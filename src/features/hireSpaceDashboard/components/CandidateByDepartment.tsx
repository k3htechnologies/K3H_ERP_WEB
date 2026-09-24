import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { Table2 } from "@/features/hireSpaceDashboard/models/HireSpaceDashboardModel";

interface Props {
  departmentData: Table2[];
}

export default function CandidateByDepartment({ departmentData }: Props) {
  const maxValue = Math.max(...departmentData.map((item) => item.CandidateCount || 0), 1);

  return (
    <div className="pt-5">
      <div
        className="flex h-[315px] flex-col space-y-3 rounded-xl border border-gray-100 bg-white p-4"
        style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
      >
        <h3 className="font-semibold text-gray-500">Candidate by Department</h3>

        {departmentData.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full">
            <NoDataView />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto thin-scroll space-y-3 pr-1">
            {departmentData.map((item, index) => {
              const count = item.CandidateCount ?? 0;
              const widthPercent = count === 0 ? 0 : (count / maxValue) * 100;

              return (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-36 shrink-0 truncate">
                    {item.DepartmentName ?? ""}
                  </span>

                  <div className="relative flex-1 h-8 rounded-lg overflow-hidden">
                    <div
                      className={`h-full rounded-lg bg-[#bfdbfe] flex items-center ${count === 0 ? "justify-center " : "justify-end pr-3"}`}
                      style={{ width: count === 0 ? "2rem" : `${widthPercent}%`, minWidth: count === 0 ? "2rem" : undefined }}
                    >
                      <span className={`text-sm whitespace-nowrap ${count === 0 ? "font-normal text-gray-400" : "font-bold text-[#1d4ed8]"}`}>
                        {count}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
