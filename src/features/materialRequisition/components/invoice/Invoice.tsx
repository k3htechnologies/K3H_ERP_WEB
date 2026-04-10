import { useCallback, useEffect, useMemo, useState } from "react";
import type { FilterWithPaginationMaterialRequisitionInvoice, MaterialRequisitionInvoiceData } from "../../models/MaterialRequisitionInvoiceModel";
import { runApiWithLoader } from "@/core/utils";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { usePagination } from "@/core/hooks/usePagination";
import { useNavigate, useParams } from "react-router";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { materialRequisitionInvoiceService } from "../../services/MaterialRequisitionInvoiceService";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { Button } from "@/ui/components/forms";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { useMaterialRequisitionListState } from "../../context/MaterialRequisitionListStateContext";


export const Invoice: React.FC = () => {
    const [invoiceList, setInvoiceList] = useState<MaterialRequisitionInvoiceData[]>([]);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { pagination, setPagination } = usePagination(20);
    const { projectId } = useProject();
    const { addToast } = useToast();
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;

    const { canAction } = useMenuPermissions();
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const navigate = useNavigate();

    useEffect(() => {
        if (!projectId) return;
        loadInvoiceData(1, {});
    }, [projectId])

    const loadInvoiceData = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo,) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisitionInvoice = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    MaterialRequisitionId: currentMaterialRequisitionId,
                    MaterialRequisitionInvoiceId: filterParams?.MaterialRequisitionInvoiceId ? Number(filterParams.MaterialRequisitionInvoiceId) : undefined,
                    SortBy: getSortByParam(sortInfo ?? null, InvoiceColumns),
                };

                const response = await materialRequisitionInvoiceService.apiCallPullMaterialRequisitionInvoice(params);

                if (E.isRight(response)) {
                    setInvoiceList(response.right.Data);
                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });

                } else {
                    addToast({ type: "error", title: response.left.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message });
            },
            undefined,
            "Loading Invoice",
        );
    };

    //#region NAVIGATE CREATE INVOICE
    const handleCreateInvoice = useCallback((row: MaterialRequisitionInvoiceData) => {
        navigate(`/materialRequisitionInvoice/view/${row.MaterialRequisitionInvoiceId}`);
    }, [navigate]);
    //#endregion

    //#region HANDLE PAGE CHNAGE
    const handlePageChange = (page: number) => {
        setPagination({ currentPage: 1 });
        loadInvoiceData(page, {})
    }

    //#region TABLE SORT COLUMN
    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        setPagination({ currentPage: 1 });
        loadInvoiceData(1, {});
    }, []);

    //#region TABLE PAGINATION INFO
    const InvoicePaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange,
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize],
    );

    const InvoiceForTable = useMemo(() => invoiceList, [invoiceList]);

    const InvoiceColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'InvoiceDate',
            label: 'Date',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : "-",
        },
        {
            key: 'VehicleNumber',
            label: 'Vehicle No.',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => value || '-'
        },
        {
            key: 'ChallanNumber',
            label: 'Challan No.',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => value || '-'
        },
        {
            key: 'Action',
            label: 'Action',
            width: '15',
            sortable: false,
            align: 'center',
            render: (_value, row) => (
                <div className="flex items-center justify-center">
                    {canAction && (
                        <>
                            <Button
                                color="blue"
                                size="sm"
                                onClick={() => {
                                    handleCreateInvoice(row)
                                }}
                            >
                                Create Invoice
                            </Button>
                        </>
                    )}
                </div>
            )
        },
    ], []);

    return (
        <div>
            {/* Loader */}
            <Loader loading={isLoading} title={loadingMessage}>{" "} <div></div>{" "}</Loader>

            <DataTable
                data={InvoiceForTable}
                columns={InvoiceColumns}
                pagination={InvoicePaginationInfo}
                emptyMessage="No Invoice Data found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

        </div>
    )
}
export default Invoice;