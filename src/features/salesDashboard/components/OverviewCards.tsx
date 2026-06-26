import {  UserPlus, Clock3, TrendingUp, Wallet } from "lucide-react";
import type { ProjectAchievementData } from "@/features/achievement/models/AchievementReportModel";
import type { Table1 } from "@/features/salesDashboard/models/SalesDashboardModel";
import { formatToKLCr } from "@/core/utils/comman";

interface Props {
  projectAchievementData: ProjectAchievementData[];
  enquiryFollowUpData: Table1[];
}

export default function OverviewCards({ projectAchievementData, enquiryFollowUpData }: Props) {

  const totalRevenue = projectAchievementData?.reduce(
    (sum, item) => sum + (item.TotalRevenue ?? 0),
    0
  ) ?? 0;

  const totalWalkins = projectAchievementData.reduce(
    (sum, item) => sum + (item.TotalWalkins ?? 0),
    0
  );

  const overdueCount =
    enquiryFollowUpData?.reduce((sum, item) => {
        return item.EnquiryFollowUpDays?.toLowerCase().includes("overdue")
            ? sum + 1
            : sum;
    }, 0) ?? 0;

  const totalBooking = projectAchievementData.reduce(
    (sum, item) => sum + (item.TotalBooking ?? 0),
    0
  );

  const conversionPercentage =
    totalWalkins > 0
      ? ((totalBooking / totalWalkins) * 100).toFixed(2)
      : "0.00";



  const cards = [
    {
      title: "Total Revenue",
      titlebackgroundColor:"#fff",
      value: formatToKLCr(totalRevenue ?? 0),
      icon: Wallet,
      backgroundColor: "#D8E2FF",
      color: "#0058BE",
    },
    {
      title: "New Lead",
      titlebackgroundColor:"#fff",
      value: totalWalkins ?? 0,
      icon: UserPlus,
      backgroundColor: "#D8E2FF",
      color: "#0058BE",
    },
    {
      title: "Overdue",
      titlebackgroundColor:"#FFDAD64D",
      titleColor:"#BA1A1A",
      value: overdueCount ?? 0,
      icon: Clock3,
      backgroundColor: "#BA1A1A",
      color: "#fff",
    },
    {
      title: "Conversation",
      titlebackgroundColor:"#fff",
      value: `${conversionPercentage ?? 0}%`,
      icon: TrendingUp,
      backgroundColor: "#D7FFFB",
      color: "#00685D",
    }
  ];

  return (
    <div className="space-y-3 pt-5">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="rounded-2xl p-4 border border-gray-100" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",backgroundColor: c.titlebackgroundColor }} >
            <div className="flex items-start gap-3">

              <div className="p-3 rounded-xl" style={{ backgroundColor: c.backgroundColor }}>
                <c.icon size={20} style={{ color: c.color }} />
              </div>

              <div className="pl-2">
                <p className="text-sm text-gray-500" >{c.title}</p>
                <p className="text-2xl font-semibold text-gray-900" style={{ color: c.titleColor }}>
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
