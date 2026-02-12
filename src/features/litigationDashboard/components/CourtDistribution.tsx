import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts";

interface Props {
    courtData: any[];
}

export default function CourtDistribution({ courtData = [] }: Props) {

    return (

        <div className="pt-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Court Distribution
            </h2>

            <div className="bg-white p-4 rounded-lg border border-gray-100">

                {/* Legend */}
                <div className="flex justify-end gap-4 text-xs mt-1 text-gray-500">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-blue-600 rounded-sm" />
                        Total Case
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-rose-500 rounded-sm" />
                        Open Case
                    </div>
                </div>

                <div className="h-[280px]">
                    <ResponsiveContainer>
                        <BarChart
                            data={courtData}
                            layout="vertical"
                            barGap={12}
                        >

                            <XAxis type="number" hide />

                            {/* Court names */}
                            <YAxis
                                type="category"
                                dataKey="CourtName"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 13, fill: "#6b7280" }}
                            />

                            {/* TOTAL CASE */}
                            <Bar
                                dataKey="TotalCase"
                                barSize={12}
                                fill="#2563eb"
                                radius={[6, 6, 6, 6]}
                                background={{ fill: "#e5e7eb", radius: 6 }}
                            >
                                <LabelList dataKey="TotalCase" position="right" fill="#6b7280" fontSize={14}
                                />
                            </Bar>

                            {/* OPEN CASE */}
                            <Bar
                                dataKey="OpenCase"
                                barSize={12}
                                fill="#f43f5e"
                                radius={[6, 6, 6, 6]}
                                background={{ fill: "#e5e7eb", radius: 6 }}

                            >
                                <LabelList dataKey="OpenCase" position="right" fill="#6b7280" fontSize={14}
                                />
                            </Bar>

                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
