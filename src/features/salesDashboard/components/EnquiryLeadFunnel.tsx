import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface EnquiryLeadFunnelData {
    BookingConversion: number;
    BookingStage: number;
    ClosedStage: number;
    Negotiation: number;
    NegotiationConversion: number;
    OverallConversion: number;
    SiteVisit: number;
    SiteVisitConversion: number;
    TotalEnquiry: number;
    EnquiryConversionRate: number;
}

interface EnquiryHotWarmColdData {
    ColdLeads: number;
    WarmLeads: number;
    HotLeads: number;
}

interface Props {
    enquiryLeadFunnelData: EnquiryLeadFunnelData[];
    enquiryHotWarmColdData: EnquiryHotWarmColdData[];
}


export default function EnquiryLeadFunnel({ enquiryLeadFunnelData, enquiryHotWarmColdData }: Props) {

    const data = enquiryLeadFunnelData?.[0];
    const hotWarmColdData = enquiryHotWarmColdData?.[0];
    const funnelData = data
        ? [
            {
                name: "Enquiry",
                value: data.TotalEnquiry,
                type: "enquiry"

            },
            {
                name: "Site Visit",
                value: data.SiteVisit,
                subText: `Conversion: ${data.SiteVisitConversion ?? 0}%`,
            },
            {
                name: "Negotiation",
                value: data.Negotiation,
                subText: `Conversion: ${data.NegotiationConversion ?? 0}%`,
            },
            {
                name: "Booking",
                value: data.BookingStage,
                subText: `Conversion: ${data.BookingConversion ?? 0}%`,
            },
            {
                name: "Closed",
                value: data.ClosedStage,
                subText: `Success Rate: ${data.ClosedStage ?? 0}%`,
            },
        ]
        : [];

    return (
        <div className="space-y-4 pt-5">
            <h2 className="text-lg font-semibold text-gray-800">Enquiry Lead Funnel</h2>

            <div className=" w-full bg-white rounded-xl p-4 mt-2 border border-gray-100 shadow-sm space-y-4">

                {funnelData.map((item, index) => (
                    <div key={index} className="bg-gray-50/50 rounded-xl p-4 border-l-4 border-indigo-500 relative">
                        <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-bold text-blue-600">{item.name}</p>
                        </div>

                        <div className="h-4 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={[item]} margin={{ left: -60 }}>
                                    <XAxis type="number" hide domain={[0, data?.TotalEnquiry || 0]} />
                                    <YAxis type="category" dataKey="name" hide />
                                    <Bar
                                        dataKey="value"
                                        fill={item.value && item.value > 0 ? "#3B82F6" : "#c4c8d0ff"}
                                        radius={[0, 10, 10, 0]}
                                        barSize={10}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {item.name === "Enquiry" ? (
                            <p className="text-[11px] font-medium mt-2 space-x-1">
                                <span className="text-red-500 font-semibold">
                                    Hot: {hotWarmColdData?.HotLeads ?? 0}
                                </span>
                                <span className="text-gray-400">|</span>
                                <span className="text-yellow-500 font-semibold">
                                    Warm: {hotWarmColdData?.WarmLeads ?? 0}
                                </span>
                                <span className="text-gray-400">|</span>
                                <span className="text-blue-500 font-semibold">
                                    Cold: {hotWarmColdData?.ColdLeads ?? 0}
                                </span>
                            </p>
                        ) : (
                            <p className="text-[10px] text-gray-400 font-medium mt-2">
                                {item.subText}
                            </p>
                        )}
                    </div>
                ))}

                {/* Overall Conversion Card */}
                <div className="bg-[#0D1B3E] rounded-xl p-5 mt-4">
                    <p className="text-gray-300 text-[11px] font-medium uppercase tracking-wider">
                        Overall Conversion Rate
                    </p>
                    <div className="text-3xl text-white font-bold mt-1">
                        {data?.EnquiryConversionRate}%
                    </div>
                    <p className="text-gray-400 text-[10px] mt-1">
                        From enquiry to closed deals
                    </p>
                </div>
            </div>
        </div>
    );
}
