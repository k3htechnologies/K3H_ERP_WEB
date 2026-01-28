import { AlertTriangle, Building2, TrendingUp } from "lucide-react";

interface Props {
  buildingData: any[];
  tenantApplicantChargesData: any[];
  alertsData: any[];
}

export default function OverviewCards({
  buildingData = [],
  tenantApplicantChargesData = [],
  alertsData = [],
}: Props) {

  const buildingCount = buildingData.length;

  const financialTotal = tenantApplicantChargesData.reduce(
    (sum, item) => sum + Number(item.Amount || 0),
    0
  );

  const alertCount = alertsData.length;

  const cards = [
    {
      title: "Building Count",
      value: buildingCount,
      subtitle: "Total Buildings",
      icon: Building2,
      backgroundColor: "#E0E7FF",
      color: "#4F46E5",
    },
    {
      title: "Financial",
      value: `₹ ${financialTotal.toFixed(2)} Cr`,
      subtitle: "Total Exposure",
      icon: TrendingUp,
      backgroundColor: "#F7DDFE",
      color: "#561F64",
    },
    {
      title: "Alerts",
      value: alertCount,
      subtitle: "Required Action",
      icon: AlertTriangle,
      backgroundColor: "#FDE7CC",
      color: "#FF9F2D",
    },
  ];

  return (
    <div className="space-y-3">

      <h2 className="text-lg font-semibold text-gray-800">
        Overview
      </h2>

      <div className="grid grid-cols-4 gap-4">

        {cards.map((c, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow transition"
          >
            <div className="flex items-start gap-3">

              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: c.backgroundColor }}
              >
                <c.icon size={20} style={{ color: c.color }} />
              </div>

              <div>
                <p className="text-sm text-gray-500">{c.title}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {c.value}
                </p>
              </div>

            </div>

            <p className="text-xs text-gray-400 mt-3">
              {c.subtitle}
            </p>
          </div>
        ))}

      </div>
    </div>
  );
}
