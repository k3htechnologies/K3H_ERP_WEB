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
  ]

  return (
    <div className="space-y-3 pt-4">
      <div className=" bg-white rounded-xl p-2" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
        <h3 className="text-sm text-gray-500 font-medium p-3">
          RECENT ACTIVITY TIMELINE
        </h3>
        {data.map((c, i) => (
          <>
            <div key={i} className="p-3">
              <div className="flex">
                <div className="w-3 h-3 rounded-full shrink-0 mt-1"
                  style={{ backgroundColor: c.color }}>
                </div>
                <p className="ml-3"> {c.requestType}</p>
              </div>
              <p className="text-xs text-gray-400 ml-5">{c.subTitle}</p>
            </div>
          </>
        ))}
      </div>
    </div>
  )
}