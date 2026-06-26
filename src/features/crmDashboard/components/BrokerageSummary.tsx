import { formatCurrency } from "@/core/utils/comman";
import type { Table0, Table1 } from "@/features/crmDashboard/models/CrmDashboardModel";

interface Props {
    summary: Table0[];
    topBroker: Table1[];
}

const BrokerageSummary: React.FC<Props> = ({ summary, topBroker }) => {
    const s = summary[0] || {};
    const top = topBroker[0];

    return (
        <div className="pt-5">
            <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-3">

                <h3 className="font-semibold">Brokerage Summary</h3>

                {/* Header */}
                <div className="flex justify-between items-center text-sm font-medium text-gray-600 border-b pb-2" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
                    <span>Total Channel Partners</span>
                    <span className="font-semibold text-gray-900">
                        {s.TotalChannelPartner || 0}
                    </span>
                </div>

                {/* Total Brokerage */}
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Brokerage Amount</span>
                    <span className="text-gray-900 font-medium">
                        {formatCurrency(s.TotalBrokerageAmount || 0)}
                    </span>
                </div>

                {/* Paid */}
                <div className="flex justify-between text-sm">
                    <span className="text-green-600">Paid Amount</span>
                    <span className="text-green-600 font-medium">
                        {formatCurrency(s.PaidBrokerageAmount || 0)}
                    </span>
                </div>

                {/* Outstanding */}
                <div className="flex justify-between text-sm">
                    <span className="text-red-500">Outstanding Amount</span>
                    <span className="text-red-500 font-medium">
                        ₹ {s.OutstandingBrokerageAmount || 0}
                    </span>
                </div>

                {/* Top Broker */}
                {top && (
                    <div className="pt-3 border-t">
                        <p className="text-xs text-gray-500 mb-1">Top Brokers</p>

                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-gray-800">
                                {top.ChannelPartnerName}
                            </span>
                            <span className="text-gray-900 font-medium">
                                {formatCurrency(top.BrokerageAmount || 0)}
                            </span>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default BrokerageSummary;