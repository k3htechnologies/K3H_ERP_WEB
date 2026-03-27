import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import type { Table7 } from "../models/UserDashboardModel";

interface Props {
    attendanceSummaryData?: Table7[];
}

export default function AttendanceSummary({ attendanceSummaryData }: Props) {
    const total = attendanceSummaryData?.[0]?.TotalEmployees

    const data = [
        {
            name: 'Present',
            value: attendanceSummaryData?.[0]?.PresentCount,
            color: "#135bec"
        },
        {
            name: 'Absent',
            value: attendanceSummaryData?.[0]?.AbsentCount,
            color: "#13367A",
        },
        {
            name: 'On Leave',
            value: attendanceSummaryData?.[0]?.OnLeaveCount,
            color: "#7a98a5",
        }
    ]
    return (
        <div className="space-y-3 pt-5">
            <div className="bg-white rounded-xl p-5 mt-10 h-[310px] shadow-sm">
                <p className="text-md font-semibold text-gray-500 pb-2">Attendance Summary</p>

                {attendanceSummaryData?.length ?? 0 > 0 ? (
                    <>
                        <div className="grid grid-cols-2 items-center gap-4">

                            {/* Left DONUT */}
                            <div className="relative h-[220px] min-h-[220px] w-full min-w-0">
                                <ResponsiveContainer width="100%" height={200}>
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
                                        {total ?? 0}
                                    </p>
                                </div>
                            </div>

                            {/* Right LEGEND */}
                            <div className="space-y-3">
                                {data?.length > 0 ? (
                                    data.map((t, i) => (
                                        <div key={i} className="rounded-lg p-2 flex items-center gap-3">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: t.color }}
                                            ></div>
                                            <p className="font-semibold text-[22px]">
                                                {t.value ?? 0}
                                            </p>
                                            <p className="text-sm text-gray-500 font-medium">
                                                {t.name ?? '-'}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <NoDataView message="No data available" />
                                )}
                            </div>

                        </div>

                        <p className="text-sm font-bold text-left p-1 ml-20">
                            {total ?? 0} Total Employees
                        </p>
                    </>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-10">
                        No attendance data available
                    </p>
                )}

            </div>
        </div>
    )
}