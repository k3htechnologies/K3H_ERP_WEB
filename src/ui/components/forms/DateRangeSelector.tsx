import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate_dd_mm_yyyy } from '@/core/utils/dateFormat';
import { THEME } from '@/core/constants/theme';

export interface DateRangeSelectorProps {
  fromDate?: string | null;
  toDate?: string | null;
  onFromDateChange: (date: string | null) => void;
  onToDateChange: (date: string | null) => void;
  onBothDatesChange?: (fromDate: string | null, toDate: string | null) => void;
  disabled?: boolean;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onBothDatesChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [, setSelectingStart] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const from = parseDate(fromDate || null);
    const to = parseDate(toDate || null);
    if (from) {
      setCurrentMonth(from);
    } else if (to) {
      setCurrentMonth(to);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectingStart(true);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Memoize parseDate function
  const parseDate = useCallback((dateStr: string | null): Date | null => {
    if (!dateStr) return null;
    try {
      // Handle ISO format dates (YYYY-MM-DDTHH:mm:ss.sssZ) by extracting just the date part
      let dateToParse = dateStr;
      if (dateStr.includes('T')) {
        dateToParse = dateStr.split('T')[0];
      }

      const parts = dateToParse.split('-');
      if (parts.length !== 3) return null;
      const [y, m, d] = parts;
      const year = Number(y);
      const month = Number(m) - 1;
      const day = Number(d);
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      if (isNaN(date.getTime())) return null;
      return date;
    } catch {
      return null;
    }
  }, []);

  const formatLocalDate = useCallback((date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Memoize helper functions - must be defined before handleDateClick
  const isSameDay = useCallback((d1: Date | null, d2: Date | null): boolean => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  }, []);

  const isDateInRange = useCallback((date: Date, start: Date | null, end: Date | null): boolean => {
    if (!start || !end) return false;
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return dateOnly > startOnly && dateOnly < endOnly;
  }, []);

  const handleDateClick = useCallback((date: Date) => {
    const dateStr = formatLocalDate(date);
    if (!dateStr) return;

    const from = parseDate(fromDate ?? null);
    const to = parseDate(toDate ?? null);

    // Case 1: No dates selected → set start date
    if (!from && !to) {
      if (onBothDatesChange) onBothDatesChange(dateStr, null);
      else onFromDateChange(dateStr);
      setSelectingStart(false);
      return;
    }

    // Case 2: Only start selected → set end date
    if (from && !to) {
      if (isSameDay(date, from)) {
        // If clicked the same start again, treat as single-day range
        if (onBothDatesChange) onBothDatesChange(dateStr, dateStr);
        else {
          onFromDateChange(dateStr);
          onToDateChange(dateStr);
        }
      } else if (date < from) {
        // If clicked before start → swap
        if (onBothDatesChange) onBothDatesChange(dateStr, fromDate ?? null);
        else {
          onFromDateChange(dateStr);
          onToDateChange(fromDate ?? null);
        }
      } else {
        // Normal case → set end date
        if (onBothDatesChange) onBothDatesChange(fromDate ?? null, dateStr);
        else onToDateChange(dateStr);
      }
      setSelectingStart(true);
      return;
    }

    // Case 3: Only end selected → set start date
    if (!from && to) {
      if (isSameDay(date, to)) {
        if (onBothDatesChange) onBothDatesChange(dateStr, dateStr);
        else {
          onFromDateChange(dateStr);
          onToDateChange(dateStr);
        }
      } else if (date > to) {
        if (onBothDatesChange) onBothDatesChange(toDate ?? null, dateStr);
        else onFromDateChange(toDate ?? null);
        onToDateChange(dateStr);
      } else {
        if (onBothDatesChange) onBothDatesChange(dateStr, toDate ?? null);
        else onFromDateChange(dateStr);
      }
      setSelectingStart(false);
      return;
    }

    // Case 4: Both selected → click behavior
    if (from && to) {
      if (isSameDay(date, from) && isSameDay(date, to)) {
        // Single-day range clicked again → deselect both
        if (onBothDatesChange) onBothDatesChange(null, null);
        else {
          onFromDateChange(null);
          onToDateChange(null);
        }
        setSelectingStart(true);
        return;
      }

      if (isSameDay(date, from)) {
        if (onBothDatesChange) onBothDatesChange(null, toDate ?? null);
        else onFromDateChange(null);
        setSelectingStart(false);
        return;
      }

      if (isSameDay(date, to)) {
        if (onBothDatesChange) onBothDatesChange(fromDate ?? null, null);
        else onToDateChange(null);
        setSelectingStart(true);
        return;
      }

      // Click inside range → start a new range from clicked date
      if (date > from && date < to) {
        if (onBothDatesChange) onBothDatesChange(dateStr, null);
        else {
          onFromDateChange(dateStr);
          onToDateChange(null);
        }
        setSelectingStart(false);
        return;
      }

      // Click before start → new start
      if (date < from) {
        if (onBothDatesChange) onBothDatesChange(dateStr, null);
        else {
          onFromDateChange(dateStr);
          onToDateChange(null);
        }
        setSelectingStart(false);
        return;
      }

      // Click after end → new end
      if (date > to) {
        if (onBothDatesChange) onBothDatesChange(fromDate ?? null, dateStr);
        else onToDateChange(dateStr);
        setSelectingStart(true);
        return;
      }
    }
  }, [fromDate, toDate, parseDate, formatLocalDate, isSameDay, onBothDatesChange, onFromDateChange, onToDateChange]);
  // Memoize calendar generation
  const generateCalendar = useCallback((baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startWeekday; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return { days, year, month };
  }, []);

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);


  // Memoize parsed date objects
  const fromDateObj = useMemo(() => parseDate(fromDate || null), [fromDate, parseDate]);
  const toDateObj = useMemo(() => parseDate(toDate || null), [toDate, parseDate]);

  // Memoize calendar generation
  const calendarData = useMemo(() => generateCalendar(currentMonth), [currentMonth, generateCalendar]);
  const { days, year, month } = calendarData;

  // Memoize month names array
  const monthNames = useMemo(() =>
    ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    []
  );

  // Memoize display value formatter
  const getDisplayValue = useCallback((dateStr: string | null | undefined): string => {
    if (!dateStr) return '';

    // Handle ISO format dates (YYYY-MM-DDTHH:mm:ss.sssZ) by extracting just the date part
    let dateToFormat = dateStr.trim();
    if (dateToFormat.includes('T')) {
      dateToFormat = dateToFormat.split('T')[0];
    }

    // formatDate_dd_mm_yyyy expects YYYY-MM-DD format
    const formatted = formatDate_dd_mm_yyyy(dateToFormat);

    // If formatting fails, try to manually format
    if (!formatted && dateToFormat) {
      const parts = dateToFormat.split('-');
      if (parts.length === 3) {
        const [y, m, d] = parts;
        return `${d}-${m}-${y}`;
      }
    }

    return formatted || '';
  }, []);

  // Memoize display values
  const displayFrom = useMemo(() => getDisplayValue(fromDate), [fromDate, getDisplayValue]);
  const displayTo = useMemo(() => getDisplayValue(toDate), [toDate, getDisplayValue]);

  // Memoize clear button handler - must be defined unconditionally
  const handleClearDates = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // Clear both dates explicitly - use batch update if available
    if (onBothDatesChange) {
      onBothDatesChange(null, null);
    } else {
      onToDateChange(null);
      onFromDateChange(null);
    }
    setSelectingStart(true);
    setIsOpen(false);
  }, [onBothDatesChange, onToDateChange, onFromDateChange]);

  return (
    <div ref={wrapperRef} className="relative">
      {/* Single Input Field with From/To */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between
          w-full
          px-4 py-2.5
          bg-white
          border border-gray-300
          rounded-lg
          cursor-pointer
          transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
        `}
      >
        <div className="flex items-center gap-4 flex-1">
          {/* From Date */}
          <div className="flex-1 flex items-center gap-2">
            <div className="text-xs text-gray-500">From</div>
            <span className={`text-sm ${displayFrom ? 'text-gray-900' : 'text-gray-400'}`}>
              {displayFrom || 'Select date'}
            </span>
          </div>

          {/* Separator */}
          <div className="text-gray-400 text-lg">-</div>

          {/* To Date */}
          <div className="flex-1 flex items-center gap-2">
            <div className="text-xs text-gray-500">To</div>
            <span className={`text-sm ${displayTo ? 'text-gray-900' : 'text-gray-400'}`}>
              {displayTo || 'Select date'}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '26px',
            height: '26px',
            backgroundColor: '#DBEAFE',
            borderRadius: '4px',
            marginLeft: THEME.spacing.lg,
          }}
        >
          <CalendarIcon size={18} style={{ color: '#0EA5E9' }} />
        </div>
      </div>

      {/* Calendar Popup */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4"
          style={{ minWidth: '320px' }}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevMonth();
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div className="text-sm font-semibold text-gray-900">
              {monthNames[month]} {year}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextMonth();
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-2">
            <div className="text-center">S</div>
            <div className="text-center">M</div>
            <div className="text-center">T</div>
            <div className="text-center">W</div>
            <div className="text-center">T</div>
            <div className="text-center">F</div>
            <div className="text-center">S</div>
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={index} className="h-8" />;
              }

              const isStart = fromDateObj && isSameDay(date, fromDateObj);
              const isEnd = toDateObj && isSameDay(date, toDateObj);
              const isInRange = fromDateObj && toDateObj && isDateInRange(date, fromDateObj, toDateObj);
              const isToday = isSameDay(date, new Date());

              // Flight booking style: don't disable dates - allow clicking any date (will swap if needed)
              const isDisabled = false;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isDisabled) {
                      handleDateClick(date);
                    }
                  }}
                  disabled={isDisabled}
                  className={`
                    h-8 w-8 rounded
                    text-xs
                    transition-colors
                    relative
                    ${isStart || isEnd
                      ? 'bg-blue-600 text-white font-semibold z-10'
                      : isInRange
                        ? 'bg-blue-100 text-blue-900'
                        : isDisabled
                          ? 'text-gray-300 cursor-not-allowed'
                          : isToday
                            ? 'bg-gray-100 text-gray-900 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Clear Button */}
          {(fromDate || toDate) && (
            <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClearDates}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;