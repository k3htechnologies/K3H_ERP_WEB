import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { Table1 } from "@/features/vendorManagementDashboard/models/VendorManagementDashboardModel";

interface Props {
    vendorDistributionData?: Table1[];
}

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899"];

export default function VendorDistribution({ vendorDistributionData = [] }: Props) {
    const totalVendors = vendorDistributionData.reduce(
        (sum, item) => sum + (item.Total || 0),
        0
    );

    return (
        <div className="space-y-3 pt-5">
            <div className="bg-white rounded-2xl p-5  border border-gray-100 w-full h-[300px]">
                {/* Header */}
                <h2 className="text-base font-semibold text-slate-500 mb-4">
                    Vendor Distribution
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6">
                    {/* Left: Donut Chart with Center Label */}
                    <div className="relative h-56 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={vendorDistributionData}
                                    dataKey="Total"
                                    nameKey="Label"
                                    innerRadius={65}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    startAngle={90}
                                    endAngle={-270}
                                    stroke="none"
                                    cornerRadius={10}
                                >
                                    {vendorDistributionData.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Absolute Center Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-extrabold text-slate-900 leading-none">
                                {totalVendors}
                            </span>
                            <span className="text-xs font-medium text-slate-400 mt-1">
                                Vendors
                            </span>
                        </div>
                    </div>

                    {/* Right: Legend Breakdown */}
                    <div className="flex flex-col space-y-4">
                        {vendorDistributionData.map((item, index) => (
                            <div
                                key={item.Label || index}
                                className="flex items-center justify-between text-sm"
                            >
                                {/* Dot indicator & Label */}
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <span className="font-medium text-slate-700 truncate">
                                        {item.Label}
                                    </span>
                                </div>

                                {/* Total & Percentage */}
                                <div className="flex items-center gap-4 shrink-0">
                                    <span className="font-semibold text-slate-900">
                                        {item.Total}
                                    </span>
                                    <span className="text-slate-400 font-normal w-12 text-right">
                                        {item.Percentage}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

    );
}