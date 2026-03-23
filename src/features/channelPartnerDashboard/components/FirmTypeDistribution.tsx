
import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { Table1 } from '@/features/channelPartnerDashboard/models/ChannelPartnerDashboardModel';
import NoDataView from '@/ui/components/NoDataView/NoDataView';

interface Props {
    firmTypeData: Table1[];
}

const COLORS = ["#2F6FED", "#1B2F6B", "#7A97A5"];

const FirmTypeDistribution: React.FC<Props> = ({ firmTypeData }) => {
    const total = firmTypeData?.reduce((sum, item) => sum + (item.TotalCount || 0), 0);

    return (
        <div className="space-y-8 pt-5">

            <div className="bg-white p-4 rounded-lg shadow-sm space-y-4 flex flex-col sm:flex-row items-center justify-between">
                <div className="relative h-[200px] w-full sm:h-[275px] sm:max-w-[300px] lg:h-[270px] lg:max-w-[400px]">
                    <h3 className="text-sm text-gray-500 font-medium ml-5 mt-1">
                        Firm Type Distribution
                    </h3>

                    {firmTypeData.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-[270px]">
                            <NoDataView />
                        </div>
                    ) : (
                        <>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={firmTypeData}
                                        innerRadius="50%"
                                        outerRadius="70%"
                                        paddingAngle={3}
                                        dataKey="TotalCount"
                                        cornerRadius={10}
                                    >
                                        {firmTypeData.map((_, i) => (
                                            <Cell
                                                key={i}
                                                fill={COLORS[i % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer></>
                    )}

                    {/* CENTER TOTAL */}
                    <div className="absolute sm:pt-18 inset-0 flex items-center justify-center">
                        <p className="text-lg font-bold text-blue-600">{total > 0 ? total : ""}</p>
                    </div>
                </div>

                {/* RIGHT LEGEND */}
                <div className="space-y-4">
                    {firmTypeData.map((t, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div
                                className="w-4 h-4 min-w-[16px] min-h-[16px] rounded-full"
                                style={{ backgroundColor: COLORS[i % COLORS.length] }}
                            />
                            <p className="font-semibold text-lg">{t.TotalCount ?? 0}</p>
                            <p className="text-sm sm:text-sm md:text- text-gray-500">{t.FirmsType ?? ''}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default FirmTypeDistribution;