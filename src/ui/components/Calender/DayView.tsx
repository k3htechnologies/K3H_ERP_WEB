import { useEffect, useState, type ReactNode } from "react";
import type { CalendarEvent } from "./CalendarEvent";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import {
  toLocalDateKey,
  parseEventDateTime,
  getEventColorClass,
} from "./CalendarUtils";

export interface RenderDayHourEventsArgs {
  hour: string;
  hourEvents: CalendarEvent[];
  onEventClick?: (ev: CalendarEvent) => void;
}

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (ev: CalendarEvent) => void;
  renderDayHourEvents?: (args: RenderDayHourEventsArgs) => ReactNode;
}

export default function DayView({
  currentDate,
  events,
  onEventClick,
  renderDayHourEvents,
}: DayViewProps) {
  const dateStr = toLocalDateKey(currentDate);

  const hours = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, "0")}:00`
  );

  const dayEvents = events.filter((e) => {
    const { dateStr: eDate } = parseEventDateTime(e.start);
    return eDate === dateStr;
  });

  const allDayEvents = dayEvents.filter((e) => {
    const { hourStr } = parseEventDateTime(e.start);
    return hourStr === null;
  });

  const timedEvents = dayEvents.filter((e) => {
    const { hourStr } = parseEventDateTime(e.start);
    return hourStr !== null;
  });

  const dayName = currentDate.toLocaleDateString("en-US", { weekday: "short" });
  const dayNumber = currentDate.getDate();

  const [nowMinutes, setNowMinutes] = useState<number>(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const n = new Date();
      setNowMinutes(n.getHours() * 60 + n.getMinutes());
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  const isToday = toLocalDateKey(new Date()) === dateStr;

  const buildLanes = (evts: CalendarEvent[]) => {
    type LaneEvent = CalendarEvent & {
      startMin: number;
      endMin: number;
      lane: number;
    };

    const getMinutesFromDateOrTime = (
      timeOrDateStr?: string,
      fallbackMinutes = 0,
    ): number => {
      if (!timeOrDateStr) return fallbackMinutes;
      const parts = timeOrDateStr.split("T");
      const timeRaw = (parts[1] || parts[0]).trim();
      const isPM = /pm/i.test(timeRaw);
      const isAM = /am/i.test(timeRaw);
      const cleanTime = timeRaw.replace(/[ap]m/gi, "").trim();
      const segments = cleanTime.split(":");
      let h = parseInt(segments[0], 10);
      const m = parseInt(segments[1] || "0", 10);
      if (Number.isNaN(h)) return fallbackMinutes;
      if (isPM && h < 12) h += 12;
      else if (isAM && h === 12) h = 0;
      return h * 60 + (Number.isNaN(m) ? 0 : m);
    };

    const mapped: LaneEvent[] = evts.map((e) => {
      const startMin = getMinutesFromDateOrTime(e.start, 0);
      const endMin = getMinutesFromDateOrTime(e.end, startMin + 60);
      return {
        ...e,
        startMin,
        endMin: Math.max(endMin, startMin + 30),
        lane: 0,
      };
    });

    mapped.sort((a, b) => a.startMin - b.startMin);

    const active: LaneEvent[] = [];

    mapped.forEach((ev) => {
      for (let i = active.length - 1; i >= 0; i--) {
        if (active[i].endMin <= ev.startMin) active.splice(i, 1);
      }

      const used = active.map((a) => a.lane);
      let lane = 0;
      while (used.includes(lane)) lane++;

      ev.lane = lane;
      active.push(ev);
    });

    return mapped;
  };

  const laneEvents = buildLanes(timedEvents);
  const maxLane = Math.max(...laneEvents.map((e) => e.lane), 0);
  const laneWidth = 100 / (maxLane + 1);

  const colors = [
    "bg-pink-400 border-pink-200",
    "bg-green-400 border-green-200",
    "bg-blue-400 border-blue-200",
  ];

  return (
    <div className="flex flex-col h-[80vh] border border-gray-200 rounded-lg bg-white">
      {/* HEADER */}
      <div className="px-4 py-3 border-b bg-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 font-semibold uppercase">
            {dayName}
          </div>
          <div className="text-xl font-bold text-gray-800">
            {dayNumber}
          </div>
        </div>

        {/* ALL-DAY / TASKS BADGES */}
        {allDayEvents.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              All Day / Tasks:
            </span>
            {allDayEvents.map((ev) => (
              <div
                key={ev.id}
                className={`cursor-pointer rounded border-l-[3px] px-2 py-1 text-xs font-medium truncate max-w-[200px] ${getEventColorClass(ev)}`}
                onClick={() => onEventClick?.(ev)}
                title={ev.title}
              >
                {ev.title}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GRID */}
      <div
        className="grid flex-1 overflow-y-auto thin-scroll relative"
        style={{ gridTemplateColumns: "80px 1fr" }}
      >
        <div>
          {hours.map((h) => (
            <div
              key={h}
              className="border-b border-r border-gray-200 text-xs px-2 py-3 h-[60px] text-gray-500"
            >
              {h}
            </div>
          ))}
        </div>

        <div className="relative">
          {hours.map((h) => {
            const hourStr = h.slice(0, 2);
            const hourEvents = timedEvents.filter((e) => {
              const { hourStr: eHour } = parseEventDateTime(e.start);
              return eHour === hourStr;
            });

            return (
              <div
                key={h}
                className="border-b border-gray-200 h-[60px] overflow-hidden"
              >
                {renderDayHourEvents?.({
                  hour: h,
                  hourEvents,
                  onEventClick,
                })}
              </div>
            );
          })}

          {/* CURRENT TIME LINE */}
          {isToday && (
            <div
              className="absolute left-0 right-0 z-50 pointer-events-none"
              style={{
                top: `${nowMinutes}px`,
              }}
            >
              <div className="h-[2px] bg-blue-500 w-full" />
              <div className="w-[10px] h-[10px] bg-blue-500 rounded-full absolute -left-[5px] -top-[4px]" />
            </div>
          )}

          {/* LANE EVENTS (when renderDayHourEvents not provided) */}
          {!renderDayHourEvents &&
            laneEvents.map((ev) => {
              const startMin = ev.startMin;
              const endMin = ev.endMin;
              const duration = Math.max(endMin - startMin, 50);

              return (
                <div
                  key={ev.id}
                  className="absolute rounded-xl shadow border cursor-pointer flex flex-col justify-between overflow-hidden"
                  style={{
                    top: `${startMin}px`,
                    height: `${duration}px`,
                    width: `${laneWidth}%`,
                    left: `${ev.lane * laneWidth}%`,
                    background:
                      ev.type?.toUpperCase() === "TASK"
                        ? "linear-gradient(90deg, rgba(19, 91, 236, 0.25) 0%, #FFFFFF 100%)"
                        : ev.type?.toUpperCase() === "MEETING"
                          ? "linear-gradient(90deg, rgba(233, 44, 44, 0.25) 0%, #FFFFFF 100%)"
                          : "linear-gradient(90deg, rgba(255, 159, 45, 0.25) 0%, #FFFFFF 100%)",
                    border:
                      ev.type?.toUpperCase() === "TASK"
                        ? "1px solid #135BEC"
                        : ev.type?.toUpperCase() === "MEETING"
                          ? "1px solid #E92C2C"
                          : "1px solid #FF9F2D",
                  }}
                  onClick={() => onEventClick?.(ev)}
                >
                  <div
                    className="absolute left-1 top-2 bottom-2 w-[6px] rounded-full"
                    style={{
                      background:
                        ev.type?.toUpperCase() === "TASK"
                          ? "#2563eb"
                          : ev.type?.toUpperCase() === "MEETING"
                            ? "#ef4444"
                            : "#f59e0b",
                    }}
                  />
                  <div className="pl-4 px-2 pt-1.5 text-sm font-semibold text-gray-800 truncate">
                    {ev.title}
                  </div>

                  <div className="pl-4 px-2 pb-1 text-[11px] text-gray-500">
                    {ev.start.includes("T") ? ev.start.split("T")[1].slice(0, 5) : ""}
                    {ev.end ? ` — ${ev.end.includes("T") ? ev.end.split("T")[1].slice(0, 5) : ""}` : ""}
                  </div>

                  {/* FOOTER */}
                  <div className="pl-4 px-2 pb-1 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 truncate max-w-[100px]">
                      {ev.CreatedBy}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {formatDate_dd_MonthName_yy(ev.CreatedDate ?? "-")}
                    </span>

                    <div className="flex -space-x-1">
                      {(ev.fullname ?? "")
                        .split(",")
                        .map((name) => name.trim())
                        .filter((name) => name !== "")
                        .slice(0, 3)
                        .map((name, i) => (
                          <div
                            key={i}
                            className={`w-5 h-5 rounded-full ${colors[i % colors.length]} border text-[9px] flex items-center justify-center text-white`}
                          >
                            {name[0].toUpperCase()}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
