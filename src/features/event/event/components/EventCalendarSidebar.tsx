import React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { convert_hh_mm_ss_to_hh_mm } from "@/core/utils/dateFormat";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import type { EventData } from "@/features/event/event/models/EventModel";

interface EventCalendarSidebarProps {
  currentDate: Date;
  events: EventData[];
  onDateSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
}

const getEventTone = (type?: string) => {
  switch (type?.toUpperCase()) {
    case "TASK":
      return "border-[#2364DB]";
    case "CONFERENCE":
      return "border-[#21A179]";
    default:
      return "border-[#F59E0B]";
  }
};

export const EventCalendarSidebar: React.FC<EventCalendarSidebarProps> = ({
  currentDate,
  events,
  onDateSelect,
  onMonthChange,
}) => (
  <aside className="flex w-full shrink-0 flex-col gap-3 border-b border-[#E1E5EC] bg-[#F3F4F6] p-2.5 lg:w-[220px] lg:border-b-0 lg:border-r">
    <div className="w-full rounded-lg bg-white p-3">
      <DayPicker
        mode="single"
        month={currentDate}
        selected={currentDate}
        showOutsideDays
        onSelect={(date) => {
          if (date) onDateSelect(date);
        }}
        onMonthChange={onMonthChange}
        className="event-mini-calendar"
      />
    </div>

    <div className="flex min-h-0 flex-col rounded-lg bg-white p-3 lg:flex-1">
      <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3px] text-[#87909F]">
        Today&apos;s Schedule
      </h2>

      <div className="thin-scroll min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {events.length === 0 ? (
          <NoDataView message="No events for this day" className="py-3" iconClassName="!h-16 !w-16" />
        ) : (
          events.map((event) => {
            const time = convert_hh_mm_ss_to_hh_mm(event.StartTime);
            const context =
              event.Room ||
              event.ProjectName ||
              event.FullName ||
              event.CreatedBy;

            return (
              <article
                key={event.EventId}
                className={`border-l-[3px] pl-2 ${getEventTone(event.Type)}`}
              >
                <h3 className="text-[11px] font-semibold leading-4 text-[#252933]">
                  <TooltipText
                    text={event.Title || event.Type || "Untitled Event"}
                    maxWidth="100%"
                    tooltipThreshold={28}
                    isApplyBgTextColor
                  />
                </h3>
                {time && (
                  <p className="text-[10px] leading-4 text-[#7E8794]">
                    &bull; {time}
                  </p>
                )}
                {context && (
                  <div className="flex items-center gap-1 text-[10px] leading-4 text-[#7E8794]">
                    <span>&bull;</span>
                    <TooltipText text={context} maxWidth="100%" tooltipThreshold={24} isApplyBgTextColor />
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  </aside>
);

export default EventCalendarSidebar;
