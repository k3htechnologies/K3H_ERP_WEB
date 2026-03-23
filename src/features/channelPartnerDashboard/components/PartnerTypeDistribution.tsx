import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar, LabelList, Cell } from "recharts";
import type { Table2 } from "@/features/channelPartnerDashboard/models/ChannelPartnerDashboardModel";

interface Props {
    partnerTypeDistributionData: Table2[];
}

const COLORS = ["#3b82f6", "#6366f1", "#8b5cf6"];

export default function PartnerTypeDistribution({ partnerTypeDistributionData}: Props) {
    return (
        <div className="pt-5">
            <div className="bg-white p-4 rounded-lg shadow-sm space-y-4 h-[315px]">
                <h3 className="text-sm text-gray-500 font-medium ml-5 mt-1">
                    Partner Type Distribution
                </h3>

                {partnerTypeDistributionData.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full">
                        <NoDataView />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={partnerTypeDistributionData}
                            layout="vertical"
                            margin={{ top: 16, right: 40, bottom: 16, left: 8 }}
                        >
                            <XAxis type="number" hide domain={[0, 'dataMax']} />

                            <YAxis
                                type="category"
                                dataKey="Type"
                                axisLine={false}
                                tickLine={false}
                                width={120}
                                tick={{ fontSize: 14, fill: "#6b7280" }}
                            />
                            <Bar
                                dataKey="TotalCount"
                                barSize={12}
                                radius={[6, 6, 6, 6]}
                                background={{ fill: "#e5e7eb", radius: 6 }}
                            >
                                {partnerTypeDistributionData.map((_, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                                <LabelList
                                    dataKey="TotalCount"
                                    position="right"
                                    fill="#374151"
                                    fontSize={13}
                                    fontWeight={500}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}