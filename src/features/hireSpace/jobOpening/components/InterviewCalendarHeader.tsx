import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate_MonthName_yy } from "@/core/utils/dateFormat";
import { Button } from "@/ui/components/forms";

export type InterviewCalendarView = "month" | "week" | "day";

interface InterviewCalendarHeaderProps {
  currentDate: Date;
  calendarView: InterviewCalendarView;
  onPreviousPeriod: () => void;
  onNextPeriod: () => void;
  onViewChange: (view: InterviewCalendarView) => void;
}

export const InterviewCalendarHeader = React.memo<InterviewCalendarHeaderProps>(({
  currentDate,
  calendarView,
  onPreviousPeriod,
  onNextPeriod,
  onViewChange,
}) => {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <h2 className="min-w-[86px] text-base font-semibold text-slate-800 sm:text-lg">
          {formatDate_MonthName_yy(currentDate)}
        </h2>
        <div className="flex items-center overflow-hidden rounded-md border border-slate-200 bg-white">
          <Button
            onClick={onPreviousPeriod}
            aria-label="Previous period"
            color="transparent"
            size="xs"
            defineWidth
            isborderRadius
          >
            <ChevronLeft />
          </Button>
          <Button onClick={onNextPeriod} aria-label="Next period" color="transparent" size="xs" defineWidth isborderRadius>
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 rounded-md bg-[#F1F3FA] p-0.5 text-xs font-medium text-slate-500">
        {(["month", "week", "day"] as InterviewCalendarView[]).map((view) => (
          <Button
            key={view}
            type="button"
            onClick={() => onViewChange(view)}
            color="transparent"
            size="xs"
            className="min-w-[58px] capitalize"
            style={{
              height: "30px",
              padding: "6px 12px",
              backgroundColor: calendarView === view ? "#1E5BEA" : "transparent",
              color: calendarView === view ? "#FFFFFF" : "#64748B",
              boxShadow: calendarView === view ? "0 1px 2px rgba(15, 23, 42, 0.08)" : "none",
            }}
          >
            {view}
          </Button>
        ))}
      </div>
    </div>
  );
});

InterviewCalendarHeader.displayName = "InterviewCalendarHeader";
