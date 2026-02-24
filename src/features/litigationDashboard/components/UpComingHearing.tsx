
interface Props {
  upComingHearingData: any[];
}

export default function UpComingHearing({ upComingHearingData = [] }: Props) {
  return (
    <div className="pt-4">
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
              <p className="text-xs text-gray-600 mt-2">
                {item.CaseType}</p>
              <p className="text-xs text-gray-600 mt-2">
                {item.CourtType}</p>
            </div>

            {/* Right content */}
            <div className="flex flex-col items-end space-y-2">
              <p className="text-sm font-medium text-gray-700">
                {item.Location}
              </p>

              <span className="bg-purple-800 text-white px-1 py-1 mt-3 rounded">
                {`in ${Math.ceil((new Date(item.HearingDate).getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24))} days`}
              </span>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}