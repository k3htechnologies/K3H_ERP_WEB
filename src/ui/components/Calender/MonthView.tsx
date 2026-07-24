import { useMemo } from "react";
import { getMonthMatrix } from "@/ui/components/Calender/CalendarUtils";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import type { CalendarEvent } from "./CalendarEvent";

const toLocalDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const getEventColorClass = (event: CalendarEvent) => {
    switch (event.color) {
        case "orange":
            return "bg-orange-100 text-orange-800 border-orange-200";
        case "green":
            return "bg-emerald-100 text-emerald-800 border-emerald-200";
        case "blue":
            return "bg-blue-100 text-blue-800 border-blue-200";
        default:
            return event.type?.toUpperCase() === "TASK"
                ? "bg-blue-100 text-blue-800 border-blue-200"
                : event.type?.toUpperCase() === "MEETING"
                    ? "bg-violet-100 text-violet-800 border-violet-200"
                    : "bg-orange-100 text-orange-800 border-orange-200";
    }
};

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
                const dateStr = toLocalDateKey(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                const dayEvents = events.filter(e =>
                    e.start.slice(0, 10) === dateStr
                ).sort((first, second) => first.start.localeCompare(second.start));

                return (
                    <div
                        key={day.toISOString()}
                        className={`border border-gray-200 min-h-[115px] p-2 cursor-pointer hover:bg-blue-50 ${
                            isCurrentMonth ? "bg-white" : "bg-slate-50 text-slate-400"
                        }`}
                        onClick={() => onDateChange?.(day)}
                    >
                        <div className="text-xs font-semibold">
                            {day.getDate()}
                        </div>

                        <div className="mt-1 space-y-1">
                            {dayEvents.slice(0, 2).map(ev => (
                                <button
                                    type="button"
                                    key={ev.id}
                                    className={`block w-full rounded border px-1.5 py-1 text-left text-[10px] font-medium ${getEventColorClass(ev)}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEventClick?.(ev);
                                    }}
                                >
                                    <TooltipText
                                        text={ev.title}
                                        maxWidth="100%"
                                        tooltipThreshold={14}
                                        isApplyBgTextColor
                                        tooltipClassName="text-left"
                                    />
                                </button>
                            ))}

                            {dayEvents.length > 2 && (
                                <button
                                    type="button"
                                    className="block w-full rounded px-1 text-left text-[10px] font-semibold text-blue-600 hover:bg-blue-50"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onDateChange?.(day);
                                    }}
                                >
                                    +{dayEvents.length - 2} more
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
