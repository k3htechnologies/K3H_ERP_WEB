import NoDataView from "@/ui/components/NoDataView/NoDataView";
import {
    LineChart, ResponsiveContainer, Legend, Tooltip, Line, XAxis, YAxis
} from "recharts";
import type { Table7 } from "@/features/litigationDashboard/models/litigationDashboardModel";

interface Props {
    CaseAnalysisData: Table7[];
}

export default function CaseAnalysis({ CaseAnalysisData = [] }: Props) {
    return (
        <div className="pt-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Case Analysis
            </h2>

            <div className="bg-white rounded-lg p-4 space-y-4 shadow-sm">
                {CaseAnalysisData.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-[350px]">
                        <NoDataView />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart
                            data={CaseAnalysisData}
                        >

                            <XAxis dataKey="MonthName" />
                            <YAxis
                                type="number"
                                domain={[0, 100]}
                                ticks={[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                                interval={0}  
                            />
                            <Tooltip />
                            
                            <Legend
                                verticalAlign="top"
                                align="right"
                                iconSize={0}
                                formatter={(value) => `- ${value}`}
                            />

                            {/* Closed Cases*/}
                            <Line
                                type="monotone"
                                dataKey="ClosedCases"
                                name="CLOSED"
                                stroke="#6366F1"
                                strokeWidth={3}
                                dot={false}
                            />

                            {/* Open Cases*/}

                            <Line
                                type="monotone"
                                dataKey="OpenCases"
                                name="OPENED"
                                stroke="#EC4899"
                                strokeWidth={3}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
