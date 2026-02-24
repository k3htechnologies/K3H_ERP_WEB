import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Cell,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import ReportsGrid from './ReportGridSection';

interface CallTrackerItem {
    TotalCalls: number;
    Pending: number;
    Overdue: number;
    AvgDurationMinutes: number | Record<string, any>;
}

interface TopCallersToday {
    FullName: string;
    TotalCalls: number;
}

interface Props {
    callTrackerData: CallTrackerItem[];
    topCallersTodayData: TopCallersToday[];
    overviewCardData: any[];
}


export default function CallTracker({ callTrackerData = [], topCallersTodayData = [], overviewCardData = [] }: Props) {

    const tracker = callTrackerData?.[0] ?? {
        TotalCalls: 0,
        Pending: 0,
        Overdue: 0,
        AvgDurationMinutes: 0
    };

    const avgDuration =
        typeof tracker.AvgDurationMinutes === "number"
            ? tracker.AvgDurationMinutes
            : 0;

    const callStatusDistribution = overviewCardData?.[0];
    const chartData = [
        {
            name: 'Connected',
            value: callStatusDistribution?.TodayConnected || 0,
            color: '#3B82F6'
        },
        {
            name: 'Not Connected',
            value: callStatusDistribution?.TodayNotConnected || 0,
            color: '#94A3B8'
        },
        {
            name: 'Rescheduled',
            value: callStatusDistribution?.TodayRescheduled || 0,
            color: '#FACC15'
        },
        {
            name: 'Closed',
            value: callStatusDistribution?.TodayClosed || 0,
            color: '#EF4444'
        }
    ];

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Call Tracker</h2>

            <div className="flex flex-row gap-4 items-stretch">
                <div className="flex-1 bg-white rounded-xl p-5 shadow-sm border border-gray-100">

                    <div className="grid grid-cols-12 gap-6">

                        <div className="col-span-7 space-y-6">
                            <div className="flex gap-3">
                                <div className="flex-1 h-20 bg-cyan-50 border border-cyan-100 rounded-lg flex flex-col items-center justify-center">
                                    <p className="text-xl font-bold text-cyan-500">
                                        {tracker.TotalCalls}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium">
                                        Total Calls
                                    </p>
                                </div>

                                <div className="flex-1 h-20 bg-yellow-50 border border-yellow-100 rounded-lg flex flex-col items-center justify-center">
                                    <p className="text-xl font-bold text-yellow-500">
                                        {tracker.Pending}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium">
                                        Pending
                                    </p>
                                </div>

                                <div className="flex-1 h-20 bg-red-50 border border-red-100 rounded-lg flex flex-col items-center justify-center">
                                    <p className="text-xl font-bold text-red-500">
                                        {tracker.Overdue}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium">
                                        Overdue
                                    </p>
                                </div>

                                <div className="flex-1 h-20 bg-green-50 border border-green-100 rounded-lg flex flex-col items-center justify-center">
                                    <p className="text-xl font-bold text-green-500">
                                        {avgDuration}M
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium">
                                        Avg Duration
                                    </p>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="space-y-2">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    Call Status Distribution
                                </p>

                                <div className="h-48 w-full">
                                    <ResponsiveContainer width="100%" height={180}>
                                        <BarChart
                                            data={chartData}
                                            layout="vertical"
                                            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                                            barSize={8}
                                        >
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                width={120}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip cursor={{ fill: 'transparent' }} />
                                            <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                        </div>

                        <div className="col-span-5 border-l border-gray-50 pl-6 bg-gray-100 rounded-lg">
                            <p className="text-xs font-semibold text-gray-500 mb-4 mt-2">
                                Top Callers Today
                            </p>
                            {/* your caller list */}
                            {topCallersTodayData.map((caller, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <p className="text-sm font-medium text-gray-500 p-2">{caller.FullName}</p>
                                    <p className="text-sm font-medium text-gray-500 p-2">{caller.TotalCalls} calls</p>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
                <ReportsGrid />
            </div>
        </div>
    )
}