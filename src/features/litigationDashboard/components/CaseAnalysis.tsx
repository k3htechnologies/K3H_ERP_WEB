import {
    LineChart, ResponsiveContainer, Legend, Tooltip, Line, XAxis, YAxis
} from "recharts";

interface CaseAnalysisData {
    Month: string;
    OpenCases: number;
    ClosedCases: number;
}

interface Props {
    CaseAnalysisData: CaseAnalysisData[];
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
                        <YAxis />

                        <Tooltip />
                        <Legend verticalAlign="top" align="right" />

                        {/* Closed Cases*/}
                        <Line
                            type="monotone"
                            dataKey="ClosedCases"
                            stroke="#6366F1"
                            strokeWidth={3}
                            dot={false}
                        />

                        {/* Opened Cases */}
                        <Line
                            type="monotone"
                            dataKey="OpenCases"
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
