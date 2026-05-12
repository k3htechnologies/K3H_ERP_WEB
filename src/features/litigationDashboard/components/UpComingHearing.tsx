import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { Table5 } from "@/features/litigationDashboard/models/litigationDashboardModel";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";

interface Props {
  upComingHearingData: Table5[];
}

export default function UpComingHearing({ upComingHearingData }: Props) {
  return (
    <div className="pt-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Upcoming Hearings
      </h2>

      <div className="bg-white rounded-lg p-4 space-y-4 thin-scroll h-[830px] flex flex-col border border-gray-100" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
        {upComingHearingData.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full">
            <NoDataView />
          </div>

        ) : (
          <div className="flex-1 overflow-y-auto thin-scroll space-y-3 pr-1">
            {upComingHearingData.map((item, index) => (
              <div key={index} className="border border-purple-300 bg-purple-50 rounded-lg p-4 flex justify-between items-center">

                <div>
                  <p className="text-sm font-semibold text-gray-900">  Project Name: {item.ProjectName ?? '-'}</p>

                  <p className="text-sm text-gray-900 mt-2"> Case No: {item.CaseNumber ?? '-'}</p>

                  <p className="text-xs text-gray-600 mt-2"> {item.CaseType ?? '-'}</p>

                  <p className="text-xs text-gray-600 mt-2"> {item.CourtType ?? '-'}</p>

                </div>

                <div className="flex flex-col items-end space-y-2">

                  <p className="text-sm font-medium text-gray-700">
                    {formatDate_dd_MonthName_yy(item.HearingDate ?? '')}
                  </p>

                  <span className="bg-purple-800 text-white px-2 py-1 mt-3 rounded">
                    {item.DaysRemaining === 0 ? "Today" : `in ${item.DaysRemaining} days`}
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}