import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

export default function NoticeStatusOverview() {
    const statusData = [
        { name: "Closed", value: 65, color: "#22c55e" },
        { name: "Reply Submitted", value: 24, color: "#4f46e5" },
        { name: "Appeal Filed", value: 12, color: "#eab308" },
        { name: "Reply Pending", value: 9, color: "#f97316" },
        { name: "Favourable", value: 8, color: "#10b981" },
        { name: "Non-Favourable", value: 6, color: "#ef4444" },
        { name: "Reopened", value: 4, color: "#a855f7" },
    ];

    // Calculate actual total instead of array length
    const totalNotices = statusData.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="space-y-3 pt-5">
             <div className=" bg-white rounded-xl p-4 h-[300px]" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
            {/* Heading */}
            <h2 className="text-sm font-semibold uppercase text-slate-500 mb-4">
                Notice Status Overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6">
                {/* LEFT DONUT CHART */}
                <div className="relative h-59 w-full flex items-center justify-center -ml-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={3}
                                dataKey="value"
                                cornerRadius={4}
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Centered Label inside Donut Hole */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-slate-800 leading-tight">
                            {totalNotices}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 uppercase">
                            Total Notices
                        </span>
                    </div>
                </div>

                {/* RIGHT LEGEND */}
                <div className="space-y-2">
                    {statusData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between  text-xs">
                            <div className="flex items-center gap-2.5 -ml-15 mt-1">
                                <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-slate-600 font-medium text-sm">{item.name}</span>
                            </div>
                            <span className="text-slate-800 font-bold text-sm">
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        </div>


       
    );
}