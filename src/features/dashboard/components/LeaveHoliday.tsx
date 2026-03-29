import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts";
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import type { Table4, Table6, Table5 } from "../models/UserDashboardModel";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { getSafeString } from "@/core/utils/comman";


interface Props {
    leaveBalanceData: Table4[];
    holidayData: Table6[];
    upcomingApprovedHolidays: Table5[];
}

export default function LeaveHoliday({ leaveBalanceData, holidayData, upcomingApprovedHolidays }: Props) {

    const parseNumber = (val: any) => typeof val === 'number' ? val : (Number(val) || 0);

    // caluculate total leaves
    const totalLeaves = leaveBalanceData.reduce((acc, leave) => acc + parseNumber(leave.TotalLeaves), 0);
    // used leaves
    const usedLeaves = leaveBalanceData.reduce((acc, leave) => acc + parseNumber(leave.UsedLeaves), 0);
    // calculate Pending leaves
    const pendingLeaves = leaveBalanceData.reduce((acc, leave) => acc + parseNumber(leave.RemainingLeaves), 0);

    // Next Holidays (DaysRemaining between 0 and 7)
    const nextHolidays = holidayData.filter((item) => item.DaysRemaining != null && item.DaysRemaining >= 0 && item.DaysRemaining <= 7);
    console.log('Next Holidays', nextHolidays);

    // Upcoming Holidays (DaysRemaining > 7)
    const upcomingHolidays = holidayData.filter((item) => item.DaysRemaining != null && item.DaysRemaining > 7);
    console.log('Upcoming Holidays', upcomingHolidays);

    return (
        <div className="space-y-3 pt-5">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 ml-1 sm:ml-2">Leave & Holiday</h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">

                {/* Leave Summary Card: */}
                
                <div className="col-span-1 lg:col-span-6 bg-white p-5 rounded-xl  h-[340px] overflow-y-auto thin-scroll  border border-gray-100" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
                    <p className="text-md font-semibold text-gray-500  pb-2">Leave Summary</p>
                    <p className="text-sm font-medium text-gray-400 mb-3 mt-3">Leave Breakdown</p>

                    <div className="h-[200px] min-h-[200px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart
                                data={[...leaveBalanceData]}
                                layout="vertical"
                                barCategoryGap={10}
                                margin={{ left: -20, right: 30 }}
                            >
                                <XAxis type="number" hide />
                                <YAxis
                                    type="category"
                                    dataKey="LeaveTypeName"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: "#6b7280" }}
                                    width={100}
                                />
                                <Bar
                                    dataKey="TotalLeaves"
                                    barSize={15}
                                    fill="#2563eb"
                                    radius={[0, 6, 6, 0]}
                                    background={{ fill: "#e5e7eb", radius: 6 }}
                                />
                                <LabelList
                                    dataKey="TotalLeaves"
                                    position="right"
                                    fill="#858a04"
                                    fontSize={12}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Leave Balance Card: */}
                <div className="col-span-1 lg:col-span-3 bg-white rounded-xl p-5  h-[340px] overflow-y-auto thin-scroll  border border-gray-100" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
                    <p className="text-md font-semibold text-gray-500 pb-2">
                        Leave Balance & Approved
                    </p>

                    {leaveBalanceData ? (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-400 mb-3 mt-3">Leave Balance</p>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-600 font-medium">Total Leaves :</p>
                                    <p className="text-sm font-semibold text-gray-800">{getSafeString(totalLeaves)}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-600 font-medium">Used :</p>
                                    <p className="text-sm font-semibold text-gray-800">{getSafeString(usedLeaves)}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-600 font-medium">Pending :</p>
                                    <p className="text-sm font-semibold text-gray-800">{getSafeString(pendingLeaves)}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-6">
                            <p className="text-sm text-gray-400">No leave data available</p>
                        </div>
                    )}

                    <p className="text-sm font-medium text-gray-400 mb-3 mt-3">Upcoming Approved</p>
                    <div className="w-full bg-green-50 rounded-md p-3 border border-green-100 mt-2">
                        {upcomingApprovedHolidays.length > 0 ? (
                            upcomingApprovedHolidays.map((item, index) => (
                                <div key={index} className="space-y-1">
                                    <p className="text-sm font-semibold text-green-800">{item.LeaveTypeName || "--"}</p>
                                    <div className="flex items-center justify-between text-[11px] text-green-700">
                                        <span>
                                            {item.StartDate ? formatDate_dd_MonthName_yy(item.StartDate) : "--"} - {item.EndDate ? formatDate_dd_MonthName_yy(item.EndDate) : "--"}
                                        </span>
                                        <span className="font-bold">
                                            {item.NoOfDays ? `${item.NoOfDays}d` : "--"}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-xs text-gray-400 text-center">--</div>
                        )}
                    </div>
                </div>

                {/* Holiday Card: */}
                <div className="col-span-1 lg:col-span-3 rounded-xl bg-white p-5 h-[340px] overflow-y-auto thin-scroll  border border-gray-100" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
                    <p className="text-md font-semibold text-gray-500  pb-2">Holiday</p>

                    {holidayData && holidayData.length > 0 ? (
                        <div className="">
                            <p className="text-sm font-medium text-gray-400 mb-3 mt-3">Next Holiday</p>
                            {nextHolidays && nextHolidays.length > 0 ? (
                                <div className="space-y-3 mb-4">
                                    {nextHolidays.map((h, index) => (
                                        <div key={index} className="w-full bg-indigo-50 rounded-md p-3 border border-indigo-100">
                                            <p className="font-semibold text-indigo-900 text-sm">
                                                {h.HolidayName ?? '-'}
                                            </p>
                                            <div className="flex justify-between items-center mt-2">
                                                <p className="text-[12px] text-indigo-700">
                                                    {h.HolidayDate ? new Date(h.HolidayDate).toLocaleDateString('en-GB', {
                                                        day: 'numeric', month: 'short', weekday: 'short'
                                                    }) : '-'}
                                                </p>
                                                <p className="text-[10px] text-white font-bold bg-indigo-500 rounded px-1.5 py-0.5">
                                                    {h.DaysRemaining === 0 ? 'Today' : `${h.DaysRemaining} day${h.DaysRemaining === 1 ? '' : 's'} left`}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 mb-4">No next holidays</p>
                            )}

                            <p className="text-sm font-medium text-gray-400 mb-3 mt-3">Upcoming Holidays</p>
                            <div className="space-y-2">
                                {upcomingHolidays?.length > 0 ? (
                                    upcomingHolidays.map((holiday, index) => (
                                        <div key={index} className="flex items-center justify-between pb-1 last:border-0">
                                            <p className="text-sm text-black truncate mr-2 ">{holiday.HolidayName ?? '-'}</p>
                                            <p className="text-sm  text-black whitespace-nowrap">
                                                {holiday.HolidayDate ? new Date(holiday.HolidayDate).toLocaleDateString('en-GB', {
                                                    day: 'numeric', month: 'short'
                                                }) : '-'}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[11px] text-gray-400">No more upcoming holidays</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <NoDataView message="No Holidays Available" />
                    )}
                </div>
            </div>
        </div>
    );
}