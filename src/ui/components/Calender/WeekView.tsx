import type { ReactNode } from "react";
import { getWeekDays, getHours, toLocalDateKey } from "@/ui/components/Calender/CalendarUtils";
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
        <div className="grid grid-cols-[80px_repeat(7,1fr)] h-[80vh] text-xs">

            {/* HEADER ROW */}
            <div></div>
            {days.map(day => (
                <div key={day.toISOString()} className="flex flex-col gap-0.5 text-center">
                    <span className="text-[10px] text-gray-500 font-semibold">
                        {day.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}
                    </span>

                    <span className="text-sm font-semibold">
                        {day.getDate()}
                    </span>
                </div>

            ))}

            {/* TIME GRID */}
            {hours.map(h => (
                <div key={h} className="contents">
                    {/* LEFT TIME LABEL */}
                    <div className="border border-gray-200 px-2 py-1 text-gray-500">{h}</div>

                    {/* CELLS FOR EACH DAY */}
                    {days.map(day => {
                        const dateStr = toLocalDateKey(day);
                        const hourStr = h.slice(0, 2);

                        const slotEvents = events.filter(e => {
                            const eDate = e.start.slice(0, 10);
                            const eHour = e.start.slice(11, 13);
                            return eDate === dateStr && eHour === hourStr;
                        });

                        return (
                            <div
                                key={`${dateStr}-${h}`}
                                className="border border-gray-200 relative min-h-[44px]"
                            >
                                {renderWeekSlotEvents
                                    ? renderWeekSlotEvents({ day, slotEvents, onEventClick })
                                    : slotEvents.map(ev => (
                                        <div
                                            key={ev.id}
                                            className={`absolute m-1 p-1 rounded cursor-pointer ${
                                                ev.type?.toUpperCase() === "TASK"
                                                    ? "bg-blue-200 text-blue-900"
                                                    : ev.type?.toUpperCase() === "MEETING"
                                                        ? "bg-red-200 text-red-900"
                                                        : "bg-orange-200 text-orange-900"
                                            }`}
                                            onClick={() => onEventClick?.(ev)}
                                        >
                                            {ev.title}
                                        </div>
                                    ))}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
