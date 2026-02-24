import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts";

interface LeaveBalanceData {
    LeaveTypeName: string;
    PendingLeaves: number;
    TotalLeaves: number;
    UsedLeaves: number;
}

interface HolidaysData {
    DayName: string;
    DaysRemaining: number;
    HolidayDate: string;
    HolidayName: string;
}

interface Props {
    leaveBalanceData: LeaveBalanceData[];
    holidayData: HolidaysData[];
}


export default function LeaveHoliday({ leaveBalanceData = [], holidayData = [] }: Props) {


    // caluculate total leaves
    const totalLeaves = leaveBalanceData.reduce((acc, leave) => acc + leave.TotalLeaves, 0);
    // used leaves
    const usedLeaves = leaveBalanceData.reduce((acc, leave) => acc + leave.UsedLeaves, 0);
    // calculate Pending leaves
    const pendingLeaves = leaveBalanceData.reduce((acc, leave) => acc + leave.PendingLeaves, 0);

    // Next Holiday 
    const nextHoliday = holidayData.length > 0 ? holidayData[0] : null;

    // Upcoming Holidays 
    const upcomingHolidays = holidayData.slice(1);

    return (
        <div className="space-y-3 pt-5">
            <p className="text-md font-semibold text-gray-800">Leave & Holiday</p>
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6 bg-white p-5 rounded-xl ">
                    <p className="text-xs font-semibold text-gray-500">Leave Summary</p>
                    <p className="text-xs font-semibold text-gray-500 mt-7">Leave Breakdown</p>

                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                            data={[...leaveBalanceData, { LeaveTypeName: "Earned Leave", TotalLeaves: 0, UsedLeaves: 0, PendingLeaves: 0 }, { LeaveTypeName: "Paid Leave", TotalLeaves: 0, UsedLeaves: 0, PendingLeaves: 0 }]}
                            layout="vertical"
                            barCategoryGap={10}
                        >
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="LeaveTypeName"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: "#6b7280" }} />
                            <Bar
                                dataKey="TotalLeaves"
                                barSize={15}
                                fill="#2563eb"
                                radius={[6, 6, 6, 6]}
                                background={{ fill: "#e5e7eb", radius: 6 }}
                            />
                            <LabelList
                                dataKey="TotalLeaves"
                                position="right"
                                fill="#abb004ff"
                                fontSize={14}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Second Card */}
                <div className="col-span-3 bg-white rounded-xl shadow p-5 h-80">
                    <p className="text-md font-semibold text-gray-500">Leave Balance & Approved</p>
                    <p className="text-base font-medium text-gray-400 mt-2">Leave Balance</p>

                    <div className="flex item-center justify-between">
                        <p className="text-xs font-semibold text-gray-500">Total Leaves     : </p>
                        <p className="text-xs font-semibold text-gray-500">{totalLeaves}</p>
                    </div>
                    <div className="flex item-center justify-between">
                        <p className="text-xs font-semibold text-gray-500">Used Leaves   : </p>
                        <p className="text-xs font-semibold text-gray-500">{usedLeaves}</p>
                    </div>
                    <div className="flex item-center justify-between">
                        <p className="text-xs font-semibold text-gray-500">Pending Leaves    : </p>
                        <p className="text-xs font-semibold text-gray-500">{pendingLeaves}</p>
                    </div>
                </div>

                {/* Third Card */}
                {holidayData.length > 0 && <div className="col-span-3 rounded-xl bg-white shadow p-5 h-80 overflow-y-auto">
                    <p className="text-md font-semibold text-gray-500">Holiday</p>
                    {/* NEXT HOLIDAY SECTION */}
                    <p className="text-base font-medium text-gray-400 mt-2">Next Holiday</p>
                    {nextHoliday ? (
                        <div className="w-full bg-purple-50 shadow-sm rounded-md p-3 border border-blue-300 mt-2">
                            <p className="font-semibold text-gray-700">{nextHoliday.HolidayName}</p>
                            <div className="flex justify-between item-center">
                                <p className="text-xs text-gray-600 mt-1">
                                    {new Date(nextHoliday.HolidayDate).toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'short',
                                        weekday: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                                <p className="text-xs text-white font-medium bg-blue-600 rounded-md px-2 py-1">
                                    {nextHoliday.DaysRemaining} days to go
                                </p>

                            </div>
                        </div>
                    ) : (
                        // Then show no card


                        <p className="text-sm text-gray-400">No upcoming holidays</p>
                    )}

                    {/* UPCOMING HOLIDAYS LIST */}
                    <p className="text-base font-medium text-gray-400 mt-4">Upcoming Holidays</p>
                    <div className="mt-2 space-y-3">
                        {upcomingHolidays.length > 0 ? (
                            upcomingHolidays.map((holiday, index) => (
                                <div key={index} className="flex items-center justify-between border-b pb-1 border-gray-50">
                                    <p className="text-sm text-gray-700">{holiday.HolidayName}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(holiday.HolidayDate).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-gray-400 italic">No more holidays this month</p>
                        )}
                    </div>
                </div>}


            </div>

        </div>
    );
}