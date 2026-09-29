import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { Table0, Table5 } from "@/features/teamWorkspaceDashboard/models/TeamWorkspaceDashboardModel";

interface Props {
  overviewData: Table5[];
  taskData: Table0[];
}

const getStatusClass = (status?: string | null) => {
  const value = (status || "").toLowerCase();

  if (value.includes("progress")) return "bg-blue-100 text-blue-700";
  if (value.includes("hold")) return "bg-yellow-100 text-yellow-700";
  if (value.includes("to do") || value.includes("todo")) return "bg-gray-100 text-gray-700";
  if (value.includes("complete")) return "bg-green-100 text-green-700";

  return "bg-gray-100 text-gray-700";
};

export default function MyTaskOverview({ overviewData, taskData }: Props) {
  const data = overviewData[0] || {};
  const completed = data.CompletedTasks ?? 0;
  const pending = data.PendingTasks ?? 0;
  const inProgress = data.InProgressTasks ?? 0;
  const total = data.TotalTasks || completed + pending + inProgress || 1;

  return (
    <div className="pt-5">
      <div
        className="bg-white p-4 rounded-xl border border-gray-100 space-y-3 h-[420px] flex flex-col"
        style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
      >
        <h3 className="font-medium text-gray-400">My Task Overview</h3>

        <div className="space-y-2">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="bg-green-500" style={{ width: `${(completed / total) * 100}%` }} />
            <div className="bg-orange-400" style={{ width: `${(inProgress / total) * 100}%` }} />
            <div className="bg-gray-300" style={{ width: `${(pending / total) * 100}%` }} />
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <span>
              Completed: <span className="font-semibold text-green-600">{completed}</span>
            </span>
            <span>
              In Progress: <span className="font-semibold text-orange-500">{inProgress}</span>
            </span>
            <span>
              Pending: <span className="font-semibold text-gray-600">{pending}</span>
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto thin-scroll space-y-3 pr-1">
          {taskData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <NoDataView />
            </div>
          ) : (
            taskData.map((item) => (
              <div key={item.TaskId} className="bg-[#F9F9FF] rounded-lg p-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-[#2D2D2D]">{item.TaskTitle || "-"}</p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusClass(item.Status)}`}
                  >
                    {item.Status || "-"}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{item.TaskDescription || "-"}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
