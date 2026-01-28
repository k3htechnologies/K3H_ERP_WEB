import { formatToKLCr } from "@/core/utils/comman";
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

  const financialTotalPaid = tenantApplicantChargesData.reduce(
    (sum, item) => sum + Number(item.Paid || 0),
    0
  );

  const totalPlotArea = buildingData.reduce(
    (sum, x) => sum + Number(x.TotalPlotAreaSqFt || 0),
    0
  );

  const alertCount = alertsData.length;

  const cards = [
    {
      title: "Building Count",
      value: buildingCount,
      subtitle: `Total Plot Area : ${totalPlotArea} SqFt`,
      icon: Building2,
      backgroundColor: "#E0E7FF",
      color: "#4F46E5",
    },
    {
      title: "Financial (Rent)",
      value: `₹ ${formatToKLCr(financialTotal)}`,
      subtitle: ` Pending : ₹ ${formatToKLCr(financialTotal - financialTotalPaid)}`,
      icon: TrendingUp,
      backgroundColor: "#F7DDFE",
      color: "#561F64",
      titletooltip: `₹ ${financialTotal.toFixed(2)}`,
      subtitletooltip: `₹ ${(financialTotal - financialTotalPaid).toFixed(2)}`,
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
    <div className="space-y-3 pt-5">

      <h2 className="text-lg font-semibold text-gray-800">
        Overview
      </h2>

      <div className="grid grid-cols-4 gap-4">

        {cards.map((c, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100" style={{boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
            <div className="flex items-start gap-3">

              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: c.backgroundColor }}
              >
                <c.icon size={20} style={{ color: c.color }} />
              </div>

              <div>
                <p className="text-sm text-gray-500">{c.title}</p>
                <div className="relative group inline-block">
                  <p className="text-2xl font-semibold text-gray-900 cursor-pointer">
                    {c.value}
                  </p>

                  {c.titletooltip && (
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      {c.titletooltip}
                    </span>
                  )}
                </div>

              </div>

            </div>
            <div className="relative group inline-block">
              <p className="text-xs text-gray-400 mt-3 cursor-pointer">
                {c.subtitle}
              </p>
              {c.subtitletooltip && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  {c.subtitletooltip}
                </span>
              )}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
