import type { Table0 } from "@/features/channelPartnerDashboard/models/ChannelPartnerDashboardModel";

interface Props {
  overViewData?: Table0[];
}

export default function OverviewCards({ overViewData = [] }: Props) {

  const data = overViewData[0] || {};

  const cards = [
    {
      title: "Total Channel Partner",
      value: data.TotalChannelPartner ?? 0,
      type: "primary",
    },
    {
      title: "Active Channel Partner",
      value: data.ActiveChannelPartner ?? 0,
      type: "default",
    },
    {
      title: "New Added Channel Partner",
      value: data.ThisMonthAddedChannelPartner ?? 0,
      type: "month",
    },
    {
      title: "Missing Information",
      value: data.MissingInfoChannelPartner ?? 0,
      type: "warning",
    },
  ];

  return (
    <div className="space-y-3 pt-1">

      <h2 className="text-lg font-semibold text-gray-800">
        Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div
            key={i}
            className={`
              rounded-lg p-5 shadow-sm space-y-4
              ${c.type === "primary" && "bg-blue-900 text-white border-blue-900"}
              ${c.type === "default" && "bg-white-300 border-gray-200"}
              ${c.type === "month" && "bg-white-300 border-gray-200"}
              ${c.type === "warning" && "bg-red-50 border-red-300"}
            `}
          >
            <p className={`text-sm ${c.type === "primary" ? "text-white/80" : "text-gray-500"}`}>
              {c.title}
            </p>

            <div className="flex items-end gap-2 mt-1">
              <p className={`text-2xl font-semibold ${c.type === "primary" ? "text-white" : "text-gray-900"}`}>
                {c.value}
              </p>

              {c.type === "month" && (
                <span className="text-xs text-green-600">
                  this month
                </span>
              )}
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}