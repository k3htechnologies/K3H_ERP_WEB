import { useMemo, type ReactNode } from "react";
import { getEventColorClass, getMonthMatrix, toLocalDateKey } from "@/ui/components/Calender/CalendarUtils";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import type { CalendarEvent } from "./CalendarEvent";

export type RenderMonthDayEventsArgs = {
    day: Date;
    dayEvents: CalendarEvent[];
    onEventClick?: (ev: CalendarEvent) => void;
    onDateChange?: (date: Date) => void;
};

interface MonthViewProps {
    currentDate: Date;
    selectedDate?: Date;
    events: CalendarEvent[];
    onDateChange?: (date: Date) => void;
    onEventClick?: (ev: CalendarEvent) => void;
    renderDayEvents?: (args: RenderMonthDayEventsArgs) => ReactNode;
}

export default function MonthView({
    currentDate,
    selectedDate,
    events,
    onDateChange,
    onEventClick,
    renderDayEvents,
}: MonthViewProps) {
    const days = useMemo(() => getMonthMatrix(currentDate), [currentDate]);

    const isSameDate = (first: Date, second?: Date) =>
        Boolean(
            second &&
            first.getFullYear() === second.getFullYear() &&
            first.getMonth() === second.getMonth() &&
            first.getDate() === second.getDate(),
        );

    return (
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-[#CAD2E1] bg-[#D9DEE8]">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div
                    key={d}
                    className="flex h-12 items-center justify-center bg-[#EFF0F8] text-center text-[11px] font-semibold uppercase text-[#596170]"
                >
                    {d}
                </div>
            ))}

            {days.map((day) => {
                const dateStr = toLocalDateKey(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isSelected = isSameDate(day, selectedDate);

                const dayEvents = events
                    .filter((e) => e.start.slice(0, 10) === dateStr)
                    .sort((first, second) => first.start.localeCompare(second.start));

                return (
                    <div
                        key={day.toISOString()}
                        className={`min-h-[115px] cursor-pointer p-2 transition-colors ${
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
                            {renderDayEvents ? (
                                renderDayEvents({
                                    day,
                                    dayEvents,
                                    onEventClick,
                                    onDateChange,
                                })
                            ) : (
                                <>
                                    {dayEvents.slice(0, 2).map((ev) => (
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
                                </>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
