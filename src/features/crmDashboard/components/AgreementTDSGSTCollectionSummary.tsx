import React from "react";
import type { Table0 } from "@/features/crmDashboard/models/CrmDashboardModel";
import { formatToKLCr } from "@/core/utils/comman";
import { useNavigate } from "react-router-dom";

interface Props {
    bookingRegisteredData: Table0[];
    filterType?: string;
    fromDate?: string | null;
    toDate?: string | null;
}

const AgreementTDSGSTCollectionSummary: React.FC<Props> = ({
    bookingRegisteredData,
    filterType,
    fromDate,
    toDate,
}) => {

    const navigate = useNavigate();

    // 👉 Table0 (summary)
    const summary = bookingRegisteredData[0] || {};

    const totalAgreement = summary.CollectionAgreementReceived ?? 0;
    const totalGST = summary.CollectionGST ?? 0;
    const totalTDS = summary.CollectionTDS ?? 0;
    const totalCollection = summary.TotalCollection ?? 0;

    return (
        <div className="pt-5">

            <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-4" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
                <div className="flex justify-between">
                    <h2 className="text-sm font-medium text-gray-500">Collection Summary</h2>
                    <div
                        className="text-blue-600 hover:underline cursor-pointer"
                        onClick={() =>
                            navigate("/crmDashboard/collectionSummary/view", {
                                state: {
                                    filterType,
                                    fromDate,
                                    toDate,
                                },
                            })
                        }
                    >
                        View Collection Report →
                    </div>
                </div>

                {/* ================= TOP CARDS ================= */}
                <div className="grid grid-cols-4 gap-3">

                    <div className="bg-[#0F2A44] text-white p-5 rounded-lg">
                        <p className="text-sm">Total Collection</p>
                        <p className="font-semibold">{formatToKLCr(totalCollection)}</p>
                    </div>

                    <div className="bg-gray-100 p-5 rounded-lg">
                        <p className="text-sm text-gray-600">Agreement</p>
                        <p className="font-semibold">{formatToKLCr(totalAgreement)}</p>
                    </div>

                    <div className="bg-gray-100 p-5 rounded-lg">
                        <p className="text-sm text-gray-600">GST</p>
                        <p className="font-semibold">{formatToKLCr(totalGST)}</p>
                    </div>

                    <div className="bg-gray-100 p-5 rounded-lg">
                        <p className="text-sm text-gray-600">TDS</p>
                        <p className="font-semibold">{formatToKLCr(totalTDS)}</p>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default AgreementTDSGSTCollectionSummary;