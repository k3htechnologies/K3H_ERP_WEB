
interface OverviewItem {
  TotalCases?: number;
  OpenCases?: number;
  ClosedCases?: number;
  ReOpenCases?: number;
  TotalHearings?: number;
}

interface Props {
  overViewData?: OverviewItem[];
  hearingData?:any[]
}

export default function OverviewCards({ overViewData = [], hearingData = [] }: Props) {

  const caseData = overViewData[0] || {};
  const hearing = hearingData[0] || {};

const cards = [
  { title: "Total Cases", value: Number(caseData?.TotalCases) || 0 },
  { title: "Open Cases", value: Number(caseData?.OpenCases) || 0 },
  { title: "Closed Cases", value: Number(caseData?.ClosedCases) || 0 },
  { title: "Reopened Cases", value: Number(caseData?.ReOpenCases) || 0 },
  { title: "Total Hearings", value: Number(hearing?.TotalHearings) || 0 },
];

  return (
    <div className="space-y-3 pt-5">

      <h2 className="text-lg font-semibold text-gray-800">
        Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c, i) => (
          <div
            key={i}
            className="bg-white rounded-lg p-4 shadow-sm space-y-4"
            style={{
              backgroundColor: c.title === "Total Cases" ? "#0c3ca3" : "#ffffff",
              color: c.title === "Total Cases" ? "#ffffff" : "inherit",
              boxShadow: "0px 1px 2px rgba(0,0,0,0.05)"
            }}
          >
            <div className="flex items-start gap-3">

              {/* Text */}
              <div>
                <p className={`${c.title === "Total Cases" ? "text-white" : "text-gray-500"}`}>
                  {c.title}
                </p>

                <p className={`text-2xl font-semibold ${c.title === "Total Cases" ? "text-white" : "text-gray-900"}`}>
                  {c.value}
                </p>

              </div>

            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
