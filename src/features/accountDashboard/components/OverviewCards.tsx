// import { formatToKLCr } from "@/core/utils/comman";

export default function OverviewCards({ }) {
  const cards = [
    {
      title: "Total Notices",
      value: 128,
      subtitle: `+12 from this month`,
      backgroundColor: "white",
      color: "black",
    },
    {
      title: "Active Notices",
      value: 128,
      subtitle: `Currently required tracking`,
      backgroundColor: "white",
      color: "black",

    },
    {
      title: "Action Required",
      value: `08`,
      subtitle: `Requires Immediate Attention`,
      backgroundColor: "white",
      color: "black",
      outlineColor: "red"
    },
    {
      title: "Upcoming Deadlines",
      value: `08`,
      subtitle: `Requires Immediate Attention`,
      backgroundColor: "white",
      color: "black",
    },
    {
      title: "Reply Pending",
      value: `08`,
      subtitle: `Requires Immediate Attention`,
      backgroundColor: "white",
      color: "black",
    },
    {
      title: "Appeal Pending",
      value: `08`,
      subtitle: `Requires Immediate Attention`,
      backgroundColor: "white",
      color: "black",
    },
    {
      title: "Closed Notice",
      value: `08`,
      subtitle: `Requires Immediate Attention`,
      backgroundColor: "white",
      color: "black",
      outlineColor: "green"
    },
    {
      title: "Total Disputed Amount",
      value: `(₹) 121.32 CR`,
      subtitle: `Requires Immediate Attention`,
      backgroundColor: "white",
      color: "black",
    },

  ];

  return (
    <div className="space-y-3 pt-5">
      <div className="grid grid-cols-4 gap-4">
        {cards.map((c, i) => {
          if (c.title === 'Action Required' || c.title === "Closed Notice") {
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 relative border border-gray-100 shadow-sm overflow-hidden "
                style={{ borderColor: c.outlineColor || '#2563EB' }}
              >
                <div
                  className="absolute inset-y-0 left-0 w-1 border border-g-200"
                  style={{ backgroundColor: c.outlineColor || '#2563EB', borderColor: c.outlineColor || '#2563EB', borderWidth: '1px' }}
                />
                <div className="flex items-start gap-3 pl-2">
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{c.title}</p>
                    <p className="text-2xl font-bold mt-2" style={{ color: c.color }}>{c.value}</p>
                    <p className="text-xs text-gray-500 mt-2">{c.subtitle}</p>
                  </div>
                </div>
              </div>
            )
          }
          return (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
              <div className="flex items-start gap-3">
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{c.title}</p>
                  <p className="text-2xl font-bold mt-2" style={{ color: c.color }}>{c.value}</p>
                  <p className="text-xs text-gray-500 mt-2">{c.subtitle}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
