import React from 'react';

interface StatData {
    title: string;
    value: string | number;
    subValue?: string;
    subLabel?: string;
    subColor?: string; // e.g., 'text-green-500', 'text-red-500', 'text-blue-500'
    variant?: 'primary' | 'default';
}

const OverviewCards: React.FC = () => {
    const stats: StatData[] = [
        {
            title: 'Total Enquiries',
            value: '1284',
            subValue: '+12.5%',
            subLabel: 'vs last month',
            subColor: 'text-green-400',
            variant: 'primary',
        },
        {
            title: 'New Lead',
            value: '200',
            subLabel: 'This month',
        },
        {
            title: 'Active Follow-Ups',
            value: '156',
            subValue: '5',
            subLabel: 'Due Today',
            subColor: 'text-orange-500',
        },
        {
            title: 'Lost Leads',
            value: '300',
            subLabel: 'High Alert',
            subColor: 'text-red-500',
        },
        {
            title: 'Total Bookings',
            value: '127',
            subValue: '+0.5%',
            subLabel: 'conversion up',
            subColor: 'text-green-500',
        },
        {
            title: 'Total Booking Value',
            value: '₹ 18.45 Cr',
            subLabel: 'Avg ₹14.5L',
            subColor: 'text-blue-500',
        },
        {
            title: 'Target vs Achieved',
            value: '76.5%',
            subLabel: 'out of 100%',
        },
        {
            title: 'CP Contribution',
            value: '68.2%',
            subLabel: '80 active partners',
            subColor: 'text-blue-500',
        },
    ];

    return (
        <div className="space-y-4 pt-5">
            <h2 className="text-lg font-semibold text-gray-800">Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-xl border transition-all duration-200 ${stat.variant === 'primary'
                                ? 'bg-[#0B3D7B] border-[#0B3D7B] text-white shadow-md'
                                : 'bg-white border-gray-200 text-gray-800 shadow-sm hover:shadow-md'
                            }`}
                    >
                        <div className="flex flex-col h-full justify-between space-y-2">
                            <h3 className={`text-sm font-medium ${stat.variant === 'primary' ? 'text-gray-200' : 'text-gray-500'
                                }`}>
                                {stat.title}
                            </h3>

                            <div className="space-y-1">
                                <div className="text-2xl font-bold tracking-tight">
                                    {stat.value}
                                </div>
                                {(stat.subValue || stat.subLabel) && (
                                    <div className="flex items-center text-xs gap-1">
                                        {stat.subValue && (
                                            <span className={`font-medium ${stat.variant === 'primary' ? 'text-green-300' : stat.subColor || 'text-gray-500'
                                                }`}>
                                                {stat.subValue}
                                            </span>
                                        )}
                                        {stat.subLabel && (
                                            <span className={`${stat.variant === 'primary'
                                                    ? 'text-gray-300'
                                                    : (stat.subValue ? 'text-gray-500' : (stat.subColor || 'text-gray-500'))
                                                }`}>
                                                {stat.subLabel}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OverviewCards;