import React, { useState, useEffect } from "react";
import polyline from "@mapbox/polyline";
import { formatTimeFromDateTime } from "@/core/utils/dateFormat";
import type { Table11 } from "../models/UserDashboardModel";

interface Props {
  workTimeOverviewTable: Table11[];
}

const WorktimeOverview: React.FC<Props> = ({ workTimeOverviewTable }) => {
  const data = workTimeOverviewTable[0];

  const formattedDate = data?.PunchIn
    ? new Date(data.PunchIn).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "--";

  const totalTime = data?.TotalTime ?? "9 hrs";
  const date = data?.Date ?? "--";
  const punchIn = data?.PunchIn ?? "--";
  const punchOut = data?.PunchOut ?? "--";

  const isPunchedOut = !!data?.PunchOut && new Date(data.PunchOut).getFullYear() > 1900;
  const displayPunchOut = isPunchedOut ? formatTimeFromDateTime(punchOut) : "--";

  const [currentDuration, setCurrentDuration] = useState<string>(data?.WorkedTime ?? "00:00:00");
  const [progress, setProgress] = useState<number>(data?.Progress ?? 0);

  useEffect(() => {
    if (!data?.PunchIn || data.PunchIn.startsWith("0001") || data.PunchIn.startsWith("1900")) return;

    const punchInDate = new Date(data.PunchIn);

    const updateDuration = () => {
      if (isPunchedOut && data?.WorkedTime && data.WorkedTime !== "00:00:00") {
        setCurrentDuration(data.WorkedTime);
        if (data.Progress !== undefined && data.Progress !== null) {
          setProgress(data.Progress);
        }
        return;
      }

      const endTime = isPunchedOut ? new Date(data.PunchOut!) : new Date();
      const diffMs = endTime.getTime() - punchInDate.getTime();

      if (diffMs < 0) {
        setCurrentDuration("00:00:00");
        setProgress(0);
        return;
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const formattedHours = hours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedSeconds = seconds.toString().padStart(2, "0");

      setCurrentDuration(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`);

      // Assuming total time is 9 hours
      const maxSeconds = 9 * 3600;
      let calculatedProgress = (totalSeconds / maxSeconds) * 100;
      if (calculatedProgress > 100) calculatedProgress = 100;

      setProgress(calculatedProgress);
    };

    updateDuration(); // Initial call

    if (!isPunchedOut) {
      const interval = setInterval(updateDuration, 1000);
      return () => clearInterval(interval);
    }
  }, [data?.PunchIn, data?.PunchOut, isPunchedOut, data?.WorkedTime, data?.Progress]);

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

      <div className="bg-white rounded-xl p-5 mt-3 h-[330px] shadow-sm">
        <p className="text-md font-semibold text-gray-500  pb-2">Work Time</p>

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
              <div className="absolute inset-0 flex items-center justify-center font-bold text-lg text-gray-800 tracking-wide">
                {currentDuration}
              </div>
            </div>

            <p className="text-center text-sm mb-4 font-semibold text-gray-800">
              {currentDuration} <span className="text-gray-500 font-medium">/{totalTime.replace(" ", "")}</span>
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
                <span className="font-semibold text-right mr-30">{displayPunchOut}</span>
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

              <div className="absolute inset-0 flex items-center justify-center font-bold text-lg text-gray-800 tracking-wide">
                {currentDuration}
              </div>
            </div>

            <p className="text-center text-sm mb-4 font-semibold text-gray-800">
              {currentDuration} <span className="text-gray-500 font-medium">/{totalTime.replace(" ", "")}</span>
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
                <span className="font-semibold text-right">{displayPunchOut}</span>
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