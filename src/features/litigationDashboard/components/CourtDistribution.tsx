import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts";
import type { Table3 } from "@/features/litigationDashboard/models/litigationDashboardModel";

interface Props {
    courtData: Table3[];
}

export default function CourtDistribution({ courtData = [] }: Props) {

    return (
        <div className="pt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Court Distribution
            </h2>

            <div className="bg-white rounded-lg p-4 space-y-4 overflow-y-auto thin-scroll border border-gray-100" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
                {courtData.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-[295px]">
                        <NoDataView />
                    </div>
                ) : (
                    <>
                        {/* Legend */}
                        <div className="flex justify-end gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 bg-blue-600 rounded-sm" />
                                Total Case
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 bg-rose-500 rounded-sm" />
                                Open Case
                            </div>
                        </div>

                        <div className="h-[260px] relative [&_.recharts-wrapper_svg]:outline-none">
                            <ResponsiveContainer >
                                <BarChart
                                    data={courtData}
                                    layout="vertical"
                                    margin={{ top: 10, right: 60, left: 10, bottom: 10 }}
                                >
                                    
                                    <XAxis type="number" hide />

                                    {/* Court names */}
                                    
                                    <YAxis
                                        type="category"
                                        dataKey="CourtType"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 13, fill: "#6b7280" }}
                                    />

                                    {/* TOTAL CASE */}
                                    <Bar
                                        dataKey="TotalCases"
                                        barSize={12}
                                        fill="#2563eb"
                                        radius={[6, 6, 6, 6]}
                                        background={{ fill: "#e5e7eb", radius: 6 }}
                                    >
                                        <LabelList dataKey="TotalCases" position="right" fill="#6b7280" fontSize={14}
                                        />
                                    </Bar>

                                    {/* OPEN CASE */}
                                    <Bar
                                        dataKey="OpenCases"
                                        barSize={12}
                                        fill="#f43f5e"
                                        radius={[6, 6, 6, 6]}
                                        background={{ fill: "#e5e7eb", radius: 6 }}
                                    >
                                        <LabelList dataKey="OpenCases" position="right" fill="#6b7280" fontSize={14}
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        </>
                )}
            </div>
        </div>
    );
}
