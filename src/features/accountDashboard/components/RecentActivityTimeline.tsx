export default function RecentActivityTimeline({ }) {
  const data = [
    {
      requestType: 'Reply Submitted',
      subTitle: 'GST-Notice-Kampa Projects .Today, 10:45AM',
      color: "#29a4e7ff"
    },
    {
      requestType: 'Appeal Filed',
      subTitle: 'GST-Notice-Kampa Projects .Today, 10:45AM',
      color: "#08d230ff"
    },
    {
      requestType: 'Order Received',
      subTitle: 'GST-Notice-Kampa Projects .Today, 10:45AM',
      color: "#d68016ff"
    },
    {
      requestType: 'New Notice Added',
      subTitle: 'GST-Notice-Kampa Projects .Today, 10:45AM',
      color: "#29a4e7ff"
    },
    {
      requestType: 'Order Received',
      subTitle: 'GST-Notice-Kampa Projects .Today, 10:45AM',
      color: "#d68016ff"
    },
  ];

  return (
    <div className="space-y-3 pt-4">
      {/* flex flex-col aur overflow-hidden add kiya */}
      <div
        className="bg-white w-full h-[370px] rounded-xl p-5 flex flex-col overflow-y-auto thin-scroll"
        style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
      >
        <h3 className="text-sm font-semibold text-slate-500 uppercase shrink-0 mb-2">
          RECENT ACTIVITY TIMELINE
        </h3>

        {/* Scrollable list container */}
        <div className="overflow-y-auto flex-1 thin-scroll space-y-1">
          {data.map((c, i) => (
            <div key={i} className="p-2">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: c.color }}
                />
                <p className="ml-3 font-medium text-sm text-slate-800">
                  {c.requestType}
                </p>
              </div>
              <p className="text-sm text-gray-400 ml-6 mt-0.5 truncate">
                {c.subTitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}