import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { Table2 } from "@/features/channelPartnerDashboard/models/ChannelPartnerDashboardModel";

interface Props {
    partnerTypeDistributionData: Table2[];
}

const COLORS = ["#3b82f6", "#6366f1", "#8b5cf6"];

export default function PartnerTypeDistribution({ partnerTypeDistributionData }: Props) {

    const maxValue = Math.max(...partnerTypeDistributionData.map(d => d.TotalCount), 1);

    return (
        <div className="pt-5">
            <div className="bg-white p-4 rounded-lg space-y-4 border border-gray-100 h-[315px]  flex flex-col" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
                <h3 className="text-sm text-gray-500 font-medium ml-3 mt-1">
                    Partner Type Distribution
                </h3>

                {partnerTypeDistributionData.length === 0 ? (
                    <div className="flex flex-col justify-center items-center flex-1">
                        <NoDataView />
                    </div>
                ) : (
                    <div className="flex flex-col justify-center flex-1 gap-4 px-2">
                        {partnerTypeDistributionData.map((item, index) => {
                            
                            const percentage = (item.TotalCount / maxValue) * 100;
                            const color = COLORS[index % COLORS.length];

                            return (
                                <div key={index} className="flex flex-col gap-1">

                                    <div className="text-sm text-gray-500 truncate px-1">
                                        {item.Type}
                                    </div>

                                    <div className="flex items-center gap-2">

                                        <div
                                            className="flex-1 rounded-md overflow-hidden"
                                            style={{ height: "14px", backgroundColor: "#e5e7eb" }}
                                        >
                                            <div
                                                style={{
                                                    width: `${percentage}%`,
                                                    height: "100%",
                                                    backgroundColor: color,
                                                    borderRadius: "6px",
                                                    transition: "width 0.4s ease",
                                                }}
                                            />
                                        </div>

                                        <div
                                            className="flex-shrink-0 text-gray-700"
                                            style={{ width: "32px", fontSize: "15px", fontWeight: 500 }}
                                        >
                                            {item.TotalCount}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}