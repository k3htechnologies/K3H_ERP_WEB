import { getWeekDays, getHours } from "@/ui/components/Calender/CalendarUtils";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import type { CalendarEvent } from "./CalendarEvent";

interface WeekViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    onEventClick?: (ev: CalendarEvent) => void;
}

export default function WeekView({
    currentDate,
    events,
    onEventClick
}: WeekViewProps) {

    const days = getWeekDays(currentDate);
    const hours = getHours();
    return (
        <div className="grid grid-cols-[80px_repeat(7,1fr)] h-[80vh] text-xs">

            {/* HEADER ROW */}
            <div></div>
            {days.map(day => (
                <div className="flex flex-col gap-0.5 text-center">
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
                    <div className="border border-gray-200 px-2 py-1">{h}</div>

                    {/* CELLS FOR EACH DAY */}
                    {days.map(day => {
                        const dateStr = day.toISOString().slice(0, 10);
                        const hourStr = h.slice(0, 2);

                        const slotEvents = events.filter(e =>
                            e.start.slice(0, 10) === dateStr &&
                            e.start.slice(11, 13) === hourStr
                        );

                        return (
                            <div
                                key={`${dateStr}-${h}`}
                                className="border border-gray-200 relative"
                            >
                                {slotEvents.map(ev => (
                                    <div
                                        key={ev.id}
                                        className={`absolute m-1 min-w-0 overflow-hidden rounded p-1 cursor-pointer
                      ${ev.type?.toUpperCase() === "TASK"
                                                ? "bg-blue-200 text-blue-900"
                                                : ev.type?.toUpperCase() === "MEETING"
                                                    ? "bg-red-200 text-red-900"
                                                    : "bg-emerald-100 text-emerald-900"
                                        }`}
                                        onClick={() => onEventClick?.(ev)}
                                    >
                                        <TooltipText
                                            text={ev.title}
                                            maxWidth="100%"
                                            tooltipThreshold={14}
                                            isApplyBgTextColor
                                            tooltipClassName="text-left"
                                        />
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
