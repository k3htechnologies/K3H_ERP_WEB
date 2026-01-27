import { Check } from "lucide-react";

interface Step {
  label: string;
  percent: number;
}

const steps: Step[] = [
  { label: "Project Onboarding", percent: 100 },
  { label: "Tenant Data", percent: 100 },
  { label: "Offer", percent: 85 },
  { label: "Plan", percent: 62 },
  { label: "Execution", percent: 0 },
];

export default function ProgressTimeline() {


  const overallProgress =
    steps.reduce((sum, s) => sum + s.percent, 0) / steps.length;

  return (
    <div className="bg-white p-4 rounded-xl mt-5">

      <p className="text-sm text-gray-500 font-medium mb-4">Project Progress</p>

      <div className="relative flex items-center justify-between">

        {/* Gray background line */}
        <div className="absolute left-0 right-0 top-3 h-2 bg-gray-200 rounded" />

        {/* Colored progress line */}
        <div
          className="absolute left-0 top-3 h-2 rounded bg-gradient-to-r from-blue-600 via-purple-600 to-green-500"
          style={{ width: `${overallProgress}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = step.percent === 100;

          return (
            <div key={index} className="relative z-10 flex flex-col items-center">

              {/* Circle */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md
                          ${isCompleted
                                          ? "bg-blue-600 shadow-blue-300/40"
                                          : "border-2 border-purple-600 bg-white shadow-purple-300/40"}
                        `}
              >

                {isCompleted && (
                  <Check size={14} className="text-white" />
                )}
              </div>

              <p className="text-xs mt-2 text-gray-600 whitespace-nowrap">
                {step.label}
              </p>

              <p className="text-xs text-gray-400">
                {step.percent}%
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
