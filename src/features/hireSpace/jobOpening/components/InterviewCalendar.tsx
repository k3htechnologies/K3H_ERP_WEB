import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate_MonthName_yy } from '@/core/utils/dateFormat';
import CustomCalendar from '@/ui/components/Calender/CustomCalendar';
import type { CalendarEvent } from '@/ui/components/Calender/CalendarEvent';
import Tabs, { type TabItem } from '@/ui/components/Tab/Tab';
import { Button } from '@/ui/components/forms';

export type InterviewCalendarView = 'month' | 'week' | 'day';

const CALENDAR_VIEW_TABS: TabItem[] = [
  { id: 'month', label: 'Month' },
  { id: 'week', label: 'Week' },
  { id: 'day', label: 'Day' },
];

const shiftCalendarDate = (
  date: Date,
  view: InterviewCalendarView,
  direction: -1 | 1,
): Date => {
  const next = new Date(date);

  if (view === 'day') next.setDate(next.getDate() + direction);
  else if (view === 'week') next.setDate(next.getDate() + 7 * direction);
  else next.setFullYear(next.getFullYear(), next.getMonth() + direction, 1);

  return next;
};

interface InterviewCalendarProps {
  events: CalendarEvent[];
  date?: Date;
  onDateChange?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

export const InterviewCalendar: React.FC<InterviewCalendarProps> = ({
  events,
  date,
  onDateChange,
  onEventClick,
  className = '',
}) => {
  const [calendarView, setCalendarView] = useState<InterviewCalendarView>('month');
  const [currentDate, setCurrentDate] = useState(() => date ?? new Date());

  useEffect(() => {
    if (!date) return;
    setCurrentDate(date);
  }, [date?.getTime()]);

  const updateDates = (nextDate: Date) => {
    setCurrentDate(nextDate);
    onDateChange?.(nextDate);
  };

  const handlePreviousPeriod = () => {
    updateDates(shiftCalendarDate(currentDate, calendarView, -1));
  };

  const handleNextPeriod = () => {
    updateDates(shiftCalendarDate(currentDate, calendarView, 1));
  };

  const handleDateChange = (nextDate: Date) => {
    updateDates(nextDate);
  };

  const handleEventClick = (calendarEvent: CalendarEvent) => {
    const [year, month, day] = calendarEvent.start.slice(0, 10).split('-').map(Number);
    updateDates(new Date(year, month - 1, day));
    onEventClick?.(calendarEvent);
  };

  return (
    <section
      className={`flex min-w-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white ${className}`}
    >
      <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
            {formatDate_MonthName_yy(currentDate)}
          </h2>
          <div className="flex items-center overflow-hidden rounded-md border border-gray-200 bg-white">
            <Button
              onClick={handlePreviousPeriod}
              aria-label="Previous period"
              color="transparent"
              size="xs"
              defineWidth
              isborderRadius
            >
              <ChevronLeft />
            </Button>
            <Button
              onClick={handleNextPeriod}
              aria-label="Next period"
              color="transparent"
              size="xs"
              defineWidth
              isborderRadius
            >
              <ChevronRight />
            </Button>
          </div>
        </div>

        <Tabs
          tabs={CALENDAR_VIEW_TABS}
          defaultActive={calendarView}
          istoggleTab
          onTabChange={(tab) => setCalendarView(tab.id as InterviewCalendarView)}
        />
      </div>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto bg-white">
        <CustomCalendar
          view={calendarView}
          currentDate={currentDate}
          events={events}
          onDateChange={handleDateChange}
          onEventClick={handleEventClick}
        />
      </div>
    </section>
  );
};
