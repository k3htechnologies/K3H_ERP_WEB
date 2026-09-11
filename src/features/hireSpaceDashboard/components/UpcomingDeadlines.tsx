import { AlertTriangle } from "lucide-react";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { Table5 } from "@/features/hireSpaceDashboard/models/HireSpaceDashboardModel";

interface Props {
  deadlinesData: Table5[];
}

export default function UpcomingDeadlines({ deadlinesData }: Props) {
  return (
    <div className="pt-5">
      <div
        className="bg-white p-4 rounded-xl border border-gray-100 space-y-3 h-[460px] flex flex-col"
        style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
      >
        <h3 className="font-semibold text-gray-500">
          Upcoming Deadlines <span className="text-sm font-normal text-gray-500">
            ({deadlinesData.length} Records)
          </span>
        </h3>

        <div className="flex-1 overflow-y-auto thin-scroll space-y-3 pr-1">
          {deadlinesData.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <NoDataView />
            </div>
          ) : (
            deadlinesData.map((item, i) => (
              <div
                key={i}
                className="relative bg-orange-50 rounded-lg p-3 border border-orange-100"
              >
                <span className="absolute left-0 top-0 h-full w-1 bg-orange-400 rounded-l-lg" />

                <div className="flex gap-3">
                  <div className="pt-1 flex-shrink-0">
                    <AlertTriangle size={18} className="text-orange-500" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-orange-800 break-words">
                      {item.JobRole} · {item.PositionsRemaining} positions remaining
                    </p>
                    <p className="text-sm text-orange-700 mt-1 break-words">{item.Status}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
