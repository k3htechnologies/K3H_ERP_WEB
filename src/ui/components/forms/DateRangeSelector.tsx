import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate_dd_mm_yyyy } from '@/core/utils/dateFormat';
import { THEME } from '@/core/constants/theme';

export interface DateRangeSelectorProps {
  fromDate?: string | null;
  toDate?: string | null;
  onFromDateChange: (date: string | null) => void;
  onToDateChange: (date: string | null) => void;
  disabled?: boolean;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectingStart, setSelectingStart] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Initialize current month based on selected dates
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

  const parseDate = (dateStr: string | null): Date | null => {
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
  };

  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateClick = (date: Date) => {
    const dateStr = formatLocalDate(date);
    if (!dateStr) return;

    const from = parseDate(fromDate || null);
    const to = parseDate(toDate || null);

    if (selectingStart || (!from && !to)) {
      // Selecting start date
      onFromDateChange(dateStr);
      // If there's an end date and it's before the new start, clear it
      if (to && date > to) {
        onToDateChange(null);
      }
      setSelectingStart(false);
    } else {
      // Selecting end date
      if (from) {
        if (date < from) {
          // If selected date is before start, swap them
          onFromDateChange(dateStr);
          onToDateChange(fromDate || null);
        } else {
          onToDateChange(dateStr);
        }
        // Close calendar when both dates are selected
        setIsOpen(false);
        setSelectingStart(true);
      }
    }
  };

  const isSameDay = (d1: Date | null, d2: Date | null): boolean => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  };

  const isDateInRange = (date: Date, start: Date | null, end: Date | null): boolean => {
    if (!start || !end) return false;
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return dateOnly > startOnly && dateOnly < endOnly;
  };

  const generateCalendar = (baseDate: Date) => {
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
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };


  const fromDateObj = parseDate(fromDate || null);
  const toDateObj = parseDate(toDate || null);
  const { days, year, month } = generateCalendar(currentMonth);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Format dates for display - ensure dates are in correct format
  const getDisplayValue = (dateStr: string | null | undefined): string => {
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
  };

  const displayFrom = getDisplayValue(fromDate);
  const displayTo = getDisplayValue(toDate);

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

              // Disable dates before start date when selecting end date
              const isDisabled = !!(!selectingStart && fromDateObj && date < fromDateObj);

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
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  // Clear both dates explicitly
                  onFromDateChange(null);
                  onToDateChange(null);
                  setSelectingStart(true);
                  setIsOpen(false);
                }}
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
