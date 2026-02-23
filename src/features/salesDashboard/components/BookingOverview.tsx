import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

import AreaWiseDistribution from './AreaWiseDistribution';

const salesData = [
    { month: 'JANUARY', value: 4 },
    { month: 'FEBRUARY', value: 6 },
    { month: 'MARCH', value: 12 },
    { month: 'APRIL', value: 9 },
    { month: 'MAY', value: 18 },
    { month: 'JUNE', value: 7 },
    { month: 'JULY', value: 14 },
    { month: 'AUGUST', value: 24 },
    { month: 'SEPTEMBER', value: 11 },
    { month: 'OCTOBER', value: 16 },
    { month: 'NOVEMBER', value: 10 },
    { month: 'DECEMBER', value: 5 },
];

const sourceWiseDistributionData = [
    {
        icon: '🌐', // Aap yahan Lucide-react ya FontAwesome icons use kar sakte hain
        source: 'Website',
        subData: 'Organic & Paid',
        count: '134',
        percentage: '39.2%',
        color: 'bg-blue-50', // Tailwind class for background color
        borderColor: 'border-blue-200',
        textColor: 'text-blue-600'
    },
    {
        icon: '📱',
        source: 'Advertisement',
        subData: 'Facebook, Instagram, etc',
        count: '98',
        percentage: '28.7%',
        color: 'bg-pink-50',
        borderColor: 'border-pink-200',
        textColor: 'text-pink-600'
    },
    {
        icon: '👥',
        source: 'Referrals',
        subData: 'Employee Referrals',
        count: '56',
        percentage: '16.4%',
        color: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-600'
    },
    {
        icon: '🏢',
        source: 'Property Search Portal',
        subData: 'Direct Visit',
        count: '54',
        percentage: '15.7%',
        color: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-600'
    }
];

const BookingOverview: React.FC = () => {
    return (
        <div className="space-y-4 pt-5">
            <h2 className="text-lg font-bold text-gray-800">Booking Overview</h2>

            {/* Main White Card containing everything */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-8">

                {/* Top 3 Stats Row */}
                <div className="flex gap-4 items-stretch">
                    {/* Direct Booking */}
                    <div className="flex-1 bg-[#F5F3FF] border border-indigo-100 rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-indigo-700">Direct Booking</p>
                                <p className="text-[10px] font-bold text-indigo-400 mt-1">66.7%</p>
                            </div>
                            <span className="text-2xl font-black text-indigo-900">28</span>
                        </div>
                    </div>

                    {/* CP Booking */}
                    <div className="flex-1 bg-[#EFF6FF] border border-blue-100 rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-blue-700 leading-tight">Channel Partner Booking</p>
                                <p className="text-[10px] font-bold text-blue-400 mt-1">33.3%</p>
                            </div>
                            <span className="text-2xl font-black text-blue-900">14</span>
                        </div>
                    </div>

                    {/* Upcoming Registration */}
                    <div className="flex-1 bg-[#FFFBEB] border border-yellow-100 rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-yellow-700">Upcoming Registration</p>
                                <div className="h-4"></div>
                            </div>
                            <span className="text-2xl font-black text-yellow-600">22</span>
                        </div>
                    </div>
                </div>

                {/* Graph Section Inside the same White Card */}
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
                                    axisLine={true}
                                    tickLine={true}
                                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                    ticks={[0, 5, 10, 15, 20, 25]}
                                    unit=" CR"
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
                                            fill={entry.month === 'AUGUST' ? '#2563EB' : '#3B82F6'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className='grid grid-cols-2 gap-5'>
                    {/* Column 1: Source Wise Distribution */}
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
                                            <p className="text-[10px] text-gray-400 font-medium">{item.percentage}</p>
                                        </div>
                                    </div>

                                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
                                        <div
                                            className={`h-full rounded-full ${item.textColor.replace('text', 'bg')}`}
                                            style={{ width: item.percentage }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Area Wise Distribution */}
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-blue-700 font-bold">Area Wise Distribution</p>
                        <div className='font-bold text-gray-700  p-2 rounded-xl h-full'>
                            <AreaWiseDistribution />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingOverview;