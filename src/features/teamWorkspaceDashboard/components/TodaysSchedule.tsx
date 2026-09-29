import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { formatTimeFromDateTime } from "@/core/utils/dateFormat";
import type { Table0 } from "@/features/teamWorkspaceDashboard/models/TeamWorkspaceDashboardModel";

interface Props {
  scheduleData: Table0[];
}

const getStatusClass = (status?: string | null) => {
  const value = (status || "").toLowerCase();

  if (value.includes("progress")) return "bg-blue-100 text-blue-700";
  if (value.includes("hold")) return "bg-yellow-100 text-yellow-700";
  if (value.includes("to do") || value.includes("todo")) return "bg-gray-100 text-gray-700";
  if (value.includes("complete")) return "bg-green-100 text-green-700";

  return "bg-gray-100 text-gray-700";
};

const getDotClass = (status?: string | null) => {
  const value = (status || "").toLowerCase();

  if (value.includes("progress")) return "bg-blue-500";
  if (value.includes("hold")) return "bg-orange-400";
  if (value.includes("complete")) return "bg-green-600";

  return "bg-gray-400";
};

export default function TodaysSchedule({ scheduleData }: Props) {
  return (
    <div className="pt-5">
      <div
        className="bg-white p-4 rounded-xl border border-gray-100 space-y-3 h-[420px] flex flex-col"
        style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
      >
        <h3 className="font-medium text-gray-400">Today's Schedule</h3>

        <div className="flex-1 overflow-y-auto thin-scroll pr-1">
          {scheduleData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <NoDataView />
            </div>
          ) : (
            <div className="relative space-y-6">
              <div className="absolute left-[52px] top-2 bottom-2 w-px bg-gray-200" />

              {scheduleData.map((item) => {
                const timeLabel = formatTimeFromDateTime(item.StartDate);
                const [timePart, periodPart] = timeLabel
                  ? timeLabel.split(" ")
                  : ["-", ""];

                return (
                  <div key={item.TaskId} className="relative flex gap-3 items-start">
                    <div className="w-12 shrink-0 text-right pt-1">
                      <p className="text-sm font-semibold text-gray-800 leading-tight">
                        {timePart}
                      </p>
                      {periodPart ? (
                        <p className="text-[10px] text-gray-400 leading-tight">
                          {periodPart}
                        </p>
                      ) : null}
                    </div>

                    <div className="relative z-10 mt-2 shrink-0">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ring-4 ring-white ${getDotClass(item.Status)}`}
                      />
                    </div>

                    <div className="min-w-0 flex-1 bg-[#F9F9FF] rounded-lg p-3 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-[#2D2D2D]">
                          {item.TaskTitle || "-"}
                        </p>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusClass(item.Status)}`}
                        >
                          {item.Status || "-"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {item.TaskDescription || "-"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
