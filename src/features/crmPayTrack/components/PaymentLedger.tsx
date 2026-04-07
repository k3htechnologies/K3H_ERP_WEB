import type {
    FilterWithPaginationPaymentLedger,
    AddUpdatePaymentLedger,
    DeletePaymentLedgerRequest,
    PaymentLedgerData,
    PaymentLedgerSummaryModelData,
} from "@/features/crmPayTrack/models/PaymentLedgerModel";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { runApiWithLoader } from "@/core/utils";
import { paymentLedgerService } from "@/features/crmPayTrack/services/PaymentLedgerService";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import {
    convert_dd_mm_yyyy_To_Yyyy_mm_dd,
    formatDate_dd_mm_yyyy,
    formatDate_dd_MonthName_yy,
    formatDate_dd_MonthName_yy_hh_mm,
} from "@/core/utils/dateFormat";
import { Modal } from "@/ui/components/Modal/Modal";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { PAYMENT_FOR_OPTIONS, PAYMENT_MODE, PAYMENT_RECEIVED_FROM_OPTIONS } from "@/core/constants";
import { Button, Input } from "@/ui/components/forms";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import { usePayTrackBookingListState } from "../context/PayTrackBookingListStateContext";
import DataTableExpandable, { type DataTableExpandableRef } from "@/ui/components/DataTable/DataTableExpandable";
import type { TableColumn } from "@/ui/components/DataTable/DataTable";
import { Edit, Trash2 } from "lucide-react";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { fetchBankListMasterDropdown } from "@/features/bankListMaster/bankListMasterDropDown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchProjectBankDropdown, fetchProjectBankDropdownById } from "@/features/projectMaster/projectBankDropdown";
import type { ProjectWithBankDetails } from "@/features/projectMaster/models/ProjectMasterModel";
import { hasAnyDocumentFile } from "@/core/utils/fileValidation";
import type {
    ModulesApprovalStatusRequest,
    UpdateModulesWorkflowApprovalRequest,
} from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel";
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService";
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import NoDataView from "@/ui/components/NoDataView/NoDataView";

const initialFormState = (): AddUpdatePaymentLedger => ({
    PayTrackPaymentLedgerId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    BookingId: null,
    ProjectId: null,
    BookingOtherChargesId: 0,
    PaymentFor: "",
    PaymentMode: "",
    PaymentReceivedFrom: "",
    ProjectBankListMasterId: 0,
    BankListMasterId: 0,
    ReceivedAmount: 0,
    TransactionChequeDemandDraftNumber: "",
    TransactionChequeDemandDraftURL: null,
    RemoveTransactionChequeDemandDraftURL: "",
    TransactionChequeDemandDraftDate: "",
});

export const PaymentLedger: React.FC = () => {
    const [paymentLedgerList, setPaymentLedgerList] = useState<PaymentLedgerData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const dtRef = useRef<DataTableExpandableRef | null>(null);

    const [formData, setFormData] = useState<AddUpdatePaymentLedger>(() => initialFormState());

    const [documentFiles, setDocumentFiles] = useState<(File | string)[]>([]);
    const [removedDocumentURLs, setRemovedDocumentURLs] = useState<string[]>([]);
    const [documentURL, setDocumentURL] = useState<string>();

    const [editingPaymentLedgerData, setEditingPaymentLedgerData] = useState<PaymentLedgerSummaryModelData | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [deletePaymentLedgerCrmData, setDeletePaymentLedgerCrmData] = useState<PaymentLedgerSummaryModelData | null>(null);

    const [projectWithBankData, setProjectWithBankData] = useState<ProjectWithBankDetails | null>(null);

    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const { canAction } = useMenuPermissions("/payTrack");

    const { projectId } = useProject();

    const { listState } = usePayTrackBookingListState();
    const { bookingId, bookingName, flat, bookingOtherChargesData } = listState;

    const { addToast } = useToast();

    const [dropdownLabels, setDropdownLabels] = useState<{
        projectBankName?: string;
        bankName?: string;
    }>({});

    const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
    const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);

    const [payementFor, setPayementFor] = useState<string | null>("");
    const [receivedAmount, setReceivedAmount] = useState<number | null>(0);

    // APPROVAL ACTION MODAL
    const [isApprovalActionModalOpen, setIsApprovalActionModalOpen] = useState(false);
    const [approvalActionType, setApprovalActionType] = useState<"approve" | "reject">("approve");
    const [approvalRowData, setApprovalRowData] = useState<PaymentLedgerSummaryModelData | null>(null);

    useEffect(() => {
        if (projectId && bookingId) {
            loadPaymentLedger();
        }
    }, [projectId, bookingId]);
    

    useEffect(() => {
        if (isAddUpdateModalOpen) {
            if (editingPaymentLedgerData) {
                setFormData({
                    PayTrackPaymentLedgerId: editingPaymentLedgerData.PayTrackPaymentLedgerId || 0,
                    Uniquekey: editingPaymentLedgerData.Uniquekey || initialFormState().Uniquekey,
                    BookingId: bookingId || 0,
                    ProjectId: Number(projectId),
                    BookingOtherChargesId: editingPaymentLedgerData.BookingOtherChargesId || 0,
                    PaymentFor: editingPaymentLedgerData.PaymentFor || "",
                    PaymentMode: editingPaymentLedgerData.PaymentMode || "",
                    PaymentReceivedFrom: editingPaymentLedgerData.PaymentReceivedFrom || "",
                    ProjectBankListMasterId: editingPaymentLedgerData.ProjectBankListMasterId || 0,
                    BankListMasterId: editingPaymentLedgerData.BankListMasterId || 0,
                    ReceivedAmount: editingPaymentLedgerData.ReceivedAmount || 0,
                    TransactionChequeDemandDraftNumber: editingPaymentLedgerData.TransactionChequeDemandDraftNumber || "",
                    RemoveTransactionChequeDemandDraftURL: editingPaymentLedgerData.TransactionChequeDemandDraftURL || "",
                    TransactionChequeDemandDraftDate: editingPaymentLedgerData.TransactionChequeDemandDraftDate || "",
                });
                setDropdownLabels({
                    projectBankName: editingPaymentLedgerData.ProjectBankName || "",
                    bankName: editingPaymentLedgerData.BankName || "",
                });

                setDocumentFiles([]);
                setDocumentURL(editingPaymentLedgerData.TransactionChequeDemandDraftURL || "");
                setRemovedDocumentURLs([]);

                if (editingPaymentLedgerData.ProjectId) {
                    fetchProjectBankDropdownById(Number(projectId)).then((bank) => {
                        if (!bank) return;
                        setProjectWithBankData(bank);
                    });
                }
            } else {
                setFormData(initialFormState());
            }
            setErrors({});
        }
    }, [isAddUpdateModalOpen, editingPaymentLedgerData, projectId]);

    const loadPaymentLedger = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationPaymentLedger = {
                    ProjectId: Number(projectId),
                    BookingId: bookingId,
                };

                const response = await paymentLedgerService.apiCallPullPaymentLedger(params);

                if (E.isRight(response)) {
                    setPaymentLedgerList(response.right.Data);
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
            "Loading Payment Ledger Details",
        );
    };

    const handleEditPaymentLedger = useCallback((row: PaymentLedgerSummaryModelData) => {
        setEditingPaymentLedgerData({
            ...row,
            BookingOtherChargesId: row.BookingOtherChargesId || 0,
            PaymentFor: row.PaymentFor || "",
            PaymentMode: row.PaymentMode || "",
            PaymentReceivedFrom: row.PaymentReceivedFrom || "",
            ProjectBankListMasterId: row.ProjectBankListMasterId || 0,
            BankListMasterId: row.BankListMasterId || 0,
            ReceivedAmount: row.ReceivedAmount || 0,
            TransactionChequeDemandDraftNumber: row.TransactionChequeDemandDraftNumber || "",
            TransactionChequeDemandDraftDate: row.TransactionChequeDemandDraftDate || "",
        });
        setIsAddUpdateModalOpen(true);
    }, []);

    const handleConfirmationDialogBoxOpen = useCallback((row: PaymentLedgerSummaryModelData) => {
        setDeletePaymentLedgerCrmData(row);
        setIsConfirmationDialogBoxOpen(true);
    }, []);

    const handleApprovalLog = (row: PaymentLedgerSummaryModelData) => {
        const request: ModulesApprovalStatusRequest = {
            ModuleName: "PAY TRACK LEDGER APPROVAL",
            Id: row.PayTrackPaymentLedgerId ?? 0,
            ProjectId: row.ProjectId ?? 0,
        };
        setPayementFor(row.PaymentFor);
        setReceivedAmount(row?.ReceivedAmount);

        setApprovalLogRequest(request);
        setIsApprovalLogModalOpen(true);
    };

    const handleApproveRejectDocument = (row: PaymentLedgerSummaryModelData, approvalType: "approve" | "reject") => {
        setApprovalRowData(row);
        setPayementFor(row.PaymentFor);
        setReceivedAmount(row?.ReceivedAmount);
        setApprovalActionType(approvalType);
        setIsApprovalActionModalOpen(true);
    };

    const totals = useMemo(() => {
        return paymentLedgerList.reduce(
            (acc, row) => {
                const total = row.TotalAmount || 0;
                const paid = row.ReceivedAmount || 0;

                acc.TotalAmount += total;
                acc.ReceivedAmount += paid;
                acc.PendingAmount += (total - paid);
                acc.UploadedPaymentLedgerCount += row.UploadedPaymentLedgerCount || 0;
                acc.ApprovalPendingPaymentLedgerCount += row.ApprovalPendingPaymentLedgerCount || 0;

                return acc;
            },
            {
                TotalAmount: 0,
                ReceivedAmount: 0,
                PendingAmount: 0,
                UploadedPaymentLedgerCount: 0,
                ApprovalPendingPaymentLedgerCount: 0,
            }
        );
    }, [paymentLedgerList]);

    const dataWithTotal = useMemo(() => {
        return [
            ...paymentLedgerList,
            {
                PaymentFor: "TOTAL",
                TotalAmount: totals.TotalAmount,
                ReceivedAmount: totals.ReceivedAmount,
                PendingAmount: totals.PendingAmount,
                UploadedPaymentLedgerCount: totals.UploadedPaymentLedgerCount,
                ApprovalPendingPaymentLedgerCount: totals.ApprovalPendingPaymentLedgerCount,
                isTotal: true,
            }
        ];
    }, [paymentLedgerList, totals]);

    const payTrackPaymentLedgerColumns = useMemo<TableColumn[]>(() => [
        {
            key: "PaymentFor",
            label: "Stage",
            render: (value, row) =>
                row.isTotal ? <b>{value}</b> : value,
        },
        {
            key: "TotalAmount",
            label: "Total Amount",
            align: "right",
            render: (value, row) =>
                row.isTotal
                    ? <b>₹ {value.toLocaleString()}</b>
                    : `₹ ${value.toLocaleString()}`,
        },
        {
            key: "ReceivedAmount",
            label: "Paid Amount",
            align: "right",
            render: (value, row) =>
                row.isTotal
                    ? <b>₹ {value.toLocaleString()}</b>
                    : `₹ ${value.toLocaleString()}`,
        },
        {
            key: "PendingAmount",
            label: "Pending Amount",
            align: "right",
            render: (_, row) => {
                const pending = (row.TotalAmount || 0) - (row.ReceivedAmount || 0);

                return row.isTotal
                    ? <b>₹ {pending.toLocaleString()}</b>
                    : `₹ ${pending.toLocaleString()}`;
            }
        },
        {
            key: "UploadedPaymentLedgerCount",
            label: "Ledger Count",
            align: "right",
            render: (value, row) =>
                row.isTotal ? <b>{value}</b> : value || 0,
        },
        {
            key: "ApprovalPendingPaymentLedgerCount",
            label: "Approval Count",
            align: "center",
            render: (value, row) => {
                if (row.isTotal) {
                    return <b>{value}</b>;
                }

                return (
                    <TooltipText
                        text={`${value || 0} Pending`}
                        maxWidth="180px"
                        tooltipThreshold={18}
                        tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
                    />
                );
            },
        }
    ], []);

    const handlePaymentLedgerCrmModal = () => {
        setProjectWithBankData(null);
        setEditingPaymentLedgerData(null);
        setFormData(initialFormState());
        setErrors({});
        setIsAddUpdateModalOpen(true);
    };

    const validateAddPaymentLedger = (): {
        isValid: boolean;
        errors: { [key: string]: string };
    } => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.PaymentFor?.trim()) {
            newErrors.PaymentFor = "Payment For is required";
        }

        if (formData.PaymentFor?.trim() !== "" && formData.PaymentFor?.trim()?.toUpperCase().includes("OTHER CHARGES") && !formData.BookingOtherChargesId) {
            newErrors.BookingOtherChargesId = "Other Charge is required";
        }

        if (!formData.PaymentMode?.trim()) {
            newErrors.PaymentMode = "Payment Mode is required";
        }

        if (!formData.BankListMasterId || formData.BankListMasterId === 0) {
            newErrors.BankListMasterId = "Bank Name is required";
        }

        if (!formData.PaymentReceivedFrom?.trim()) {
            newErrors.PaymentReceivedFrom = "Payment Received From is required";
        }

        if (!formData.ReceivedAmount) {
            newErrors.ReceivedAmount = "Received Amount is required";
        } else if (formData.ReceivedAmount <= 0) {
            newErrors.ReceivedAmount = "Received Amount cannot be zero or negative";
        }

        if (!formData.TransactionChequeDemandDraftNumber) {
            newErrors.TransactionChequeDemandDraftNumber = "Transaction / Cheque / Demand Draft Number is required";
        }

        if (!formData.TransactionChequeDemandDraftDate) {
            newErrors.TransactionChequeDemandDraftDate = "Transaction / Cheque / Demand Draft Date is required";
        }

        if (!hasAnyDocumentFile(documentFiles, documentURL, removedDocumentURLs)) {
            newErrors.documentFiles = "Transaction / Cheque / Demand Draft Image is required.";
        }

        if (!formData.ProjectBankListMasterId || formData.ProjectBankListMasterId === 0) {
            newErrors.ProjectBankListMasterId = "Project Bank Name is required";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const pushAddPaymentLedgerData = (): FormData => {

        setPayementFor(formData.PaymentFor);

        const fd = new FormData();
        fd.append("PayTrackPaymentLedgerId", formData.PayTrackPaymentLedgerId.toString());
        fd.append("Uniquekey", formData.Uniquekey);
        fd.append("BookingId", String(bookingId));
        fd.append("ProjectId", String(formData.ProjectId ?? projectId));
        fd.append("BookingOtherChargesId", formData.PaymentFor?.toUpperCase().includes("OTHER CHARGES") ? formData.BookingOtherChargesId?.toString() || "" : "0");
        fd.append("PaymentFor", formData.PaymentFor);
        fd.append("PaymentMode", formData.PaymentMode);
        fd.append("PaymentReceivedFrom", formData.PaymentReceivedFrom);
        fd.append("ProjectBankListMasterId", formData.ProjectBankListMasterId.toString());
        fd.append("BankListMasterId", formData.BankListMasterId.toString());
        fd.append("ReceivedAmount", formData.ReceivedAmount.toString());
        fd.append("TransactionChequeDemandDraftNumber", formData.TransactionChequeDemandDraftNumber);

        documentFiles.forEach((file) => {
            if (file instanceof File) {
                fd.append("TransactionChequeDemandDraftURL", file);
            }
        });

        fd.append("RemoveTransactionChequeDemandDraftURL", removedDocumentURLs.join(","));

        fd.append("TransactionChequeDemandDraftDate", formData.TransactionChequeDemandDraftDate);
        return fd;
    };

    const handleFieldChange = (field: keyof AddUpdatePaymentLedger, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleAddPaymentLedger = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({});

        const validation = validateAddPaymentLedger();

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const payload = pushAddPaymentLedgerData();

                const response = await paymentLedgerService.apiCallAddUpdatePaymentLedger(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    const parentKey = formData.PaymentFor ?? "";

                    await loadPaymentLedger();

                    dtRef.current?.collapseAll?.();

                    if (parentKey) {
                        setTimeout(() => {
                            dtRef.current?.expandRow?.(parentKey);
                        }, 50);
                    }

                    setFormData(initialFormState());
                    setDocumentFiles([]);
                    setDocumentURL("");
                    setRemovedDocumentURLs([]);

                } else {
                    addToast({ type: "error", title: response.left?.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message });
            },
            undefined,
            Number(formData.PayTrackPaymentLedgerId) === 0 ? "Add Ledger" : "Update Ledger",
        );
    };

    const handleDeleteDialogClose = useCallback(() => {
        setIsConfirmationDialogBoxOpen(false);
        setDeletePaymentLedgerCrmData(null);
    }, [setIsConfirmationDialogBoxOpen, setDeletePaymentLedgerCrmData]);

    const handleDeletePaymentLedgerCrm = async () => {
        setIsConfirmationDialogBoxOpen(false);

        if (!deletePaymentLedgerCrmData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeletePaymentLedgerRequest = {
                    PayTrackPaymentLedgerId: deletePaymentLedgerCrmData?.PayTrackPaymentLedgerId || 0,

                    Uniquekey: deletePaymentLedgerCrmData?.Uniquekey || "",

                    ProjectId: deletePaymentLedgerCrmData?.ProjectId || 0,
                };

                const response = await paymentLedgerService.apiCallDeletePaymentLedgerCrm(params);

                if (E.isRight(response)) {
                    const parentKey = deletePaymentLedgerCrmData.PaymentFor;

                    await loadPaymentLedger();

                    dtRef.current?.collapseAll?.();

                    setTimeout(() => {
                        dtRef.current?.expandRow?.(parentKey);
                    }, 50);

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsConfirmationDialogBoxOpen(false);

                    setDeletePaymentLedgerCrmData(null);
                } else {
                    addToast({ type: "error", title: response.left.message });
                    setIsConfirmationDialogBoxOpen(false);
                }
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Deleting Payment Ledger",
        );
    };

    const fetchProjectBankList = useCallback(
        async (page: number) => {
            return fetchProjectBankDropdown(page, {
                projectId: Number(projectId),
            });
        },
        [projectId],
    );

    const handleApprovalSubmit = async (remark: string) => {
        if (!approvalRowData) return;

        const payload: UpdateModulesWorkflowApprovalRequest = {
            ModuleName: "PAY TRACK LEDGER APPROVAL",
            Id: approvalRowData.PayTrackPaymentLedgerId ?? 0,
            ProjectId: approvalRowData.ProjectId ?? 0,
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

                    const parentKey = approvalRowData.PaymentFor;

                    await loadPaymentLedger();

                    dtRef.current?.collapseAll?.();

                    setTimeout(() => {
                        dtRef.current?.expandRow?.(parentKey);
                    }, 50);
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
            approvalActionType === "approve" ? "Approving Booking" : "Rejecting Booking",
        );
    };

    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}>
                {" "}
                <div></div>{" "}
            </Loader>

            <TableActionToolbar
                isShowSearchBar={false}
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handlePaymentLedgerCrmModal} />

            <DataTableExpandable
                ref={dtRef}
                data={dataWithTotal}
                columns={payTrackPaymentLedgerColumns}
                emptyMessage="No Payment Ledger Found"
                loading={isLoading}
                fixedHeight
                recordsPerPage={20}
                expandable={
                    {

                        keyField: "PaymentFor",
                        alwaysFetchOnOpen: true,

                        fetchRow: async (row) => {

                            if (!row || row.isTotal || !row.PaymentFor) {
                                console.log("Invalid row:", row);
                                return [];
                            }


                            const paymentFor = row?.PaymentFor || "";

                            console.log("API PaymentFor:", paymentFor);

                            setIsLoading(true);

                            setLoadingMessage("Loading Payment Ledger");

                            const params: FilterWithPaginationPaymentLedger = {
                                ProjectId: Number(projectId),
                                BookingId: bookingId,
                                PaymentFor: paymentFor,
                            };

                            const response = await paymentLedgerService.apiCallPullPaymentLedgerSummary(params);

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
                                        const showEdit = canAction && !row.ApprovalStatus?.toUpperCase().includes("APPROVED") ? true : false;
                                        return (
                                            <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                                <div className="flex justify-between items-center">

                                                    <div className="text-sm text-gray-700">
                                                        <FieldItem label="Amount" value={`₹ ${row.ReceivedAmount || 0}`} urls={row.PaymentReceiptURL} isRow isIcon={true} />
                                                        <FieldItem label="Payment Mode" value={row.PaymentMode || "-"} isRow />
                                                        {row.ChargeName !== "" && <FieldItem label="Other Charges" value={row.ChargeName || "-"} isRow />}
                                                    </div>

                                                    <div className="flex items-center gap-2">

                                                        <ApprovalActions
                                                            approvalStatus={row.ApprovalStatus || "-"}
                                                            showApproval={row.IsApproval}
                                                            isIcons={true}
                                                            onHistory={() => handleApprovalLog(row)}
                                                            onApprove={() => handleApproveRejectDocument(row, "approve")}
                                                            onReject={() => handleApproveRejectDocument(row, "reject")}
                                                        />

                                                        <Button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                if (!showEdit) return;
                                                                handleEditPaymentLedger(row);
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
                                                            title="Edit"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>

                                                        <Button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                if (!showEdit) return;
                                                                handleConfirmationDialogBoxOpen(row);
                                                            }}
                                                            color="transparent"
                                                            isborderRadius
                                                            disabled={!showEdit}
                                                            size="sm"
                                                            style={{
                                                                color: showEdit ? "red" : "#9CA3AF",
                                                                cursor: showEdit ? "pointer" : "not-allowed",
                                                                opacity: showEdit ? 1 : 0.5,
                                                            }}
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>


                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-6 text-sm pt-5">

                                                    <div className="space-y-3">
                                                        <h3 className="font-semibold mb-2">Our Bank Details</h3>

                                                        <FieldItem label="Account Number" value={row.ProjectAccountNumber || "-"} isRow={false} />
                                                        <FieldItem label="Bank Name" value={row.ProjectBankName || "-"} isRow={false} />
                                                        <FieldItem label="IFSC Code" value={row.ProjectIFSCCode || "-"} isRow={false} />
                                                    </div>

                                                    <div className="space-y-3">
                                                        <h3 className="font-semibold mb-2">Opposite Party Bank Details</h3>

                                                        <FieldItem label="Bank" value={row.BankName || "-"} />

                                                        <FieldItem
                                                            label="Transaction / Cheque / Demand Draft No"
                                                            urls={row.TransactionChequeDemandDraftURL}
                                                            value={row.TransactionChequeDemandDraftNumber || "-"}
                                                        />

                                                        <FieldItem
                                                            label="Transaction / Cheque / Demand Draft Date"
                                                            value={formatDate_dd_MonthName_yy(row.TransactionChequeDemandDraftDate) || "-"}
                                                        />
                                                    </div>

                                                    <div className="space-y-3">
                                                        <h3 className="font-semibold mb-2">Other</h3>

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

            <Modal
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                    setFormData(initialFormState());
                    setErrors({});
                    setDocumentFiles([]);
                    setDocumentURL("");
                    setRemovedDocumentURLs([]);
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                    setFormData(initialFormState());
                    setErrors({});
                    setDocumentFiles([]);
                    setDocumentURL("");
                    setRemovedDocumentURLs([]);
                }}
                onSubmit={handleAddPaymentLedger}
                saveText={editingPaymentLedgerData ? "Update" : "Add"}
                loading={isLoading}
                size="small50"
                title={editingPaymentLedgerData ? "Update Payment Ledger" : "Add Payment Ledger"}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <SinglePageSelection
                                label="Payment For"
                                required
                                placeholder="Select Payment For"
                                value={formData.PaymentFor || ""}

                                onChange={(item) => {
                                    if (!item) {
                                        handleFieldChange("PaymentFor", "");
                                        handleFieldChange("BookingOtherChargesId", 0);

                                        return;
                                    }

                                    const selected = PAYMENT_FOR_OPTIONS.find(x => x.id === item);
                                    handleFieldChange("PaymentFor", selected?.name || "");
                                    handleFieldChange("BookingOtherChargesId", 0);
                                }}

                                options={PAYMENT_FOR_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                                error={errors.PaymentFor}
                            />
                        </div>
                        {formData.PaymentFor?.toUpperCase().includes("OTHER CHARGES") && (
                            <div>
                                <SinglePageSelection
                                    label="Other Charges"
                                    placeholder="Select Other Charges"
                                    required
                                    value={formData.BookingOtherChargesId ?? 0}
                                    onChange={(e) => handleFieldChange("BookingOtherChargesId", String(e))}
                                    options={(bookingOtherChargesData || []).map((opt) => ({
                                        label: opt.ChargeName || "",
                                        value: String(opt.BookingOtherChargesId),
                                    }))}
                                    error={errors.BookingOtherChargesId} />


                            </div>
                        )}
                        <div>
                            <SinglePageSelection
                                label="Payment Mode"
                                required
                                placeholder="Select Payment Mode"
                                value={formData.PaymentMode || ""}
                                onChange={(e) => handleFieldChange("PaymentMode", String(e))}
                                options={PAYMENT_MODE.map((opt) => ({ label: opt.name, value: opt.id }))}
                                error={errors.PaymentMode}
                            />
                        </div>
                        <div>
                            <SingleSelectDropdownWithPagination
                                label="Bank Name"
                                required
                                title="Select Bank Name"
                                size="lg"
                                dataFetchCallBack={fetchBankListMasterDropdown}
                                onSelected={(item) => {
                                    if (!item) {
                                        handleFieldChange("BankListMasterId", null);
                                        return;
                                    }

                                    handleFieldChange("BankListMasterId", Number(item.value));
                                }}
                                initialValue={createDropdownInitialValue(formData.BankListMasterId, dropdownLabels.bankName)}
                                error={errors.BankListMasterId}
                            />
                        </div>
                        <div>
                            <SinglePageSelection
                                label="Payment Received From"
                                required
                                placeholder="Select Payment Received From"
                                value={formData.PaymentReceivedFrom || ""}
                                onChange={(e) => handleFieldChange("PaymentReceivedFrom", String(e))}
                                options={PAYMENT_RECEIVED_FROM_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                                error={errors.PaymentReceivedFrom}
                            />
                        </div>

                        <div>
                            <Input
                                label="Received Amount (₹)"
                                placeholder="Enter Received Amount (₹)"
                                required
                                value={formData.ReceivedAmount || ""}
                                onChange={(e) => handleFieldChange("ReceivedAmount", Number(e.target.value))}
                                rightIcon="₹"
                                error={errors.ReceivedAmount}
                            />
                        </div>
                        <div>
                            <Input
                                label="Transaction / Cheque / Demand Draft No."
                                placeholder="Enter Transaction / Cheque / Demand Draft No."
                                required
                                value={formData.TransactionChequeDemandDraftNumber || ""}
                                onChange={(e) => handleFieldChange("TransactionChequeDemandDraftNumber", e.target.value)}
                                error={errors.TransactionChequeDemandDraftNumber}
                            />
                        </div>
                        <div>
                            <MultiFilePicker
                                label="Transaction / Cheque / Demand Draft Image"
                                placeholder="Select Transaction / Cheque / Demand Draft Image"
                                required
                                value={documentFiles}
                                onChange={(files) => {
                                    setDocumentFiles(files);
                                    if (errors.documentFiles) {
                                        setErrors((prev) => ({ ...prev, documentFiles: "" }));
                                    }
                                }}
                                availableFilesURL={documentURL ?? ""}
                                allowedTypes={["image/jpeg", "image/png", "application/pdf"]}
                                onRemoveExisting={(url) => {
                                    setRemovedDocumentURLs((prev) => [...prev, url]);
                                }}
                                error={errors.documentFiles}
                            />
                        </div>
                        <div>
                            <DatePickerInput
                                label="Transaction / Cheque / Demand Draft Date"
                                required
                                value={formatDate_dd_mm_yyyy(formData.TransactionChequeDemandDraftDate)}
                                onChange={(val) => handleFieldChange("TransactionChequeDemandDraftDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                error={errors.TransactionChequeDemandDraftDate}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-5">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Our Bank Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            <div>
                                <SingleSelectDropdownWithPagination
                                    label="Project Bank Name"
                                    required
                                    title="Select Project Bank Name"
                                    size="lg"
                                    dataFetchCallBack={fetchProjectBankList}
                                    onSelected={(item) => {
                                        if (!item) {
                                            handleFieldChange("ProjectBankListMasterId", null);
                                            setProjectWithBankData(null);
                                            return;
                                        }

                                        setProjectWithBankData(item as unknown as ProjectWithBankDetails);

                                        handleFieldChange("ProjectBankListMasterId", Number(item.value));
                                    }}
                                    initialValue={createDropdownInitialValue(formData.ProjectBankListMasterId, dropdownLabels.projectBankName)}
                                    error={errors.ProjectBankListMasterId}
                                />
                            </div>
                            {projectWithBankData && (
                                <>
                                    <div>
                                        <Input
                                            label="Account Number"
                                            placeholder="Enter Account Number"
                                            value={projectWithBankData?.AccountNumber || ""}
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <Input label="IFSC Code" placeholder="Enter IFSC Code" value={projectWithBankData?.IFSCCode || ""} disabled />
                                    </div>
                                    <div>
                                        <Input label="Branch" placeholder="Enter Branch" value={projectWithBankData?.Branch || ""} disabled />
                                    </div>
                                    <div>
                                        <Input label="Account Type" placeholder="Enter Account Type" value={projectWithBankData?.AcType || ""} disabled />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={handleDeleteDialogClose}
                onConfirm={handleDeletePaymentLedgerCrm}
                loading={isLoading}
                pageName="Bank Document"
            />

            <ApprovalLogModal
                isOpen={isApprovalLogModalOpen}
                title="Payment Ledger"
                titleText={bookingName ?? ""}
                subTitleText={flat ?? ""}
                subSubTitleText={`${payementFor ?? ""} -  ₹${receivedAmount ?? ""}`}
                onClose={() => setIsApprovalLogModalOpen(false)}
                request={approvalLogRequest}
            />

            <ApprovalActionModal
                title="Payment Ledger"
                isOpen={isApprovalActionModalOpen}
                onClose={() => setIsApprovalActionModalOpen(false)}
                actionType={approvalActionType}
                titleText={bookingName ?? ""}
                subTitleText={flat ?? ""}
                subSubTitleText={`${payementFor ?? ""} -  ₹${receivedAmount ?? ""}`}
                onSubmit={handleApprovalSubmit}
                loading={isLoading}
            />
        </div>
    );
};

export default PaymentLedger;
