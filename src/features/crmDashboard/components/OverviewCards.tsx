
import { formatToKLCr } from "@/core/utils/comman";
import type { Table0 } from "@/features/crmDashboard/models/CrmDashboardModel";
import { FileSpreadsheet, Check, IndianRupee, Calendar } from "lucide-react";

interface Props {
  overViewData?: Table0[];
}

export default function OverviewCards({ overViewData = [] }: Props) {
  const data = overViewData[0] || {};

  const cards = [
    {
      title: "Total Agreement Value",
      value: formatToKLCr(data.TotalAgreementAmount ?? 0),
      icon: FileSpreadsheet,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      title: "Total Received Amount",
      value: formatToKLCr(data.TotalReceivedAgreementAmount ?? 0),
      icon: Check,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-100",
    },
    {
      title: "Total Outstanding",
      value: formatToKLCr(data.TotalOutstandingAgreementValue ?? 0),
      icon: IndianRupee,
      iconColor: "text-rose-500",
      iconBg: "bg-rose-50",
    },
    {
      title: "Total Bookings",
      value: data.TotalBooking ?? 0,
      icon: Calendar,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
    },
  ];

  return (
    <div className="space-y-3 pt-1">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div
            key={i}
            className="h-[100px] flex flex-col justify-center bg-white rounded-2xl p-4 border border-gray-100"
            style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium  text-slate-500">
                {c.title}
              </p>

              <div className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center ${c.iconBg}`}>
                <c.icon
                  size={20}
                  className={c.iconColor}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <p className={`text-2xl font-semibold ${i === 1 ? "text-emerald-500" :
                i === 3 ? "text-amber-600" :
                  "text-slate-800"
                }`}>
                {i !== 3 ? "₹ " : ""}{c.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
