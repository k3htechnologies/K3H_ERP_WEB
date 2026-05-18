import { useEffect, useMemo, useState } from "react";
import type { FilterWithPaginationStockManagementRequest, StockManagementRequestData } from "../models/StockManagementModel";
import useToast from "@/core/hooks/useToast";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import usePagination from "@/core/hooks/usePagination";
import { useParams } from "react-router-dom";
import { useStockManagementListState } from "../context/StockManagementListStateContext";
import { runApiWithLoader } from "@/core/utils/apiLoaderHelper";
import { stockManagementService } from "../services/StockManagementService";
import * as E from 'fp-ts/Either';
import type { PaginationInfo, TableColumn } from "@/ui/components/DataTable/DataTableWithHeadColor";
import { Loader } from "@/core/utils/loader";
import { DataTable } from "@/ui/components/DataTable/DataTable";

import TooltipText from "@/ui/components/Tooltip/TooltipText";

export const StockSummary: React.FC = () => {

    const [stockManagementSummaryList, setStockManagementSummaryList] = useState<StockManagementRequestData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { addToast } = useToast();
    const { projectId } = useProject();
    const { pagination, setPagination } = usePagination(20);
    const { SubMaterialMasterId, MaterialMasterId, MaterialId, SubMaterialId } = useParams<{ SubMaterialMasterId?: string; MaterialMasterId?: string; MaterialId?: string; SubMaterialId?: string }>();
    const { listState } = useStockManagementListState();
    const currentSubMaterialMasterId = SubMaterialMasterId ? Number(SubMaterialMasterId) : listState.SubMaterialMasterId;
    const currentMaterialMasterId = MaterialMasterId ? Number(MaterialMasterId) : listState.MaterialId;
    const currentMaterialId = MaterialId ? Number(MaterialId) : listState.MaterialId;
    const currentSubMaterialId = SubMaterialId ? Number(SubMaterialId) : listState.SubMaterialId;

    useEffect(() => {
        if (!projectId) return
        loadStockManagementSummaryData()
    }, [projectId])

    const loadStockManagementSummaryData = async (page: number = pagination.currentPage) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationStockManagementRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    MaterialId: currentMaterialId,
                    SubMaterialId: currentSubMaterialId,
                    MaterialMasterId: currentMaterialMasterId,
                    SubMaterialMasterId: currentSubMaterialMasterId,
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
                width: "30",
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
                label: 'SubMaterial Name',
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
                key: "UomCode",
                label: 'UOM',
                width: "20",
                sortable: false,
                align: "left",
                render: (value) => value || "-"
            },
            {
                key: "SystemGeneratedCode",
                label: 'PO No.',
                width: "30",
                sortable: false,
                align: "left",
                render: (value) => value || "-"
            },
            {
                key: "TotalMaterialQuantityInStock",
                label: 'Total Material Quantity in Stock',
                width: "10",
                sortable: false,
                align: "left",
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

    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}> {" "} <div></div>{" "}</Loader>

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