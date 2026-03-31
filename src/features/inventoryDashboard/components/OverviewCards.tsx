import { Building2, Layers, Box, GitBranch, Grid3x3 } from "lucide-react";
import type { Table0 } from "@/features/inventoryDashboard/models/InventoryDashboardModel";

interface Props {
  overViewData?: Table0[];
}

export default function OverviewCards({ overViewData = [] }: Props) {

  const data = overViewData[0] || {};

  const cards = [
    {
      title: "Total Building",
      value: data.TotalBuilding ?? 0,
      icon: Building2,
      backgroundColor: "#E0E7FF",
      color: "#4F46E5",
    },
    {
      title: "Basement",
      value: data.TotalBasement ?? 0,
      icon: Layers,
      backgroundColor: "#ECFEFF",
      color: "#0891B2",
    },
    {
      title: "Podium",
      value: data.TotalPodium ?? 0,
      icon: Box,
      backgroundColor: "#FDF4FF",
      color: "#A21CAF",
    },
    {
      title: "Wings",
      value: data.TotalWings ?? 0,
      icon: GitBranch,
      backgroundColor: "#FFF7ED",
      color: "#EA580C",
    },
    {
      title: "Ground",
      value: data.TotalBuilding ?? 0,
      icon: Grid3x3,
      backgroundColor: "#F0FDF4",
      color: "#16A34A",
    },
  ];

  return (
    <div className="space-y-3 pt-5">

      <h2 className="text-lg font-semibold text-gray-800">
        Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c, i) => (
          <div  key={i} className="bg-white rounded-2xl p-4 border border-gray-100" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }} >
            <div className="flex items-start gap-3">

              <div className="p-3 rounded-xl" style={{ backgroundColor: c.backgroundColor }}>
                <c.icon size={20} style={{ color: c.color }} />
              </div>
             
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
