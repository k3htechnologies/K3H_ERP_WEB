import { PieChart, Pie, Cell } from "recharts";
import type { Table2 } from "@/features/litigationDashboard/models/litigationDashboardModel";

interface Props {
    CaseTypeData: Table2[];
}

export default function CaseTypeDistribution({ CaseTypeData = [] }: Props) {

    const civil = CaseTypeData.find(d => d.CaseType === "CIVIL")?.TotalCases ?? 0;
    const criminal = CaseTypeData.find(d => d.CaseType === "CRIMINAL")?.TotalCases ?? 0;
    const total = civil + criminal;

    const chartData = [
        { name: "Civil Case", value: civil },
        { name: "Criminal Case", value: criminal },
    ];

    const COLORS = ["#1d8cf8", "#0c3ca3"];

    return (
        <div className="space-y-3 pt-4">
            <h2 className="text-lg font-semibold text-gray-800">
                Case Type Distribution
            </h2>

            <div className="bg-white p-4 rounded-lg space-y-4 mt-4 border border-gray-100 space-y-4">
                {/* Donut Chart */}
                <div className="flex justify-center relative [&_.recharts-wrapper_svg]:outline-none">
                    <PieChart width={220} height={200}>
                        <Pie
                            data={chartData}
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey="value"
                            cornerRadius={10}
                            startAngle={90}
                            endAngle={-270}
                            style={{ outline: "none" }}
                        >
                            {chartData.map((_, index) => (
                                <Cell key={index} fill={COLORS[index]} />
                            ))}
                        </Pie>
                    </PieChart>

                    {/* Center Label */}
                    <div className="absolute top-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <p className="text-sm font-semibold text-gray-700">Total Cases</p>
                        <p className="text-sm font-bold text-gray-900">{total}</p>
                    </div>
                </div>

                {/* Bottom Cards */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <Card title="Civil Case" value={civil} color={COLORS[0]} />
                    <Card title="Criminal Case" value={criminal} color={COLORS[1]} />
                </div>
            </div>
        </div>
    );
}

function Card({ title, value, color }: { title: string; value: number; color: string }) {
    return (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100" >
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-lg font-bold" style={{ color }}>{value}</p>
        </div>
    );
}