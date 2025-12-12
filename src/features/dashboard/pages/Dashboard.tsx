import React from "react";

const CircularProgress: React.FC<{ percent: number; size?: number; strokeWidth?: number }> = ({ percent, size = 128, strokeWidth = 10 }) => {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - percent / 100);
  return (
    <svg width={size} height={size} className="block">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#EEF2F6" strokeWidth={strokeWidth} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#10B981"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${c} ${c}`}
        strokeDashoffset={offset}
        fill="none"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
};

const Dashboard: React.FC = () => {
  
  const percent = 65;
  const totalHours = "5:45:32";
  const production = "3.45 hrs";
  const punchInText = "Punch In at 10.00 AM";

  return (
     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="p-4">
      <div className="grid grid-cols-12 gap-3 items-start">

        {/* Left: Attendance Card (col-span 4) */}
        <div className="col-span-12 lg:col-span-4">
          <div className="h-full bg-white rounded-lg border border-orange-300 p-6 shadow-sm">
            <div className="text-center mb-4">
              <div className="text-xs text-gray-500">Attendance</div>
              <div className="text-lg font-bold text-gray-800">08:35 AM, 11 Mar 2025</div>
            </div>

            <div className="flex flex-col items-center mb-4">
              <div className="relative">
                <CircularProgress percent={percent} size={140} strokeWidth={10} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-xs text-gray-500">Total Hours</div>
                  <div className="text-base font-semibold text-gray-800">{totalHours}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mb-3">
              <span className="bg-black text-white text-sm px-3 py-1 rounded-md shadow-sm">Production : {production}</span>
            </div>

            <div className="flex items-center justify-center text-sm text-gray-700 mb-4">
              <span className="text-orange-500 mr-2">📍</span>
              {punchInText}
            </div>

            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-md font-semibold">Punch Out</button>
          </div>
        </div>

        
      </div>
    </div>
    </div>
  );
};

export default Dashboard;
