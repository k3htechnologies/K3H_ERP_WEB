import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

const funnelData = [
    { name: "Enquiry", value: 342, subText: "Hot: 156 | Warm: 98 | Cold: 88" },
    { name: "Site Visit", value: 234, subText: "Conversion: 68.4%" },
    { name: "Negotiation", value: 178, subText: "Conversion: 52.0%" },
    { name: "Booking", value: 127, subText: "Conversion: 37.1%" },
    { name: "Closed", value: 114, subText: "Success Rate: 33.3%" },
];

const EnquiryLeadFunnel = () => {
    return (
        <div className="space-y-4 pt-5">
            <h2 className="text-lg font-semibold text-gray-800">Enquiry Lead Funnel</h2>

            <div className=" w-full bg-white rounded-xl p-4 mt-2 border border-gray-100 shadow-sm space-y-4">

                {/* Loop chalaya hai funnelData par */}
                {funnelData.map((item, index) => (
                    <div key={index} className="bg-gray-50/50 rounded-xl p-4 border-l-4 border-indigo-500 relative">
                        <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-bold text-blue-600">{item.name}</p>
                            <span className="text-sm font-bold text-gray-200">{item.value}</span>
                        </div>

                        {/* 2. RECHARTS: Parent container with fixed height */}
                        <div className="h-4 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={[item]} margin={{ left: -60 }}>
                                    <XAxis type="number" hide domain={[0, 400]} />
                                    <YAxis type="category" dataKey="name" hide />
                                    <Bar
                                        dataKey="value"
                                        fill="#3B82F6"
                                        radius={[0, 10, 10, 0]}
                                        barSize={8}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <p className="text-[10px] text-gray-400 font-medium mt-2">
                            {item.subText}
                        </p>
                    </div>
                ))}

                {/* Overall Conversion Card */}
                <div className="bg-[#0D1B3E] rounded-xl p-5 mt-4">
                    <p className="text-gray-300 text-[11px] font-medium uppercase tracking-wider">
                        Overall Conversion Rate
                    </p>
                    <div className="text-3xl text-white font-bold mt-1">
                        33.3 %
                    </div>
                    <p className="text-gray-400 text-[10px] mt-1">
                        From enquiry to closed deals
                    </p>
                </div>
            </div>
        </div>
    );
}

export default EnquiryLeadFunnel;