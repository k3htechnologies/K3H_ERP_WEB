import React from "react";

interface Props {
  workedTime?: string;
  totalTime?: string;
  date?: string;
  punchIn?: string;
  punchOut?: string;
  progress?: number; // 0–100
}

const WorktimeOverview: React.FC<Props> = ({
  workedTime = "05:11:22",
  totalTime = "9hrs",
  date = "02 January 2026",
  punchIn = "09:00 am",
  punchOut = "--",
  progress = 60,
}) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-white rounded-xl shadow p-5">

      <p className="text-sm text-gray-500 mb-3">Work Time</p>

      {/* Circle */}
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

      {/* Info */}
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

      </div>

      {/* Button */}
      <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
        Punch Out
      </button>

    </div>
  );
};

export default WorktimeOverview;
