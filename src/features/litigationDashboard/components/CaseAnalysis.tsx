import {
    LineChart, ResponsiveContainer, Legend, Tooltip, Line, XAxis, YAxis
} from "recharts";

interface Props {
    CaseAnalysisData: any[];
}

export default function CaseAnalysis({ CaseAnalysisData = [] }: Props) {
    return (
        <div className="pt-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Case Analysis
            </h2>

            <div className="bg-white rounded p-4 space-y-4 shadow-sm">
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart
                        data={CaseAnalysisData}
                    >

                        <XAxis dataKey="Month" />
                        <YAxis
                            type="number"
                            domain={[10, 100]}
                            allowDataOverflow={true}
                            ticks={[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                            label={{
                                value: "CASES (YEAR)",
                                angle: -90,
                                position: "insideLeft"
                            }}
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
                            dataKey="Closed"
                            stroke="#6366F1"
                            strokeWidth={3}
                            dot={false}
                        />

                        {/* Opened Cases */}
                        <Line
                            type="monotone"
                            dataKey="Opened"
                            stroke="#EC4899"
                            strokeWidth={3}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
