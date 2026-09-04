import MonthView from "./MonthView";
import WeekView from "./WeekView";
import DayView from "./DayView";
import type { CalendarEvent } from "./CalendarEvent";

type CalendarView = "month" | "week" | "day";

interface Props {
  view: CalendarView;
  currentDate: Date;
  events: CalendarEvent[];
  onDateChange?: (d: Date) => void;
  onEventClick?: (e: CalendarEvent) => void;
}

export default function CustomCalendar({
  view,
  currentDate,
  events,
  onDateChange,
  onEventClick
}: Props) {

  if (view === "week")
    return <WeekView {...{ currentDate, events, onDateChange, onEventClick }} />

  if (view === "day")
    return <DayView {...{ currentDate, events, onEventClick }} />

  return <MonthView {...{ currentDate, events, onDateChange, onEventClick }} />
}