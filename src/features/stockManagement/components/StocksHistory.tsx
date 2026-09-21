import useToast from "@/core/hooks/useToast";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { useEffect, useMemo, useState } from "react";
import type { FilterWithPaginationStockManagementHistoryRequest, StockManagementRequestHistoryData } from "@/features/stockManagement/models/StockManagementModel";
import { stockManagementService } from "@/features/stockManagement/services/StockManagementService";
import { runApiWithLoader } from "@/core/utils";
import * as E from 'fp-ts/Either';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { Loader } from "@/core/utils/loader";
import { useStockManagementListState } from "@/features/stockManagement/context/StockManagementListStateContext";
import { useNavigate, useParams } from "react-router-dom";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import usePagination from "@/core/hooks/usePagination";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { Tabs } from "@/ui/components/Tab/Tab";
import { MaterialIn } from "./Materialin";
import { MaterialOut } from "./Materialout";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { TableActionToolbar } from "@/ui/components/TableAction/TableActionToolbar";
import { handleExportFile } from "@/core/utils/exportFile";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";

export const StockHistory: React.FC = () => {
    const [stockManagementHistoryList, setStockManagementHistoryList] = useState<StockManagementRequestHistoryData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { addToast } = useToast();
    const { projectId } = useProject();
    const { pagination, setPagination } = usePagination(20);
    const { SubMaterialMasterId } = useParams<{ SubMaterialMasterId?: string }>();
    const { listState } = useStockManagementListState();
    const currentSubMaterialMasterId = SubMaterialMasterId ? Number(SubMaterialMasterId) : listState.SubMaterialMasterId;
    const navigate = useNavigate();
    const { canExport } = useMenuPermissions();
    const materialName = listState.MaterialName;
    const subMaterialName = listState.SubMaterialName;
    const [sortInfo] = useState<SortInfo | undefined>();

    const MaterialRequisitionTabList = [
        { id: 'History', label: 'History' },
        { id: 'Material In', label: 'Material In' },
        { id: 'Material Out', label: 'Material Out' },
    ];

    const [activeTab, setActiveTab] = useState<string>(MaterialRequisitionTabList[0].id);

    useEffect(() => {
        if (!projectId) return
        loadStockManagementHistoryData()
    }, [projectId])

    const handleBackToStockManagement = () => {
        navigate("/stock");
    };

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
                label: 'Material In / Out',
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
                key: "Reason",
                label: 'Remark',
                width: "20",
                sortable: false,
                fixed: "left",
                align: "left",
                render: (value) => (
                    <TooltipText
                        text={value || "-"}
                        maxWidth="250px"
                        tooltipThreshold={25}
                    />
                ),
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
                    PageSize: pagination.totalRecords,
                    ProjectId: Number(projectId),
                    SubMaterialMasterId: currentSubMaterialMasterId,
                    SortBy: getSortByParam(sortInfo ?? null, StockManagementHistoryColumn),
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}> {" "} <div></div>{" "}</Loader>

            <div className="flex justify-between">
                <HeaderActionBar
                    subTitleText={materialName ?? ""}
                    subSubTitleText={subMaterialName ?? ""}
                    cancelText="Cancel"
                    EditText="Edit"
                    onCancel={() => handleBackToStockManagement()}
                />

                <TableActionToolbar
                    isShowSearchBar={false}
                    isShowExportButton={canExport}
                    onExportExcel={handleExportStockManagementHistoryExcel}
                    onExportPdf={handleExportStockManagementHistoryPdf}
                    exportLoading={isLoading}
                />
            </div>

            <div className="pt-0 pb-3">
                <Tabs
                    tabs={MaterialRequisitionTabList}
                    defaultActive={activeTab}
                    islarge
                    onTabChange={(t) => setActiveTab(t.id)}
                />
            </div>

            {activeTab === 'History' && (
                <DataTable
                    data={StockManagementHistoryForTable}
                    columns={StockManagementHistoryColumn}
                    pagination={StockManagementHistoryPaginationInfo}
                    emptyMessage="No Stock History Data found"
                    fixedHeight
                    recordsPerPage={20}
                    className="flex-1"
                />
            )}

            {activeTab === 'Material In' && <MaterialIn />}
            {activeTab === 'Material Out' && <MaterialOut />}

        </div>
    )
}
export default StockHistory;