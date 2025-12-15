import React, { useEffect, useRef, useState } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
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

const formatDdMmYyyy = (date: Date | null): string => {
  if (!date) return ''
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}

export const DatePickerInput: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  required,
  error,
  minYear = 1950,
  maxYear = new Date().getFullYear() + 20,
  disabled = false,
  helperText,
}) => {
  const theme = THEME
  const [isOpen, setIsOpen] = useState(false)

  const initialDate = parseDdMmYyyy(value) ?? new Date()
  const [currentMonth, setCurrentMonth] = useState<Date>(initialDate)
  const [selectedDate, setSelectedDate] = useState<Date | null>(parseDdMmYyyy(value))

  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const popupRef = useRef<HTMLDivElement | null>(null)

  // 'bottom' means popup below input (default), 'top' means popup above input
  const [openPosition, setOpenPosition] = useState<'bottom' | 'top'>('bottom')
  
  // State to track popup position for fixed positioning
  const [popupPosition, setPopupPosition] = useState<{ top?: number; bottom?: number; left?: number; right?: number }>({})

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        wrapperRef.current && 
        !wrapperRef.current.contains(target) &&
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

  // Calculate weeks grid derived values
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay() // 0 = Sun

  const weeks: (Date | null)[][] = []
  let currentRow: (Date | null)[] = []

  for (let i = 0; i < firstDayOfWeek; i++) currentRow.push(null)

  for (let day = 1; day <= daysInMonth; day++) {
    currentRow.push(new Date(year, month, day))
    if (currentRow.length === 7) {
      weeks.push(currentRow)
      currentRow = []
    }
  }
  if (currentRow.length > 0) {
    while (currentRow.length < 7) currentRow.push(null)
    weeks.push(currentRow)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = Number(e.target.value)
    setCurrentMonth(prev => new Date(newYear, prev.getMonth(), 1))
  }

  const handleDayClick = (date: Date | null) => {
    if (!date) return
    setSelectedDate(date)
    const formatted = formatDdMmYyyy(date)
    onChange(formatted)
    setIsOpen(false)
  }

  const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    )
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  const years: number[] = []
  for (let y = minYear; y <= maxYear; y++) years.push(y)

  const displayValue = selectedDate ? formatDdMmYyyy(selectedDate) : ''

  // Decide open position (above/below) and calculate fixed positioning
  const computeAndSetPosition = () => {
    const wrapper = wrapperRef.current
    const popup = popupRef.current
    if (!wrapper) return
    
    const rect = wrapper.getBoundingClientRect()
    const popupHeight = popup?.offsetHeight || 280 // fallback estimate (increased for better calculation)
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    // Determine position (above or below)
    let position: 'bottom' | 'top' = 'bottom'
    if (spaceBelow >= popupHeight + 8) {
      position = 'bottom'
    } else if (spaceAbove >= popupHeight + 8) {
      position = 'top'
    } else {
      position = spaceBelow >= spaceAbove ? 'bottom' : 'top'
    }

    setOpenPosition(position)
    
    // Calculate fixed positioning relative to viewport
    const popupWidth = 320 // Fixed width of the popup
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // Calculate horizontal position - try to align with input's right edge
    let leftPos: number | undefined = undefined
    let rightPos: number | undefined = undefined
    
    // Try to align right edge of popup with right edge of input
    const inputRight = rect.right
    const rightSpace = viewportWidth - inputRight
    
    if (rightSpace >= popupWidth) {
      // Enough space on the right, align right edges
      rightPos = viewportWidth - inputRight
    } else {
      // Not enough space on right, try left alignment
      const inputLeft = rect.left
      if (inputLeft >= popupWidth) {
        // Enough space on left, align left edges
        leftPos = inputLeft
      } else {
        // Not enough space on either side, center or use available space
        leftPos = Math.max(8, Math.min(inputLeft, viewportWidth - popupWidth - 8))
      }
    }
    
    // Calculate vertical position
    let topPos: number | undefined = undefined
    let bottomPos: number | undefined = undefined
    
    if (position === 'bottom') {
      topPos = rect.bottom + 8
      // Ensure it doesn't go below viewport
      if (topPos + popupHeight > viewportHeight) {
        topPos = Math.max(8, viewportHeight - popupHeight - 8)
      }
    } else {
      bottomPos = viewportHeight - rect.top + 8
      // Ensure it doesn't go above viewport
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

  // Compute position when opening
  useEffect(() => {
    if (!isOpen || !wrapperRef.current) return

    // Initial position calculation
    const updatePosition = () => {
      // Use double RAF to ensure popup is rendered and measured
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          computeAndSetPosition()
        })
      })
    }

    updatePosition()

    // also recompute on scroll/resize while open
    const onScroll = () => {
      if (wrapperRef.current) {
        computeAndSetPosition()
      }
    }
    window.addEventListener('resize', onScroll, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })

    return () => {
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('scroll', onScroll, { capture: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentMonth, selectedDate]) // re-check when calendar size/content might change

  // Toggle open with disabled guard
  const handleToggleOpen = () => {
    if (disabled) return
    const willOpen = !isOpen
    setIsOpen(willOpen)
    
    // If opening, calculate position immediately
    if (willOpen && wrapperRef.current) {
      // Use setTimeout to ensure state update is processed
      setTimeout(() => {
        const rect = wrapperRef.current?.getBoundingClientRect()
        if (rect) {
          const popupHeight = 280
          const spaceBelow = window.innerHeight - rect.bottom
          const spaceAbove = rect.top
          
          let position: 'bottom' | 'top' = 'bottom'
          if (spaceBelow >= popupHeight + 8) {
            position = 'bottom'
          } else if (spaceAbove >= popupHeight + 8) {
            position = 'top'
          } else {
            position = spaceBelow >= spaceAbove ? 'bottom' : 'top'
          }
          
          setOpenPosition(position)
          
          const popupWidth = 320
          const viewportWidth = window.innerWidth
          const viewportHeight = window.innerHeight
          
          let leftPos: number | undefined = undefined
          let rightPos: number | undefined = undefined
          
          const inputRight = rect.right
          const rightSpace = viewportWidth - inputRight
          
          if (rightSpace >= popupWidth) {
            rightPos = viewportWidth - inputRight
          } else {
            const inputLeft = rect.left
            if (inputLeft >= popupWidth) {
              leftPos = inputLeft
            } else {
              leftPos = Math.max(8, Math.min(inputLeft, viewportWidth - popupWidth - 8))
            }
          }
          
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

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'relative', width: '100%' }}
    >
      <Input
        label={label}
        required={required}
        type="text"
        value={displayValue}
        readOnly
        disabled={disabled}
        error={error}
        helperText={helperText}
        onClick={handleToggleOpen}
        leftIcon={<CalendarIcon size={18} />}
        placeholder="DD-MM-YYYY"
      />

      {isOpen && !disabled && (
        <div
          ref={popupRef}
          style={{
            position: 'fixed',
            top: popupPosition.top !== undefined ? `${popupPosition.top}px` : undefined,
            bottom: popupPosition.bottom !== undefined ? `${popupPosition.bottom}px` : undefined,
            left: popupPosition.left !== undefined ? `${popupPosition.left}px` : undefined,
            right: popupPosition.right !== undefined ? `${popupPosition.right}px` : undefined,
            zIndex: 9999,
            width: 320,
            backgroundColor: theme.colors.background,
            borderRadius: theme.borderRadius.lg,
            boxShadow: theme.shadows.lg,
            border: `1px solid ${theme.colors.border}`,
            padding: 16,
            // small transform to help with clipping rounding
            transformOrigin: openPosition === 'bottom' ? 'top right' : 'bottom right'
          }}
        >
          {/* Header: month + year + nav */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              <ChevronLeft size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 600 }}>
                {monthNames[month]}
              </span>
              <select
                value={year}
                onChange={handleYearChange}
                className='thin-scroll'
                style={{
                  borderRadius: 6,
                  border: `1px solid ${theme.colors.border}`,
                  padding: '2px 6px',
                  fontSize: theme.fontSize.sm,
                }}
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Weekday header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              textAlign: 'center',
              fontSize: theme.fontSize.sm,
              color: theme.colors.textSecondary,
              marginBottom: 8,
            }}
          >
            <span>S</span>
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
          </div>

          {/* Calendar grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 4,
            }}
          >
            {weeks.map((week, wIdx) =>
              week.map((date, dIdx) => {
                if (!date) {
                  return (
                    <div
                      key={`${wIdx}-${dIdx}`}
                      style={{ height: 32 }}
                    />
                  )
                }

                const selected = isSameDay(date, selectedDate)
                return (
                  <button
                    key={`${wIdx}-${dIdx}`}
                    type="button"
                    onClick={() => handleDayClick(date)}
                    style={{
                      height: 32,
                      borderRadius: 999,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: theme.fontSize.sm,
                      backgroundColor: selected
                        ? theme.colors.primary1
                        : 'transparent',
                      color: selected ? '#fff' : theme.colors.text,
                    }}
                  >
                    {date.getDate()}
                  </button>
                )
              }),
            )}
          </div>
        </div>
      )}
    </div>
  )
}
