import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { Table5 } from "@/features/litigationDashboard/models/litigationDashboardModel";
import { formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";

interface Props {
  upComingHearingData: Table5[];
}

export default function UpComingHearing({ upComingHearingData }: Props) {
  return (
    <div className="pt-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Upcoming Hearings
      </h2>

      <div className="bg-white rounded-lg p-4 space-y-4 shadow-sm  overflow-y-auto thin-scroll h-[280px]">
        {upComingHearingData.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full">
            <NoDataView />
          </div>
        ) : (
          <>
            {upComingHearingData.map((item, index) => (
              <div
                key={index}
                className="border border-purple-300 bg-purple-50 rounded-lg p-4 flex justify-between items-center"
              >
                {/* Left content */}
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Case No: {item.CaseNumber ?? '-'}</p>
                  <p className="text-xs text-gray-600 mt-2">
                    {item.CaseType ?? '-'}</p>
                  <p className="text-xs text-gray-600 mt-2">
                    {item.CourtType ?? '-'}</p>
                </div>

                {/* Right content */}
                <div className="flex flex-col items-end space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    {formatDate_dd_MonthName_yy_hh_mm(item.HearingDate ?? '')}
                  </p>
                  <span className="bg-purple-800 text-white px-2 py-1 mt-3 rounded">
                    {`in ${item.DaysRemaining} day`}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}