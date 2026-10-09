import { CalendarDays, Check, Users, DoorOpen, CircleAlert } from "lucide-react";
import type { VisitorManagementDashboardFilterType, VisitorOverviewData } from "@/features/visitorManagementDashboard/models/VisitorManagementDashboardModel";

interface Props {
  filterType: VisitorManagementDashboardFilterType;
  overViewData: VisitorOverviewData;
}

export default function OverviewCards({ filterType, overViewData }: Props) {

  const cards = [
    {
      title: "TOTAL VISITORS",
      value: overViewData.TotalVisitors,
      icon: Users,
      backgroundColor: "#EEF2F7",
      color: "#475569",
      text: "This Week"
    },
    {
      title: "CURRENTLY INSIDE",
      value: overViewData.CurrentlyInside,
      icon: Check,
      backgroundColor: "#D7F8E9",
      color: "#10B981",
      titleColor: "#10B981",
      text: "Currently On-premises now"
    },
    {
      title: "EXPECTED TODAY",
      value: overViewData.ExpectedToday,
      icon: CalendarDays,
      backgroundColor: "#FFF0D6",
      titleColor: "#D97706",
      color: "#F59E0B",
      text: "Upcoming appointments"
    },
    {
      title: "CHECKED OUT",
      value: overViewData.CheckedOut,
      icon: DoorOpen,
      backgroundColor: "#D8E2FF",
      titleColor: "#2563EB",
      color: "#2563EB",
      text: `Completed visits ${filterType.toLowerCase()}`
    },
    {
      title: "OVERSTAYING",
      titleColor: "#BA1A1A",
      value: overViewData.Overstaying,
      icon: CircleAlert,
      backgroundColor: "#FFE1E1",
      color: "#EF4444",
      text: "Require gate-out / alert"
    },
  ];

  return (
    <div className="space-y-3 pt-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-4"
            style={{
              boxShadow: "0px 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="w-24 text-sm font-bold uppercase tracking-wide h-10 text-gray-500">
                  {c.title}
                </p>
                <p
                  className="mt-1 text-2xl font-semibold"
                  style={{ color: c.titleColor || "#172033" }}
                >
                  {c.value}
                </p>
                <p className="mt-1 text-sm text-gray-500 ">
                  {c.text}
                </p>
              </div>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: c.backgroundColor }}
              >
                <c.icon size={18} style={{ color: c.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
