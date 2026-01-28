import { Check } from "lucide-react";

interface Props {
  buildingData: any[];
  tenantApplicantChargesData: any[];
  alertsData: any[];
  tenantData: any[];
  proposedOfferProposedPlanData: any[];
}

interface Step {
  label: string;
  percent: number;
}

export default function ProgressTimeline({
  buildingData,
  tenantApplicantChargesData,
  alertsData,
  tenantData,
  proposedOfferProposedPlanData
}: Props) {

  const steps: Step[] = [
    {
      label: "Project Onboarding",
      percent: buildingData.length > 0 ? 100 : 0
    },
    {
      label: "Tenant Data",
      percent: tenantData.length > 0 ? 100 : 0
    },
    {
      label: "Offer",
      percent: tenantApplicantChargesData.length > 0 ? 100 : 0
    },
    {
      label: "Plan",
      percent: proposedOfferProposedPlanData.length > 0 ? 100 : 0
    },
    {
      label: "Execution",
      percent: alertsData.length > 0 ? 0 : 0
    }
  ];

  const overallProgress =steps.reduce((sum, s) => sum + s.percent, 0) / steps.length;

  return (
    <div className="bg-white p-4 rounded-xl mt-5" style={{boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

      <p className="text-sm text-gray-500 font-medium mb-4">
        Project Progress
      </p>

      <div className="relative flex items-center justify-between">

        {/* Background line */}
        <div className="absolute left-0 right-0 top-3 h-2 bg-gray-200 rounded" />

        {/* Progress line */}
        <div
          className="absolute left-0 top-3 h-2 rounded bg-gradient-to-r from-blue-600 via-purple-600 to-green-500"
          style={{ width: `${overallProgress}%` }}
        />

        {steps.map((step, index) => {

          const isCompleted = step.percent === 100;

          return (
            <div key={index} className="relative z-10 flex flex-col items-center">

              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md
                  ${isCompleted
                    ? "bg-blue-600 shadow-blue-300/40"
                    : "border-2 border-purple-600 bg-white shadow-purple-300/40"
                  }`}
              >
                {isCompleted && <Check size={14} className="text-white" />}
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
