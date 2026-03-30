import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { Table5 } from "@/features/channelPartnerDashboard/models/ChannelPartnerDashboardModel";

interface Props {
    MissingDetailsData: Table5[];
}

export default function MissingDetails({ MissingDetailsData }: Props) {

    //#region
    return (
        <div className="pt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Missing Details
            </h2>

            <div className="bg-white rounded-lg p-4 space-y-4 border border-gray-100  h-[300px] thin-scroll flex flex-col" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
                {MissingDetailsData.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full">
                        <NoDataView />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto thin-scroll space-y-3 pr-1">
                        {MissingDetailsData.map((item, index) => (
                            <div key={index} className="flex items-stretch bg-red-50 rounded-lg overflow-hidden">

                                <div className="w-2 bg-red-500 flex-shrink-0"></div>
                                <div className="flex justify-between items-center w-full p-4">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{item.Name ?? ''}</p>
                                        <p className="text-xs text-gray-600 mt-1">{item.SystemGeneratedCode ?? ''}</p>
                                        <p className="text-xs text-gray-600 mt-1">{item.MissingFields ?? ''}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}