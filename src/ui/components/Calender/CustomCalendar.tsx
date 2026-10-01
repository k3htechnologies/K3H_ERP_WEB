import type { ReactNode } from "react";
import MonthView, { type RenderMonthDayEventsArgs } from "./MonthView";
import WeekView, { type RenderWeekSlotEventsArgs } from "./WeekView";
import DayView, { type RenderDayHourEventsArgs } from "./DayView";
import type { CalendarEvent } from "./CalendarEvent";

export type CalendarView = "month" | "week" | "day";

interface Props {
  view: CalendarView;
  currentDate: Date;
  events: CalendarEvent[];
  selectedDate?: Date;
  onDateChange?: (d: Date) => void;
  onEventClick?: (e: CalendarEvent) => void;
  renderDayEvents?: (args: RenderMonthDayEventsArgs) => ReactNode;
  renderWeekSlotEvents?: (args: RenderWeekSlotEventsArgs) => ReactNode;
  renderDayHourEvents?: (args: RenderDayHourEventsArgs) => ReactNode;
}

export default function CustomCalendar({
  view,
  currentDate,
  events,
  selectedDate,
  onDateChange,
  onEventClick,
  renderDayEvents,
  renderWeekSlotEvents,
  renderDayHourEvents,
}: Props) {
  if (view === "week") {
    return <WeekView {...{ currentDate, events, onEventClick, renderWeekSlotEvents }} />;
  }

  if (view === "day") {
    return <DayView {...{ currentDate, events, onEventClick, renderDayHourEvents }} />;
  }

  return (
    <MonthView
      currentDate={currentDate}
      selectedDate={selectedDate}
      events={events}
      onDateChange={onDateChange}
      onEventClick={onEventClick}
      renderDayEvents={renderDayEvents}
    />
  );
}
