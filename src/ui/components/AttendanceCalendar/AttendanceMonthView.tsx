// import React, { useMemo } from "react";
// import { getMonthMatrix } from "@/ui/components/Calender/CalendarUtils";
// import type { AttendanceCalendarEvent } from "./AttendanceCalendarEvent";

// interface AttendanceMonthViewProps {
//     currentDate: Date;
//     events: AttendanceCalendarEvent[];
//     onDateChange?: (date: Date) => void;
//     onEventClick?: (ev: AttendanceCalendarEvent) => void;
// }

// const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

// const AttendanceMonthView = React.memo(function AttendanceMonthView({
//     currentDate,
//     events,
//     onDateChange,
//     onEventClick
// }: AttendanceMonthViewProps) {

//     const days = useMemo(() => getMonthMatrix(currentDate), [currentDate]);

//     // Memoize today's date string to avoid recalculating on every render
//     const todayStr = useMemo(() => {
//         const today = new Date();
//         return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
//     }, []);

//     const currentMonth = currentDate.getMonth();
//     const currentYear = currentDate.getFullYear();

//     // Memoize events by date for faster lookup
//     const eventsByDate = useMemo(() => {
//         const map = new Map<string, AttendanceCalendarEvent[]>();
//         events.forEach(ev => {
//             if (ev.start) {
//                 const dateKey = ev.start.slice(0, 10);
//                 if (!map.has(dateKey)) {
//                     map.set(dateKey, []);
//                 }
//                 map.get(dateKey)!.push(ev);
//             }
//         });
//         return map;
//     }, [events]);

//     return (
//         <div className="w-full overflow-x-auto">
//             <div className="grid grid-cols-7 border border-gray-200 rounded-lg min-w-[600px]">
//                 {DAY_NAMES.map(d =>
//                     <div key={d} className="p-2 sm:p-3 text-center font-semibold text-gray-500 border-b border-gray-200 bg-gray-50">
//                         <span className="text-xs sm:text-sm">{d}</span>
//                     </div>
//                 )}

//                 {days.map(day => {
//                     // Use local date string to avoid timezone issues
//                     const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
//                     const isToday = dateStr === todayStr;
//                     const isCurrentMonth = day.getMonth() === currentMonth && day.getFullYear() === currentYear;

//                     // Use memoized events map for O(1) lookup instead of O(n) filter
//                     const dayEvents = eventsByDate.get(dateStr) || [];

//                     return (
//                         <div

//                             key={day.toISOString()}
//                             className={`border border-gray-200 min-h-[100px] sm:min-h-[115px] p-1.5 sm:p-2 cursor-pointer hover:bg-blue-50 transition-colors
//                                 ${!isCurrentMonth ? 'bg-gray-50 opacity-60' : 'bg-white'}
//                                 ${isToday ? 'ring-2 ring-blue-500 ring-inset' : ''}
//                             `}
//                             onClick={() => onDateChange?.(day)}
//                         >
//                             <div className={`text-xs sm:text-sm font-semibold mb-1
//                                 ${isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
//                             `}>
//                                 {day.getDate()}
//                             </div>

//                             <div className="mt-1 space-y-0.5 sm:space-y-1 overflow-hidden">
//                                 {dayEvents.slice(0, 3).map(ev => {
//                                     const evTypeUpper = ev.type?.toUpperCase().replace(/\s+/g, '_') || '';
//                                     return (
//                                         <div
//                                             key={ev.id}
//                                             className={`text-[9px] sm:text-[10px] px-1 py-0.5 rounded truncate
//                                                 ${evTypeUpper === "PRESENT"
//                                                     ? "bg-green-100 text-green-700"
//                                                     : evTypeUpper === "ABSENT"
//                                                         ? "bg-red-100 text-red-700"
//                                                         : evTypeUpper === "LEAVE"
//                                                             ? "bg-yellow-100 text-yellow-700"
//                                                             : evTypeUpper === "HOLIDAY"
//                                                                 ? "bg-purple-100 text-purple-700"
//                                                                 : evTypeUpper === "LATE" || evTypeUpper.includes("LATE")
//                                                                     ? "bg-orange-100 text-orange-700"
//                                                                     : evTypeUpper === "CHECKOUT_MISSING" || evTypeUpper.includes("CHECKOUT") || evTypeUpper.includes("MISSING")
//                                                                         ? "bg-amber-100 text-amber-700"
//                                                                         : "bg-blue-100 text-blue-700"
//                                                 }`}
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 onEventClick?.(ev);
//                                             }}
//                                         >
//                                             {ev.type}
//                                         </div>
//                                     );
//                                 })}

//                                 {dayEvents.length > 3 && (
//                                     <div className="text-[9px] sm:text-[10px] text-gray-500 font-medium">
//                                         +{dayEvents.length - 3} more
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// }, (prevProps, nextProps) => {
//     // Only re-render if currentDate month/year changes or events change
//     const prevMonthYear = `${prevProps.currentDate.getFullYear()}-${prevProps.currentDate.getMonth()}`;
//     const nextMonthYear = `${nextProps.currentDate.getFullYear()}-${nextProps.currentDate.getMonth()}`;

//     // Re-render if month/year changed
//     if (prevMonthYear !== nextMonthYear) return false;

//     // Re-render if events array reference changed (new data loaded)
//     if (prevProps.events !== nextProps.events) return false;

//     // Don't re-render if only callbacks changed (they're stable with useCallback)
//     return true;
// });

// export default AttendanceMonthView;

import React, { useMemo } from "react";
import { getMonthMatrix } from "@/ui/components/Calender/CalendarUtils";
import type { AttendanceCalendarEvent } from "./AttendanceCalendarEvent";
import { getStatusBadgeClasses } from "@/features/attendanceCalendar/utils/attendanceUtils";

interface AttendanceMonthViewProps {
    currentDate: Date;
    events: AttendanceCalendarEvent[];
    onDateChange?: (date: Date) => void;
    onEventClick?: (ev: AttendanceCalendarEvent) => void;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const AttendanceMonthView = React.memo(function AttendanceMonthView({
    currentDate,
    events,
    onDateChange,
    onEventClick,
}: AttendanceMonthViewProps) {
    const days = useMemo(() => getMonthMatrix(currentDate), [currentDate]);

    const todayStr = useMemo(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
            2,
            "0"
        )}-${String(today.getDate()).padStart(2, "0")}`;
    }, []);

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    /** Group events by YYYY-MM-DD for O(1) lookup */
    const eventsByDate = useMemo(() => {
        const map = new Map<string, AttendanceCalendarEvent[]>();
        events.forEach((ev) => {
            if (!ev.start) return;
            const dateKey = ev.start.slice(0, 10);
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)!.push(ev);
        });
        return map;
    }, [events]);

    return (
        <div className="w-full overflow-x-auto">
            <div className="grid grid-cols-7 border border-gray-200 rounded-lg min-w-[600px]">
                {/* Day headers */}
                {DAY_NAMES.map((day) => (
                    <div
                        key={day}
                        className="p-2 sm:p-3 text-center font-semibold text-gray-500 border-b border-gray-200 bg-gray-50"
                    >
                        <span className="text-xs sm:text-sm">{day}</span>
                    </div>
                ))}

                {/* Calendar cells */}
                {days.map((day) => {
                    const dateStr = `${day.getFullYear()}-${String(
                        day.getMonth() + 1
                    ).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;

                    const isToday = dateStr === todayStr;
                    const isCurrentMonth =
                        day.getMonth() === currentMonth &&
                        day.getFullYear() === currentYear;

                    const dayEvents = eventsByDate.get(dateStr) || [];

                    return (
                        <div
                            key={day.toISOString()}
                            className={`border border-gray-200 min-h-[100px] sm:min-h-[115px] p-1.5 sm:p-2 cursor-pointer transition-colors
                ${!isCurrentMonth ? "bg-gray-50 opacity-60" : "bg-white"}
                ${isToday ? "ring-2 ring-blue-500 ring-inset" : ""}
                hover:bg-blue-50
              `}
                            onClick={() => onDateChange?.(day)}
                        >
                            {/* Date number */}
                            <div
                                className={`text-xs sm:text-sm font-semibold mb-1
                  ${isToday
                                        ? "text-blue-600"
                                        : isCurrentMonth
                                            ? "text-gray-900"
                                            : "text-gray-400"
                                    }
                `}
                            >
                                {day.getDate()}
                            </div>

                            {/* Events */}
                            <div className="mt-1 space-y-0.5 sm:space-y-1 overflow-hidden">
                                {dayEvents.slice(0, 3).map((ev) => {
                                    const badge = getStatusBadgeClasses(ev.type);

                                    return (
                                        <div
                                            key={ev.id}
                                            className="text-[9px] sm:text-[10px] px-1 py-0.5 rounded truncate border"
                                            style={{
                                                backgroundColor: `${badge.backgroundColor}20`, 
                                                color: badge.color,
                                                borderColor: `${badge.backgroundColor}40`,
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEventClick?.(ev);
                                            }}
                                        >
                                            {ev.type}
                                        </div>
                                    );
                                })}

                                {dayEvents.length > 3 && (
                                    <div className="text-[9px] sm:text-[10px] text-gray-500 font-medium">
                                        +{dayEvents.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
},
    (prevProps, nextProps) => {
        const prevMonthYear = `${prevProps.currentDate.getFullYear()}-${prevProps.currentDate.getMonth()}`;
        const nextMonthYear = `${nextProps.currentDate.getFullYear()}-${nextProps.currentDate.getMonth()}`;

        if (prevMonthYear !== nextMonthYear) return false;
        if (prevProps.events !== nextProps.events) return false;

        return true;
    });

export default AttendanceMonthView;
