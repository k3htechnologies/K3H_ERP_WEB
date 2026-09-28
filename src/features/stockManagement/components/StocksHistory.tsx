import useToast from "@/core/hooks/useToast";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { useEffect, useMemo, useState } from "react";
import type { FilterWithPaginationStockManagementHistoryRequest, StockManagementHistoryData } from "@/features/stockManagement/models/StockManagementModel";
import { stockManagementService } from "@/features/stockManagement/services/StockManagementService";
import { runApiWithLoader } from "@/core/utils";
import * as E from 'fp-ts/Either';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { Loader } from "@/core/utils/loader";
import { useStockManagementListState } from "@/features/stockManagement/context/StockManagementListStateContext";
import { useParams } from "react-router-dom";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import usePagination from "@/core/hooks/usePagination";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { handleExportFile } from "@/core/utils/exportFile";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";

export const StockHistory: React.FC = () => {
    const [stockManagementHistoryList, setStockManagementHistoryList] = useState<StockManagementHistoryData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { addToast } = useToast();
    const { projectId } = useProject();
    const { pagination, setPagination } = usePagination(20);
    const { SubMaterialMasterId } = useParams<{ SubMaterialMasterId?: string }>();
    const { listState } = useStockManagementListState();
    const currentSubMaterialMasterId = SubMaterialMasterId ? Number(SubMaterialMasterId) : listState.SubMaterialMasterId;
    const { canExport } = useMenuPermissions();

    useEffect(() => {
        if (!projectId) return
        loadStockManagementHistoryData()
    }, [projectId])

    const loadStockManagementHistoryData = async (page: number = pagination.currentPage, sort?: SortInfo,) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationStockManagementHistoryRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    SubMaterialMasterId: currentSubMaterialMasterId,
                    SortBy: getSortByParam(sort ?? null, StockManagementHistoryColumn)
                };

                const response = await stockManagementService.apiCallPullStockManagementHistory(params);

                if (E.isRight(response)) {

                    setStockManagementHistoryList(response.right.Data);
                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });
                } else {
                    addToast({ type: 'error', title: response.left.message });
                    return response;
                }
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Stocks History'
        );
    }

    const StockManagementHistoryColumn = useMemo<TableColumn[]>(
        () => [
            {
                key: "MaterialQuantityInwardOutward",
                label: 'Material IN / OUT',
                width: "20",
                sortable: false,
                align: "left",
                render: (value, row) => {
                    if (!value) return "-";

                    const isInward = row.InwardOutwardType === "INWARD";
                    return (
                        <span className={isInward ? "text-green-600" : "text-red-600"}>
                            {isInward ? "+" : "-"}{value} {row.UomCode}
                        </span>
                    );
                }
            },
            {
                key: "PartyName",
                label: 'Sender / Receiver',
                width: "20",
                sortable: false,
                align: "left",
                render: (value) => value || "-"
            },
            {
                key: 'TransferNoteURL',
                label: 'Transfer Note',
                width: '20',
                sortable: false,
                align: 'left',
                render: (value: string, row: any) => {
                    return (
                        <div className="flex items-center justify-between w-full">
                            <MultiImageViewer
                                images={parseDocumentUrls(row.TransferNoteURL)}
                                title="Transfer Note"
                                isIcon={false}
                                triggerLabel={value === '' || 'Transfer Note'}
                            />

                        </div>
                    );
                }
            },
            {
                key: "Reason",
                label: 'Remark',
                width: "20",
                sortable: false,
                fixed: "left",
                align: "left",
                render: (value) => (
                    <FieldInfoTooltip value={value} />
                )
            },
            {
                key: "CreatedBy",
                label: 'Created By',
                width: "20",
                sortable: false,
                align: "left",
                render: (value) => value || "-"
            },
            {
                key: "CreatedDate",
                label: 'Created Date',
                width: "20",
                sortable: false,
                align: "left",
                render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : "-"
            },
        ], [])

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadStockManagementHistoryData(page);
    };

    const StockManagementHistoryPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange,
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize],
    );

    const StockManagementHistoryForTable = useMemo(() => stockManagementHistoryList, [stockManagementHistoryList]);

    const handleExportStockManagementHistory = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationStockManagementHistoryRequest = {
                    PageNumber: 1,
                    PageSize: 1000,
                    ProjectId: Number(projectId),
                    SubMaterialMasterId: currentSubMaterialMasterId,
                    ExportType: exportType,
                };

                const response = await stockManagementService.apiCallPullStockManagementHistory(params);

                handleExportFile(response, exportType, "Stock Management History", addToast);

                return response;
            },
            undefined,
            (error: any) =>
                addToast({ type: "error", title: error.message || "Export failed" }),
            undefined,
            "Preparing Export",
        );
    }

    const handleExportStockManagementHistoryExcel = () => handleExportStockManagementHistory("Excel");
    const handleExportStockManagementHistoryPdf = () => handleExportStockManagementHistory("PDF")

    return (
        <div >
            <Loader loading={isLoading} title={loadingMessage}> {" "} <div></div>{" "}</Loader>

            <TableActionToolbar
                isShowSearchBar={false}
                isShowExportButton={canExport}
                onExportExcel={handleExportStockManagementHistoryExcel}
                onExportPdf={handleExportStockManagementHistoryPdf}
                exportLoading={isLoading}
            />

            <DataTable
                data={StockManagementHistoryForTable}
                columns={StockManagementHistoryColumn}
                pagination={StockManagementHistoryPaginationInfo}
                emptyMessage="No Stock History Data found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
            />
        </div>
    )
}
export default StockHistory;