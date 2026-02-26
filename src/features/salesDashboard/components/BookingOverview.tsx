import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import AreaWiseDistribution from '@/features/salesDashboard/components/AreaWiseDistribution';

interface BookingCardOverviewData {
    DirectBookingCount: number;
    DirectBookingPct: number;
    ChannelPartnerBookingCount: number;
    ChannelPartnerBookingPct: number;
    UpcomingRegistrationCount: number;
}

interface SourceWiseDistributionData {
    SourceName: string;
    SubSourceName: string;
    SubSubSourceName: string;
    TotalEnquiries: number;
    SourcePct: number;
}

interface BudgetWiseDistributionData {
    MonthName: string;
    MonthNumber: number;
    YearNumber: number;
    TotalBookingValue: number;
    BudgetSlab: string;
}

interface Props {
    budgetWiseDistribution: BudgetWiseDistributionData[];
}

interface Props {
    bookingOverviewData: BookingCardOverviewData[];
    sourceWiseDistribution: SourceWiseDistributionData[];
    bookingConversionRate: any[];
    residentialData: any[];
    commercialData: any[];
}

export default function BookingOverview({ bookingOverviewData, sourceWiseDistribution, bookingConversionRate, residentialData, budgetWiseDistribution, commercialData }: Props) {

    const salesData = Object.values(
        budgetWiseDistribution.reduce<Record<string, any>>((acc, curr) => {
            const month = curr.MonthName;

            if (!acc[month]) {
                acc[month] = {
                    month: month.toUpperCase(),
                    monthNumber: curr.MonthNumber,
                    value: 0,
                };
            }

            acc[month].value += Number(curr.TotalBookingValue);

            return acc;
        }, {})
    ).sort((a, b) => a.monthNumber - b.monthNumber);

    const data = bookingOverviewData?.[0] ?? {
        DirectBookingCount: 0,
        DirectBookingPct: 0,
        ChannelPartnerBookingCount: 0,
        ChannelPartnerBookingPct: 0,
        UpcomingRegistrationCount: 0
    };

    const sourceWiseDistributionData = sourceWiseDistribution?.map((item) => ({
        icon: '🌐',
        source: item.SourceName,
        subData: item.SubSubSourceName,
        count: item.TotalEnquiries,
        percentage: item.SourcePct,
        color: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-600'
    }))

    return (
        <div className="space-y-4 pt-5">
            <h2 className="text-lg font-bold text-gray-800">Booking Overview</h2>

            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-8">

                <div className="flex gap-4 items-stretch">

                    {/* Direct Booking */}
                    <div className="flex-1 bg-[#F5F3FF] border border-indigo-100 rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-indigo-700">
                                    Direct Booking
                                </p>
                                <p className="text-[10px] font-bold text-indigo-400 mt-1">
                                    {data.DirectBookingPct ?? 0}%
                                </p>
                            </div>
                            <span className="text-2xl font-black text-indigo-900">
                                {data.DirectBookingCount ?? 0}
                            </span>
                        </div>
                    </div>

                    {/* Channel Partner Booking */}
                    <div className="flex-1 bg-[#EFF6FF] border border-blue-100 rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-blue-700 leading-tight">
                                    Channel Partner Booking
                                </p>
                                <p className="text-[10px] font-bold text-blue-400 mt-1">
                                    {data.ChannelPartnerBookingPct ?? 0}%
                                </p>
                            </div>
                            <span className="text-2xl font-black text-blue-900">
                                {data.ChannelPartnerBookingCount ?? 0}
                            </span>
                        </div>
                    </div>

                    {/* Upcoming Registration */}
                    <div className="flex-1 bg-[#FFFBEB] border border-yellow-100 rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-yellow-700">
                                    Upcoming Registration
                                </p>
                                <div className="h-4"></div>
                            </div>
                            <span className="text-2xl font-black text-yellow-600">
                                {data.UpcomingRegistrationCount ?? 0}
                            </span>
                        </div>
                    </div>

                </div>

                <div className="space-y-6">
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Sales Distribution</p>
                        <h3 className="text-sm font-bold text-gray-700 mt-1">Budget Wise Distribution</h3>
                    </div>

                    {/* Chart Area */}
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={true}
                                    tickLine={true}
                                    tick={{ fontSize: 9, fill: '#9CA3AF', fontWeight: 600 }}
                                />
                                <YAxis
                                    width={80}
                                    axisLine={true}
                                    tickLine={true}
                                    domain={[0, 25]}
                                    ticks={[0, 5, 10, 15, 20, 25]}
                                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                    tickFormatter={(value) => {
                                        switch (value) {
                                            case 0:
                                                return '< 1 CR'
                                            case 5:
                                                return '1 -5 CR'
                                            case 10:
                                                return '5 - 10 CR'
                                            case 15:
                                                return '10 -15 CR'
                                            case 20:
                                                return '15 -20 CR'
                                            case 25:
                                                return '20<CR'
                                            default:
                                                return value
                                        }
                                    }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F9FAFB' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar
                                    dataKey="value"
                                    radius={[0, 0, 0, 0]}
                                    barSize={24}
                                >
                                    {salesData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={
                                                entry.value === 1
                                                    ? '#243e64ff'
                                                    : entry.month === 'AUGUST'
                                                        ? '#2563EB'
                                                        : '#3B82F6'
                                            }
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className='grid grid-cols-2 gap-5'>
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-blue-500 font-bold">Source Wise Distribution</p>
                        <div className='font-bold text-gray-700 p-5 rounded-md h-full'>
                            {sourceWiseDistributionData.map((item, index) => (
                                <div
                                    key={index}
                                    className={`${item.color} border ${item.borderColor} rounded-xl p-4 flex flex-col gap-2 relative shadow-sm mt-3  first:mt-0 h-[110px]`}
                                >
                                    <div className="flex justify-between items-start ">
                                        <div className="flex gap-3 items-center">
                                            <span className="text-xl">{item.icon}</span>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{item.source}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">{item.subData}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-bold ${item.textColor}`}>{item.count}</p>
                                            <p className="text-[10px] text-gray-400 font-medium">{item.percentage} %</p>
                                        </div>
                                    </div>

                                    <div className="h-5 w-full mt-1">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                layout="vertical"
                                                data={[{ value: Number(item.percentage) || 0 }]}
                                            >
                                                <XAxis type="number" hide domain={[0, 100]} />
                                                <YAxis type="category" hide />
                                                <Bar
                                                    dataKey="value"
                                                    barSize={24}
                                                    radius={[0, 10, 10, 0]}
                                                    fill="#3B82F6"

                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-blue-700 font-bold">Area Wise Distribution</p>
                        <div className='font-bold text-gray-700  p-2 rounded-xl h-full'>
                            <AreaWiseDistribution bookingConversionRateData={bookingConversionRate} residentialData={residentialData} commercialData={commercialData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
