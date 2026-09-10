export default function NoticesByAuthority({ }) {

    const authorityData = [
        {
            name: "GST Authority",
            active: 12,
            pending: 5,
            activeWidth: "22%",
            pendingWidth: "16%",
            pendingColor: "bg-rose-500",
            pendingTextColor: "text-rose-500",
        },
        {
            name: "District Court",
            active: 14,
            pending: 4,
            activeWidth: "26%",
            pendingWidth: "11%",
            pendingColor: "bg-rose-500",
            pendingTextColor: "text-rose-500",
        },
        {
            name: "High Court",
            active: 10,
            pending: 3,
            activeWidth: "25%",
            pendingWidth: "11%",
            pendingColor: "bg-orange-500",
            pendingTextColor: "text-amber-600",
        },
        {
            name: "Income Tax Department",
            active: 8,
            pending: 2,
            activeWidth: "28%",
            pendingWidth: "10%",
            pendingColor: "bg-orange-500",
            pendingTextColor: "text-orange-500",
        },
        {
            name: "Supreme Court",
            active: 6,
            pending: 1,
            activeWidth: "33%",
            pendingWidth: "4%",
            pendingColor: "bg-amber-400",
            pendingTextColor: "text-amber-500",
        },
        {
            name: "ESIC",
            active: 4,
            pending: 0,
            activeWidth: "46%",
            pendingWidth: "0%",
            pendingColor: "bg-emerald-500",
            pendingTextColor: "text-emerald-500",
        },
    ];

    return (
        <div className="space-y-3 pt-5">
            <div className="bg-white rounded-xl p-4 h-[300px] border border-gray-100 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex flex-col">

                <div className="w-full bg-white rounded-2xl p-2 flex flex-col flex-1 min-h-0">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold  text-slate-500 uppercase">
                            Notices by Authority
                        </h2>

                        {/* Legend */}
                        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block"></span>
                                <span>Active</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block"></span>
                                <span>Pending Action</span>
                            </div>
                        </div>
                    </div>

                    {/* List */}
                    <div className="space-y-4  thin-scroll overflow-y-auto pr-1 ">

                        {authorityData.map((item, index) => (
                            <div key={index}>

                                {/* Authority + Count */}
                                <div className="flex justify-between items-baseline text-sm mb-1.5 font-medium">

                                    <span className="text-slate-700 font-semibold">
                                        {item.name}
                                    </span>

                                    <div className="text-xs">
                                        <span className="text-slate-500">
                                            {item.active} Active,{" "}
                                        </span>

                                        <span className={`${item.pendingTextColor} font-semibold`}>
                                            {item.pending} Pending
                                        </span>
                                    </div>

                                </div>

                                {/* Progress Bar */}
                                <div className="h-2 w-full bg-slate-100 rounded-full flex overflow-hidden">

                                    <div
                                        className="bg-blue-500 h-full rounded-l-full"
                                        style={{ width: item.activeWidth }}
                                    />

                                    {item.pending > 0 && (
                                        <div
                                            className={`${item.pendingColor} h-full rounded-r-full`}
                                            style={{ width: item.pendingWidth }}
                                        />
                                    )}

                                </div>

                            </div>
                        ))}

                    </div>

                </div>
            </div>
        </div>
    );
}