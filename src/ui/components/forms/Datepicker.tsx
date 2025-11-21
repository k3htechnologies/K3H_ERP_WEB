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
  // basic safety check
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

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keep state in sync with external value
  useEffect(() => {
    const parsed = parseDdMmYyyy(value)
    setSelectedDate(parsed)
    if (parsed) setCurrentMonth(parsed)
  }, [value])

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay() // 0 = Sun

  const weeks: (Date | null)[][] = []
  let currentRow: (Date | null)[] = []

  // Leading empty cells
  for (let i = 0; i < firstDayOfWeek; i++) currentRow.push(null)

  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    currentRow.push(new Date(year, month, day))
    if (currentRow.length === 7) {
      weeks.push(currentRow)
      currentRow = []
    }
  }
  // Trailing empty cells
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
        onClick={() => {
          if (!disabled) setIsOpen(prev => !prev)
        }}
        rightIcon={<CalendarIcon size={18} />}
        placeholder="DD-MM-YYYY"
      />

      {isOpen && !disabled && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            marginTop: 8,
            right: 0,
            zIndex: 50,
            width: 320,
            backgroundColor: theme.colors.background,
            borderRadius: theme.borderRadius.lg,
            boxShadow: theme.shadows.lg,
            border: `1px solid ${theme.colors.border}`,
            padding: 16,
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
                        ? theme.colors.primary
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
