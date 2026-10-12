import NoDataView from '@/ui/components/NoDataView/NoDataView';
import { getStatusColor } from '@/features/gatePass/utils/Status';
import type { PurposeWiseVisitorData } from '@/features/visitorManagementDashboard/models/VisitorManagementDashboardModel';

interface Props {
    purposeWiseVisitorData: PurposeWiseVisitorData[];
}

export default function PurposeWiseVisitors({ purposeWiseVisitorData }: Props) {

    const totalVisitorCount = purposeWiseVisitorData.reduce((total, item) => total + item.VisitorCount, 0);

    return (
        <div className="space-y-3 pt-4">
            <div className="bg-white p-5 h-[370px] flex flex-col border border-gray-100 rounded-xl" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
                <h3 className="text-[14px] text-gray-500 font-medium uppercase mb-6">Purpose-Wise Visitors</h3>

                {purposeWiseVisitorData.length > 0 ? (
                    <div className="space-y-5">
                        {purposeWiseVisitorData.map((item, index) => {
                            const { text } = getStatusColor(item.Purpose);
                            const percentage = (item.VisitorCount / totalVisitorCount) * 100;

                            return (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between items-center text-xs sm:text-sm text-gray-800 font-medium">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: text }}></span>
                                            {item.Purpose}
                                        </span>
                                        <span>{item.VisitorCount}</span>
                                    </div>

                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-300"
                                            style={{ width: `${percentage}%`, backgroundColor: text }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <NoDataView />
                    </div>
                )}
            </div>
        </div>
    );
}
