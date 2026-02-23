import React, { useState } from "react";
import Tabs from "@/ui/components/Tab/Tab";

const AreaWiseDistribution = () => {
    const flatData = [
        { room: '1 BHK', count: "40%" },
        { room: '2 BHK', count: "12%" },
        { room: '3 BHK', count: "8%" },
        { room: '4 BHK', count: "10%" },
        { room: 'Duplex', count: "20%" },
        { room: 'Jodi', count: "20%" },
    ]

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
                            {/* Text Row */}
                            <div className="flex justify-between items-center text-xs font-semibold">
                                <p className="text-gray-700">{item.room}</p>
                                <p className="text-gray-900">{item.count}</p>
                            </div>

                            {/* Progress Bar Container */}
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                    style={{ width: item.count }}
                                />
                            </div>
                        </div>
                    ))}

                    {/* Booking Conversion Rate Footer */}
                    <div className="mt-8 bg-[#0D2159] rounded-xl p-5 text-white">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-xs font-bold">Booking Conversion Rate</p>
                            <p className="text-xs font-bold">15%</p>
                        </div>
                        <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mb-2">
                            <div className="bg-blue-400 h-full w-[15%]" />
                        </div>
                        <p className="text-[10px] text-blue-200">42 bookings from 342 enquiries</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AreaWiseDistribution;        