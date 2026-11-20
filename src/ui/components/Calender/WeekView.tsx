import { Fragment, type ReactNode } from "react";
import {
    getWeekDays,
    getHours,
    toLocalDateKey,
    parseEventDateTime,
    getEventColorClass,
} from "@/ui/components/Calender/CalendarUtils";
import type { CalendarEvent } from "./CalendarEvent";

export interface RenderWeekSlotEventsArgs {
    day: Date;
    slotEvents: CalendarEvent[];
    onEventClick?: (ev: CalendarEvent) => void;
}

interface WeekViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    onEventClick?: (ev: CalendarEvent) => void;
    renderWeekSlotEvents?: (args: RenderWeekSlotEventsArgs) => ReactNode;
}

export default function WeekView({
    currentDate,
    events,
    onEventClick,
    renderWeekSlotEvents,
}: WeekViewProps) {
    const days = getWeekDays(currentDate);
    const hours = getHours();

    return (
        <div
            className="grid h-[80vh] overflow-y-auto thin-scroll text-xs border border-gray-200 rounded-lg bg-white"
            style={{ gridTemplateColumns: "80px repeat(7, minmax(0, 1fr))" }}
        >
            {/* HEADER ROW */}
            <div className="sticky top-0 z-20 bg-[#EFF0F8] border-b border-r border-[#CAD2E1] h-12 flex items-center justify-center font-semibold text-[#596170]">
                Time
            </div>
            {days.map(day => (
                <div
                    key={day.toISOString()}
                    className="sticky top-0 z-20 bg-[#EFF0F8] border-b border-r border-[#CAD2E1] h-12 flex flex-col items-center justify-center text-center font-semibold uppercase text-[#596170]"
                >
                    <span className="text-[10px]">
                        {day.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                    <span className="text-xs text-gray-800">
                        {day.getDate()}
                    </span>
                </div>
            ))}

            {/* ALL-DAY / TASKS ROW */}
            <div className="sticky top-12 z-10 bg-gray-50 border-b border-r border-gray-200 px-2 py-1 text-gray-500 font-medium text-[10px] flex items-center">
                All day
            </div>
            {days.map(day => {
                const dateStr = toLocalDateKey(day);
                const allDaySlotEvents = events.filter(e => {
                    const { dateStr: eDate, hourStr } = parseEventDateTime(e.start);
                    return eDate === dateStr && hourStr === null;
                });

                return (
                    <div
                        key={`allday-${dateStr}`}
                        className="sticky top-12 z-10 bg-gray-50/80 border-b border-r border-gray-200 p-1 min-h-[36px] overflow-hidden"
                    >
                        {renderWeekSlotEvents
                            ? renderWeekSlotEvents({ day, slotEvents: allDaySlotEvents, onEventClick })
                            : allDaySlotEvents.map(ev => (
                                <div
                                    key={ev.id}
                                    className={`m-0.5 p-1 rounded cursor-pointer truncate ${getEventColorClass(ev)}`}
                                    onClick={() => onEventClick?.(ev)}
                                >
                                    {ev.title}
                                </div>
                            ))}
                    </div>
                );
            })}

            {/* TIME GRID */}
            {hours.map(h => (
                <Fragment key={h}>
                    {/* LEFT TIME LABEL */}
                    <div className="border-b border-r border-gray-200 px-2 py-1 text-gray-500 bg-white min-h-[48px] flex items-start text-[11px]">
                        {h}
                    </div>

                    {/* CELLS FOR EACH DAY */}
                    {days.map(day => {
                        const dateStr = toLocalDateKey(day);
                        const hourStr = h.slice(0, 2);

                        const slotEvents = events.filter(e => {
                            const { dateStr: eDate, hourStr: eHour } = parseEventDateTime(e.start);
                            return eDate === dateStr && eHour === hourStr;
                        });

                        return (
                            <div
                                key={`${dateStr}-${h}`}
                                className="border-b border-r border-gray-200 relative min-h-[48px] overflow-hidden bg-white hover:bg-blue-50/30 transition-colors"
                            >
                                {renderWeekSlotEvents
                                    ? renderWeekSlotEvents({ day, slotEvents, onEventClick })
                                    : slotEvents.map(ev => (
                                        <div
                                            key={ev.id}
                                            className={`m-1 p-1 rounded cursor-pointer truncate ${getEventColorClass(ev)}`}
                                            onClick={() => onEventClick?.(ev)}
                                        >
                                            {ev.title}
                                        </div>
                                    ))}
                            </div>
                        );
                    })}
                </Fragment>
            ))}
        </div>
    );
}
