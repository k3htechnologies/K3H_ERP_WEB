import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { formatToKLCr } from "@/core/utils/comman";

interface TargetPerformanceItem {
    AchievedAmount: number;
    AchievementPercent: number;
    FullName: string;
    PerformanceStatus: string;
    TargetAmount: number;
    TotalBookings: number;
    BookingFromEnquiry: number;
    Designation: string;

}

interface Props {
    targetPerformanceData: TargetPerformanceItem[];
}

export default function TargetPerformance({ targetPerformanceData }: Props) {

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Excellent': return '#22C55E';
            case 'Good': return '#22D3EE';
            case 'Average': return '#FACC15';
            case 'At Risk': return '#EF4444';
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'Excellent': return 'text-green-500';
            case 'Good': return 'text-cyan-500';
            case 'Average': return 'text-yellow-500';
            case 'At Risk': return 'text-red-500';
        }
    };

    return (
        <div className="space-y-4 pt-5 pb-10">
            <h2 className="text-lg font-semibold text-gray-800">Target Performance</h2>
            <div className="max-h-[700px] overflow-y-auto bg-white rounded-xl p-6 mt-5 space-y-15 shadow-sm border border-gray-100 thin-scroll">
                {targetPerformanceData.map((item) => (
                    <div key={item.FullName} className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                                    {item.FullName?.trim()
                                        ? item.FullName.trim().split(' ').map(n => n[0]).join('')
                                        : 'NA'}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800">{item.FullName}</h3>
                                    <p className="text-[11px] text-gray-400 font-medium">{item.Designation}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-xl font-black ${getStatusTextColor(item.PerformanceStatus)}`}>
                                    {typeof item.AchievementPercent === "number"
                                        ? item.AchievementPercent
                                        : 0}%
                                </span>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.PerformanceStatus}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 text-sm">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Target</p>
                                <p className="font-bold text-gray-800">₹{formatToKLCr(item.TargetAmount)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Achieved</p>
                                <p className={`font-bold ${getStatusTextColor(item.PerformanceStatus)}`}>₹{formatToKLCr(item.AchievedAmount)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Bookings</p>
                                <p className="font-bold text-gray-800">{item.TotalBookings}/{item.BookingFromEnquiry}</p>
                            </div>
                        </div>

                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={[{
                                    value: typeof item.AchievementPercent === "number"
                                        ? item.AchievementPercent
                                        : 0
                                }]} margin={{ left: -60, right: 0 }}>
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis type="category" hide />
                                    <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                                        <Cell fill={getStatusColor(item.PerformanceStatus)} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
