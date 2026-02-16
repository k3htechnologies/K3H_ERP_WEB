
interface OverviewItem {
  TotalCases?: number;
  OpenCases?: number;
  ClosedCases?: number;
  ReOpenCases?: number;
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
      backgroundColor: "#010715",
    },
    {
      title: "Open Cases",
      value: data.OpenCases ?? 0,
      backgroundColor: "#ECFEFF",
    },
    {
      title: "Closed Cases",
      value: data.ClosedCases ?? 0,
      backgroundColor: "#FDF4FF",
    },
    {
      title: "Reopened Cases",
      value: data.ReOpenCases ?? 0,
      backgroundColor: "#FFF7ED",
    },
    {
      title: "Total Hearings",
      value: data.TotalHearings ?? 0,
      backgroundColor: "#F0FDF4",
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
            className="rounded-xl shadow-sm p-4 border border-gray-100"
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
