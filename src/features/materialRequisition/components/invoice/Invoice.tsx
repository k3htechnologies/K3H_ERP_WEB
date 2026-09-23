import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { runApiWithLoader } from "@/core/utils";
import { type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { usePagination } from "@/core/hooks/usePagination";
import { useNavigate, useParams } from "react-router";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import { Button } from "@/ui/components/forms";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext";
import type { FilterWithPaginationMaterialRequisitionGRN, MaterialRequisitionGRNData } from "@/features/materialRequisition/models/MaterialRequisitionGRNModel";
import { materialRequisitionGRNService } from "@/features/materialRequisition/services/MaterialRequisitionGRNService";
import type { DeleteMaterialRequisitionInvoice, FilterWithPaginationMaterialRequisitionInvoice, FilterWithPaginationMaterialRequisitionInvoiceSummary, MaterialRequisitionInvoiceData, MaterialRequisitionInvoiceSummaryData } from "@/features/materialRequisition/models/MaterialRequisitionInvoiceModel";
import { materialRequisitionInvoiceService } from "@/features/materialRequisition/services/MaterialRequisitionInvoiceService";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import DataTableExpandable, { type DataTableExpandableRef } from "@/ui/components/DataTable/DataTableExpandable";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { formatCurrency } from "@/core/utils/comman";
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import type { ModulesApprovalStatusRequest, UpdateModulesWorkflowApprovalRequest } from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel";
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal";
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService";
import { Edit, Trash2 } from "lucide-react";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";

interface FinalizedVendorProps {
    onApprovalSuccess?: () => Promise<void>;
}

export const Invoice: React.FC<FinalizedVendorProps> = ({ onApprovalSuccess }) => {

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
    const materialRequisitionStatus = ["COMPLETED", "CLOSED"].includes(listState.MaterialRequisitionStatus?.toUpperCase())
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const navigate = useNavigate();
    const [invoiceNumber, setInvoiceNumber] = useState<string | null>("");
    const [invoiceAmount, setInvoiceAmount] = useState<number | null>(0);
    const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
    const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
    const [isApprovalActionModalOpen, setIsApprovalActionModalOpen] = useState(false);
    const [approvalActionType, setApprovalActionType] = useState<"approve" | "reject">("approve");
    const [materialRequisitionInvoiceId, setMaterialRequisitionInvoiceId] = useState<Number | null>(0);

    const [expandedParentRow, setExpandedParentRow] = useState<any>(null);
    const [expandedParentId, setExpandedParentId] = useState<string>("");
    const dtRef = useRef<DataTableExpandableRef | null>(null);

    const [deleteInvoiceData, setDeleteInvoiceData] = useState<MaterialRequisitionInvoiceData | null>(null);
    const [isConfirmationDialogBoxOpenForInVoice, setIsConfirmationDialogBoxOpenForInVoice] = useState(false)

    const { canView: canAddInvoice } = useMenuPermissions('Add Invoice');

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
            "Loading Invoice",
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

        navigate(`/materialRequisition/addInvoice/add/${row.MaterialRequisitionGRNId}`);
    }, [navigate]);

    const handleEditInvoice = useCallback((row: MaterialRequisitionInvoiceData) => {

        navigate(`/materialRequisition/addInvoice/add/${row.MaterialRequisitionGRNId}/${row.MaterialRequisitionInvoiceId}`);
    }, [navigate]);

    const handleMakePayment = useCallback((row: MaterialRequisitionInvoiceData) => {

        navigate(`/materialRequisition/invoicePayment/${row.MaterialRequisitionGRNId}`);
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
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize],);

    const InvoiceForTable = useMemo(() => invoiceList, [invoiceList]);

    const InvoiceColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'ChallanNumber',
            label: 'Challan Number',
            width: '25',
            render: (value?: string) => value || '-'
        },
        {
            key: 'UploadChallanURL',
            label: 'Challan',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value: string, row: any) => {
                return (
                    <div className="flex items-center justify-between w-full">
                        <MultiImageViewer
                            images={parseDocumentUrls(row.UploadChallanURL)}
                            title="Challan Document"
                            isIcon={false}
                            triggerLabel={value === '' || 'Challan'}
                        />

                    </div>
                );
            }
        },
        {
            key: 'VehicleNumber',
            label: 'Vehicle Number',
            width: '35',
            render: (value?: string) => value || '-'
        },
        {
            key: "Remarks",
            label: "Remark",
            width: "15",
            sortable: false,
            align: "left",
            render: (value) => (
                <FieldInfoTooltip value={value} />
            )
        },
        {
            key: "ModifiedBy",
            label: "Last Modified By",
            width: "15",
            sortable: false,
            align: "left",
            render: (value, row) => <TooltipText text={value || row.CreatedBy || "-"} maxWidth="180px" tooltipThreshold={18} />,
        },
        {
            key: "ModifiedDate",
            label: "Last Modified Date",
            width: "15",
            sortable: false,
            align: "left",
            render: (value, row) =>
                value ? formatDate_dd_MonthName_yy_hh_mm(value) : row.CreatedDate ? formatDate_dd_MonthName_yy_hh_mm(row.CreatedDate) : "-",
        },
        {
            key: 'Action',
            label: 'Action',
            width: '10',
            sortable: false,
            align: 'center',
            render: (_value, row) => (
                <div>
                    {row.IsInvoiceCreated === false && !materialRequisitionStatus && (
                        <Button
                            color="blue"
                            size="sm"
                            onClick={() => handleCreateInvoice(row)}
                        >
                            Create Invoice
                        </Button>
                    )}

                    {row.IsInvoiceCreated === true && row.IsInvoicePaymentCompleted === false && row.InvoiceStatus.toUpperCase() === "APPROVED" && !materialRequisitionStatus && (
                        <Button
                            color="blue"
                            size="sm"
                            onClick={() => handleMakePayment(row)}
                        >
                            Make Payment
                        </Button>
                    )}

                    {row.IsInvoiceCreated === true && row.IsInvoicePaymentCompleted === true && !materialRequisitionStatus && (
                        <Button
                            color="blue"
                            size="sm"
                            onClick={() => handleMakePayment(row)}
                        >
                            View Payment
                        </Button>
                    )}

                    {materialRequisitionStatus && (
                        <Button
                            color="blue"
                            size="sm"
                            onClick={() => handleMakePayment(row)}
                        >
                            View Payment
                        </Button>
                    )}

                </div>
            )
        }
    ], [handleMakePayment, handleMakePayment, handleCreateInvoice]);

    const handleApprovalLog = (row: MaterialRequisitionInvoiceData) => {
        const request: ModulesApprovalStatusRequest = {
            ModuleName: "ADD INVOICE",
            Id: currentMaterialRequisitionId ?? 0,
            SubId: row.MaterialRequisitionInvoiceId ?? 0,
            ProjectId: projectId ?? 0,
        };
        setInvoiceNumber(row.InvoiceNumber);
        setInvoiceAmount(row.InvoiceAmount);
        setMaterialRequisitionInvoiceId(row.MaterialRequisitionInvoiceId)
        setApprovalLogRequest(request);
        setIsApprovalLogModalOpen(true);
    };

    const handleApproveRejectInvoice = (row: MaterialRequisitionInvoiceData, approvalType: "approve" | "reject") => {
        setInvoiceNumber(row.InvoiceNumber);
        setInvoiceAmount(row.InvoiceAmount);
        setMaterialRequisitionInvoiceId(row.MaterialRequisitionInvoiceId)
        setApprovalActionType(approvalType);
        setIsApprovalActionModalOpen(true);
    };

    const handleApprovalSubmit = async (remark: string) => {

        if (!materialRequisitionInvoiceId) return;

        const payload: UpdateModulesWorkflowApprovalRequest = {
            ModuleName: "MATERIAL REQUISITION",
            Id: currentMaterialRequisitionId ?? 0,
            SubId: Number(materialRequisitionInvoiceId) ?? 0,
            ProjectId: Number(projectId),
            IsApproved: approvalActionType === "approve",
            Remarks: remark ?? null,
        };
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await modulesWorkflowApprovalService.apiCallupdateModulesWorkflowApproval(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsApprovalActionModalOpen(false);

                    const parentId = expandedParentId;
                    const parentRow = expandedParentRow;

                    await loadMaterialRequisitionGRNData(1, {});

                    dtRef.current?.collapseAll?.();

                    if (parentId && parentRow) {
                        setTimeout(() => {
                            dtRef.current?.expandRow?.(
                                String(parentId),
                                parentRow
                            );
                        }, 100);
                    }

                    await onApprovalSuccess?.();


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
            approvalActionType === "approve" ? "Approving Invoice" : "Rejecting Invoice"
        );
    };

    const handleConfirmationDialogBoxOpenForInVoice = useCallback((row: MaterialRequisitionInvoiceData) => {
        setDeleteInvoiceData(row)
        setIsConfirmationDialogBoxOpenForInVoice(true)
    }, [])

    const handleDeleteInvoiceData = async () => {

        setIsConfirmationDialogBoxOpenForInVoice(false);

        if (!deleteInvoiceData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteMaterialRequisitionInvoice = {
                    MaterialRequisitionInvoiceId: deleteInvoiceData.MaterialRequisitionInvoiceId || 0,
                    MaterialRequisitionId: deleteInvoiceData.MaterialRequisitionId || 0,
                    Uniquekey: deleteInvoiceData.Uniquekey || "",
                    ProjectId: Number(projectId),
                };

                const response = await materialRequisitionInvoiceService.apiCallDeleteMaterialRequisitionInvoice(params);

                if (E.isRight(response)) {

                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

                    const parentId = expandedParentId;
                    const parentRow = expandedParentRow;

                    await loadMaterialRequisitionGRNData(1, {});

                    dtRef.current?.collapseAll?.();

                    if (parentId && parentRow) {
                        setTimeout(() => {
                            dtRef.current?.expandRow?.(
                                String(parentId),
                                parentRow
                            );
                        }, 100);
                    }

                    setIsConfirmationDialogBoxOpenForInVoice(false);
                    setDeleteInvoiceData(null);

                    loadmaterialRequisitionInvoiceSummary();
                } else {
                    addToast({ type: 'error', title: response.left.message });

                    setIsConfirmationDialogBoxOpenForInVoice(false);
                }
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Deleting Invoice"
        );
    };

    return (
        <div className="pt-2">
            <Loader loading={isLoading} title={loadingMessage}>{" "} <div></div>{" "}</Loader>

            <div className="gap-x-4 bg-[#EFF6FF] rounded-lg shadow-sm border border-gray-300 p-4 mb-4">
                <div className="lg:col-span-5 pb-3">

                    <div className="mb-5">
                        <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">
                            Vendor Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FieldItem
                                label="Vendor Name"
                                value={invoiceSummaryData?.FinalVendor}
                            />

                            <FieldItem
                                label="Vendor Company"
                                value={invoiceSummaryData?.FinalVendorCompanyName}
                            />

                            <FieldItem
                                label="Mobile Number"
                                value={`${invoiceSummaryData?.FinalVendorMobileNumberCountryCode ?? "+91"} ${invoiceSummaryData?.FinalVendorMobileNumber ?? ""}`}
                            />

                            <FieldItem
                                label="GST Number"
                                value={invoiceSummaryData?.FinalVendorGSTNumber}
                            />
                        </div>
                    </div>

                    <div className="mb-5">
                        <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">
                            PO Amount Details (₹)
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FieldItem
                                label="Total (₹)"
                                value={formatCurrency(invoiceSummaryData?.TotalRequisitionAmount)}
                            />

                            <FieldItem
                                label="Paid (₹)"
                                value={formatCurrency(invoiceSummaryData?.PaidRequisitionAmount)}
                            />

                            <FieldItem
                                label="Pending (₹)"
                                value={formatCurrency(invoiceSummaryData?.PendingRequisitionAmount)}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">
                            Invoice Details  (₹)
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FieldItem
                                label="Total (₹)"
                                value={formatCurrency(invoiceSummaryData?.TotalInvoiceAmount)}
                            />

                            <FieldItem
                                label="Paid (₹)"
                                value={formatCurrency(invoiceSummaryData?.TotalAmountPaid)}
                            />

                            <FieldItem
                                label="Pending(₹)"
                                value={formatCurrency(invoiceSummaryData?.RemainingInvoiceAmount)}
                            />
                        </div>
                    </div>

                </div>
            </div>

            <DataTableExpandable
                ref={dtRef}
                data={InvoiceForTable}
                columns={InvoiceColumns}
                pagination={InvoicePaginationInfo}
                emptyMessage="No GRN Data found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
                expandable={{

                    keyField: "MaterialRequisitionGRNId",
                    alwaysFetchOnOpen: true,
                    rowExpandable: (row) => row.IsInvoiceCreated,

                    fetchRow: async (row) => {

                        setExpandedParentRow(row);

                        setExpandedParentId(row.MaterialRequisitionGRNId);

                        setIsLoading(true);

                        setLoadingMessage("Loading Invoice");

                        const params: FilterWithPaginationMaterialRequisitionInvoice = {
                            PageNumber: 1,
                            PageSize: 1,
                            ProjectId: Number(projectId),
                            MaterialRequisitionId: Number(currentMaterialRequisitionId),
                            MaterialRequisitionInvoiceId: Number(0),
                            MaterialRequisitionGRNId: Number(row.MaterialRequisitionGRNId)
                        };

                        const response = await materialRequisitionInvoiceService.apiCallPullMaterialRequisitionInvoice(params);

                        setIsLoading(false);

                        if (E.isRight(response)) {

                            return response.right.Data ?? [];
                        }
                        return [];
                    },

                    renderRow: (fetchedData) => {
                        const details = Array.isArray(fetchedData) ? fetchedData : fetchedData ? [fetchedData] : [];

                        if (!details.length) {
                            return (
                                <div className="p-1 text-xs text-gray-600 text-center">
                                    <NoDataView />
                                </div>
                            );
                        }

                        return (
                            <div className="space-y-4">
                                {details.map((row, index) => {

                                    const showEdit = canAddInvoice && !row.InvoiceStatus?.toUpperCase().includes("APPROVED") ? true : false;
                                    const showDelete = canAddInvoice && !row.InvoiceStatus?.toUpperCase().includes("APPROVED") ? true : false;

                                    return (
                                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                            <div className="flex justify-between items-center">
                                                <div className="text-sm text-gray-700">

                                                    <FieldItem label="Invoice Number" value={row.InvoiceNumber || "-"} isRow />
                                                    <FieldItem label="Invoice Amount" value={formatCurrency(row?.InvoiceAmount)} isRow />
                                                    <FieldItem
                                                        label="Amount Paid Till Date"
                                                        value={
                                                            <span className="text-green-600 font-semibold">
                                                                {formatCurrency(row?.InvoiceAmountPaidTillDate)}
                                                            </span>
                                                        }
                                                        isRow
                                                    />

                                                    <FieldItem label=" Amount to be Paid" value={
                                                        <span className="text-red-600 font-semibold">
                                                            {formatCurrency(Number(row.InvoiceAmount) - Number(row.InvoiceAmountPaidTillDate))}
                                                        </span>
                                                    } isRow />
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <ApprovalActions
                                                        approvalStatus={row?.InvoiceStatus}
                                                        onApprove={() => handleApproveRejectInvoice(row as MaterialRequisitionInvoiceData, "approve")}
                                                        onReject={() => handleApproveRejectInvoice(row as MaterialRequisitionInvoiceData, "reject")}
                                                        showApproval={row?.IsApproval}
                                                        isIcons={true}
                                                        onHistory={() => handleApprovalLog(row as MaterialRequisitionInvoiceData)}
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            if (!showEdit) return;
                                                            handleEditInvoice(row as MaterialRequisitionInvoiceData);

                                                        }}
                                                        color="transparent"
                                                        isborderRadius
                                                        disabled={!showEdit}
                                                        size="sm"
                                                        style={{
                                                            color: showEdit ? "" : "#9CA3AF",
                                                            cursor: showEdit ? "pointer" : "not-allowed",
                                                            opacity: showEdit ? 1 : 0.5,
                                                        }}
                                                        title="Edit">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            if (!showDelete) return;
                                                            handleConfirmationDialogBoxOpenForInVoice(row);
                                                        }}
                                                        color="transparent"
                                                        isborderRadius
                                                        disabled={!showDelete}
                                                        size="sm"
                                                        style={{
                                                            color: showDelete ? "red" : "#9CA3AF",
                                                            cursor: showDelete ? "pointer" : "not-allowed",
                                                            opacity: showDelete ? 1 : 0.5,
                                                        }}
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-6 text-sm pt-5">
                                                <div className="space-y-3">
                                                    <h3 className="font-semibold mb-2">Invoice Details</h3>


                                                    <FieldItem label="Invoice Date" value={formatDate_dd_MonthName_yy(row?.InvoiceDate ?? '')} />
                                                    <FieldItem label="Due Date" value={formatDate_dd_MonthName_yy(row?.InvoiceDueDate ?? '')} />

                                                    <FieldItem label="Remark" value={row?.Remarks ?? ''} />
                                                </div>

                                                <div className="space-y-3">
                                                    <h3 className="font-semibold mb-2">Document's Details</h3>

                                                    <FieldItem label="Invoice" urls={row.UploadInvoiceURL} isSetValue={false} isIcon />

                                                    <FieldItem label="Performance Report" urls={row.PerformaInvoiceURL} isSetValue={false} isIcon />
                                                    <FieldItem label="Measurement Report" urls={row.MeasurementReportURL} isSetValue={false} isIcon />

                                                </div>

                                                <div className="space-y-3">
                                                    <h3 className="font-semibold mb-2">Action Details</h3>

                                                    <FieldItem label="Created By" value={row?.CreatedBy ?? "-"} />

                                                    <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy_hh_mm(row?.CreatedDate ?? "-")} />
                                                    <FieldItem label="Modified By" value={row?.ModifiedBy ?? "-"} />
                                                    <FieldItem label="Modified Date" value={formatDate_dd_MonthName_yy_hh_mm(row?.ModifiedDate ?? "-")} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    },

                    expandButton: { openText: "Hide", closeText: "Show" },
                }}
            />

            <ApprovalLogModal
                isOpen={isApprovalLogModalOpen}
                titleText={invoiceNumber ?? ""}
                subTitleText={String(invoiceAmount ?? 0)}
                title='Invoice Approval'
                onClose={() => setIsApprovalLogModalOpen(false)}
                request={approvalLogRequest}
            />

            <ApprovalActionModal
                title='Invoice Approval'
                titleText={invoiceNumber ?? ""}
                subTitleText={String(invoiceAmount ?? 0)}
                isOpen={isApprovalActionModalOpen}
                onClose={() => setIsApprovalActionModalOpen(false)}
                actionType={approvalActionType}
                onSubmit={handleApprovalSubmit}
                loading={isLoading}
            />

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpenForInVoice}
                onClose={() => {
                    setDeleteInvoiceData(null);
                    setIsConfirmationDialogBoxOpenForInVoice(false);
                }}
                onConfirm={handleDeleteInvoiceData}
                loading={isLoading}
                pageName="Invoice"
            />

        </div>
    )
}

export default Invoice;