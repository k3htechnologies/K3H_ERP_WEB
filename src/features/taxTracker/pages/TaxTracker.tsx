import { runApiWithLoader } from "@/core/utils";
import { Loader } from "@/core/utils/loader";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useState } from "react";
import type { FilterWithPaginationTaxTrackerRequest } from "../models/TaxTrackerModel";
import usePagination from "@/core/hooks/usePagination";
import { useTaxTrackerListState } from "../context/TaxTrackerListStateContext";
import { taxTrackerService } from "../services/TaxTrackerService";
import { handleExportFile } from "@/core/utils/exportFile";
import useToast from "@/core/hooks/useToast";

export const TaxTracker: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const { canAction, canExport } = useMenuPermissions();
    const { pagination, setPagination } = usePagination(20);
    const { listState, } = useTaxTrackerListState();
    const { filters } = listState;
    const { addToast } = useToast();

    const handleAddTaxTracker = () => {
        console.log('Handle Add Tax Tracker');
    }

    const handleExportTaxTracker = async (exportType: 'Excel' | 'PDF') => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationTaxTrackerRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    GovernmentCompliance: filters.GovernmentCompliance || undefined,
                    CompanyName: filters.CompanyName ?? undefined,
                    NoticeSection: filters.NoticeSection || "",
                    FinancialYear: filters.FinancialYear || undefined,
                    NoticeStatus: filters.NoticeStatus || undefined,
                    FromNoticeDate: filters.FromNoticeDate || null,
                    ToNoticeDate: filters.ToNoticeDate || null,
                    ExportType: exportType,
                };

                const response = await taxTrackerService.apiCallPullTaxTracker(params);

                handleExportFile(response, exportType, "Tax Tracker", addToast);

                return response;
            },
            undefined,
            (error: any) =>
                addToast({ type: "error", title: error.message || "Export failed" }),
            undefined,
            "Preparing Export",
        );
    }

    const handleExportTaxTrackerExcel = () => handleExportTaxTracker("Excel");
    const handleExportTaxTrackerPdf = () => handleExportTaxTracker("PDF");

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            {/* Loader */}
            <Loader loading={isLoading} title={loadingMessage}>
                {" "}
                <div></div>{" "}
            </Loader>

            <TableActionToolbar

                isShowSearchBar={false}
                isShowFilterButton={false}
                // ADD
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddTaxTracker}
                // IMPORT
                isShowImportButton={false}
                // EXPORT
                isShowExportButton={canExport}
                onExportExcel={handleExportTaxTrackerExcel}
                onExportPdf={handleExportTaxTrackerPdf}
                exportLoading={isLoading}
            />




        </div>
    )
}

export default TaxTracker;