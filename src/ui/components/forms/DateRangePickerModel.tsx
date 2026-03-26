import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react'
import { Modal } from '@/ui/components/Modal/Modal'
import { THEME } from '@/core/constants/theme'
import { isToday } from '@/core/utils/dateFormat'

const parseYyyyMmDd = (value?: string | null): Date | null => {
  if (!value) return null
  try {
    const trimmed = value.trim()
    const datePart = trimmed.includes('T') ? trimmed.split('T')[0] : trimmed
    const parts = datePart.split('-')
    if (parts.length !== 3) return null
    const [y, m, d] = parts
    const year = Number(y)
    const month = Number(m) - 1
    const day = Number(d)
    // Build a date in local time without shifting
    const date = new Date(year, month, day)
    date.setHours(0, 0, 0, 0)
    if (isNaN(date.getTime())) return null
    return date
  } catch {
    return null
  }
}

const isDateInRange = (date: Date, startDate: Date | null, endDate: Date | null): boolean => {
  if (!startDate || !endDate) return false
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const startOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  const endOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
  return dateOnly >= startOnly && dateOnly <= endOnly
}

const isSameDay = (d1: Date | null, d2: Date | null): boolean => {
  if (!d1 || !d2) return false
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
}

const formatLocalDate = (date: Date | null): string | null => {
  if (!date) return null
  // Format directly from local date components to avoid timezone shifts
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

export interface DateRangePickerModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (startDate: string | null, endDate: string | null, reason?: string | null) => void
  title?: string
  startDate?: string | null // YYYY-MM-DD format
  endDate?: string | null // YYYY-MM-DD format
  showTimePicker?: boolean
  startTime?: string
  endTime?: string
  onTimeChange?: (startTime: string, endTime: string) => void
  showAIToggle?: boolean
  aiEnabled?: boolean
  onAIToggle?: (enabled: boolean) => void
  confirmText?: string
  cancelText?: string
  resetText?: string
  onReset?: () => void
  // Additional fields
  loading?: boolean
  timeLabel?: string
  children?: React.ReactNode // allows injecting custom fields (e.g., Reason)
  renderChildren?: (dates: {
    startDate: string | null
    endDate: string | null
    editingField?: 'start' | 'end' | null
    onSelectField?: (field: 'start' | 'end') => void
    onClearField?: (field: 'start' | 'end') => void
    onUpdateDate?: (field: 'start' | 'end', date: string | null) => void
  }) => React.ReactNode
  // Summary customization
  showSummary?: boolean // Whether to show the summary section
  summaryPrefix?: string // Custom prefix for summary (default: "Event:")
  renderSummary?: (dates: {
    startDate: string | null
    endDate: string | null
    startTime?: string
    endTime?: string
    summaryText: string
  }) => React.ReactNode // Custom render function for summary
  allowedDates?: string[] // Array of dates in YYYY-MM-DD format that can be selected
  onMonthChange?: (monthStart: string, monthEnd: string) => void // Callback when calendar month changes (YYYY-MM-DD format)
}

const parseTimeParts = (value: string) => {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(value.trim())
  if (!match) return { hour: '00', minute: '00', meridiem: 'AM' as const }
  const [, h, m, mer] = match
  const hour = h.padStart(2, '0')
  const minute = m.padStart(2, '0')
  const meridiem = mer.toUpperCase() === 'PM' ? 'PM' : 'AM'
  return { hour, minute, meridiem }
}

const formatTimeParts = (hour: string, minute: string, meridiem: 'AM' | 'PM') =>
  `${hour}:${minute} ${meridiem}`

const adjustHour = (time: string, delta: number) => {
  const { hour, minute, meridiem } = parseTimeParts(time)
  const mer = meridiem as 'AM' | 'PM'
  let h = Number(hour)
  h = ((h - 1 + delta) % 12 + 12) % 12 + 1
  const newHour = h.toString().padStart(2, '0')
  return formatTimeParts(newHour, minute, mer)
}

const adjustMinute = (time: string, delta: number) => {
  const { hour, minute, meridiem } = parseTimeParts(time)
  const mer = meridiem as 'AM' | 'PM'
  let m = Number(minute)
  m = ((m + delta) % 60 + 60) % 60
  const newMinute = m.toString().padStart(2, '0')
  return formatTimeParts(hour, newMinute, mer)
}

const toggleMeridiem = (time: string) => {
  const { hour, minute, meridiem } = parseTimeParts(time)
  const next = meridiem === 'AM' ? 'PM' : 'AM'
  return formatTimeParts(hour, minute, next)
}

export const DateRangePickerModal: React.FC<DateRangePickerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  startDate,
  endDate,
  showTimePicker = false,
  startTime = '00:00 am',
  endTime = '00:00 am',
  onTimeChange,
  showAIToggle = false,
  aiEnabled = false,
  onAIToggle,
  confirmText = 'Schedule',
  cancelText = 'Cancel',
  resetText,
  onReset,
  loading = false,
  timeLabel = 'Time',
  children,
  renderChildren,
  showSummary = true,
  summaryPrefix = 'Event:',
  renderSummary,
  allowedDates,
  onMonthChange,
}) => {
  const theme = THEME
  const startDateObj = parseYyyyMmDd(startDate)
  const endDateObj = parseYyyyMmDd(endDate)
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDateObj)
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDateObj)
  const initialDate = startDateObj ?? endDateObj ?? new Date()
  const [currentMonth, setCurrentMonth] = useState<Date>(initialDate)
  const [editingField, setEditingField] = useState<'start' | 'end' | null>(null) 
  const [localStartTime, setLocalStartTime] = useState(startTime)
  const [localEndTime, setLocalEndTime] = useState(endTime)
  const [localAIEnabled, setLocalAIEnabled] = useState(aiEnabled)

  // Keep state in sync with external values
  useEffect(() => {
    if (!isOpen) {
      // Reset internal state when modal closes
      setTempStartDate(null)
      setTempEndDate(null)
      setEditingField(null)
      setLocalStartTime(startTime)
      setLocalEndTime(endTime)
      setLocalAIEnabled(aiEnabled)
      return
    }
    const parsedStart = parseYyyyMmDd(startDate)
    const parsedEnd = parseYyyyMmDd(endDate)
    setTempStartDate(parsedStart)
    setTempEndDate(parsedEnd)

    // Reset time to default when dates are cleared (e.g., on reset)
    if (!parsedStart && !parsedEnd) {
      setLocalStartTime('00:00 am')
      setLocalEndTime('00:00 am')
    } else {
      setLocalStartTime(startTime)
      setLocalEndTime(endTime)
    }

    setLocalAIEnabled(aiEnabled)
    if (parsedStart) setCurrentMonth(parsedStart)
    else if (parsedEnd) setCurrentMonth(parsedEnd)
    else setCurrentMonth(new Date())
  }, [isOpen, startDate, endDate, startTime, endTime, aiEnabled])

  // Calendar calculations for embedded picker
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay() // 0 = Sun

  const weeks: (Date | null)[][] = []
  let currentRow: (Date | null)[] = []

  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    currentRow.push(new Date(year, month - 1, day))
  }

  for (let day = 1; day <= daysInMonth; day++) {
    currentRow.push(new Date(year, month, day))
    if (currentRow.length === 7) {
      weeks.push(currentRow)
      currentRow = []
    }
  }

  if (currentRow.length > 0) {
    let nextDay = 1
    while (currentRow.length < 7) {
      currentRow.push(new Date(year, month + 1, nextDay))
      nextDay++
    }
    weeks.push(currentRow)
  }

  // Calculate month start and end dates
  const getMonthStartEnd = useCallback((date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0) // Last day of the month
    return {
      start: formatLocalDate(monthStart),
      end: formatLocalDate(monthEnd)
    }
  }, [])

  // Notify parent when month changes
  useEffect(() => {
    if (isOpen && onMonthChange) {
      const { start, end } = getMonthStartEnd(currentMonth)
      if (start && end) {
        onMonthChange(start, end)
      }
    }
  }, [currentMonth, isOpen])

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  // Convert date to YYYY-MM-DD format for comparison
  const formatYyyyMmDd = (date: Date): string => {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  // Check if a selected date is from allowedDates (CompOff dates)
  const isSelectedDateFromAllowedDates = (): boolean => {
    if (!allowedDates || allowedDates.length === 0) return false
    const selectedDateStr = tempStartDate ? formatYyyyMmDd(tempStartDate) :
      (tempEndDate ? formatYyyyMmDd(tempEndDate) : null)
    if (!selectedDateStr) return false
    return allowedDates.includes(selectedDateStr)
  }

  const isDateAllowed = (date: Date): boolean => {
if (!allowedDates || allowedDates.length === 0) return false

    // If a CompOff date is selected, invert the logic:
    // - Disable dates from allowedDates (CompOff dates)
    // - Enable all other dates
    if (isSelectedDateFromAllowedDates()) {
      const dateStr = formatYyyyMmDd(date)
      return !allowedDates.includes(dateStr) // Invert: allow dates NOT in allowedDates
    }

    // Default behavior: only allow dates from allowedDates
    const dateStr = formatYyyyMmDd(date)
    return allowedDates.includes(dateStr)
  }

  const handleDayClick = (date: Date | null) => {
    if (!date) return

    // Check if date is allowed
    if (!isDateAllowed(date)) return

    if (editingField === 'start') {
      setTempStartDate(date)
      if (!tempEndDate || date > tempEndDate) {
        setTempEndDate(null)
      }
      setEditingField('end')
      return
    }

    if (editingField === 'end') {
      if (tempStartDate && date < tempStartDate) {
        setTempStartDate(date)
        setTempEndDate(null)
        setEditingField('end')
      } else {
        setTempEndDate(date)
        setEditingField(null)
      }
      return
    }

    if (!tempStartDate) {
      setTempStartDate(date)
      setEditingField('end')
      return
    }

    if (!tempEndDate) {
      if (date < tempStartDate) {
        setTempEndDate(tempStartDate)
        setTempStartDate(date)
        setEditingField(null)
      } else {
        setTempEndDate(date)
        setEditingField(null)
      }
      return
    }

    if (date < tempStartDate) {
      setTempStartDate(date)
      setTempEndDate(null)
      setEditingField('end')
    } else if (date < tempEndDate) {
      setTempStartDate(date)
      setTempEndDate(null)
      setEditingField('end')
    } else {
      setTempStartDate(tempStartDate)
      setTempEndDate(date)
      setEditingField(null)
    }
  }

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    // Allow confirming with at least one date selected
    if (tempStartDate || tempEndDate) {
      const start = tempStartDate ? formatLocalDate(tempStartDate) : null
      const end = tempEndDate ? formatLocalDate(tempEndDate) : null
      onConfirm(start, end)
      if (onTimeChange) {
        onTimeChange(localStartTime, localEndTime)
      }
      if (onAIToggle && showAIToggle) {
        onAIToggle(localAIEnabled)
      }
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  const getSummaryText = () => {
    if (tempStartDate && tempEndDate) {
      return `${monthNames[tempStartDate.getMonth()]} ${tempStartDate.getDate()} - ${tempEndDate.getDate()}, ${tempStartDate.getFullYear()}`
    } else if (tempStartDate) {
      return `${monthNames[tempStartDate.getMonth()]} ${tempStartDate.getDate()}, ${tempStartDate.getFullYear()}`
    } else if (tempEndDate) {
      return `${monthNames[tempEndDate.getMonth()]} ${tempEndDate.getDate()}, ${tempEndDate.getFullYear()}`
    }
    return ''
  }

  const summaryText = getSummaryText()

  // Memoize formatted dates
  const formattedStartDate = useMemo(() => formatLocalDate(tempStartDate), [tempStartDate])
  const formattedEndDate = useMemo(() => formatLocalDate(tempEndDate), [tempEndDate])

  const fullSummaryText = useMemo(() => {
    if (!summaryText) return ''
    if (renderSummary) {
      // Custom render function will handle display, but we still need a text value
      return summaryText
    }
    if (showTimePicker) {
      return `${summaryPrefix} ${summaryText}, from ${localStartTime} - ${localEndTime}`
    }
    return `${summaryPrefix} ${summaryText}`
  }, [summaryText, showTimePicker, localStartTime, localEndTime, summaryPrefix, renderSummary])

  // Memoize renderChildren result to prevent unnecessary re-renders when only time changes

  const handleSelectField = useCallback((field: 'start' | 'end') => {
    setEditingField(field)
    if (field === 'start' && tempStartDate) {
      setTempStartDate(null)
      setTempEndDate(null)
    }
  }, [tempStartDate])

  const handleClearField = useCallback((field: 'start' | 'end') => {
    if (field === 'start') {
      setTempStartDate(null)
    } else {
      setTempEndDate(null)
    }
    setEditingField(null)
  }, [])

  const handleUpdateDate = useCallback((field: 'start' | 'end', date: string | null) => {
    const parsedDate = date ? parseYyyyMmDd(date) : null
    if (field === 'start') {
      setTempStartDate(parsedDate)
      if (parsedDate) {
        setCurrentMonth(parsedDate)
      }
    } else {
      setTempEndDate(parsedDate)
      if (parsedDate) {
        setCurrentMonth(parsedDate)
      }
    }
    setEditingField(null)
  }, [])

  const renderedChildren = useMemo(() => {
    if (renderChildren) {
      return renderChildren({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        editingField,
        onSelectField: handleSelectField,
        onClearField: handleClearField,
        onUpdateDate: handleUpdateDate,
      })
    }
    return children
  }, [renderChildren, formattedStartDate, formattedEndDate, editingField, children, handleSelectField, handleClearField, handleUpdateDate])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onCancel={onClose}
      title={title || ''}
      onSubmit={handleConfirm}
      saveText={confirmText}
      cancelText={cancelText}
      resetText={resetText}
      onreset={onReset}
      size="xl"
      loading={loading}
    >
      <div style={{ padding: 0 }}>
        {/* Main Content */}
        <div style={{
          display: 'flex',
          gap: 24,
          padding: '0',
          marginTop: -8
        }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              style={{
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.md,
                padding: 12,
                boxShadow: theme.shadows.sm,
                background: theme.colors.primaryHover,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 8px',
                  borderRadius: theme.borderRadius.sm,
                  backgroundColor: theme.colors.backgroundSecondary,
                  marginBottom: 10,
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
                    display: 'flex',
                    alignItems: 'center',
                    color: theme.colors.text,
                  }}
                >
                  <ChevronLeft size={18} />
                </button>

                <div
                  style={{
                    fontSize: theme.fontSize.md,
                    fontWeight: theme.fontWeight.normal,
                    color: theme.colors.textSecondary,
                    letterSpacing: '0.25px',
                  }}
                >
                  {monthNames[month]} {year}
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    color: theme.colors.textSecondary,
                    fontWeight: theme.fontWeight.normal,

                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Weekday header with spacing */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  columnGap: 10,
                  textAlign: 'center',
                  fontSize: theme.fontSize.sm,
                  color: theme.colors.textSecondary,
                  marginBottom: 8,
                  fontWeight: theme.fontWeight.normal,
                  letterSpacing: '0.35px',
                  padding: '6px 0',
                }}
              >
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>

              {/* Calendar grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: 8,
                }}
              >
                {weeks.map((week, wIdx) =>
                  week.map((date, dIdx) => {
                    if (!date) {
                      return <div key={`${wIdx}-${dIdx}`} style={{ height: 40 }} />
                    }
                    const today = isToday(date)
                    const isCurrentMonth = date.getMonth() === month
                    const isStart = tempStartDate && isSameDay(date, tempStartDate)
                    const isEnd = tempEndDate && isSameDay(date, tempEndDate)
                    const isInRange = tempStartDate && tempEndDate && isDateInRange(date, tempStartDate, tempEndDate)
                    const isSelected = isStart || isEnd
                    const dateAllowed = isDateAllowed(date)
                    const dateStr = formatYyyyMmDd(date)
                    const isFromAllowedDates = allowedDates && allowedDates.length > 0 && allowedDates.includes(dateStr)
                    const hasCompOffDateSelected = isSelectedDateFromAllowedDates()
                    const isHighlighted = hasCompOffDateSelected
                      ? (!isFromAllowedDates && !isSelected && !isInRange && isCurrentMonth && dateAllowed)
                      : (isFromAllowedDates && !isSelected && !isInRange && isCurrentMonth && dateAllowed)

                    return (
                      <button
                        key={`${wIdx}-${dIdx}`}
                        type="button"
                        onClick={() => handleDayClick(date)}
                        disabled={!dateAllowed}
                        style={{
                          height: 42,
                          borderRadius: 10,
                          border: isHighlighted ? '1px solid #3b82f6' : 'none',
                          cursor: dateAllowed ? 'pointer' : 'not-allowed',
                          fontSize: theme.fontSize.sm,
                          backgroundColor: isSelected
                            ? theme.colors.primary1
                            : isInRange
                              ? theme.colors.backgroundSecondary
                              : isHighlighted
                                ? '#dbeafe'
                                : today
                                  ? '#eff6ff'
                                  : 'transparent',
                          color: isSelected
                            ? '#ffff'
                            : today
                              ? '#2563eb'
                              : !isCurrentMonth
                                ? theme.colors.textLight
                                : !dateAllowed
                                  ? theme.colors.textLight
                                  : theme.colors.text,
                          fontWeight: isSelected ? theme.fontWeight.medium : theme.fontWeight.normal,
                          transition: 'all 0.2s',
                          opacity: !dateAllowed ? 0.3 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected && isCurrentMonth && dateAllowed) {
                            e.currentTarget.style.backgroundColor = isHighlighted ? '#bfdbfe' : theme.colors.backgroundSecondary
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = isInRange
                              ? theme.colors.backgroundSecondary
                              : isHighlighted
                                ? '#dbeafe'
                                : 'transparent'
                          }
                        }}
                      >
                        {date.getDate()}
                      </button>
                    )
                  }),
                )}
              </div>
            </div>

            {showTimePicker && (
              <div style={{
                padding: 12,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.md,
                boxShadow: theme.shadows.sm,
                background: theme.colors.background
              }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 8,
                    color: theme.colors.text,
                    fontWeight: theme.fontWeight.normal,
                    fontSize: theme.fontSize.sm,
                  }}
                >
                  <CalendarIcon size={14} />
                  <span>{timeLabel}</span>
                </div>
                <TimeCard
                  label=""
                  value={localStartTime}
                  onChange={(val) => {
                    setLocalStartTime(val)
                    setLocalEndTime(val)
                  }}
                />
              </div>
            )}
          </div>

          {/* Right Side - Custom children (render prop preferred) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {renderedChildren}
          </div>
        </div>

        {/* Summary Section */}
        {showSummary && fullSummaryText && (
          <div style={{
            padding: '16px 24px',
            borderTop: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.backgroundSecondary,
            marginTop: 16
          }}>
            {renderSummary ? (
              renderSummary({
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                startTime: localStartTime,
                endTime: localEndTime,
                summaryText: summaryText
              })
            ) : (
              <p style={{
                margin: 0,
                fontSize: theme.fontSize.sm,
                color: theme.colors.text,
                fontWeight: theme.fontWeight.normal
              }}>
                {fullSummaryText}
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

interface TimeCardProps {
  label: string
  value: string
  onChange: (val: string) => void
}

const TimeCard: React.FC<TimeCardProps> = ({ value, onChange }) => {
  const theme = THEME
  const { hour, minute, meridiem } = parseTimeParts(value)

  const change = {
    hourUp: () => onChange(adjustHour(value, 1)),
    hourDown: () => onChange(adjustHour(value, -1)),
    minuteUp: () => onChange(adjustMinute(value, 1)),
    minuteDown: () => onChange(adjustMinute(value, -1)),
    meridiemUp: () => onChange(toggleMeridiem(value)),
    meridiemDown: () => onChange(toggleMeridiem(value)),
  }

  const section: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  }

  const arrow: React.CSSProperties = {
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    fontSize: 12,
    color: theme.colors.textSecondary,
    padding: 2,
  }

  const box: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#fff',
    padding: '10px 14px',
    borderRadius: 10,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    gap: 18,
  }

  const valueStyle: React.CSSProperties = {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.normal,
    color: theme.colors.text,
  }

  return (
    <div style={box}>
      <div style={section}>
        <button type="button" style={arrow} onClick={change.hourUp}>
          <ChevronUp size={16} />
        </button>
        <span style={valueStyle}>{hour}</span>
        <button type="button" style={arrow} onClick={change.hourDown}>
          <ChevronDown size={16} />
        </button>
      </div>

      <div style={section}>
        <button type="button" style={arrow} onClick={change.minuteUp}>
          <ChevronUp size={16} />
        </button>
        <span style={valueStyle}>{minute}</span>
        <button type="button" style={arrow} onClick={change.minuteDown}>
          <ChevronDown size={16} />
        </button>
      </div>

      <div style={section}>
        <button type="button" style={arrow} onClick={change.meridiemUp}>
          <ChevronUp size={16} />
        </button>
        <span style={valueStyle}>{meridiem}</span>
        <button type="button" style={arrow} onClick={change.meridiemDown}>
          <ChevronDown size={16} />
        </button>
      </div>
    </div>
  )
}
