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
import { useParams } from "react-router-dom";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import usePagination from "@/core/hooks/usePagination";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";

export const MaterialIn: React.FC = () => {
    const [materialInList, setMaterialInList] = useState<StockManagementRequestHistoryData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { addToast } = useToast();
    const { projectId } = useProject();
    const { pagination, setPagination } = usePagination(20);
    const { SubMaterialMasterId } = useParams<{ SubMaterialMasterId?: string }>();
    const { listState } = useStockManagementListState();
    const currentSubMaterialMasterId = SubMaterialMasterId ? Number(SubMaterialMasterId) : listState.SubMaterialMasterId;

    useEffect(() => {
        if (!projectId) return
        loadMaterialInData();
    }, [projectId, currentSubMaterialMasterId])

    const loadMaterialInData = async (page: number = pagination.currentPage, sort?: SortInfo,) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationStockManagementHistoryRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    SubMaterialMasterId: currentSubMaterialMasterId,
                    SortBy: getSortByParam(sort ?? null, MaterialInColumn)
                };

                const response = await stockManagementService.apiCallPullStockManagementHistory(params);

                if (E.isRight(response)) {

                    const filteredData = response.right.Data.filter(
                        (item) => item.InwardOutwardType === "INWARD"
                    );

                    setMaterialInList(filteredData);

                    setPagination({
                        currentPage: page,
                        totalRecords: filteredData.length,
                        totalPages: Math.ceil(filteredData.length / pagination.pageSize),
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

    const MaterialInColumn = useMemo<TableColumn[]>(
        () => [
            {
                key: "MaterialQuantityInwardOutward",
                label: 'Material In',
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
        loadMaterialInData(page);
    };

    const MaterialInPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange,
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize],
    );

    // const StockManagementHistoryForTable = useMemo(() => {
    //     if (activeTab === 'History') return MaterialInList;

    //     const typeMap: Record<string, string> = {
    //         'Material In': 'INWARD',
    //         'Material Out': 'OUTWARD',
    //     };

    //     return MaterialInList.filter(
    //         (item) => item.InwardOutwardType === typeMap[activeTab]
    //     );
    // }, [MaterialInList, activeTab]);

    // const StockManagementHistoryPaginationInfo: PaginationInfo = useMemo(
    //     () => ({
    //         currentPage: pagination.currentPage,
    //         totalPages: Math.ceil(StockManagementHistoryForTable.length / pagination.pageSize),
    //         totalRecords: StockManagementHistoryForTable.length,
    //         pageSize: pagination.pageSize,
    //         onPageChange: handlePageChange,
    //     }),
    //     [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize],
    // );

    const MaterialInForTable = useMemo(() => materialInList, [materialInList]);

    return (
        <div >
            <Loader loading={isLoading} title={loadingMessage}> {" "} <div></div>{" "}</Loader>

            <DataTable
                data={MaterialInForTable}
                columns={MaterialInColumn}
                pagination={MaterialInPaginationInfo}
                emptyMessage="No Material In Data found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
            />
        </div>
    )
}
export default MaterialIn;