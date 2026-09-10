import { useState } from "react";

export default function UpcomingDeadlines({ }) {

    const data = [
        {
            status: "Reply Due",
            title: "GST NOTICE- KAMPA PROJECTS ",
            subTitle: "Reply Due Date: 05 September 2026"
        },
        {
            status: "Reply Due",
            title: "GST NOTICE- KAMPA PROJECTS ",
            subTitle: "Reply Due Date: 05 September 2026"
        },
    ]

      const [active, setActive] = useState<"All" | "Reply" | "Appeal" | "Order">("All");

    return (
        <div className="space-y-3 pt-4">
            <div className=" bg-white rounded-xl p-4" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
                <h3 className="text-sm text-gray-500 font-medium">
                    Upcoming Deadlines
                </h3>
                <div className="flex gap-2 mb-3 mt-3">
                    {(["All", "Reply", "Appeal", "Order"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setActive(t)}
                            className={`px-3 py-1 text-xs rounded-md transition ${active === t
                                    ? "bg-blue-600 text-white shadow"
                                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                    
                </div>
            </div>
        </div>
    )
}