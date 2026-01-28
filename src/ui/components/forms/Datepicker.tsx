import React, { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Input } from '@/ui/components/forms'
import { THEME } from '@/core/constants/theme'
import type { DatePickerProps } from '@/core/types/form.types'

/* ================= Utils ================= */

const parseDdMmYyyy = (value?: string | null): Date | null => {
  if (!value) return null
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value)
  if (!match) return null
  const [, dd, mm, yyyy] = match
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  return (
    d.getFullYear() === Number(yyyy) &&
    d.getMonth() === Number(mm) - 1 &&
    d.getDate() === Number(dd)
  )
    ? d
    : null
}

const formatDdMmYyyy = (date: Date | null): string => {
  if (!date) return ''
  return `${String(date.getDate()).padStart(2, '0')}-${String(
    date.getMonth() + 1,
  ).padStart(2, '0')}-${date.getFullYear()}`
}

/* ================= Component ================= */

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

  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const [isOpen, setIsOpen] = useState(false)

  const initialDate = parseDdMmYyyy(value)
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate)
  const [currentMonth, setCurrentMonth] = useState<Date>(initialDate ?? new Date())

  /* ================= Portal Position (ONLY LOGIC CHANGE) ================= */

  const CALENDAR_HEIGHT = 280 // approx, ONLY for position calculation

  const [portalPos, setPortalPos] = useState<{
    left: number
    top: number
  } | null>(null)

  const updatePortalPosition = useCallback(() => {
    const node = wrapperRef.current
    if (!node) return

    const rect = node.getBoundingClientRect()
    const vh = window.innerHeight

    const spaceBelow = vh - rect.bottom
    const spaceAbove = rect.top

    const openBelow =
      spaceBelow >= CALENDAR_HEIGHT || spaceBelow >= spaceAbove

    let top = openBelow
      ? rect.bottom + 8
      : rect.top - CALENDAR_HEIGHT - 8

    // keep inside viewport
    top = Math.max(8, Math.min(top, vh - CALENDAR_HEIGHT - 8))

    setPortalPos({
      left: rect.right - 320, // KEEP EXACT OLD ALIGNMENT
      top,
    })
  }, [])

  useEffect(() => {
    if (!isOpen) return

    updatePortalPosition()

    const onUpdate = () => updatePortalPosition()
    window.addEventListener('resize', onUpdate)
    window.addEventListener('scroll', onUpdate, true)

    return () => {
      window.removeEventListener('resize', onUpdate)
      window.removeEventListener('scroll', onUpdate, true)
    }
  }, [isOpen, updatePortalPosition])

  /* ================= Close Handlers ================= */

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  /* ================= Sync Value ================= */

  useEffect(() => {
    const parsed = parseDdMmYyyy(value)
    setSelectedDate(parsed)
    if (parsed) setCurrentMonth(parsed)
  }, [value])

  /* ================= Calendar Logic ================= */

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()

  const weeks: (Date | null)[][] = []
  let row: (Date | null)[] = []

  for (let i = 0; i < firstDay; i++) row.push(null)

  for (let d = 1; d <= daysInMonth; d++) {
    row.push(new Date(year, month, d))
    if (row.length === 7) {
      weeks.push(row)
      row = []
    }
  }
  if (row.length) {
    while (row.length < 7) row.push(null)
    weeks.push(row)
  }

  const isSameDay = (a: Date | null, b: Date | null) =>
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    onChange(formatDdMmYyyy(date))
    setIsOpen(false)
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i)

  const clearDate = () => {
    setSelectedDate(null);
    onChange("");
  };


  /* ================= Render ================= */

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <Input
        label={label}
        required={required}
        type="text"
        value={selectedDate ? formatDdMmYyyy(selectedDate) : ''}
        readOnly
        disabled={disabled}
        error={error}
        helperText={helperText}
        onClick={() => !disabled && setIsOpen(p => !p)}
        placeholder="DD-MM-YYYY"
        rightIcon={
          selectedDate ? (
            <X
              size={16}
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                clearDate();
              }}
            />
          ) : (
            <CalendarIcon size={18} />
          )
        }
      />

      {isOpen &&
        portalPos &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onMouseDown={e => e.stopPropagation()}
            style={{
              position: 'fixed',
              left: portalPos.left,
              top: portalPos.top,
              width: 320, // 🔒 SAME AS ORIGINAL
              backgroundColor: theme.colors.background,
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.lg,
              border: `1px solid ${theme.colors.border}`,
              padding: 16,
              zIndex: 9999,
            }}
          >
            {/* ===== HEADER (UNCHANGED) ===== */}
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
                onClick={() =>
                  setCurrentMonth(p => new Date(p.getFullYear(), p.getMonth() - 1, 1))
                }
                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <ChevronLeft size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600 }}>{monthNames[month]}</span>
                <select
                  value={year}
                  onChange={e =>
                    setCurrentMonth(p => new Date(Number(e.target.value), p.getMonth(), 1))
                  }
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
                onClick={() =>
                  setCurrentMonth(p => new Date(p.getFullYear(), p.getMonth() + 1, 1))
                }
                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* ===== WEEK HEADER ===== */}
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
              <span>S</span><span>M</span><span>T</span>
              <span>W</span><span>T</span><span>F</span><span>S</span>
            </div>

            {/* ===== DAYS GRID ===== */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 4,
              }}
            >
              {weeks.flat().map((date, i) =>
                date ? (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleDayClick(date)}
                    style={{
                      height: 32,
                      borderRadius: 999,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: theme.fontSize.sm,
                      backgroundColor: isSameDay(date, selectedDate)
                        ? theme.colors.primary1
                        : 'transparent',
                      color: isSameDay(date, selectedDate)
                        ? '#fff'
                        : theme.colors.text,
                    }}
                  >
                    {date.getDate()}
                  </button>
                ) : (
                  <div key={i} style={{ height: 32 }} />
                ),
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

export default DatePickerInput
