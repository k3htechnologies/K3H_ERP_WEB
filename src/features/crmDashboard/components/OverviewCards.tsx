import { formatToKLCr } from "@/core/utils/comman";
import type { Table0 } from "@/features/crmDashboard/models/CrmDashboardModel";

interface Props {
  overViewData?: Table0[];
}

export default function OverviewCards({ overViewData = [] }: Props) {

  const data = overViewData[0] || {};

  const cards = [
    {
      title: "Total Agreement Value",
      value: formatToKLCr(data.TotalAgreementAmount?? 0),
      type:"₹"
    },
    {
      title: "Total Received Amount",
      value: formatToKLCr(data.TotalReceivedAgreementAmount ?? 0),
      type:"₹"
    },
    {
      title: "Total Outstanding ",
      value: formatToKLCr(data.TotalOutstandingAgreementValue ?? 0),
      type:"₹"
    },
    {
      title: "Total Booking",
      value: data.TotalBooking ?? 0,
      type:""
    },
  ];

  return (
    <div className="space-y-3 pt-1">

      <h2 className="text-lg font-semibold text-gray-800">
        Overview
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="p-4 h-[100px] flex flex-col justify-center bg-white rounded-2xl p-4 border border-gray-100"
             style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }} >
              
            <p className="text-sm text-gray-500">
              {c.title}
            </p>

            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-semibold">
                {c.type === "₹" ? "₹ " : ""}{c.value}
              </p>

             
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}