interface OverviewCardData {
    ActiveFollowUps: number;
    LostLeadsToday: number;
    Message: string;
    NewLeadsThisMonth: number;
    TodayBookingValue: number;
    TodayBookings: number;
    TodayClosed: number;
    TodayConnected: number;
    TodayNotConnected: number;
    TodayRescheduled: number;
    TodayTotalCalls: number;
    TotalEnquiries: number;
    ActiveCp: number;
    CPPercentage: number;
    Achieved: number;
    OverallConversion: number;
    IncreaseEnquiryPercentage: number;
    TodaysFollowUpDues: number;
    TotalBookingConversion: string;
    AverageBookingValue: number;
}

interface StatData {
    title: string;
    value: number;
    subValue?: string;
    subLabel?: string;
    subColor?: string;
    variant?: 'primary' | 'secondary';
}

interface Props {
    overViewCardData: OverviewCardData[];
}

export default function OverviewCards({ overViewCardData }: Props) {
    const data = overViewCardData[0] || {};

    const stats: StatData[] = [
        {
            title: 'Total Enquiries',
            value: data.TotalEnquiries || 0,
            subValue: `${data.IncreaseEnquiryPercentage}%`,
            subLabel: 'vs last month',
            subColor: 'text-green-400',
            variant: 'primary',
        },
        {
            title: 'New Enquiry',
            value: data.NewLeadsThisMonth || 0,
            subLabel: 'This month',
        },
        {
            title: 'Active Follow-Ups',
            value: data.ActiveFollowUps || 0,
            subValue: `${data.TodaysFollowUpDues}`,
            subLabel: 'Due Today',
            subColor: 'text-orange-500',
        },
        {
            title: 'Lost Enquiry',
            value: data.LostLeadsToday || 0,
            subLabel: 'High Alert',
            subColor: 'text-red-500',
        },
        {
            title: 'Total Bookings',
            value: data.TodayBookings || 0,
            subValue: `${data.TotalBookingConversion}%`,
            subLabel: 'conversion up',
            subColor: 'text-green-500',
        },
        {
            title: 'Total Booking Value',
            value: data.TodayBookingValue || 0,
            subLabel: `Avg ${data.AverageBookingValue}L`,
            subColor: 'text-blue-500',
        },
        {
            title: 'Target vs Achieved',
            value: data.Achieved,
            subLabel: 'out of 100%',
        },
        {
            title: 'CP Contribution',
            value: data.CPPercentage,
            subLabel: `${data.ActiveCp} active partners`,
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