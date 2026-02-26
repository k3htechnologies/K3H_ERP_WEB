import { useState } from "react";
import Tabs from "@/ui/components/Tab/Tab";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface BookingConversionRateData {
    TotalEnquiries: number;
    TotalBookings: number;
    ConversionRatePct: number;
}

interface ResidentialData {
    UnitType: string;
    TotalEnquiries: number;
    Percentage: number;
}

interface CommercialData {
    UnitType: string;
    TotalEnquiries: number;
    Percentage: number;
}

interface Props {
    bookingConversionRateData: BookingConversionRateData[];
    residentialData: ResidentialData[];
    commercialData: CommercialData[];
}

export default function AreaWiseDistribution({ bookingConversionRateData, residentialData, commercialData }: Props) {

    const data = bookingConversionRateData?.[0] ?? {
        TotalEnquiries: 0,
        TotalBookings: 0,
        ConversionRatePct: 0
    }

    const flatData = residentialData?.map((item) => ({
        room: item.UnitType,
        count: item.Percentage,
    }))

    const commercialFlatData = commercialData?.map((item) => ({
        room: item.UnitType,
        count: item.Percentage,
    }))

    const tabList = [
        { id: "Residential", label: "Residential" },
        { id: "Commercial", label: "Commercial" },
    ];

    const [activeTab, setActiveTab] = useState<string>(tabList[0].id)

    return (
        <div>
            <Tabs
                tabs={tabList}
                defaultActive={activeTab}
                islarge
                isChips
                onTabChange={(t) => setActiveTab(t.id)}
            />
            {activeTab === "Residential" && (
                <div className="mt-6 space-y-5 p-2">
                    {flatData.map((item, index) => (
                        <div key={index} className="space-y-2">

                            <div className="flex justify-between items-center text-xs font-semibold">
                                <p className="text-gray-700">{item.room}</p>
                                <p className="text-gray-900">{item.count}%</p>
                            </div>

                            <div className="h-5 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        layout="vertical"
                                        data={[{ value: Number(item.count) || 0 }]}
                                    >
                                        <XAxis type="number" hide domain={[0, 100]} />
                                        <YAxis type="category" hide />
                                        <Bar
                                            dataKey="value"
                                            barSize={24}
                                            radius={[0, 10, 10, 0]}
                                            fill="#2563EB"
                                            background={{
                                                fill: "#E5E7EB",
                                                radius: 20,
                                            }}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                        </div>
                    ))}

                    <div className="mt-8 bg-[#0D2159] rounded-xl p-5 text-white">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-xs font-bold">Booking Conversion Rate</p>
                            <p className="text-xs font-bold">{data.ConversionRatePct}%</p>
                        </div>

                        <div className="h-5 w-full mb-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={[{ value: Number(data?.ConversionRatePct) || 0 }]}
                                >
                                    <XAxis type="number" hide domain={[0, 100]} />
                                    <YAxis type="category" hide />
                                    <Bar
                                        dataKey="value"
                                        radius={[10, 10, 10, 0]}
                                        barSize={24}
                                        fill="#3B82F6"
                                        background={{
                                            fill: "rgba(255,255,255,0.2)",
                                            radius: 20
                                        }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <p className="text-[10px] text-blue-200">
                            {data.TotalBookings} bookings from {data.TotalEnquiries} enquiries
                        </p>
                    </div>


                </div>
            )}
            {activeTab === 'Commercial' && (
                <div className="mt-6 space-y-5 p-2">
                    {commercialFlatData.map((item, index) => (
                        <div key={index} className="space-y-2">

                            <div className="flex justify-between items-center text-xs font-semibold">
                                <p className="text-gray-700">{item.room}</p>
                                <p className="text-gray-900">{item.count}%</p>
                            </div>
                            <div className="h-5 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        layout="vertical"
                                        data={[{ value: Number(item.count) || 0 }]}
                                    >
                                        <XAxis type="number" hide domain={[0, 100]} />
                                        <YAxis type="category" hide />
                                        <Bar
                                            dataKey="value"
                                            barSize={24}
                                            radius={[0, 10, 10, 0]}
                                            fill="#2563EB"
                                            background={{
                                                fill: "#E5E7EB",
                                                radius: 20,
                                            }}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                        </div>
                    ))}

                    <div className="mt-8 bg-[#0D2159] rounded-xl p-5 text-white">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-xs font-bold">Booking Conversion Rate</p>
                            <p className="text-xs font-bold">{data.ConversionRatePct}%</p>
                        </div>

                        <div className="h-5 w-full mb-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={[{ value: Number(data?.ConversionRatePct) || 0 }]}
                                >
                                    <XAxis type="number" hide domain={[0, 100]} />
                                    <YAxis type="category" hide />
                                    <Bar
                                        dataKey="value"
                                        radius={[10, 10, 10, 0]}
                                        barSize={24}
                                        fill="#3B82F6"
                                        background={{
                                            fill: "rgba(255,255,255,0.2)",
                                            radius: 20
                                        }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <p className="text-[10px] text-blue-200">
                            {data.TotalBookings} bookings from {data.TotalEnquiries} enquiries
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
