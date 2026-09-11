import type { Table0 } from "@/features/hireSpaceDashboard/models/HireSpaceDashboardModel";

interface Props {
  overViewData?: Table0[];
}

export default function OverviewCards({ overViewData = [] }: Props) {
  const data = overViewData[0] || {};

  const cards = [
    {
      title: "Total Job Roles",
      value: data.TotalJobRoles ?? 0,
    },
    {
      title: "Active Openings",
      value: data.ActiveOpenings ?? 0,
    },
    {
      title: "Total Positions to Fill",
      value: data.TotalPositions ?? 0,
      subtitle: `${data.FilledPositions ?? 0} filled · ${data.RemainingPositions ?? 0} remaining`,
      subtitleClass: "text-blue-600",
    },
    {
      title: "Active Candidates",
      value: data.ActiveCandidates ?? 0,
      subtitle: "Across all active openings",
      subtitleClass: "text-green-600",
    },
    {
      title: "Total Candidates",
      value: data.TotalCandidates ?? 0,
    },
  ];

  return (
    <div className="space-y-3 pt-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 border border-gray-100"
            style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
          >
            <p className="text-sm text-gray-500">{c.title}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{c.value}</p>
            {c.subtitle && (
              <p className={`text-xs mt-1 ${c.subtitleClass}`}>{c.subtitle}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
