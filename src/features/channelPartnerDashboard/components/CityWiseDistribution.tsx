import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { Table3 } from "@/features/channelPartnerDashboard/models/ChannelPartnerDashboardModel";

interface Props {
    cityWiseDistributionData: Table3[];
}

export default function CityWiseDistribution({ cityWiseDistributionData }: Props) {
    const maxValue = Math.max(...cityWiseDistributionData.map(item => item.TotalChannelPartner || 0), 1);

    return (
        <div className="pt-5">
            <div className="bg-white rounded-lg p-6 h-[315px] shadow-sm space-y-4 thin-scroll flex flex-col" >
                <h3 className="text-sm text-gray-500 font-medium mb-4 ml-1">
                    City Wise Distribution
                </h3>

                {cityWiseDistributionData.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full">
                        <NoDataView />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto thin-scroll space-y-3 pr-1">
                        {cityWiseDistributionData.map((item, index) => {
                            const widthPercent = ((item.TotalChannelPartner || 0) / maxValue) * 100;
                            return (
                                <div key={index} className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 w-24 shrink-0">
                                        {item.Name ?? ''}
                                    </span>

                                    <div className="relative flex-1 h-8 rounded-lg  overflow-hidden">
                                        <div
                                            className="h-full rounded-lg bg-[#bfdbfe] flex items-center justify-end pr-3 transition-all duration-500"
                                            style={{ width: `${widthPercent}%` }}
                                        >
                                            <span className="text-sm font-bold text-[#1d4ed8] whitespace-nowrap">
                                                {item.TotalChannelPartner ?? 0}
                                            </span>
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