import React from "react";
import polyline from "@mapbox/polyline";
import { formatTimeFromDateTime } from "@/core/utils/dateFormat";

interface Props {
  workTimeOverviewTable: any[];
}

const WorktimeOverview: React.FC<Props> = ({ workTimeOverviewTable = [] }) => {
  const data = workTimeOverviewTable[0];

  const formattedDate = data?.PunchIn
    ? new Date(data.PunchIn).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "--";

  const workedTime = data?.WorkedTime ?? "00:00";
  const totalTime = data?.TotalTime ?? "9 hrs";
  const date = data?.Date ?? "--";
  const punchIn = data?.PunchIn ?? "--";
  const punchOut = data?.PunchOut ?? "--";
  const progress = data?.Progress ?? 0;

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const generateMapUrl = () => {
    if (data?.Polyline) {
      try {
        const decoded = polyline.decode(data.Polyline) as [number, number][];

        if (!decoded.length) return "#";

        const origin = decoded[0];
        const destination = decoded[decoded.length - 1];

        const maxWaypoints = 20;
        const step = Math.ceil(decoded.length / maxWaypoints);

        const waypoints = decoded
          .filter((_, index) => index % step === 0)
          .map(([lat, lng]) => `${lat},${lng}`)
          .join("|");

        return `https://www.google.com/maps/dir/?api=1&origin=${origin[0]},${origin[1]}&destination=${destination[0]},${destination[1]}&waypoints=${waypoints}&travelmode=driving`;
      } catch {
        return "#";
      }
    }

    if (data?.StartLatitude && data?.StartLongitude) {
      if (data?.EndLatitude && data?.EndLongitude) {
        return `https://www.google.com/maps/dir/?api=1&origin=${data.StartLatitude},${data.StartLongitude}&destination=${data.EndLatitude},${data.EndLongitude}&travelmode=driving`;
      }
      return `https://www.google.com/maps/search/?api=1&query=${data.StartLatitude},${data.StartLongitude}`;
    }

    return "#";
  };

  const hasMapData = !!data?.Polyline || (!!data?.StartLatitude && !!data?.StartLongitude);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800">
        Work Overview
      </h2>

      <div className="bg-white rounded-xl p-5 mt-3 h-[330px]">
        <p className="text-sm text-gray-500 font-medium mb-3">Work Time</p>

        {workTimeOverviewTable.length > 0 ? (
          <>
            <div className="flex justify-center relative mb-3">
              <svg width="120" height="120">
                <circle stroke="#E5EDFF" fill="transparent" strokeWidth="8" r={radius} cx="60" cy="60" />
                <circle
                  stroke="#2563EB"
                  fill="transparent"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  r={radius}
                  cx="60"
                  cy="60"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-semibold">
                {workedTime}
              </div>
            </div>

            <p className="text-center text-sm mb-4">
              {workedTime} / {totalTime}
            </p>

            <div className="text-sm space-y-2">
              <div className="grid grid-cols-[125px_15px_1fr]">
                <span className="font-medium">Date</span>
                <span className="font-medium text-center">:</span>
                <span className="font-semibold text-right mr-25">{formattedDate}</span>
              </div>
              <div className="grid grid-cols-[125px_15px_1fr]">
                <span className="font-medium">Punch In Time</span>
                <span className="font-medium text-center">:</span>
                <span className="font-semibold text-right  mr-30">{formatTimeFromDateTime(punchIn)}</span>
              </div>
              <div className="grid grid-cols-[125px_15px_1fr]">
                <span className="font-medium">Punch Out Time</span>
                <span className="font-medium text-center">:</span>
                <span className="font-semibold text-right mr-30">{formatTimeFromDateTime(punchOut)}</span>
              </div>
              {hasMapData && (
                <div className="flex justify-end ">
                  <a
                    href={generateMapUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium justify-end"
                  >
                    View Map
                  </a>
                </div>
              )}
            </div>
          </>
        ) : (
          <div>
            <div className="flex justify-center relative mb-3">
              <svg width="120" height="120">
                <circle
                  stroke="#E5EDFF"
                  fill="transparent"
                  strokeWidth="8"
                  r={radius}
                  cx="60"
                  cy="60"
                />
                <circle
                  stroke="#2563EB"
                  fill="transparent"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  r={radius}
                  cx="60"
                  cy="60"
                  transform="rotate(-90 60 60)"
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center font-semibold">
                {workedTime}
              </div>
            </div>

            <p className="text-center text-sm mb-4">
              {workedTime} / {totalTime}
            </p>

            <div className="text-sm space-y-2">
              <div className="grid grid-cols-[120px_10px_1fr]">
                <span className="font-medium">Date</span>
                <span className="font-medium text-center">:</span>
                <span className="font-semibold text-right">{date}</span>
              </div>

              <div className="grid grid-cols-[120px_10px_1fr]">
                <span className="font-medium">Punch In Time</span>
                <span className="font-medium text-center">:</span>
                <span className="font-semibold text-right">{punchIn}</span>
              </div>

              <div className="grid grid-cols-[120px_10px_1fr]">
                <span className="font-medium">Punch Out Time</span>
                <span className="font-medium text-center">:</span>
                <span className="font-semibold text-right">{punchOut}</span>
              </div>

              {hasMapData && (
                <div className="flex justify-end">
                  <a
                    href={generateMapUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium text-sm"
                  >
                    View Map
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorktimeOverview;