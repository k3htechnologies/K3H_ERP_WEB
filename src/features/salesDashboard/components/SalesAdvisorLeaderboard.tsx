import { formatToKLCr } from "@/core/utils/comman";

interface SalesAdvisorLeaderBoardItem {
  FullName: string;
  Designation: string;
  TotalBookings: number;
  TotalBookingValue: number;
}

interface Props {
  leaderBoardData: SalesAdvisorLeaderBoardItem[];
}

export default function Leaderboard({
  leaderBoardData = [],
}: Props) {

  return (
    <div className="space-y-4 pt-5">
      <h2 className="text-lg font-semibold text-gray-800">
        Sales Advisor Leaderboard
      </h2>

      <div className="h-[620px] overflow-y-auto bg-white border border-gray-100 rounded-lg shadow-sm thin-scroll">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-gray-500 font-medium text-lg">
            Top Sales Advisor
          </h2>
        </div>

        <div className="flex flex-col">

          {leaderBoardData.length === 0 && (
            <div className="p-6 text-center text-gray-400 text-sm">
              No Data Available
            </div>
          )}

          {leaderBoardData.map((advisor, index) => {

            return (
              <div
                key={index}
                className={`p-5 ${index !== leaderBoardData.length - 1
                  ? "border-b border-gray-200"
                  : ""
                  }`}
              >
                <h3 className="text-gray-800 font-semibold text-base">
                  {advisor.FullName}
                </h3>

                <p className="text-gray-400 text-sm mb-4">
                  {advisor.Designation}
                </p>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">
                      Bookings
                    </p>
                    <p className="text-gray-900 font-bold">
                      {advisor.TotalBookings}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">
                      Booking Value
                    </p>
                    <p className="text-gray-900 font-bold">
                      ₹{formatToKLCr(advisor.TotalBookingValue)}
                    </p>
                  </div>

                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}