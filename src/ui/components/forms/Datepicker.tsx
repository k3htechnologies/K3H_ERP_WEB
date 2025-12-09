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

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

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

  // Decide open position (above/below) whenever popup open state changes or on resize/scroll
  const computeAndSetPosition = () => {
    const wrapper = wrapperRef.current
    const popup = popupRef.current
    if (!wrapper) return
    // If popup not rendered yet, assume bottom; will re-evaluate after next paint
    if (!popup) {
      setOpenPosition('bottom')
      return
    }

    const rect = wrapper.getBoundingClientRect()
    const popupHeight = popup.offsetHeight || 240 // fallback estimate
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    // prefer below if enough, otherwise above if enough; otherwise choose the one with more space
    if (spaceBelow >= popupHeight + 8) {
      setOpenPosition('bottom')
    } else if (spaceAbove >= popupHeight + 8) {
      setOpenPosition('top')
    } else {
      setOpenPosition(spaceBelow >= spaceAbove ? 'bottom' : 'top')
    }
  }

  // Compute position when opening
  useEffect(() => {
    if (!isOpen) return

    // run after next paint so popupRef.offsetHeight is accurate
    const raf = requestAnimationFrame(() => {
      computeAndSetPosition()
    })

    // also recompute on scroll/resize while open
    const onScroll = () => computeAndSetPosition()
    window.addEventListener('resize', onScroll, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('scroll', onScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentMonth, selectedDate]) // re-check when calendar size/content might change

  // Also recompute when popup first mounts (popupRef becomes available)
  useEffect(() => {
    if (!isOpen) return
    computeAndSetPosition()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popupRef.current])

  // Toggle open with disabled guard
  const handleToggleOpen = () => {
    if (disabled) return
    setIsOpen(prev => !prev)
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
            position: 'absolute',
            // If openPosition is bottom, place below: top = 100% + margin
            // If openPosition is top, place above: bottom = 100% + margin
            top: openPosition === 'bottom' ? '100%' : undefined,
            bottom: openPosition === 'top' ? '100%' : undefined,
            marginTop: openPosition === 'bottom' ? 8 : undefined,
            marginBottom: openPosition === 'top' ? 8 : undefined,
            right: 0,
            zIndex: 50,
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
