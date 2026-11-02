import type { Table6 } from "@/features/vendorManagementDashboard/models/VendorManagementDashboardModel";
import { AlertTriangle } from "lucide-react";
import NoDataView from "@/ui/components/NoDataView/NoDataView";

interface Props {
    alertData?: Table6[];
}

const Alerts: React.FC<Props> = ({ alertData }) => {
    return (
        <div className="space-y-3 pt-5">

            <div
                className="bg-white rounded-xl p-4 h-[345px] flex flex-col border border-gray-100"
                style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
            >
                <h2 className="text-sm font-semibold text-slate-500 mb-4 mt-2">
                    Alerts
                </h2>
                <div className="flex-1 overflow-y-auto thin-scroll space-y-3 pr-1">
                    {alertData?.length === 0 && (
                        <p className="text-sm text-gray-400 text-center mt-16">
                            <NoDataView />
                        </p>
                    )}
                    {alertData?.map((alert, i) => (
                        <div
                            key={i}
                            className="relative bg-orange-50 rounded-lg p-3 border border-orange-100"
                        >

                            {/* Left Accent */}
                            <span className="absolute left-0 top-0 h-full w-1 bg-orange-400 rounded-l-lg" />

                            <div className="flex gap-3">

                                <div className="pt-1 shrink-0">
                                    <AlertTriangle size={18} className="text-orange-500" />
                                </div>

                                <div className="min-w-0 flex-1">

                                    <p className="text-sm font-semibold text-orange-800 break-all whitespace-normal">
                                        {alert.AlertType || "-"}
                                    </p>

                                    <p className="text-sm text-orange-700 mt-1 wrap-break-words whitespace-normal">
                                        {alert.Message || "-"}
                                    </p>

                                </div>

                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Alerts;