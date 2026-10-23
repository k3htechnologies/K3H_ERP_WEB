import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import type { CrmMilestoneSummary } from "@/features/crmDashboard/models/CrmMilestoneModel";
import { runApiWithLoader } from "@/core/utils";
import { crmMilestoneService } from "@/features/crmDashboard/services/CrmMilestoneService";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { Loader } from "@/core/utils/loader";
import * as E from "fp-ts/Either";
import { formatToKLCr } from "@/core/utils/comman";

interface NavigationFilterState {
    filterType?: "TODAY" | "WEEKLY" | "MONTHLY" | "DATEWISE" | "OVERALL";
    fromDate?: string | null;
    toDate?: string | null;
}

const CrmCollectionSummaryView: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const { projectId } = useProject();
    const location = useLocation();

    // Read inherited filter from router state, with safe fallbacks
    const navState = (location.state as NavigationFilterState) || {};
    const filterType = navState.filterType ?? "TODAY";
    const fromDate = navState.fromDate ?? null;
    const toDate = navState.toDate ?? null;

    const [active, setActive] = useState<"Agreement" | "GST" | "TDS">("Agreement");
    const [summaryData, setSummaryData] = useState<CrmMilestoneSummary[]>([]);

    const totalAgreement = summaryData.reduce(
        (sum, item) => sum + Number(item.Agreement || 0),
        0
    );

    const totalGST = summaryData.reduce(
        (sum, item) => sum + Number(item.GST || 0),
        0
    );

    const totalTDS = summaryData.reduce(
        (sum, item) => sum + Number(item.TDS || 0),
        0
    );

    const totalCollection = totalAgreement + totalGST + totalTDS;

    const maxValue =
        Math.max(
            ...summaryData.map((d) => d[active] || 0)
        ) || 1;

    useEffect(() => {
        if (!projectId) return;

        if (filterType.toUpperCase() === "DATEWISE" && (!fromDate || !toDate)) return;

        loadCrmSummaryData();
    }, [projectId, filterType, fromDate, toDate]);

    const loadCrmSummaryData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const response = await crmMilestoneService.apiCallPullCrmMilestoneCollectionSummary(
                    Number(projectId),
                    filterType.toUpperCase(),
                    filterType.toUpperCase() === "DATEWISE" ? fromDate || "" : "",
                    filterType.toUpperCase() === "DATEWISE" ? toDate || "" : ""
                );

                if (E.isRight(response)) {
                    setSummaryData(response.right.Data || []);
                }
            }
        );
    };

    return (
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}><div /></Loader>

            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Collection Summary</h2>
                <span className="text-xs font-medium px-2.5 py-1 rounded bg-gray-200 text-gray-700">
                    Filtered by: {filterType} {filterType === "DATEWISE" && fromDate && toDate ? `(${fromDate} - ${toDate})` : ""}
                </span>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-4 mt-4" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
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

                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
                    <p className="text-sm text-gray-600">Collection Trend</p>

                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {(["Agreement", "GST", "TDS"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setActive(t)}
                                className={`px-3 py-1 text-sm rounded-md ${active === t ? "bg-blue-600 text-white" : "text-gray-600"}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto thin-scroll">
                    <div className="flex items-end h-[160px] px-2 gap-6 min-w-[600px]">
                        {summaryData.map((d, i) => {
                            const value = d[active] ?? 0;
                            const height = (value / maxValue) * 100;

                            return (
                                <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0 w-[100px]">
                                    <div
                                        className={`p-3 rounded-md flex items-end justify-center text-white text-xs ${active === "Agreement"
                                                ? "bg-gradient-to-b from-blue-800 to-blue-500"
                                                : active === "GST"
                                                    ? "bg-gradient-to-b from-green-600 to-green-400"
                                                    : "bg-gradient-to-b from-yellow-500 to-orange-400"
                                            }`}
                                        style={{ height: `${height}%` }}
                                    >
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

export default CrmCollectionSummaryView;