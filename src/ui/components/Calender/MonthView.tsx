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
    selectedDate?: Date;
    events: CalendarEvent[];
    variant?: "default" | "event";
    groupEventsByType?: boolean;
    onDateChange?: (date: Date) => void;
    onEventClick?: (ev: CalendarEvent) => void;
}

export default function MonthView({
    currentDate,
    selectedDate,
    events,
    variant = "default",
    groupEventsByType = false,
    onDateChange,
    onEventClick
}: MonthViewProps) {

    const days = useMemo(() => {
        const monthMatrix = getMonthMatrix(currentDate);
        if (variant !== "event") return monthMatrix;

        const lastCurrentMonthIndex = monthMatrix.reduce(
            (lastIndex, day, index) =>
                day.getMonth() === currentDate.getMonth() ? index : lastIndex,
            0,
        );
        const visibleDayCount = Math.max(
            35,
            Math.ceil((lastCurrentMonthIndex + 1) / 7) * 7,
        );
        return monthMatrix.slice(0, visibleDayCount);
    }, [currentDate, variant]);

    const isSameDate = (first: Date, second?: Date) =>
        Boolean(
            second &&
            first.getFullYear() === second.getFullYear() &&
            first.getMonth() === second.getMonth() &&
            first.getDate() === second.getDate(),
        );

    return (
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-[#CAD2E1] bg-[#D9DEE8]">

            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d =>
                <div
                    key={d}
                    className={`flex items-center justify-center bg-[#EFF0F8] text-center font-semibold uppercase text-[#596170] ${
                        variant === "event" ? "h-12 text-[11px]" : "p-2 text-xs"
                    }`}
                >
                    {d}
                </div>
            )}

            {days.map(day => {
                const dateStr = toLocalDateKey(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isSelected = isSameDate(day, selectedDate);

                const dayEvents = events.filter(e =>
                    e.start.slice(0, 10) === dateStr
                ).sort((first, second) => first.start.localeCompare(second.start));
                const groupedEvents = Array.from(
                    dayEvents.reduce((groups, event) => {
                        const key = event.type?.toUpperCase() || "EVENT";
                        const group = groups.get(key) ?? [];
                        group.push(event);
                        groups.set(key, group);
                        return groups;
                    }, new Map<string, CalendarEvent[]>()),
                );

                return (
                    <div
                        key={day.toISOString()}
                        className={`cursor-pointer p-2 transition-colors ${
                            variant === "event" ? "min-h-[145px]" : "min-h-[115px]"
                        } ${
                            isSelected
                                ? "bg-[#F1F3FC]"
                                : isCurrentMonth
                                  ? "bg-white hover:bg-blue-50"
                                  : "bg-[#F4F5F8] text-slate-400 hover:bg-[#EEF1F7]"
                        }`}
                        onClick={() => onDateChange?.(day)}
                    >
                        <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                                isSelected ? "bg-[#1558D6] text-white" : ""
                            }`}
                        >
                            {day.getDate()}
                        </div>

                        <div className="mt-1 space-y-1">
                            {groupEventsByType
                              ? groupedEvents.slice(0, 3).map(([type, grouped]) => {
                                const firstEvent = grouped[0];
                                const label =
                                    type === "CONFERENCE" && grouped.length === 1
                                        ? firstEvent.title || "Conference"
                                        : `${type.charAt(0)}${type.slice(1).toLowerCase()} [${grouped.length}]`;

                                return (
                                    <button
                                        type="button"
                                        key={type}
                                        className={`block w-full truncate rounded border-l-[3px] px-2 py-1.5 text-left text-[10px] font-medium ${getEventColorClass(firstEvent)}`}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onEventClick?.(firstEvent);
                                        }}
                                    >
                                        {label}
                                    </button>
                                );
                              })
                              : dayEvents.slice(0, 2).map(ev => (
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

                            {!groupEventsByType && dayEvents.length > 2 && (
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
