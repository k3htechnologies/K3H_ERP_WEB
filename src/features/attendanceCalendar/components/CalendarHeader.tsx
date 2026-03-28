import React, { useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { formatDate_MonthName_yy } from '@/core/utils/dateFormat';

const ATTENDANCE_TYPE_FILTER_OPTIONS = [
  { id: 'All', label: 'All' },
  { id: 'Present', label: 'Present' },
  { id: 'Absent', label: 'Absent' },
  { id: 'Leave', label: 'Leave' },
  { id: 'Holiday', label: 'Holiday' },
  { id: 'Half Day', label: 'Half Day' },
  { id: 'Checkout Missing', label: 'Checkout Missing' },
  { id: 'Early Leave', label: 'Early Leave' },
  { id: 'CompOff', label: 'Comp Off' },
  { id: 'WeekOff', label: 'Week Off' },
] as const;

const FILTER_OPTIONS = ATTENDANCE_TYPE_FILTER_OPTIONS.map((o) => ({
  label: o.label,
  value: o.id,
}));

interface CalendarHeaderProps {
  displayedMonth: Date;
  activeTab: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onFilterChange: (value: string) => void;
}

export const CalendarHeader = React.memo<CalendarHeaderProps>(({
  displayedMonth,
  activeTab,
  onPreviousMonth,
  onNextMonth,
  onFilterChange,
}) => {
  const formattedMonth = useMemo(
    () => formatDate_MonthName_yy(displayedMonth),
    [displayedMonth]
  );

  const handleFilterChange = useCallback(
    (val: string | number) => {
      onFilterChange(String(val));
    },
    [onFilterChange]
  );

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
      <div className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-start">
        <button
          onClick={onPreviousMonth}
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Previous month"
          type="button"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
        </button>
        <h2 className="font-semibold text-blue-600 text-lg sm:text-xl lg:text-[22px] min-w-[140px] sm:min-w-[180px] text-center">
          {formattedMonth}
        </h2>
        <button
          onClick={onNextMonth}
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Next month"
          type="button"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
        </button>
      </div>

      <div className="w-full sm:w-auto sm:min-w-[160px] lg:min-w-[180px] pt-0 sm:pt-3">
        <SinglePageSelection
          value={activeTab}
          onChange={handleFilterChange}
          options={FILTER_OPTIONS}
        />
      </div>
    </div>
  );
});

CalendarHeader.displayName = 'CalendarHeader';

