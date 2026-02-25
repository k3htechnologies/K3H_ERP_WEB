interface ChannelPartnerData {
    ChannelPartnerName: string;
    TotalBookings: number;
    BookingValueInCr: number;
    ConversionPercent: number;
    Status: string;
    InActiveChannelPartnerDays: number;
}

interface channelPartnerIBMobmData {
    totalIbm: number;
    totalObm: number;
    totalInboundMeeting: number;
    totalOutboundMeeting: number;
    inboundConversionRate: number;
    outboundConversionRate: number;
}

interface Props {
    channelPartnerData: ChannelPartnerData[];
    channelPartnerIBMOBMdata: channelPartnerIBMobmData[];
}


export default function ChannelPartner({ channelPartnerData, channelPartnerIBMOBMdata }: Props) {

    const inactivePartnerCount = channelPartnerData.filter(item => item.Status === "Inactive").length;


    const inactivePartnerAlert = {
        title: 'Inactive Channel Partners Alert',
        description: `No activity in ${channelPartnerData[0]?.InActiveChannelPartnerDays}+ days`,
        bgColor: 'bg-red-50',
        textColor: 'text-red-500'
    };

    return (
        <div className="space-y-4 pt-5">
            <h1 className="text-lg font-semibold text-gray-800">Channel Partner</h1>
            <div className='bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-3'>
                {channelPartnerIBMOBMdata.length > 0 && channelPartnerIBMOBMdata.map((item, index) => {
                    return (
                        <div key={index} className="grid grid-cols-2 gap-3">
                            <div className=" border border-blue-200 bg-blue-100 rounded-xl p-4">
                                <p className="text-sm text-gray-400 font-semibold">IBM</p>
                                <p className="text-lg font-bold text-blue-400">{item.totalIbm}</p>
                                <p className="text-sm text-blue-400 font-semibold">Inbound Meetings</p>
                            </div>
                            <div key={index} className=" border border-purple-200 bg-purple-100 rounded-xl p-4">
                                <p className="text-sm text-gray-400 font-semibold">OBM</p>
                                <p className="text-lg font-bold text-purple-400">{item.totalObm}</p>
                                <p className="text-sm text-purple-400 font-semibold">Inbound Meetings</p>
                            </div>
                        </div>
                    )
                })}

                {channelPartnerData.map((item) => (
                    <div key={item.ChannelPartnerName} className="border border-gray-200 rounded-xl p-4">

                        <div className="flex item-center justify-between">
                            <p className="text-md text-gray-800 font-semibold">{item.ChannelPartnerName}</p>
                            <p className="text-sm text-green-300 font-semibold ">{item.BookingValueInCr} Cr </p>
                        </div>

                        <div className="flex item-center justify-between">
                            <p className="text-xs font-bold text-gray-300">{item.BookingValueInCr} bookings</p>
                            <p className="text-sm text-gray-400 font-semibold">{item.ConversionPercent}%  conv</p>
                        </div>
                    </div>
                ))}

                <div className="border border-red-200 bg-red-100 rounded-xl p-4">
                    <p className="text-sm text-gray-400 font-semibold">{inactivePartnerAlert.title}</p>
                    <p className="text-lg font-bold text-red-400">{inactivePartnerCount}</p>
                    <p className="text-sm text-red-400 font-semibold">{inactivePartnerAlert.description}</p>
                </div>
            </div>
        </div>
    )
}
