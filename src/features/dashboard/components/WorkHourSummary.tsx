import { BarChart, Bar, XAxis, Cell, ResponsiveContainer, LabelList } from 'recharts';
import type { Table2, Table3 } from '../models/UserDashboardModel';


const HeaderStat = ({ label, value, subLabel, valueColor = "text-gray-900" }: { label: string, value: string, subLabel?: React.ReactNode, valueColor?: string }) => (
    <div className="flex flex-col">
        <span className="text-sm text-gray-400 mb-1">{label}</span>
        <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${valueColor}`}>{value}</span>
            {subLabel}
        </div>
    </div>
);

interface Props {
    workHourStatus: Table2[];
    workHourBarGraphStatus: Table3[];
}

export default function WorkHourSummary({ workHourStatus, workHourBarGraphStatus }: Props) {

    const today = new Date();
    const dayName = today.toLocaleString('en-us', { weekday: 'long' });

    const aggregatedData = workHourBarGraphStatus.reduce((acc: any, item) => {
        const day = item.DayName;

        let currentHours = 0;
        const hasValidPunches = typeof item.PunchIn === 'string' && item.PunchIn.trim() !== "" &&
            typeof item.PunchOut === 'string' && item.PunchOut.trim() !== "";

        if (hasValidPunches) {
            if (typeof item.HoursWorked === 'number') {
                currentHours = item.HoursWorked;
            } else if (item.WorkingHours) {
                const parts = item.WorkingHours.split(':');
                if (parts.length === 2) {
                    const h = parseInt(parts[0], 10);
                    const m = parseInt(parts[1], 10);
                    if (!isNaN(h) && !isNaN(m)) currentHours = h + m / 60;
                }
            }
        }

        if (!acc[day]) {
            acc[day] = {
                ...item,
                totalHours: 0,
                isLate: item.AttendanceStatus === "Late In",
                isEarly: item.AttendanceStatus === "Early Logout"
            };
        }

        acc[day].totalHours += currentHours;
        if (item.AttendanceStatus === "Late In") acc[day].isLate = true;
        if (item.AttendanceStatus === "Early Logout") acc[day].isEarly = true;

        return acc;
    }, {});

    const chartData = Object.values(aggregatedData).map((item: any) => {
        const hours = item.totalHours;
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);

        const displayH = m === 60 ? h + 1 : h;
        const displayM = m === 60 ? 0 : m;
        const displayLabel = hours > 0 ? `${displayH}H ${displayM.toString().padStart(2, '0')}m` : "";

        return {
            ...item,
            hours: hours,
            maxHours: item.RequiredHours || 9,
            label: displayLabel,
            fillColor: hours === 0 || item.DayName === 'Sunday' ? '#E5E7EB' : '#2563EB'
        };
    });

    const uniqueDays = Object.values(aggregatedData);
    const lateInEmployee = uniqueDays.filter((item: any) => item.isLate).length;
    const earlyLogoutEmployee = uniqueDays.filter((item: any) => item.isEarly).length;

    return (
        <div className="space-y-5 pt-5">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 ml-1 sm:ml-2 ">Work Hour Summary</h2>

            {(workHourStatus.length > 0 && workHourBarGraphStatus.length > 0) && <div className="bg-white rounded-xl p-5 h-full flex flex-col">
                <p className="text-md font-semibold text-gray-500 pb-2">Working Hour </p>
                <div className="flex justify-between items-start mb-8 flex-wrap gap-4 mt-5">

                    <div className="flex justify-between w-full">
                        <HeaderStat label="This Month" value={`${Math.round(workHourStatus[0]?.ThisMonthHours || 0)} h`} />
                        <HeaderStat label="This Week" value={`${Math.round(workHourStatus[0]?.ThisWeekHours || 0)} h`} />
                        <HeaderStat label="Overtime" value={`${Math.round(workHourStatus[0]?.OvertimeHours || 0)} h`} valueColor="text-orange-500" />
                        <HeaderStat label="Avg Daily" value={`${Math.round(workHourStatus[0]?.AvgDailyHours || 0)} h`}
                            subLabel={<span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md ml-2">This Week</span>}
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-6">Daily Work Hours (This Week)</p>
                    <div className="h-[250px] min-h-[250px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                barGap={-45}
                            >
                                <XAxis
                                    dataKey="DayName"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={({ x, y, payload }) => {
                                        const isToday = payload.value === dayName;
                                        return (
                                            <g transform={`translate(${x},${y})`}>
                                                <text
                                                    x={0}
                                                    y={0}
                                                    dy={16}
                                                    textAnchor="middle"
                                                    fill={isToday ? "#2563EB" : "#9CA3AF"}
                                                    fontWeight={isToday ? "bold" : "normal"}
                                                    fontSize={14}
                                                >
                                                    {payload.value}
                                                </text>
                                            </g>
                                        );
                                    }}
                                />
                                <Bar
                                    dataKey="maxHours"
                                    fill="#F3F4F6"
                                    radius={[6, 6, 6, 6]}
                                    barSize={45}
                                    isAnimationActive={false}
                                />
                                <Bar dataKey="hours" radius={[6, 6, 6, 6]} barSize={45}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fillColor} />
                                    ))}
                                    <LabelList
                                        dataKey="label"
                                        position="top"
                                        fill="#6B7280"
                                        fontSize={12}
                                        offset={10}
                                        style={{ fontWeight: 500 }}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="flex gap-6 mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className="text-red-500">⚠</span>
                        <span className="text-sm text-gray-500">Late Login: <span className="text-gray-700">{lateInEmployee} days</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-orange-500">⏱</span>
                        <span className="text-sm text-gray-500">Early Logout: <span className="text-gray-700">{earlyLogoutEmployee} days</span></span>
                    </div>
                </div>
            </div>}
        </div>
    );
}