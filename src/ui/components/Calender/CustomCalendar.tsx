import type { ReactNode } from "react";
import type { CalendarEvent } from "@/ui/components/Calender/CalendarEvent";
import DayView, { type RenderDayHourEventsArgs } from "@/ui/components/Calender/DayView";
import MonthView, { type RenderMonthDayEventsArgs } from "@/ui/components/Calender/MonthView";
import WeekView, { type RenderWeekSlotEventsArgs } from "@/ui/components/Calender/WeekView";

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
