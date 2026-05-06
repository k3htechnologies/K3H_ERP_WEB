import { formatCurrency } from "@/core/utils/comman";
import { formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import type { Table3 } from "@/features/crmDashboard/models/CrmDashboardModel";

interface Props {
    data: Table3[];
}

const RecentTransaction: React.FC<Props> = ({ data }) => {
    return (
        <div className="pt-5">
            <div className="bg-white p-4 rounded-xl border border-gray-100" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

                <h3 className="font-semibold mb-4">Recent Transaction <span className="text-sm font-normal text-gray-500">
                    ({data.length} Records)
                </span></h3>

                <div className="relative">

                    <div className="absolute left-2 top-0 bottom-0 w-[2px] bg-blue-200"></div>

                    <div className="space-y-5 max-h-[450px] overflow-y-auto pr-2 thin-scroll">

                        {data.map((d, i) => (
                            <div key={i} className="flex justify-between items-start relative">

                                <div className="flex gap-3">

                                    <div className="w-3 h-3 bg-blue-600 rounded-full mt-1 ml-1 z-10"></div>

                                    <div>
                                        <p className="font-medium text-sm text-gray-800">
                                            {formatCurrency(d.ReceivedAmount || 0)} : {d.Flat}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            {d.ApplicantName}
                                        </p>

                                        <p className="text-xs text-gray-400">
                                            {d.PaymentMode}
                                        </p>

                                    </div>
                                </div>


                                <div className="text-right space-y-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                                        ${d.ApprovalStatus === "Approved" ? "bg-green-100 text-green-600"
                                        : d.ApprovalStatus === "Pending" ? "bg-yellow-100 text-yellow-600"
                                        : "bg-red-100 text-red-600"
                                            }`}>
                                        {d.ApprovalStatus}
                                    </span>

                                    <p className="text-xs text-gray-400">
                                        {formatDate_dd_MonthName_yy_hh_mm(d.CreatedDate)}
                                    </p>
                                </div>

                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecentTransaction;