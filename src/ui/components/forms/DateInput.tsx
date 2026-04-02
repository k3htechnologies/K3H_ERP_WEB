import React, { useEffect, useRef, useState, forwardRef } from 'react'
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/ui/components/forms'
import { THEME } from '@/core/constants/theme'
import type { DatePickerProps } from '@/core/types/form.types'

const parseDdMmYyyy = (value?: string | null): Date | null => {
  if (!value) return null
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value)
  if (!match) return null
  const [, dd, mm, yyyy] = match
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  if (
    d.getFullYear() === Number(yyyy) &&
    d.getMonth() === Number(mm) - 1 &&
    d.getDate() === Number(dd)
  ) {
    return d
  }
  return null
}

const formatDdMmYyyy = (date: Date): string => {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}

export interface DateInputProps extends Omit<DatePickerProps, 'onChange'> {
  onChange?: (value: string | null) => void
  showClearButton?: boolean
  onClear?: () => void
  isActive?: boolean // For highlighting when active/editing
  openCalendarOnClick?: boolean // If false, clicking on input won't open calendar
  allowedDates?: string[] // Array of dates in YYYY-MM-DD format that can be selected
}

export const DateInput = forwardRef<HTMLDivElement, DateInputProps>(
  ({
    label,
    value,
    onChange,
    required,
    error,
    minYear = 1950,
    maxYear = new Date().getFullYear() + 20,
    disabled = false,
    helperText,
    showClearButton = true,
    onClear,
    isActive = false,
    openCalendarOnClick = true,
    allowedDates,
    ...props
  }, ref) => {
    const theme = THEME
    const [isOpen, setIsOpen] = useState(false)

    const initialDate = parseDdMmYyyy(value) ?? new Date()
    const [currentMonth, setCurrentMonth] = useState<Date>(initialDate)
    const [selectedDate, setSelectedDate] = useState<Date | null>(parseDdMmYyyy(value))

    const internalRef = useRef<HTMLDivElement | null>(null)
    const popupRef = useRef<HTMLDivElement | null>(null)

    // Merge forwarded ref with internal ref
    const wrapperRef = (node: HTMLDivElement | null) => {
      internalRef.current = node
      if (ref) {
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      }
    }

    const [, setOpenPosition] = useState<'bottom' | 'top'>('bottom')
    const [popupPosition, setPopupPosition] = useState<{ top?: number; bottom?: number; left?: number; right?: number }>({})

    // Close on outside click
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node
        if (
          internalRef.current &&
          !internalRef.current.contains(target) &&
          popupRef.current &&
          !popupRef.current.contains(target)
        ) {
          setIsOpen(false)
        }
      }
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false)
      }
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleKey)
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleKey)
      }
    }, [isOpen])

    // Keep state in sync with external value
    useEffect(() => {
      const parsed = parseDdMmYyyy(value)
      setSelectedDate(parsed)
      if (parsed) setCurrentMonth(parsed)
    }, [value])

    // Calculate weeks grid
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - startDate.getDay())

    const weeks: Date[][] = []
    let current = new Date(startDate)
    while (current <= lastDay || weeks.length < 6) {
      const week: Date[] = []
      for (let i = 0; i < 7; i++) {
        week.push(new Date(current))
        current.setDate(current.getDate() + 1)
      }
      weeks.push(week)
      if (current > lastDay && current.getDate() > 7) break
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const handleDateClick = (date: Date) => {
      setSelectedDate(date)
      const formatted = formatDdMmYyyy(date)
      onChange?.(formatted)
      setIsOpen(false)
    }

    const handlePrevMonth = () => {
      setCurrentMonth(new Date(year, month - 1, 1))
    }

    const handleNextMonth = () => {
      setCurrentMonth(new Date(year, month + 1, 1))
    }

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation()
      setSelectedDate(null)
      onChange?.(null)
      onClear?.()
    }

    const displayValue = selectedDate ? formatDdMmYyyy(selectedDate) : ''

    const handleToggleOpen = () => {
      if (disabled) return
      const willOpen = !isOpen
      setIsOpen(willOpen)

      if (willOpen) {
        setTimeout(() => {
          const rect = internalRef.current?.getBoundingClientRect()
          const popupHeight = 350
          const viewportHeight = window.innerHeight

          if (rect) {
            const leftPos = rect.left
            const rightPos = window.innerWidth - rect.right

            let position: 'bottom' | 'top' = 'bottom'
            if (rect.bottom + popupHeight + 8 > viewportHeight && rect.top > popupHeight + 8) {
              position = 'top'
            }
            setOpenPosition(position)
            // openPosition is set but not used - keeping for potential future use

            let topPos: number | undefined = undefined
            let bottomPos: number | undefined = undefined

            if (position === 'bottom') {
              topPos = rect.bottom + 8
              if (topPos + popupHeight > viewportHeight) {
                topPos = Math.max(8, viewportHeight - popupHeight - 8)
              }
            } else {
              bottomPos = viewportHeight - rect.top + 8
              if (bottomPos + popupHeight > viewportHeight) {
                bottomPos = undefined
                topPos = 8
              }
            }

            setPopupPosition({
              top: topPos,
              bottom: bottomPos,
              left: leftPos,
              right: rightPos
            })
          }
        }, 0)
      }
    }

    const isDateInMonth = (date: Date) => date.getMonth() === month
    const isToday = (date: Date) => {
      const today = new Date()
      return date.toDateString() === today.toDateString()
    }
    const isSelected = (date: Date) => {
      if (!selectedDate) return false
      return date.toDateString() === selectedDate.toDateString()
    }
    
    // Convert date to YYYY-MM-DD format for comparison
    const formatYyyyMmDd = (date: Date): string => {
      const yyyy = date.getFullYear()
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const dd = String(date.getDate()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd}`
    }
    
    const isDateAllowed = (date: Date): boolean => {
      if (allowedDates === undefined) return true
      if (allowedDates.length === 0) return false
      const dateStr = formatYyyyMmDd(date)
      return allowedDates.includes(dateStr)
    }
    
    const isDateHighlighted = (date: Date): boolean => {
      if (allowedDates === undefined || allowedDates.length === 0) return false
      return isDateAllowed(date)
    }

    return (
      <div
        ref={wrapperRef}
        style={{ position: 'relative', width: '100%' }}
      >
        <div style={{ position: 'relative' }}>
          <Input
            label={label}
            required={required}
            type="text"
            value={displayValue}
            readOnly
            disabled={disabled}
            error={error}
            helperText={helperText}
            onClick={openCalendarOnClick ? handleToggleOpen : undefined}
            leftIcon={<CalendarIcon size={18} />}
            placeholder="DD-MM-YYYY"
            style={{
              cursor: disabled ? 'not-allowed' : openCalendarOnClick ? 'pointer' : 'default',
              borderColor: isActive ? '#3b82f6' : undefined,
              borderWidth: isActive ? '2px' : undefined,
              paddingRight: showClearButton && displayValue ? '40px' : undefined,
              ...props.style
            }}
          />

          {showClearButton && displayValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                position: 'absolute',
                right: theme.spacing.md,
                top: label ? 'calc(50% + 12px)' : '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#ef4444',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                borderRadius: '4px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fef2f2'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              title="Clear date"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {isOpen && !disabled && (
          <div
            ref={popupRef}
            style={{
              position: 'fixed',
              top: popupPosition.top !== undefined ? `${popupPosition.top}px` : undefined,
              bottom: popupPosition.bottom !== undefined ? `${popupPosition.bottom}px` : undefined,
              left: popupPosition.left !== undefined ? `${popupPosition.left}px` : undefined,
              right: popupPosition.right !== undefined ? `${popupPosition.right}px` : undefined,
              width: '320px',
              backgroundColor: theme.colors.background,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.lg,
              zIndex: 10000,
              padding: theme.spacing.md,
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: theme.spacing.md,
            }}>
              <button
                type="button"
                onClick={handlePrevMonth}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: theme.colors.text,
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <div style={{
                fontSize: theme.fontSize.md,
                fontWeight: theme.fontWeight.semibold,
                color: theme.colors.text,
              }}>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: theme.colors.text,
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Day names */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              marginBottom: theme.spacing.sm,
            }}>
              {dayNames.map(day => (
                <div
                  key={day}
                  style={{
                    textAlign: 'center',
                    fontSize: theme.fontSize.xs,
                    fontWeight: theme.fontWeight.medium,
                    color: theme.colors.textSecondary,
                    padding: '4px',
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
            }}>
              {weeks.flat().map((date, idx) => {
                const inMonth = isDateInMonth(date)
                const today = isToday(date)
                const selected = isSelected(date)
                const dateYear = date.getFullYear()
                const yearDisabled = dateYear < minYear || dateYear > maxYear
                const dateNotAllowed = allowedDates && allowedDates.length > 0 && !isDateAllowed(date)
                const isDisabled = yearDisabled || dateNotAllowed
                const isHighlighted = isDateHighlighted(date) && !selected && !today

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => !isDisabled && handleDateClick(date)}
                    disabled={isDisabled}
                    style={{
                      aspectRatio: '1',
                      border: 'none',
                      borderRadius: theme.borderRadius.sm,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      fontSize: theme.fontSize.sm,
                      backgroundColor: selected
                        ? theme.colors.primary
                        : today
                          ? theme.colors.primaryLight
                          : isHighlighted
                            ? '#dbeafe'
                            : 'transparent',
                      color: selected
                        ? '#fff'
                        : inMonth
                          ? theme.colors.text
                          : theme.colors.textLight,
                      opacity: isDisabled ? 0.3 : 1,
                      fontWeight: selected || today ? theme.fontWeight.semibold : theme.fontWeight.normal,
                      borderWidth: isHighlighted ? '1px' : '0',
                      borderStyle: isHighlighted ? 'solid' : 'none',
                      borderColor: isHighlighted ? '#3b82f6' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isDisabled && !selected) {
                        e.currentTarget.style.backgroundColor = isHighlighted ? '#bfdbfe' : theme.colors.hover
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isDisabled && !selected) {
                        e.currentTarget.style.backgroundColor = selected
                          ? theme.colors.primary
                          : today
                            ? theme.colors.primaryLight
                            : isHighlighted
                              ? '#dbeafe'
                              : 'transparent'
                      }
                    }}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }
)

DateInput.displayName = 'DateInput'
