import NoDataView from '@/ui/components/NoDataView/NoDataView';
import { getAlertColor } from '@/features/visitorManagementDashboard/utils/Status';
import type { VisitorAlertData } from '@/features/visitorManagementDashboard/models/VisitorManagementDashboardModel';

interface Props {
    visitorAlertData: VisitorAlertData[];
}

export default function VisitorAlerts({ visitorAlertData }: Props) {
    return (
        <div className="space-y-3 pt-4">
            <div
                className="bg-white rounded-xl p-5 h-[370px] flex flex-col border border-gray-100"
                style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
            >
                <h3 className="text-[14px] text-gray-500 font-medium uppercase mb-4">Alerts</h3>

                <div className="flex-1 overflow-y-auto thin-scroll space-y-3 pr-1">
                    {visitorAlertData.length === 0 && (
                        <div className="text-sm text-gray-400 text-center mt-16">
                            <NoDataView />
                        </div>
                    )}

                    {visitorAlertData.map((alert, i) => {
                        const { bg, border, accent } = getAlertColor(alert.AlertType);

                        return (
                            <div
                                key={i}
                                className="relative rounded-lg p-3 pl-5 border"
                                style={{ backgroundColor: bg, borderColor: border }}
                            >
                                <span className="absolute left-0 top-0 h-full w-1.5 rounded-l-lg" style={{ backgroundColor: accent }} />

                                <p className="text-sm font-semibold text-orange-800 break-words whitespace-normal">
                                    {alert.AlertType || "-"}
                                </p>

                                <p className="text-xs text-orange-700 mt-1 break-words whitespace-normal">
                                    {alert.Message || "-"}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
