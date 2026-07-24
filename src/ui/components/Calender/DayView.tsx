import { useEffect, useState } from "react";
import type { CalendarEvent } from "./CalendarEvent";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import TooltipText from "@/ui/components/Tooltip/TooltipText";

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (ev: CalendarEvent) => void;
}

export default function DayView({
  currentDate,
  events,
  onEventClick
}: DayViewProps) {

  const dateStr = currentDate.toISOString().slice(0, 10);

  const hours = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, "0")}:00`
  );

  const dayEvents = events.filter(e =>
    e.start.slice(0, 10) === dateStr
  );

  const dayName = currentDate.toLocaleDateString("en-US", { weekday: "short" });
  const dayNumber = currentDate.getDate();


  /* Track current time in minutes */
  const [nowMinutes, setNowMinutes] = useState<number>(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });

  /* update every minute */
  useEffect(() => {
    const timer = setInterval(() => {
      const n = new Date();
      setNowMinutes(n.getHours() * 60 + n.getMinutes());
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  /*  Show only if currentDate is TODAY */
  const isToday =
    new Date().toISOString().slice(0, 10) === dateStr;


  /* ---------- LANE LOGIC (unchanged) ---------- */
  const buildLanes = (evts: CalendarEvent[]) => {

    type LaneEvent = CalendarEvent & {
      startMin: number;
      endMin: number;
      lane: number;
    };

    const mapped: LaneEvent[] = evts.map(e => {
      const s = new Date(e.start);
      const e2 = new Date(e.end ?? e.start);
      return {
        ...e,
        startMin: s.getHours() * 60 + s.getMinutes(),
        endMin: e2.getHours() * 60 + e2.getMinutes(),
        lane: 0
      };
    });

    mapped.sort((a, b) => a.startMin - b.startMin);

    const active: LaneEvent[] = [];

    mapped.forEach(ev => {
      for (let i = active.length - 1; i >= 0; i--) {
        if (active[i].endMin <= ev.startMin) active.splice(i, 1);
      }

      const used = active.map(a => a.lane);
      let lane = 0;
      while (used.includes(lane)) lane++;

      ev.lane = lane;
      active.push(ev);
    });

    return mapped;
  };

  const laneEvents = buildLanes(dayEvents);
  const maxLane = Math.max(...laneEvents.map(e => e.lane), 0);
  const laneWidth = 100 / (maxLane + 1);

  const colors = [
    "bg-pink-400 border-pink-200",
    "bg-green-400 border-green-200",
    "bg-blue-400 border-blue-200"
  ];


  return (
    <div className="flex flex-col h-[80vh]">

      {/* HEADER */}
      <div className="px-4 py-3 border-b bg-white">
        <div className="text-sm text-gray-500 font-semibold uppercase">
          {dayName}
        </div>
        <div className="text-lg font-bold text-gray-800">
          {dayNumber}
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-[80px_1fr] flex-1 overflow-y-auto thin-scroll relative">

        <div>
          {hours.map(h => (
            <div key={h} className="border border-gray-200 text-xs px-2 py-3 h-[60px]">
              {h}
            </div>
          ))}
        </div>

        <div className="relative">

          {hours.map(h => (
            <div key={h} className="border border-gray-200 h-[60px]" />
          ))}

          {/*  CURRENT-TIME LINE HERE */}
          {isToday && (
            <div
              className="absolute left-0 right-0 z-50"
              style={{
                top: `${nowMinutes}px`,
              }}
            >
              {/* blue line */}
              <div className="h-[2px] bg-blue-500 w-full" />

              {/* round marker like your screenshot */}
              <div className="w-[10px] h-[10px] bg-blue-500 rounded-full absolute -left-[5px] -top-[4px]" />
            </div>
          )}

          {/* EVENTS */}
          {laneEvents.map(ev => {

            const startMin = ev.startMin;
            const endMin = ev.endMin;
            const duration = Math.max(endMin - startMin, 60);

            return (
              <div
                key={ev.id}
                className="absolute rounded-xl shadow border cursor-pointer flex flex-col justify-between"
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
                  className="absolute left-1 top-2 bottom-2 w-[8px] rounded-full"
                  style={{
                    background:
                      ev.type?.toUpperCase() === "TASK"
                        ? "#2563eb"
                        : ev.type?.toUpperCase() === "MEETING"
                          ? "#ef4444"
                          : "#f59e0b",
                  }}
                />
                <div className="pl-5 px-3 pt-2 text-[16px] font-semibold text-gray-800 truncate">
                  <TooltipText
                    text={ev.title}
                    maxWidth="100%"
                    tooltipThreshold={22}
                    isApplyBgTextColor
                    tooltipClassName="text-left"
                  />
                </div>

                <div className=" pl-5 px-3 pb-2 text-[11px] text-gray-500">
                  {ev.start.slice(11, 16)} — {ev.end?.slice(11, 16)}
                </div>

                {/* FOOTER */}
                <div className=" pl-5  px-3 pb-2 flex items-center justify-between">

                  <span className="text-[11px] text-gray-500">
                    {ev.CreatedBy}
                  </span>

                  <span className="text-[11px] text-gray-500">
                    {formatDate_dd_MonthName_yy(ev.CreatedDate ?? '-')}
                  </span>

                  <div className="flex -space-x-2">
                    {ev.fullname!
                      .split(',')
                      .map(name => name.trim())
                      .filter(name => name !== "")
                      .slice(0, 3)   
                      .map((name, i) => (
                        <div
                          key={i}
                          className={`w-6 h-6 rounded-full ${colors[i % colors.length]} border text-[10px] flex items-center justify-center text-white`}
                        >
                          {name[0].toUpperCase()}
                        </div>
                      ))}

                    {/* EXTRA COUNT BADGE */}
                    {ev.fullname!.split(',').filter(n => n.trim() !== "").length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-purple-400 border-purple-200 text-[10px] flex items-center justify-center text-white">
                        +
                        {
                          ev.fullname!.split(',').filter(n => n.trim() !== "").length - 3
                        }
                      </div>
                    )}
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
