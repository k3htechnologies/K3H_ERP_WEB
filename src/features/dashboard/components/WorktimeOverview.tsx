import React from "react";
import polyline from "@mapbox/polyline";

export interface WorkTimeOverviewData {
  WorkedTime?: string;
  TotalTime?: string;
  Date?: string;
  PunchIn?: string;
  PunchOut?: string;
  Progress?: number;
  StartLatitude?: number;
  StartLongitude?: number;
  EndLatitude?: number;
  EndLongitude?: number;
  Polyline?: string;
  Distance?: number;

}

interface Props {
  workTimeOverviewTable: WorkTimeOverviewData[];
}

const WorktimeOverview: React.FC<Props> = ({
  workTimeOverviewTable = [],
}) => {
  const data = workTimeOverviewTable[0];

  const workedTime = data?.WorkedTime ?? "00:00";
  const totalTime = data?.TotalTime ?? "00:00";
  const date = data?.Date ?? "--";
  const punchIn = data?.PunchIn ?? "--";
  const punchOut = data?.PunchOut ?? "--";
  const progress = data?.Progress ?? 0;
  const distance = data?.Distance ?? 0;

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const generateMapUrl = () => {
    if (!data?.Polyline) return "#";

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
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800">
        Work Overview
      </h2>

      {workTimeOverviewTable.length > 0 && (
        <div className="bg-white rounded-xl shadow p-5 mt-2">
          <p className="text-sm text-gray-500 mb-3">Work Time</p>

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
            <div className="flex justify-between">
              <span>Date</span>
              <span>{date}</span>
            </div>

            <div className="flex justify-between">
              <span>Punch In Time</span>
              <span>{punchIn}</span>
            </div>

            <div className="flex justify-between">
              <span>Punch Out Time</span>
              <span>{punchOut}</span>
            </div>


            {data?.Polyline && (
              <div className="flex justify-between">
                <a
                  href={generateMapUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  View Map
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorktimeOverview;