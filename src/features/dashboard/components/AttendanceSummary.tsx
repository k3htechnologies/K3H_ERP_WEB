import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface AttendanceSummaryItem {
    AbsentCount: number;
    OnLeaveCount: number;
    PresentCount: number;
    TotalEmployees: number;
    Message: string;
}

interface Props {
    attendanceSummaryData?: AttendanceSummaryItem[];
}

export default function AttendanceSummary({ attendanceSummaryData = [] }: Props) {
    const total = attendanceSummaryData[0]?.TotalEmployees

    const data = [
        {
            name: 'Present',
            value: attendanceSummaryData[0]?.PresentCount,
            color: "#135bec"
        },
        {
            name: 'Absent',
            value: attendanceSummaryData[0]?.AbsentCount,
            color: "#13367A",
        },
        {
            name: 'On Leave',
            value: attendanceSummaryData[0]?.OnLeaveCount,
            color: "#7a98a5",
        }
    ]
    return (
        <div className="space-y-3 pt-5">

            {attendanceSummaryData.length > 0 &&
                <div
                    className=" bg-white rounded-xl p-5 mt-10 "
                    style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
                >
                    <h3 className="text-sm text-gray-500 font-medium">Attendance Summary</h3>

                    <div className="grid grid-cols-2 items-center gap-4">
                        {/* Left DONUT */}
                        <div className="relative h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        innerRadius={40}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        cornerRadius={10}
                                    >
                                        {data.map((t, i) => (
                                            <Cell key={i} fill={t.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            {/* CENTER TOTAL */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                <p className="text-xl font-bold text-gray-800">
                                    {total}
                                </p>
                            </div>
                        </div>
                        {/* Right LEGEND */}
                        <div className="space-y-3">
                            {data.map((t, i) => (
                                <div key={i} className="rounded-lg p-2 flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: t.color }}
                                    ></div>
                                    <p className="font-semibold text-[22px]">{t.value}</p>
                                    <p className="text-sm text-gray-500 font-medium">{t.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <p className="text-sm font-bold text-left p-1 ml-20">
                        {total} Total Employees
                    </p>
                </div>}

        </div>
    )
}