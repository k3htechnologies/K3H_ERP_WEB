import { runApiWithLoader } from "@/core/utils";
import React, { useCallback, useEffect, useState } from "react";
import { useToast } from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import * as E from 'fp-ts/Either';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { usePayTrackBookingListState } from "@/features/crmPayTrack/context/PayTrackBookingListStateContext";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatCurrency, getSafeString } from '@/core/utils/comman';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import { Button } from "@/ui/components/forms";
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import { useNavigate } from 'react-router-dom';
import type { DeleteRefundAmountDetailsRequest, FilterWithPaginationRefundAmountDetails, RefundAmountDetailsData } from "@/features/crmPayTrack/models/RefundAmountDetailsModel";
import { Edit, Trash2 } from "lucide-react";
import { refundAmountDetailsCrmService } from "@/features/crmPayTrack/services/RefundAmountDetailsCrmService";
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import type { ModulesApprovalStatusRequest, UpdateModulesWorkflowApprovalRequest } from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel";
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal";
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";


export const RefundPaymentLegger: React.FC = () => {

    const [refundedAmountLedgerList, setRefundedAmountLedgerList] = useState<RefundAmountDetailsData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { addToast } = useToast();
    const { projectId } = useProject();
    const { listState } = usePayTrackBookingListState();
    const { bookingId, bookingName, flat } = listState;
    const navigate = useNavigate();

    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [deleteRefundPaymentLedgerData, setDeleteRefundPaymentLedgerData] = useState<RefundAmountDetailsData | null>(null);

    const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
    const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);

    const [receivedAmount, setReceivedAmount] = useState<number | null>(0);

    const [isApprovalActionModalOpen, setIsApprovalActionModalOpen] = useState(false);
    const [approvalActionType, setApprovalActionType] = useState<"approve" | "reject">("approve");
    const [approvalRowData, setApprovalRowData] = useState<RefundAmountDetailsData | null>(null);

    const { canAction } = useMenuPermissions('/modificationRequest');

    useEffect(() => {
        if (!projectId || !bookingId) return;

        loadRefundedAmountDetailsHistory();

    }, [projectId, bookingId]);


    const loadRefundedAmountDetailsHistory = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationRefundAmountDetails = {
                    ProjectId: Number(projectId),
                    BookingId: bookingId,
                };

                const response = await refundAmountDetailsCrmService.apiCallPullRefundAmountDetails(params);

                if (E.isRight(response)) {

                    setRefundedAmountLedgerList(response.right.Data);

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
            "Loading Refunded Amount Details"
        )

    }

    const handleConfirmationDialogBoxOpen = useCallback((row: RefundAmountDetailsData) => {
        setDeleteRefundPaymentLedgerData(row);
        setIsConfirmationDialogBoxOpen(true);
    }, []);


    const handleDeleteDialogClose = useCallback(() => {
        setIsConfirmationDialogBoxOpen(false);
        setDeleteRefundPaymentLedgerData(null);
    }, [setIsConfirmationDialogBoxOpen, setDeleteRefundPaymentLedgerData]);

    const handleDeleteRefundPaymentLedger = async () => {
        setIsConfirmationDialogBoxOpen(false);

        if (!deleteRefundPaymentLedgerData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: DeleteRefundAmountDetailsRequest = {

                    RefundedAmountLedgerId: deleteRefundPaymentLedgerData?.RefundedAmountLedgerId || 0,

                    Uniquekey: deleteRefundPaymentLedgerData?.Uniquekey || "",

                    ProjectId: deleteRefundPaymentLedgerData?.ProjectId || 0,

                    BookingId: deleteRefundPaymentLedgerData?.BookingId || 0,
                };

                const response = await refundAmountDetailsCrmService.apiCallDeleteRefundAmountDetails(params);

                if (E.isRight(response)) {

                    setRefundedAmountLedgerList(prev =>
                        prev.filter(
                            item =>
                                item.RefundedAmountLedgerId !== deleteRefundPaymentLedgerData.RefundedAmountLedgerId
                        )
                    );


                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsConfirmationDialogBoxOpen(false);

                    setDeleteRefundPaymentLedgerData(null);

                } else {
                    addToast({ type: "error", title: response.left.message });
                    setIsConfirmationDialogBoxOpen(false);
                }
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Deleting Refunded Payment Ledger",
        );
    };

    const handleApprovalLog = (row: RefundAmountDetailsData) => {
        const request: ModulesApprovalStatusRequest = {
            ModuleName: "REFUND PAYMENT LEDGER APPROVAL",
            Id: row.BookingId ?? 0,
            SubId: row.RefundedAmountLedgerId ?? 0,
            ProjectId: row.ProjectId ?? 0,
        };
        setReceivedAmount(row?.RefundedAmount);

        setApprovalLogRequest(request);
        setIsApprovalLogModalOpen(true);
    };

    const handleApproveRejectDocument = (row: RefundAmountDetailsData, approvalType: "approve" | "reject") => {
        setApprovalRowData(row);
        setReceivedAmount(row?.RefundedAmount);
        setApprovalActionType(approvalType);
        setIsApprovalActionModalOpen(true);
    };

    const handleApprovalSubmit = async (remark: string) => {
        if (!approvalRowData) return;

        const payload: UpdateModulesWorkflowApprovalRequest = {
            ModuleName: "REFUND PAYMENT LEDGER APPROVAL",
            Id: approvalRowData.BookingId ?? 0,
            SubId: approvalRowData.RefundedAmountLedgerId ?? 0,
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

                    await loadRefundedAmountDetailsHistory();

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
            approvalActionType === "approve" ? "Approving Refunded Payment Ledger" : "Rejecting Refunded Payment Ledger",
        );
    };

    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>
            <div className="pt-5 space-y-4">

                {refundedAmountLedgerList.length > 0 ? (

                    refundedAmountLedgerList.map((data, index) => {

                        const showEditDelete = canAction && !data.ApprovalStatus?.toUpperCase().includes("APPROVED") ? true : false;

                        return (
                            <div key={data.RefundedAmountLedgerId || index} className="bg-white border border-gray-200 rounded-lg p-4 px-6 py-4">
                                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                    <div className="gap-6 text-sm text-gray-700">
                                        <FieldItem label="Refunded Amount" value={formatCurrency(data.RefundedAmount)} isRow />
                                        <FieldItem label="Payment Mode" value={getSafeString(data.PaymentMode ?? '-')} isRow />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ApprovalActions
                                            approvalStatus={data.ApprovalStatus || "-"}
                                            showApproval={data.IsApproval}
                                            isIcons={true}
                                            onHistory={() => handleApprovalLog(data)}
                                            onApprove={() => handleApproveRejectDocument(data, "approve")}
                                            onReject={() => handleApproveRejectDocument(data, "reject")}
                                        />

                                        <Button

                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (!showEditDelete) return;
                                                navigate('/payTrack/view/addRefundDetails', { state: { refundData: data } });
                                            }}
                                            color="transparent"
                                            isborderRadius
                                            disabled={!showEditDelete}
                                            size="sm"
                                            style={{
                                                color: showEditDelete ? "" : "#9CA3AF",
                                                cursor: showEditDelete ? "pointer" : "not-allowed",
                                                opacity: showEditDelete ? 1 : 0.5,
                                            }}
                                            title="Edit">
                                            <Edit className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (!showEditDelete) return;
                                                handleConfirmationDialogBoxOpen(data);
                                            }}
                                            color="transparent"
                                            isborderRadius
                                            disabled={!showEditDelete}
                                            size="sm"
                                            style={{
                                                color: showEditDelete ? "red" : "#9CA3AF",
                                                cursor: showEditDelete ? "pointer" : "not-allowed",
                                                opacity: showEditDelete ? 1 : 0.5,
                                            }}
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm pt-5 border-b border-gray-200 pb-3">

                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-gray-900 mb-2">Payment Details</h3>



                                        <FieldItem label="Payment Mode" value={getSafeString(data.PaymentMode ?? '-')} />
                                        <FieldItem label="Refunded Amount (₹)" value={formatCurrency(data.RefundedAmount ?? '0')} />

                                        <FieldItem label="Transaction / Cheque / Demand Draft No." value={getSafeString(data.TransactionChequeDemandDraftNumber ?? '-')} urls={data.TransactionChequeDemandDraftURL} isIcon />
                                        <FieldItem label="Transaction / Cheque / Demand Draft Date" value={formatDate_dd_MonthName_yy(data.TransactionChequeDemandDraftDate ?? '') || '-'} />


                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-gray-900 mb-2">Developers Bank Details</h3>
                                        <FieldItem label="Project Bank name" value={getSafeString(data.ProjectBankName ?? '-')} isRow={false} />
                                        <FieldItem label="Account Number" value={getSafeString(data.ProjectAccountNumber ?? '-')} isRow={false} />
                                        <FieldItem label="IFSC Code" value={getSafeString(data.ProjectIFSCCode ?? '-')} isRow={false} />
                                        <FieldItem label="Nature Of Account" value={data.ProjectNatureOfAccount || "-"} isRow={false} />
                                        <FieldItem label="Account Type" value={data.ProjectAcType || "-"} isRow={false} />
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-gray-900 mb-2">Customers Bank Details</h3>
                                        <FieldItem label="Account Holder Name" value={getSafeString(data.AccountHolderName ?? '-')} />
                                        <FieldItem label="Bank Name" value={getSafeString(data.BankName ?? '-')} />
                                        <FieldItem label="Account Number" value={getSafeString(data.AccountNumber ?? '-')} />
                                        <FieldItem label="IFSC Code" value={getSafeString(data.IFSCCode ?? '-')} />

                                    </div>


                                </div>

                                <h3 className="font-semibold text-gray-900 pt-5 text-sm">Action Details</h3>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm pt-2">
                                    <FieldItem label="Created By" value={data?.CreatedBy ?? "-"} isRow={false} />
                                    <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy_hh_mm(data?.CreatedDate ?? "-")} isRow={false} />
                                    <FieldItem label="Modified By" value={data?.ModifiedBy ?? "-"} isRow={false} />
                                    <FieldItem label="Modified Date" value={formatDate_dd_MonthName_yy_hh_mm(data?.ModifiedDate ?? "-")} isRow={false} />
                                </div>
                            </div>
                        )
                    })


                ) : (

                    <section className="md:col-span-4 bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                        <NoDataView message='No refunded amount details history found' />
                    </section>
                )}

            </div>

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={handleDeleteDialogClose}
                onConfirm={handleDeleteRefundPaymentLedger}
                loading={isLoading}
                pageName="Refunded Payment Ledger"
            />

            <ApprovalLogModal
                isOpen={isApprovalLogModalOpen}
                title="Refunded Payment Ledger"
                titleText={bookingName ?? ""}
                subTitleText={flat ?? ""}
                subSubTitleText={`₹${receivedAmount ?? ""}`}
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
                subSubTitleText={`₹${receivedAmount ?? ""}`}
                onSubmit={handleApprovalSubmit}
                loading={isLoading}
            />
        </div>
    )
}

export default RefundPaymentLegger