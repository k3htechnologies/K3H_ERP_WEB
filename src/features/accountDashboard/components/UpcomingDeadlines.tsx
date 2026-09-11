import { useState } from "react";

const STATUS_THEMES: Record<
    string,
    {
        border: string;
        strip: string;
        badgeBg: string;
        badgeText: string;
        dot: string;
        timeLineText: string;
        btnBg: string;
    }
> = {
    "Reply Due": {
        border: "border-red-500",
        strip: "bg-red-500",
        badgeBg: "bg-red-50",
        badgeText: "text-red-500",
        dot: "bg-red-500",
        timeLineText: "text-red-500",
        btnBg: "bg-red-600 hover:bg-red-700",
    },
    "Appeal Due": {
        border: "border-blue-500",
        strip: "bg-blue-500",
        badgeBg: "bg-blue-50",
        badgeText: "text-blue-600",
        dot: "bg-blue-600",
        timeLineText: "text-blue-600",
        btnBg: "bg-red-600 hover:bg-red-700",
    },
    "Order Due": {
        border: "border-amber-400",
        strip: "bg-amber-400",
        badgeBg: "bg-amber-100",
        badgeText: "text-yellow-900",
        dot: "bg-amber-400",
        timeLineText: "text-amber-500",
        btnBg: "bg-red-600 hover:bg-red-700",
    },
};

const DEFAULT_THEME = STATUS_THEMES["Reply Due"];

export default function UpcomingDeadlines() {
    const data = [
        {
            status: "Reply Due",
            title: "GST Notice- Kampa Projects",
            timeLine: "2 Days Remaining",
            subTitle: "Reply Due Date: 05 September 2026",
        },
        {
            status: "Reply Due",
            title: "GST Notice- Kampa Projects",
            timeLine: "2 Days Remaining",
            subTitle: "Reply Due Date: 05 September 2026",
        },
        {
            status: "Reply Due",
            title: "GST Notice- Kampa Projects",
            timeLine: "2 Days Remaining",
            subTitle: "Reply Due Date: 05 September 2026",
        },
        {
            status: "Appeal Due",
            title: "GST Notice- Kampa Projects",
            timeLine: "2 Days Remaining",
            subTitle: "Appeal Due Date: 05 September 2026",
        },
        {
            status: "Order Due",
            title: "GST Notice- Kampa Projects",
            timeLine: "2 Days Remaining",
            subTitle: "Order Due Date: 05 September 2026",
        },
    ];

    const [active, setActive] = useState<"All" | "Reply" | "Appeal" | "Order">("All");

    const currentData = data.filter((item) => {
        if (active === "All") return true;
        if (active === "Reply") return item.status === "Reply Due";
        if (active === "Appeal") return item.status === "Appeal Due";
        if (active === "Order") return item.status === "Order Due";
        return false;
    });

    return (
        <div className="space-y-3 pt-4">
            <div
                className="bg-white rounded-xl p-4 h-[370px] overflow-y-auto thin-scroll"
                style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
            >
                <h3 className="text-sm font-semibold text-slate-500 uppercase">
                    Upcoming Deadlines
                </h3>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-2 mb-3 mt-3">
                    {(["All", "Reply", "Appeal", "Order"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setActive(t)}
                            className={`px-3 cursor-pointer py-1 text-xs rounded-md transition ${active === t
                                ? "bg-blue-600 text-white shadow"
                                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Card List */}
                <div className="space-y-4">
                    {currentData.map((item, index) => {
                        const theme = STATUS_THEMES[item.status] || DEFAULT_THEME;

                        return (
                            <div
                                key={index}
                                className={`relative bg-white rounded-2xl pl-4 border ${theme.border} overflow-hidden mt-4 p-3`}
                            >
                                {/* Left colored strip */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.strip}`} />

                                {/* Card Content */}
                                <div className="flex flex-wrap items-center justify-between w-full gap-2">
                                    {/* Dynamic Badge */}
                                    <div className={`inline-flex items-center px-2 py-0.5 rounded ${theme.badgeBg}`}>
                                        <span className={`text-xs font-semibold ${theme.badgeText}`}>
                                            {item.status}
                                        </span>
                                    </div>

                                    {/* Dynamic Timeline with Dot */}
                                    <div className={`flex items-center gap-1.5 text-xs font-medium ${theme.timeLineText} shrink-0`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${theme.dot} inline-block`} />
                                        <span>{item.timeLine}</span>
                                    </div>
                                </div>

                                <p className="text-base font-medium text-black mt-2 break-words">
                                    {item.title}
                                </p>

                                <div className="flex flex-wrap justify-between items-center mt-2 gap-2">
                                    <p className="text-sm font-medium text-gray-500 break-words min-w-[150px] flex-1">
                                        {item.subTitle}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => { }}
                                            className={`px-3 py-1 text-xs rounded-md text-white cursor-pointer transition ${theme.btnBg}`}
                                        >
                                            View Notice
                                        </button>
                                        <button
                                            onClick={() => { }}
                                            className="px-3 py-1 text-xs rounded-md bg-white text-black border border-gray-300 cursor-pointer hover:bg-gray-50 transition"
                                        >
                                            Set Reminder
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}