import { CalendarDays, Check, Users, Clock, CircleAlert } from "lucide-react";
import type { 
  VisitorManagementDashboardFilterType, 
  VisitorOverviewCard, 
  OverviewTable 
} from "@/features/visitorManagementDashboard/models/VisitorManagementDashboardModel";

interface Props {
  filterType: VisitorManagementDashboardFilterType;
  overViewData: OverviewTable;
  onOpenModal: (cardKey: keyof OverviewTable, cardTitle: string) => void;
}

export default function OverviewCards({ filterType, overViewData, onOpenModal }: Props) {
    const getFilterText = () => {
    switch (filterType) {
      case "TODAY":
        return "Today";
      case "WEEKLY":
        return "This week";
      case "MONTHLY":
        return "This month";
      case "DATEWISE":
        return "Datewise";
      default:
        return "Today";
    }
  };

  const getAwaitingApprovalText = () => {
    switch (filterType) {
      case "TODAY":
        return "Awaiting approval today";
      case "WEEKLY":
        return "Awaiting approval this week";
      case "MONTHLY":
        return "Awaiting approval this month";
      case "DATEWISE":
        return "Awaiting approval datewise";
      default:
        return "Awaiting approval today";
    }
  };

  const getExpectedTitle = () => {
    switch (filterType) {
      case "TODAY":
        return "EXPECTED TODAY";
      case "WEEKLY":
        return "EXPECTED THIS WEEK";
      case "MONTHLY":
        return "EXPECTED THIS MONTH";
      case "DATEWISE":
        return "EXPECTED DATEWISE";
      default:
        return "EXPECTED TODAY";
    }
  };

  const getExpectedText = () => {
    switch (filterType) {
      case "TODAY":
        return "Upcoming appointments today";
      case "WEEKLY":
        return "Upcoming appointments this week";
      case "MONTHLY":
        return "Upcoming appointments this month";
      case "DATEWISE":
        return "Upcoming appointments datewise";
      default:
        return "Upcoming appointments";
    }
  };

  const cards: VisitorOverviewCard[] = [
    {
      key: "TotalVisitors",
      title: "TOTAL VISITORS",
      value: overViewData.TotalVisitors,
      icon: Users,
      backgroundColor: "#EEF2F7",
      color: "#475569",
      text: getFilterText()
    },
    {
      key: "CurrentlyInside",
      title: "CURRENTLY IN",
      value: overViewData.CurrentlyInside,
      icon: Check,
      backgroundColor: "#D7F8E9",
      color: "#10B981",
      titleColor: "#10B981",
      text: "Currently On-premises"
    },
    {
      key: "ExpectedToday",
      title: getExpectedTitle(),
      value: overViewData.ExpectedToday,
      icon: CalendarDays,
      backgroundColor: "#FFEDD5",
      titleColor: "#EA580C",
      color: "#EA580C",
      text: getExpectedText()
    },
    {
      key: "PendingApprovals",
      title: "PENDING APPROVALS",
      value: overViewData.PendingApprovals,
      icon: Clock,
      backgroundColor: "#E0E7FF",
      titleColor: "#4338CA",
      color: "#4338CA",
      text: getAwaitingApprovalText()
    },
    {
      key: "Overstaying",
      title: "OVERSTAYING",
      titleColor: "#7E22CE",
      value: overViewData.Overstaying,
      icon: CircleAlert,
      backgroundColor: "#F3E8FF",
      color: "#7E22CE",
      text: "Require gate-out / alert"
    },
  ];

  return (
    <div className="space-y-3 pt-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c, i) => {
          const isClickable = c.value > 0;

          return (
            <div
              key={i}
              onClick={isClickable ? () => onOpenModal(c.key, c.title) : undefined}
              className={`rounded-xl border border-gray-200 bg-white p-4 ${isClickable ? "cursor-pointer hover:shadow transition" : ""}`}
              style={{
                boxShadow: "0px 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="max-w-[140px] text-sm font-bold uppercase tracking-wide h-10 leading-tight text-gray-500">
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
          );
        })}
      </div>
    </div>
  );
}