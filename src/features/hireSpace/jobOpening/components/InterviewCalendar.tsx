import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate_MonthName_yy } from '@/core/utils/dateFormat';
import { InterviewEventChip } from '@/features/hireSpace/jobOpening/components/InterviewEventChip';
import { getEventTime } from '@/features/hireSpace/jobOpening/utils/jobOpeningUtils';
import CustomCalendar from '@/ui/components/Calender/CustomCalendar';
import type { CalendarEvent } from '@/ui/components/Calender/CalendarEvent';
import type { RenderDayHourEventsArgs } from '@/ui/components/Calender/DayView';
import type { RenderMonthDayEventsArgs } from '@/ui/components/Calender/MonthView';
import type { RenderWeekSlotEventsArgs } from '@/ui/components/Calender/WeekView';
import Tabs, { type TabItem } from '@/ui/components/Tab/Tab';
import { Button } from '@/ui/components/forms';
import TooltipText from '@/ui/components/Tooltip/TooltipText';

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
  onViewChange?: (view: InterviewCalendarView) => void;
  className?: string;
}

export const InterviewCalendar: React.FC<InterviewCalendarProps> = ({
  events,
  date,
  onDateChange,
  onEventClick,
  onViewChange,
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

  const handleViewChange = (tab: TabItem) => {
    const nextView = tab.id as InterviewCalendarView;

    setCalendarView(nextView);
    onViewChange?.(nextView);
  };

  const handleEventClick = (calendarEvent: CalendarEvent) => {
    const [year, month, day] = calendarEvent.start.slice(0, 10).split('-').map(Number);
    updateDates(new Date(year, month - 1, day));
    onEventClick?.(calendarEvent);
  };

  const renderDayHourEvents = ({ hourEvents, onEventClick: onHourEventClick }: RenderDayHourEventsArgs) => {
    if (hourEvents.length === 0) return null;

    return (
      <div className="thin-scroll flex h-full items-stretch gap-1 overflow-x-auto overflow-y-hidden px-1 py-0.5">
        {hourEvents.map((event) => (
          <InterviewEventChip
            key={event.id}
            event={event}
            onEventClick={onHourEventClick}
          />
        ))}
      </div>
    );
  };

  const renderWeekSlotEvents = ({ slotEvents, onEventClick: onSlotEventClick }: RenderWeekSlotEventsArgs) => {
    if (slotEvents.length === 0) return null;

    return (
      <div className="thin-scroll flex h-full items-stretch gap-0.5 overflow-x-auto overflow-y-hidden p-0.5">
        {slotEvents.map((event) => (
          <InterviewEventChip
            key={event.id}
            event={event}
            onEventClick={onSlotEventClick}
            compact
          />
        ))}
      </div>
    );
  };

  const renderDayEvents = ({
    day,
    dayEvents,
    onEventClick: onMonthEventClick,
    onDateChange: onMonthDateChange,
  }: RenderMonthDayEventsArgs) => {
    if (dayEvents.length === 0) return null;

    return (
      <>
        {dayEvents.slice(0, 2).map((event) => (
          <button
            type="button"
            key={event.id}
            className="block w-full rounded border border-red-200 bg-red-50 px-1.5 py-1 text-left text-[10px] font-medium text-red-900"
            onClick={(clickEvent) => {
              clickEvent.stopPropagation();
              onMonthEventClick?.(event);
            }}
          >
            <span className="block font-semibold">{getEventTime(event)}</span>
            <TooltipText
              text={event.title || '-'}
              maxWidth="100%"
              tooltipThreshold={14}
              isApplyBgTextColor
              tooltipClassName="text-left text-[10px] text-red-900"
            />
          </button>
        ))}

        {dayEvents.length > 2 && (
          <button
            type="button"
            className="block w-full rounded px-1 text-left text-[10px] font-semibold text-blue-600 hover:bg-blue-50"
            onClick={(clickEvent) => {
              clickEvent.stopPropagation();
              onMonthDateChange?.(day);
            }}
          >
            +{dayEvents.length - 2} more
          </button>
        )}
      </>
    );
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
          onTabChange={handleViewChange}
        />
      </div>

      <div className="h-[80vh] min-h-0 overflow-hidden bg-white">
        <CustomCalendar
          view={calendarView}
          currentDate={currentDate}
          events={events}
          onDateChange={handleDateChange}
          onEventClick={handleEventClick}
          renderDayEvents={renderDayEvents}
          renderWeekSlotEvents={renderWeekSlotEvents}
          renderDayHourEvents={renderDayHourEvents}
        />
      </div>
    </section>
  );
};
