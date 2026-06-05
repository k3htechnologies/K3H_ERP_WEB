import React, { useState } from "react";
import type { Table0, Table4 } from "@/features/crmDashboard/models/CrmDashboardModel";
import { formatToKLCr } from "@/core/utils/comman";

interface Props {
    agreementTDSGSTCollectionData: Table4[];
    bookingRegisteredData: Table0[];
}

const AgreementTDSGSTCollectionSummary: React.FC<Props> = ({
    agreementTDSGSTCollectionData,
    bookingRegisteredData,
}) => {

    const [active, setActive] = useState<"Agreement" | "GST" | "TDS">("Agreement");

    // 👉 Table0 (summary)
    const summary = bookingRegisteredData[0] || {};

    const totalAgreement = summary.CollectionAgreementReceived ?? 0;
    const totalGST = summary.CollectionGST ?? 0;
    const totalTDS = summary.CollectionTDS ?? 0;
    const totalCollection = summary.TotalCollection ?? 0;

    // 👉 Max for chart scaling
    const maxValue =
        Math.max(
            ...agreementTDSGSTCollectionData.map((d) => d[active] || 0)
        ) || 1;

    return (
        <div className="pt-5">
            
            <h2 className="text-lg font-semibold text-gray-800">Collection Summary</h2>
            <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-4" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

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

                {/* ================= HEADER ================= */}
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                        Collection Trend
                    </p>

                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {["Agreement", "GST", "TDS"].map((t) => (
                            <button
                                key={t}
                                onClick={() => setActive(t as any)}
                                className={`px-3 py-1 text-sm rounded-md ${active === t
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-600"
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ================= BAR CHART ================= */}
                <div className="overflow-x-auto thin-scroll">
                    <div className="flex items-end h-[160px] px-2 gap-6 min-w-[600px]">

                        {agreementTDSGSTCollectionData.map((d, i) => {
                            const value = d[active] ?? 0;
                            const height = (value / maxValue) * 100;

                            return (
                                <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0 w-[100px]" >

                                    {/* BAR */}
                                    <div className={`p-3 rounded-md flex items-end justify-center text-white text-xs ${active === "Agreement"
                                        ? "bg-gradient-to-b from-blue-800 to-blue-500"
                                        : active === "GST"
                                            ? "bg-gradient-to-b from-green-600 to-green-400"
                                            : "bg-gradient-to-b from-yellow-500 to-orange-400"
                                        }`}
                                        style={{ height: `${height}%` }}>

                                        <span className="mb-1 text-[10px] whitespace-nowrap">
                                            {formatToKLCr(value ?? 0)}
                                        </span>

                                    </div>

                                    <p className="text-xs text-gray-500 whitespace-nowrap">
                                        {d.Label}
                                    </p>
                                </div>
                            );
                        })}

                    </div>
                </div>

            </div>
        </div>
    );
};

export default AgreementTDSGSTCollectionSummary;