import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";

interface UpComingHearingTableRecord {
  CaseNumber: string;
  CaseType: string;
  Location: string;
  HearingDate: string;
}

interface Props {
  upComingHearingData: UpComingHearingTableRecord[];
}

export default function UpComingHearing({ upComingHearingData = [] }: Props) {
  return (
    <div className="pt-5">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Upcoming Hearings
      </h2>

      <div className="bg-white rounded p-4 space-y-4 shadow-sm">
        {upComingHearingData.map((item, index) => (
          <div
            key={index}
            className="border border-purple-300 bg-purple-50 rounded-lg p-4 flex justify-between items-center"
          >
            {/* Left content */}
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Case No: {item.CaseNumber}</p>
              <p className="text-xs text-gray-600 mt-1">
                {item.CaseType}</p>
            </div>

            {/* Right content */}
            <div className="flex flex-col items-end space-y-2">
              <p className="text-sm font-medium text-gray-700">
                {item.Location}
              </p>

              <p className="text-xs text-gray-500">
                {formatDate_dd_MonthName_yy(item.HearingDate)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}