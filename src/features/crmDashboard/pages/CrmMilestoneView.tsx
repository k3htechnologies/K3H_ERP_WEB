import useToast from "@/core/hooks/useToast";
import { useEffect, useState } from "react";
import type { CrmMilestoneCollectionData } from "@/features/crmDashboard/models/CrmMilestoneModel";
import { runApiWithLoader } from "@/core/utils";
import { crmMilestoneService } from "@/features/crmDashboard/services/CrmMilestoneService";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { Loader } from "@/core/utils/loader";
import * as E from "fp-ts/Either";
import { formatCurrency } from "@/core/utils/comman";
import { Button } from "@/ui/components/forms";
import { Download } from "lucide-react";
import { handleExportFile } from "@/core/utils/exportFile";
import { useLocation } from "react-router-dom";

interface NavigationFilterState {
    filterType?: "TODAY" | "WEEKLY" | "MONTHLY" | "DATEWISE" | "OVERALL";
    fromDate?: string | null;
    toDate?: string | null;
}

const CrmMilestoneView: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const { addToast } = useToast();

    const { projectId } = useProject();
    const location = useLocation();
    const navState = (location.state as NavigationFilterState) || {};

    const filterType = navState.filterType ?? "TODAY";
    const fromDate = navState.fromDate ?? null;
    const toDate = navState.toDate ?? null;
    const [milestoneData, setMilestoneCollectionData] = useState<CrmMilestoneCollectionData[]>([]);

    useEffect(() => {
        if (!projectId) return;

        if (filterType.toUpperCase() === "DATEWISE" && (!fromDate || !toDate)) return;

        loadCrmMilestoneData();
    }, [projectId, filterType, fromDate, toDate]);

    const handleExportMilestoneCollectionExcel = async () => {
        if (!projectId) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const response =
                    await crmMilestoneService.apiCallPullCrmMilestoneCollectionTrend(
                        Number(projectId),
                        filterType.toUpperCase(),
                        filterType.toUpperCase() === "DATEWISE"
                            ? fromDate
                            : "",
                        filterType.toUpperCase() === "DATEWISE"
                            ? toDate
                            : "",
                        "EXCEL"
                    );

                handleExportFile(response, "Excel", "Milestone Collection", addToast);

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message || "Export failed" });
            },
            undefined,
            "Preparing Export"
        );
    };

    const loadCrmMilestoneData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const response = await crmMilestoneService.apiCallPullCrmMilestoneCollectionTrend(
                    Number(projectId),
                    filterType.toUpperCase(),
                    filterType.toUpperCase() === "DATEWISE" ? fromDate : "",
                    filterType.toUpperCase() === "DATEWISE" ? toDate : ""
                );

                if (E.isRight(response)) {
                    setMilestoneCollectionData(response.right.Data || []);
                }
            }
        );
    };

    return (
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}><div /></Loader>

            <div className="flex items-center justify-between">
                <span className="text-xs font-medium px-2.5 py-1 rounded bg-gray-200 text-gray-700">
                    Filtered by: {filterType} {filterType === "DATEWISE" && fromDate && toDate ? `(${fromDate} - ${toDate})` : ""}
                </span>
            </div>

            <div className="pt-5">
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold"> Milestone Collection <span className="text-sm font-normal text-gray-500 ml-1">({milestoneData.length} Records) </span> </h3>
                        {milestoneData?.length > 0 && (
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleExportMilestoneCollectionExcel();
                                }}
                                color="blue"
                                variant="solid"
                                colorMode="extraLight"
                                style={{ width: '35px', height: '35px' }}
                                centerIcon={<Download className="h-5 w-5" />}>
                            </Button>
                        )}
                    </div>

                    <div className="overflow-auto thin-scroll max-h-[500px] rounded-lg">
                        <table className="w-full min-w-[750px] text-sm">
                            <thead className="sticky top-0 bg-white z-20 text-gray-500 shadow-sm">
                                <tr>
                                    <th className="px-2 py-2 text-left">Stage</th>
                                    <th className="px-2 py-2 text-left">Expected</th>
                                    <th className="px-2 py-2 text-left">Received</th>
                                    <th className="px-2 py-2 text-left">Pending</th>
                                    <th className="px-2 py-2 text-left">Progress</th>
                                </tr>
                            </thead>

                            <tbody className="w-full border-separate border-spacing-y-2">
                                <tr className="sticky top-[35px] z-10 font-semibold border-t-2 border-gray-300 font-semibold bg-gray-50">
                                    <td className="px-2 py-3 rounded-l-lg">
                                        Total
                                    </td>

                                    <td className="px-2 py-3">
                                        {formatCurrency(milestoneData.reduce((sum, item) => sum + (item.Expected || 0), 0))}
                                    </td>

                                    <td className="px-2 py-3 text-green-600">
                                        {formatCurrency(
                                            milestoneData.reduce((sum, item) => sum + (item.Received || 0), 0)
                                        )}
                                    </td>

                                    <td className="px-2 py-3 text-red-500">
                                        {formatCurrency(
                                            milestoneData.reduce((sum, item) => sum + (item.Pending || 0), 0)
                                        )}
                                    </td>

                                    <td className="px-2 py-3">
                                        {(() => {
                                            const totalExpected = milestoneData.reduce(
                                                (sum, item) => sum + (item.Expected || 0),
                                                0
                                            );

                                            const totalReceived = milestoneData.reduce(
                                                (sum, item) => sum + (item.Received || 0),
                                                0
                                            );

                                            const totalPercent = totalExpected
                                                ? (totalReceived / totalExpected) * 100
                                                : 0;

                                            return (
                                                <div className="w-full bg-gray-200 h-2 rounded">
                                                    <div
                                                        className="bg-green-500 h-2 rounded"
                                                        style={{ width: `${totalPercent}%` }}
                                                    />
                                                </div>
                                            );
                                        })()}
                                    </td>
                                </tr>

                                {milestoneData.map((d, i) => {
                                    const percent = d.Expected ? (d.Received / d.Expected) * 100 : 0;

                                    return (
                                        <tr key={i} className="border-t border-gray-100">
                                            <td className="px-2 py-2 rounded-l-lg">{d.PaymentScheduleName}</td>
                                            <td className="px-2 py-2">{formatCurrency(d.Expected || 0)}</td>
                                            <td className="px-2 py-2 text-green-600">{formatCurrency(d.Received || 0)}</td>
                                            <td className="px-2 py-2 text-red-500">{formatCurrency(d.Pending || 0)}</td>
                                            <td>
                                                <div className="w-full bg-gray-200 h-2 rounded">
                                                    <div
                                                        className="bg-green-500 h-2 rounded"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrmMilestoneView;