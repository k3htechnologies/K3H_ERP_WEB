import { useEffect, useMemo, useState } from "react";
import type { FilterWithPaginationStockManagementSummaryRequest, StockManagementRequestData } from "@/features/stockManagement/models/StockManagementModel";
import useToast from "@/core/hooks/useToast";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import usePagination from "@/core/hooks/usePagination";
import { useParams } from "react-router-dom";
import { useStockManagementListState } from "@/features/stockManagement/context/StockManagementListStateContext";
import { runApiWithLoader } from "@/core/utils/apiLoaderHelper";
import { stockManagementService } from "@/features/stockManagement/services/StockManagementService";
import * as E from 'fp-ts/Either';
import type { PaginationInfo, TableColumn } from "@/ui/components/DataTable/DataTableWithHeadColor";
import { Loader } from "@/core/utils/loader";
import { DataTable } from "@/ui/components/DataTable/DataTable";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { handleExportFile } from "@/core/utils/exportFile";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Button } from "@/ui/components/forms";
import { copyToClipboard } from "@/core/utils/comman";
import { Copy } from "lucide-react";

export const StockSummary: React.FC = () => {

    const [stockManagementSummaryList, setStockManagementSummaryList] = useState<StockManagementRequestData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { addToast } = useToast();
    const { projectId } = useProject();
    const { pagination, setPagination } = usePagination(20);
    const { SubMaterialMasterId, MaterialId, } = useParams<{ SubMaterialMasterId?: string; MaterialMasterId?: string; MaterialId?: string; SubMaterialId?: string }>();
    const { listState } = useStockManagementListState();
    const currentSubMaterialMasterId = SubMaterialMasterId ? Number(SubMaterialMasterId) : listState.SubMaterialMasterId;
    const currentMaterialId = MaterialId ? Number(MaterialId) : listState.MaterialId;
    const { canExport } = useMenuPermissions();

    useEffect(() => {
        if (!projectId) return
        loadStockManagementSummaryData()
    }, [projectId])

    const loadStockManagementSummaryData = async (page: number = pagination.currentPage) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationStockManagementSummaryRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    MaterialId: currentMaterialId,
                    SubMaterialId: currentSubMaterialMasterId,
                };

                const response = await stockManagementService.apiCallPullStockSummary(params);

                if (E.isRight(response)) {

                    setStockManagementSummaryList(response.right.Data);
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

    const StockManagementSummaryColumn = useMemo<TableColumn[]>(
        () => [
            {
                key: "MaterialName",
                label: 'Material Name',
                width: "20",
                sortable: false,
                align: "left",
                render: (value) => (
                    <TooltipText
                        text={value || "-"}
                        maxWidth="250px"
                        tooltipThreshold={25}
                    />
                )
            },
            {
                key: "SubMaterialName",
                label: 'Sub Material',
                width: "20",
                sortable: false,
                align: "left",
                render: (value) => (
                    <TooltipText
                        text={value || "-"}
                        maxWidth="250px"
                        tooltipThreshold={25}
                    />
                )
            },
            
            {
            key: 'SystemGeneratedCode',
            label: 'MR Code',
            sortable: false,
            width: '20',
            fixed: 'left',
            align: 'left',
            render: (value) => {
                return (
                    <div className="flex items-center gap-2">

                        <TooltipText
                            text={value || '-'}
                            maxWidth="180px"
                            tooltipThreshold={30}
                            tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"

                        />

                        {value && (
                            <Button
                                onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const success = await copyToClipboard(value);
                                    if (success) {
                                        addToast({ type: 'success', title: `${value} Copied!` });
                                    }
                                }}
                                color="transparent"
                                size="sm"
                                style={{
                                    padding: '2px 6px',
                                    color: '#6B7280',
                                    cursor: 'pointer'
                                }}
                                title="Copy"
                            >
                                <Copy className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>
                );
            }
        },
            {
                key: "TotalMaterialQuantityInStock",
                label: 'Quantity in Stock',
                width: "10",
                sortable: false,
                align: "left",
                render: (value :any, row :any) => (value != null ? `${value} ${row.UomCode || ""}`.trim() : "-"),
            }
        ], [])

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadStockManagementSummaryData(page);
    };

    const StockManagementSummaryPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange,
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize],
    );

    const StockManagementSummaryForTable = useMemo(() => stockManagementSummaryList, [stockManagementSummaryList]);

    const handleExportStockManagementSummary = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationStockManagementSummaryRequest = {
                    PageNumber: 1,
                    PageSize: 1000,
                    ProjectId: Number(projectId),
                    SubMaterialId: currentSubMaterialMasterId,
                    ExportType: exportType,
                };

                const response = await stockManagementService.apiCallPullStockSummary(params);

                handleExportFile(response, exportType, "Stock Management Summary", addToast);

                return response;
            },
            undefined,
            (error: any) =>
                addToast({ type: "error", title: error.message || "Export failed" }),
            undefined,
            "Preparing Export",
        );
    }

    const handleExportStockManagementSummaryExcel = () => handleExportStockManagementSummary("Excel");
    const handleExportStockManagementSummaryPdf = () => handleExportStockManagementSummary("PDF")

    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}> {" "} <div></div>{" "}</Loader>

            <TableActionToolbar
                isShowSearchBar={false}
                isShowExportButton={canExport}
                onExportExcel={handleExportStockManagementSummaryExcel}
                onExportPdf={handleExportStockManagementSummaryPdf}
                exportLoading={isLoading}
            />

            <DataTable
                data={StockManagementSummaryForTable}
                columns={StockManagementSummaryColumn}
                pagination={StockManagementSummaryPaginationInfo}
                emptyMessage="No Stock Summary Data found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
            />
        </div>
    )
}
export default StockSummary;