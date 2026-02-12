
interface OverviewItem {
  TotalCases?: number;
  TotalOpenCases?: number;
  TotalClosedCases?: number;
  TotalReopenCases?: number;
  TotalHearings?: number;
}

interface Props {
  overViewData?: OverviewItem[];
}

export default function OverviewCards({ overViewData = [] }: Props) {

  const data = overViewData[0] || {};

  const cards = [
    {
      title: "Total Cases",
      value: data.TotalCases ?? 0,
      backgroundColor: "#E0E7FF",
      color: "#4F46E5",
    },
    {
      title: "Open Cases",
      value: data.TotalOpenCases ?? 0,
      backgroundColor: "#ECFEFF",
      color: "#0891B2",
    },
    {
      title: "Closed Cases",
      value: data.TotalClosedCases ?? 0,
      backgroundColor: "#FDF4FF",
      color: "#A21CAF",
    },
    {
      title: "Reopened Cases",
      value: data.TotalReopenCases ?? 0,
      backgroundColor: "#FFF7ED",
      color: "#EA580C",
    },
    {
      title: "Total Hearings",
      value: data.TotalHearings ?? 0,
      backgroundColor: "#F0FDF4",
      color: "#16A34A",
    },
  ];

  return (
    <div className="space-y-3 pt-5">

      <h2 className="text-lg font-semibold text-gray-800">
        Overview
      </h2>

      <div className="grid grid-cols-5 gap-4">

        {cards.map((c, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
            style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
          >
            <div className="flex items-start gap-3">

            
              {/* Text */}
              <div>
                <p className="text-sm text-gray-500">{c.title}</p>
                <p className="text-2xl font-semibold text-gray-900">
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
