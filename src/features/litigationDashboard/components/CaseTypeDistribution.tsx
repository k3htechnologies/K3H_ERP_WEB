import { PieChart, Pie, Cell } from "recharts";

interface Props {
    CaseTypeData: any[];
}

export default function CaseTypeDistribution({ CaseTypeData = [] }: Props) {

    const data = CaseTypeData[0] || {};

    const chartData = [
        { name: "Civil Cases", value: data.CivilCases ?? 0 },
        { name: "Criminal Cases", value: data.CriminalCases ?? 0 },
    ];

    const COLORS = ["#2563eb", "#0c3ca3", "#ef4444", "#eab308", "#111827"];

    return (

        <div className="space-y-3 pt-5">

            <h2 className="text-lg font-semibold text-gray-800">
                Case Type Distribution
            </h2>
            <div className="bg-white p-4 rounded-xl mt-5 border border-gray-100"
                style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

                {/* Donut */}
                <div className="flex justify-center relative">

                    <PieChart width={220} height={220}>
                        <Pie
                            data={chartData}
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                        >
                            {chartData.map((_, index) => (
                                <Cell key={index} fill={COLORS[index]} />
                            ))}
                        </Pie>
                    </PieChart>

                    {/* Center Text */}
                    <div className="absolute top-1/2 -translate-y-1/2 text-center">
                        <p className="text-xs text-gray-500">Total Cases</p>
                        <p className="text-xl font-semibold">{data.TotalCases ?? 0}</p>
                    </div>
                </div>

                {/* Bottom Cards */}
                <div className="grid grid-cols-2 gap-3 mt-4">

                    <Card title="Civil Cases" value={data.CivilCases} color="text-black-500" />
                    <Card title="Criminal Cases" value={data.CriminalCases} color="text-purple-500" />

                </div>
            </div>
        </div>
    );
}

/* Small Card Component */

function Card({ title, value, color }: any) {
    return (
        <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">{title}</p>
            <p className={`text-lg font-semibold ${color}`}>{value ?? 0}</p>
        </div>
    );
}
