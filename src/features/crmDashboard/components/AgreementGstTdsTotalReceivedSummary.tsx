import { useState } from "react";
import type { Table0 } from "../models/CrmDashboardModel";
import { formatCurrency } from "@/core/utils/comman";

interface Props {
    bookingRegisteredData: Table0[];
}

const AgreementGstTdsTotalReceivedSummary: React.FC<Props> = ({
    bookingRegisteredData,
}) => {

    const [active, setActive] = useState<"Agreement" | "GST" | "TDS">("Agreement");

    const summary = bookingRegisteredData?.[0] || {};

    const dataMap = {
        Agreement: {
            total: summary.TotalAgreementAmount ?? 0,
            received: summary.CollectionAgreementReceived ?? 0,
        },
        GST: {
            total: summary.TotalAgreementGSTAmount ?? 0,   // fallback if not available
            received: summary.CollectionGST ?? 0,
        },
        TDS: {
            total: summary.TotalAgreementTDSAmount ?? 0,   // fallback
            received: summary.CollectionTDS ?? 0,
        },
    };

    const current = dataMap[active];

    const pending = Math.max(current.total - current.received, 0);

    const percent =
        current.total > 0
            ? Math.min((current.received / current.total) * 100, 100)
            : 0;

    return (
        <div className="pt-5">
            <div className="border border-gray-100 rounded-lg p-4 bg-white" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

                <h3 className="font-semibold mb-4">Account Summary</h3>
                <div className="flex gap-2 mb-3">
                    {(["Agreement", "GST", "TDS"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setActive(t)}
                            className={`px-3 py-1 text-xs rounded-md transition ${active === t
                                    ? "bg-blue-600 text-white shadow"
                                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* ================= TOTAL ================= */}
                <p className="text-sm text-gray-600 mb-2">
                    Total Amount : <span className="font-semibold">{formatCurrency(current.total)}</span>
                </p>

                {/* ================= PROGRESS BAR ================= */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                    <div
                        className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                    />
                </div>

                {/* ================= FOOTER ================= */}
                <div className="flex justify-between text-xs font-medium">
                    <p className="text-green-600">
                        Total Received : {formatCurrency(current.received)}
                    </p>
                    <p className="text-red-500">
                        Total Pending : {formatCurrency(pending)}
                    </p>
                </div>

            </div>
        </div>
    );
};

export default AgreementGstTdsTotalReceivedSummary;