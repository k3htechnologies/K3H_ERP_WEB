import { useMemo } from "react";
import { getMonthMatrix } from "@/ui/components/Calender/CalendarUtils";
import type { CalendarEvent } from "./CalendarEvent";
import { convert_yy_mm_dd_To_dd_mm_yyyy, formatDate_yyyy_mm_dd } from "@/core/utils/dateFormat";

interface MonthViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    onDateChange?: (date: Date) => void;
    onEventClick?: (ev: CalendarEvent) => void;
}

export default function MonthView({
    currentDate,
    events,
    onDateChange,
    onEventClick
}: MonthViewProps) {

    const days = useMemo(() => getMonthMatrix(currentDate), [currentDate]);

    return (
        <div className="grid grid-cols-7 border border-gray-200 rounded-lg">

            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d =>
                <div key={d} className="p-2 text-center font-semibold text-gray-500 border border-gray-200">
                    {d}
                </div>
            )}

            {days.map(day => {
                const dateStr = formatDate_yyyy_mm_dd(day);
                const dayEvents = events.filter(e =>
                    e.start.slice(0, 10) === dateStr
                );
           

                return (
                    <div
                        key={day.toISOString()}
                        className="border border-gray-200 min-h-[115px] p-2 cursor-pointer hover:bg-blue-50"
                        onClick={() => onDateChange?.(day)}
                    >
                        <div className="text-xs font-semibold">
                            {day.getDate()}
                        </div>

                        <div className="mt-1 space-y-1">
                            {dayEvents.slice(0, 3).map(ev => (
                                <div
                                    key={ev.id}
                                    className={`text-[10px] px-1 rounded 
                                            ${ev.type?.toUpperCase() === "TASK"
                                            ? "bg-blue-100 text-blue-700"
                                            : ev.type?.toUpperCase() === "MEETING"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-orange-100 text-orange-700"
                                        }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEventClick?.(ev);
                                    }}
                                >
                                    {ev.type}
                                </div>
                            ))}

                            {dayEvents.length > 3 && (
                                <div className="text-[10px] text-gray-500">
                                    +{dayEvents.length - 3} more
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
