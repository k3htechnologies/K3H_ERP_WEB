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
import React from "react";

interface FinalizedVendorProps {
    onApprovalSuccess?: () => Promise<void>;
}

export const Invoice: React.FC<FinalizedVendorProps> = ({ onApprovalSuccess }) => {

    const [invoiceList, setInvoiceList] = useState<MaterialRequisitionGRNData[]>([]);
    const [invoiceSummaryData, setInvoiceSummaryData] = useState<MaterialRequisitionInvoiceSummaryData[]>([]);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { pagination, setPagination } = usePagination(1);

    const { addToast } = useToast();
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.materialRequisitionId;
    const currentUniquekey = listState.uniquekey
    const projectId = listState.projectId
    const materialRequisitionStatus = ["COMPLETED", "CLOSED"].includes(listState.materialRequisitionStatus?.toUpperCase())
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
    const [vendorWiseGRNPages, setVendorWiseGRNPages] = useState<Record<number, number>>({});

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
                    VendorId: 0
                };

                const response = await materialRequisitionInvoiceService.apiCallPullMaterialRequisitionInvoiceSummary(params);

                if (E.isRight(response)) {

                    setInvoiceSummaryData(response.right.Data ?? []);
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
    
    const handleViewPayment = useCallback((row: MaterialRequisitionInvoiceData) => {
        navigate(`/materialRequisition/invoicePayment/${row.MaterialRequisitionGRNId}`);
    }, [navigate]);

    const handlePageChange = (page: number, vendorId: number) => {
        setVendorWiseGRNPages(prev => ({ ...prev, [vendorId]: page, }));
    };


    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        setPagination({ currentPage: 1 });
        loadMaterialRequisitionGRNData(1, {},);
    }, []);

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
                            disabled={Number(row.POPendingAmount ?? 0) <= 0}
                            style={{
                                opacity: Number(row.POPendingAmount ?? 0) <= 0 ? 0.5 : 1,
                                cursor: Number(row.POPendingAmount ?? 0) <= 0 ? "not-allowed"  : "pointer"
                            }}
                            title={
                                Number(row.POPendingAmount ?? 0) <= 0 ? "PO amount is fully paid"  : "Add Invoice"
                            }
                            onClick={() => handleCreateInvoice(row)}
                        >
                            Add Invoice
                        </Button>
                    )}

                    {row.IsInvoiceCreated === true && row.IsInvoicePaymentCompleted === false && row.ApprovalStatus.toUpperCase() === "APPROVED" && !materialRequisitionStatus && (
                        <Button
                            color="green"
                            size="sm"
                            style={{
                                background: "#00AC00"
                            }}

                            onClick={() => handleViewPayment(row)}
                        >
                            Make Payment
                        </Button>
                    )}

                    {row.IsInvoiceCreated === true && row.IsInvoicePaymentCompleted === true && !materialRequisitionStatus && (
                        <Button
                            color="blue"
                            variant="solid"
                            colorMode="extraLight"
                            size="sm"
                            onClick={() => handleViewPayment(row)}
                        >
                            View Payment
                        </Button>
                    )}

                    {materialRequisitionStatus && (
                        <Button
                            color="blue"
                            variant="solid"
                            colorMode="extraLight"
                            size="sm"
                            onClick={() => handleViewPayment(row)}
                        >
                            View Payment
                        </Button>
                    )}
                </div>
            )
        }
    ], [handleViewPayment, handleCreateInvoice, materialRequisitionStatus, invoiceSummaryData]);

    const handleApprovalLog = (row: MaterialRequisitionInvoiceData) => {
        const request: ModulesApprovalStatusRequest = {
            ModuleName: "INVOICE APPROVAL",
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
            ModuleName: "INVOICE APPROVAL",
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
        <div className="pt-5">
            <Loader loading={isLoading} title={loadingMessage}>{" "} <div></div>{" "}</Loader>

            {invoiceSummaryData.map((item, index) => {
                const vendorId = Number(item.VendorId);

                const vendorInvoiceData = InvoiceForTable
                    .filter(invoice => Number(invoice.VendorId) === vendorId)
                    .map(invoice => ({
                        ...invoice, POPendingAmount: Number(item?.POPendingAmount ?? 0)
                    }));

                const pageSize = 20;
                const currentPage = vendorWiseGRNPages[vendorId] ?? 1;

                const totalRecords = vendorInvoiceData.length;
                const totalPages = Math.ceil(totalRecords / pageSize);

                const PaginationInfo: PaginationInfo = {
                    currentPage,
                    totalPages,
                    totalRecords,
                    pageSize,
                    onPageChange: (page: number) => handlePageChange(page, vendorId),
                };

                const paginatedVendorData = vendorInvoiceData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

                return (
                    <React.Fragment key={vendorId || index}>

                        <div key={item.FinalVendor ?? index} className="gap-x-4 bg-[#EFF6FF] rounded-lg  border border-gray-300 p-4 mb-4">
                            <div className="lg:col-span-5 pb-3">

                                <div className="mb-5">
                                    <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">
                                        Vendor Details
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <FieldItem
                                            label="Vendor Name"
                                            value={item?.FinalVendor}
                                        />

                                        <FieldItem
                                            label="Vendor Company"
                                            value={item?.FinalVendorCompanyName}
                                        />

                                        <FieldItem
                                            label="Mobile Number"
                                            value={`${item?.FinalVendorMobileNumberCountryCode ?? "+91"} ${item?.FinalVendorMobileNumber ?? ""}`}
                                        />

                                        <FieldItem
                                            label="GST Number"
                                            value={item?.FinalVendorGSTNumber}
                                        />
                                    </div>
                                </div>

                                <div className="mb-5">
                                    <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">
                                        PO Amount Details (₹)
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <FieldItem label="Total (₹)" value={formatCurrency(item?.POAmount)} />

                                        <FieldItem label="Paid (₹)" value={formatCurrency(item?.POPaidAmount)} />

                                        <FieldItem label="Pending (₹)" value={formatCurrency(item?.POPendingAmount)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">
                                        Invoice Details (₹)
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <FieldItem
                                            label="Total (₹)"
                                            value={formatCurrency(item?.TotalInvoiceAmount)}
                                        />

                                        <FieldItem
                                            label="Paid (₹)"
                                            value={formatCurrency(item?.TotalAmountPaid)}
                                        />

                                        <FieldItem
                                            label="TDS Paid (₹)"
                                            value={formatCurrency(item?.TotalTDSAmountPaid)}
                                        />


                                        <FieldItem
                                            label="Pending(₹)"
                                            value={formatCurrency(item?.RemainingInvoiceAmount)}
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="mb-4">

                            <DataTableExpandable
                                ref={dtRef}
                                data={paginatedVendorData}
                                columns={InvoiceColumns}
                                pagination={PaginationInfo}
                                emptyMessage="No GRN Data found"
                                fixedHeight
                                recordsPerPage={1}
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

                                                    const showEdit = canAddInvoice && !row.ApprovalStatus?.toUpperCase().includes("APPROVED") ? true : false;
                                                    const showDelete = canAddInvoice && !row.ApprovalStatus?.toUpperCase().includes("APPROVED") ? true : false;

                                                    return (

                                                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4">

                                                            <div className="mb-5">
                                                                <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
                                                                    <h3 className="text-md font-semibold text-gray-700">
                                                                        Invoice Details (₹)
                                                                    </h3>

                                                                    <div className="flex items-center gap-1">
                                                                        <ApprovalActions
                                                                            approvalStatus={row?.ApprovalStatus}
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

                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                                    <FieldItem label="Invoice Number" value={row.InvoiceNumber || "-"} />
                                                                    <FieldItem label="Invoice Amount" value={formatCurrency(row?.InvoiceAmount)} />
                                                                    <FieldItem
                                                                        label="Amount Paid Till Date"
                                                                        value={
                                                                            <span className="text-green-600 font-semibold">
                                                                                {formatCurrency(row?.InvoiceAmountPaidTillDate)}
                                                                            </span>
                                                                        }
                                                                    />

                                                                    <FieldItem
                                                                        label="TDS Paid Till Date"
                                                                        value={
                                                                            <span className="text-green-600 font-semibold">
                                                                                {formatCurrency(row?.InvoiceTDSPaidTillDate)}
                                                                            </span>
                                                                        }
                                                                    />

                                                                    <FieldItem label=" Amount to be Paid" value={
                                                                        <span className="text-red-600 font-semibold">
                                                                            {formatCurrency(Number(row.InvoiceAmount) - Number(row.InvoiceAmountPaidTillDate) - Number(row.InvoiceTDSPaidTillDate))}
                                                                        </span>
                                                                    } />

                                                                    <FieldItem label="Invoice Date" value={formatDate_dd_MonthName_yy(row?.InvoiceDate ?? '')} />
                                                                    <FieldItem label="Due Date" value={formatDate_dd_MonthName_yy(row?.InvoiceDueDate ?? '')} />
                                                                    <FieldInfoTooltip label="Remark" value={row?.Remarks ?? ''} />
                                                                </div>
                                                            </div>

                                                            <div className="mb-5">
                                                                <h3 className="text-md font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">
                                                                    Document's Details
                                                                </h3>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                                    <FieldItem label="Invoice" urls={row.UploadInvoiceURL} isSetValue={false} isIcon />
                                                                    <FieldItem label="Proforma Report" urls={row.PerformaInvoiceURL} isSetValue={false} isIcon />
                                                                    <FieldItem label="Measurement Report" urls={row.MeasurementReportURL} isSetValue={false} isIcon />
                                                                </div>
                                                            </div>

                                                            <div className="mb-5">
                                                                <h3 className="text-md font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">
                                                                    Action Details
                                                                </h3>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        </div>

                    </React.Fragment>
                );
            })}

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