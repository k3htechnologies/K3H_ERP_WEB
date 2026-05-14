import { useCallback, useEffect, useMemo, useState } from "react";
import { runApiWithLoader } from "@/core/utils";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { usePagination } from "@/core/hooks/usePagination";
import { useNavigate, useParams } from "react-router";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { Button } from "@/ui/components/forms";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext";
import type { FilterWithPaginationMaterialRequisitionGRN, MaterialRequisitionGRNData } from "@/features/materialRequisition/models/MaterialRequisitionGRNModel";
import { materialRequisitionGRNService } from "@/features/materialRequisition/services/MaterialRequisitionGRNService";
import type { FilterWithPaginationMaterialRequisitionInvoiceSummary, MaterialRequisitionInvoiceSummaryData } from "@/features/materialRequisition/models/MaterialRequisitionInvoiceModel";
import { materialRequisitionInvoiceService } from "@/features/materialRequisition/services/MaterialRequisitionInvoiceService";
import { FieldItem } from "@/ui/components/forms/FieldItem";

export const Invoice: React.FC = () => {
    const [invoiceList, setInvoiceList] = useState<MaterialRequisitionGRNData[]>([]);
    const [invoiceSummaryData, setInvoiceSummaryData] = useState<MaterialRequisitionInvoiceSummaryData | null>(null);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { pagination, setPagination } = usePagination(20);
    const { projectId } = useProject();
    const { addToast } = useToast();
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;
    const currentUniquekey = listState.Uniquekey
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const navigate = useNavigate();

    useEffect(() => {
        if (!projectId) return;
        loadMaterialRequisitionGRNData(1, {});
        loadmaterialRequisitionInvoiceSummary();
    }, [projectId, currentMaterialRequisitionId])

    const loadMaterialRequisitionGRNData = async (page: number, filterParams: FilterInfo,) => {
        
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisitionGRN = {
                    ProjectId: Number(projectId),
                    MaterialRequisitionId: currentMaterialRequisitionId,
                    Uniquekey: currentUniquekey,
                    MaterialRequisitionGRNId: filterParams?.MaterialRequisitionGRNId ? Number(filterParams.MaterialRequisitionGRNId) : undefined,
                };

                const response = await materialRequisitionGRNService.apiCallPullMaterialRequisitionGRN(params);

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
            "Loading GRN",
        );
    };

    const loadmaterialRequisitionInvoiceSummary = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisitionInvoiceSummary = {
                    MaterialRequisitionId: currentMaterialRequisitionId,
                };

                const response = await materialRequisitionInvoiceService.apiCallPullMaterialRequisitionInvoiceSummary(params);

                if (E.isRight(response)) {

                    setInvoiceSummaryData(response.right.Data[0] ?? null);

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
            "Loading Invoice Summary",
        );
    };

    const handleCreateInvoice = useCallback((row: MaterialRequisitionGRNData) => {
        navigate(`/addInvoice/add/${row.MaterialRequisitionGRNId}`);
    }, [navigate]);

    const handleMakePayment = useCallback((row: MaterialRequisitionGRNData) => {
        navigate(`/invoicePayment/${row.MaterialRequisitionGRNId}`);
    }, [navigate]);

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: 1 });
        loadMaterialRequisitionGRNData(page, {})
    }

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        setPagination({ currentPage: 1 });
        loadMaterialRequisitionGRNData(1, {},);
    }, []);

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
            key: 'CreatedDate',
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
            width: '10',
            sortable: false,
            align: 'center',
            render: (_value, row) => (
                <div>
                    {
                        row.IsInvoiceCreated === false && (
                            <Button
                                color="blue"
                                size="sm"
                                onClick={() => handleCreateInvoice(row)}
                            >
                                Create Invoice
                            </Button>
                        )
                    }

                    {
                        row.IsInvoiceCreated === true && row.IsInvoicePaymentCompleted === false && (
                            <Button
                                color="blue"
                                size="sm"
                                onClick={() => handleMakePayment(row)}
                            >
                                Make Payment
                            </Button>
                        )
                    }

                    {
                        row.IsInvoiceCreated === true && row.IsInvoicePaymentCompleted === true && (
                            <Button
                                color="blue"
                                size="sm"
                                onClick={() => handleMakePayment(row)}
                            >
                                View Payment
                            </Button>
                        )
                    }
                </div>
            )
        }
    ], []);

    return (
        <div className="pt-2">
            <Loader loading={isLoading} title={loadingMessage}>{" "} <div></div>{" "}</Loader>

            <div className="gap-x-4 bg-[#EFF6FF] rounded-lg shadow-sm border border-gray-300 p-4 mb-4">
                <div className="lg:col-span-5 pb-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FieldItem label="Total Requisition Amount" value={`₹ ${invoiceSummaryData?.TotalRequisitionAmount?.toFixed(2) ?? ''}`} />
                        <FieldItem label="Paid  Requisition Amount" value={`₹ ${invoiceSummaryData?.PaidRequisitionAmount?.toFixed(2) ?? ''}`} />
                        <FieldItem label="Pending Requisition Amount" value={`₹ ${invoiceSummaryData?.PendingRequisitionAmount?.toFixed(2) ?? ''}`} />
                        <FieldItem label="Total Invoice Amount" value={`₹ ${invoiceSummaryData?.TotalInvoiceAmount?.toFixed(2) ?? ''}`} />
                        <FieldItem label="Paid  Invoice Amount" value={`₹ ${invoiceSummaryData?.TotalAmountPaid?.toFixed(2) ?? ''}`} />
                        <FieldItem label="Pending Invoice Amount" value={`₹ ${invoiceSummaryData?.RemainingInvoiceAmount?.toFixed(2) ?? ''}`} />
                    </div>
                </div>
            </div>

            <DataTable
                data={InvoiceForTable}
                columns={InvoiceColumns}
                pagination={InvoicePaginationInfo}
                emptyMessage="No GRN Data found"
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