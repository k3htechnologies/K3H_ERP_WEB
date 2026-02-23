
const ChannelPartner = () => {

    const channelPartnerStats = [
        {
            id: 1,
            title: 'IBM',
            count: 142,
            subTitle: 'Inbound Meetings',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            id: 2,
            title: 'OBM',
            count: 98,
            subTitle: 'Outbound Meetings',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600'
        }
    ];


    const partnerListData = [
        {
            id: 'p1',
            name: 'Prachin Bari',
            bookings: '18 bookings',
            value: '₹2.6Cr',
            conversion: '42.3% conv',
            statusColor: 'text-green-500'
        },
        {
            id: 'p2',
            name: 'Prachin Bari',
            bookings: '12 bookings',
            value: '₹1.3Cr',
            conversion: '34.6% conv',
            statusColor: 'text-green-500'
        },
        {
            id: 'p3',
            name: 'Prachin Bari',
            bookings: '9 bookings',
            value: '₹2.6Cr',
            conversion: '31.8% conv',
            statusColor: 'text-green-500'
        },
        {
            id: 'p4',
            name: 'Prachin Bari',
            bookings: '7 bookings',
            value: '₹1.0Cr',
            conversion: '28.5% conv',
            statusColor: 'text-green-500'
        }
    ];

    const inactivePartnerAlert = {
        title: 'Inactive Channel Partners Alert',
        count: 12,
        description: 'No activity in 30+ days',
        bgColor: 'bg-red-50',
        textColor: 'text-red-500'
    };

    return (
        <div className="space-y-4 pt-5">
            <h1 className="text-lg font-semibold text-gray-800">Channel Partner</h1>
            <div className='bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-3'>
                <div className="grid grid-cols-2 gap-3">
                    {/*Card-1  */}
                    <div className=" border border-blue-200 bg-blue-100 rounded-xl p-4">
                        <p className="text-sm text-gray-400 font-semibold">IBM</p>
                        <p className="text-lg font-bold text-blue-400">142</p>
                        <p className="text-sm text-blue-400 font-semibold">Inbound Meetings</p>
                    </div>
                    {/* Card-2 */}
                    <div className=" border border-purple-200 bg-purple-100 rounded-xl p-4">
                        <p className="text-sm text-gray-400 font-semibold">OBM</p>
                        <p>142</p>
                        <p>Inbound Meetings</p>
                    </div>
                </div>
                {/* Card-1 */}
                {partnerListData.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-xl p-4">

                        <div className="flex item-center justify-between">
                            <p className="text-md text-gray-800 font-semibold">{item.name}</p>
                            <p className="text-sm text-green-300 font-semibold ">{item.value}</p>
                        </div>

                        <div className="flex item-center justify-between">
                            <p className="text-xs font-bold text-gray-300">{item.bookings}</p>
                            <p className="text-sm text-gray-400 font-semibold">{item.conversion}</p>
                        </div>
                    </div>
                ))}

                <div className="border border-red-200 bg-red-100 rounded-xl p-4">
                    <p className="text-sm text-gray-400 font-semibold">{inactivePartnerAlert.title}</p>
                    <p className="text-lg font-bold text-red-400">{inactivePartnerAlert.count}</p>
                    <p className="text-sm text-red-400 font-semibold">{inactivePartnerAlert.description}</p>
                </div>
            </div>
        </div>
    )
}

export default ChannelPartner