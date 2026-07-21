import { useCallback, useEffect, useMemo, useState } from "react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { useNavigate, useParams } from "react-router-dom";
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { Loader } from "@/core/utils/loader";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import type { FilterWithPaginationMaterialRequisitionGRN, MaterialRequisitionDetailGRNData, MaterialRequisitionGRNData } from "@/features/materialRequisition/models/MaterialRequisitionGRNModel";
import { materialRequisitionGRNService } from "@/features/materialRequisition/services/MaterialRequisitionGRNService";
import type { TableColumn } from "@/ui/components/DataTable/DataTable";
import { materialRequisitionInvoiceService } from "@/features/materialRequisition/services/MaterialRequisitionInvoiceService";
import type { FilterWithPaginationMaterialRequisitionInvoice, MaterialRequisitionInvoiceData } from "@/features/materialRequisition/models/MaterialRequisitionInvoiceModel";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { Button } from "@/ui/components/forms";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { DataTableWithHeadColor } from "@/ui/components/DataTable/DataTableWithHeadColor";
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import type { ModulesApprovalStatusRequest, UpdateModulesWorkflowApprovalRequest } from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel";
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import type { FilterWithPaginationMaterialRequisitionPayment, MaterialRequisitionPaymentData } from "@/features/materialRequisition/models/MaterialRequisitionPaymentModel";
import { materialRequisitionPaymentService } from "@/features/materialRequisition/services/MaterialRequisitionPaymentService";
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal";
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService";

const InvoicePayment: React.FC = () => {

    const [materialRequisitionGRNData, setMaterialRequisitionGRNData] = useState<MaterialRequisitionGRNData | null>(null);
    const [matrialRequisitionDetailGRNData, setMaterialRequisitionDetailGRNData] = useState<MaterialRequisitionDetailGRNData[]>([]);
    const [invoiceData, setInvoiceData] = useState<MaterialRequisitionInvoiceData | null>(null);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { projectId } = useProject();
    const { addToast } = useToast();
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { MaterialRequisitionGRNId } = useParams<{ MaterialRequisitionGRNId?: string; }>();
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;
    const currentUniquekey = listState.Uniquekey
    const systemGeneratedCode = listState.SystemGeneratedCode;
    const navigate = useNavigate();
    const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
    const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
    const [isApprovalActionModalOpen, setIsApprovalActionModalOpen] = useState(false);
    const [approvalActionType, setApprovalActionType] = useState<"approve" | "reject">("approve");
    const [paymentData, setPaymentData] = useState<MaterialRequisitionPaymentData[]>([]);
    const [invoiceNumber, setInvoiceNumber] = useState<string | null>("");

    useEffect(() => {
        if (!projectId) return;

        loadmaterialRequisitionGRNData();
        loadInvoiceData();
    }, [projectId, currentMaterialRequisitionId]);

    const handleMakePayment = useCallback((row: MaterialRequisitionInvoiceData) => {
        navigate(`/makePayment/add/${row.MaterialRequisitionInvoiceId}`);
    }, [navigate]);

    const handleApproveRejectInvoice = (row: MaterialRequisitionInvoiceData, approvalType: "approve" | "reject") => {
        setInvoiceNumber(row.InvoiceNumber);
        setApprovalActionType(approvalType);
        setIsApprovalActionModalOpen(true);
    };

    const handleApprovalLog = (row: MaterialRequisitionInvoiceData) => {
        const request: ModulesApprovalStatusRequest = {
            ModuleName: "ADD INVOICE",
            Id: currentMaterialRequisitionId ?? 0,
            SubId: row.MaterialRequisitionInvoiceId ?? 0,
            ProjectId: projectId ?? 0,
        };

        setInvoiceNumber(row.InvoiceNumber);
        setApprovalLogRequest(request);
        setIsApprovalLogModalOpen(true);
    };

    const loadmaterialRequisitionGRNData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisitionGRN = {
                    ProjectId: Number(projectId),
                    MaterialRequisitionId: currentMaterialRequisitionId,
                    Uniquekey: currentUniquekey,
                    MaterialRequisitionGRNId: MaterialRequisitionGRNId ? Number(MaterialRequisitionGRNId) : 0,
                };

                const response = await materialRequisitionGRNService.apiCallPullMaterialRequisitionGRN(params);

                if (E.isRight(response)) {

                    const data = response.right.Data;

                    setMaterialRequisitionGRNData(Array.isArray(data) ? (data[0] ?? null) : data);

                    const Item = Array.isArray(data) ? data[0] : data;

                    setMaterialRequisitionDetailGRNData(Item?.MaterialRequisitionDetailGRNData ?? []);
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
            "Loading GRN Data",
        );
    };

    const handleApprovalSubmit = async (remark: string) => {

        if (!invoiceData) return;

        const payload: UpdateModulesWorkflowApprovalRequest = {
            ModuleName: "MATERIAL REQUISITION",
            Id: currentMaterialRequisitionId ?? 0,
            SubId: invoiceData.MaterialRequisitionInvoiceId ?? 0,
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

                    await loadInvoiceData();

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

    const loadInvoiceData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisitionInvoice = {
                    PageNumber: 1,
                    PageSize: 1,
                    ProjectId: Number(projectId),
                    MaterialRequisitionId: currentMaterialRequisitionId,
                    Uniquekey: currentUniquekey,
                    MaterialRequisitionGRNId: MaterialRequisitionGRNId ? Number(MaterialRequisitionGRNId) : 0,
                };

                const response = await materialRequisitionInvoiceService.apiCallPullMaterialRequisitionInvoice(params);

                if (E.isRight(response)) {

                    const data = response.right.Data;

                    const invoice = Array.isArray(data) ? (data[0] ?? null) : data;

                    setInvoiceData(invoice);

                    if (invoice?.MaterialRequisitionInvoiceId) {
                        await loadPaymentData(invoice.MaterialRequisitionInvoiceId);
                    }

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

    const loadPaymentData = async (invoiceId: number) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisitionPayment = {
                    PageNumber: 1,
                    PageSize: 1,
                    ProjectId: Number(projectId),
                    MaterialRequisitionId: currentMaterialRequisitionId,
                    MaterialRequisitionInvoiceId: invoiceId,
                };

                const response = await materialRequisitionPaymentService.apiCallPullMaterialRequisitionPayment(params);

                if (E.isRight(response)) {

                    setPaymentData(response.right.Data);

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
            "Loading Payment",
        );
    };

    const MaterialRequisitionDetailColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'MaterialName',
            label: 'Material Name',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => value || '-'
        },
        {
            key: 'SubMaterialName',
            label: 'Sub-Material',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value?: string) => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="180px"
                    tooltipThreshold={18}
                />
            )
        },
        {
            key: 'MaterialQuantity',
            label: 'Quantity',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => value || '-'
        },
    ], []);

    const InvoiceAmount = invoiceData?.InvoiceAmount ? Number(invoiceData.InvoiceAmount) : 0;

    const amountPaid = invoiceData?.InvoiceAmountPaidTillDate ? Number(invoiceData.InvoiceAmountPaidTillDate) : 0;

    const PendingAmount = Math.max(0, InvoiceAmount - amountPaid);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <Loader loading={isLoading} title={loadingMessage}>{" "} <div></div>{" "}</Loader>

            <div className="pb-4">
                <HeaderActionBar
                    titleText={'Make Payment :'}
                    subTitleText={systemGeneratedCode ?? "-"}
                    cancelText="Cancel"
                    onCancel={() =>
                        navigate("/materialRequisition/view", {
                            state: { activeTab: "Invoice" }
                        })}
                />
            </div>

            <div className="gap-x-4 bg-[#EFF6FF] rounded-lg shadow-sm border border-gray-300 p-4 mb-4">
                <div className="lg:col-span-5 pb-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FieldItem label="Date" value={formatDate_dd_MonthName_yy(materialRequisitionGRNData?.CreatedDate ?? '')} />
                        <FieldItem label="Challan No." value={materialRequisitionGRNData?.ChallanNumber} />
                        <FieldItem label="Vehicle No." value={materialRequisitionGRNData?.VehicleNumber} />

                    </div>
                </div>

                <DataTableWithHeadColor
                    columns={MaterialRequisitionDetailColumns}
                    data={matrialRequisitionDetailGRNData}
                    emptyMessage="No Material Requisition Found"
                    fixedHeight={true}
                    recordsPerPage={3}
                    className="flex-1"
                />
            </div>

            <div className="gap-x-4 rounded-lg shadow-sm border border-gray-300 p-4 mb-4">
                <div className="flex justify-between items-start">

                    <div className="text-sm font-medium text-[#1D1D1D80] truncate">
                        Invoice Number :
                        <span className="text-md text-gray-900"> {invoiceData?.InvoiceNumber}</span>
                    </div>

                    <div className="flex justify-between gap-2 pb-4">
                        <ApprovalActions
                            approvalStatus={invoiceData?.InvoiceStatus}
                            onApprove={() => handleApproveRejectInvoice(invoiceData as MaterialRequisitionInvoiceData, "approve")}
                            onReject={() => handleApproveRejectInvoice(invoiceData as MaterialRequisitionInvoiceData, "reject")}
                            showApproval={invoiceData?.IsApproval}
                            isIcons={true}
                            onHistory={() => handleApprovalLog(invoiceData as MaterialRequisitionInvoiceData)}
                        />

                        {PendingAmount === 0 ? (
                            <div>
                                <span className="border border-green-300 bg-green-100 text-green-600 font-semibold px-4 py-2 rounded-md inline-block">Paid</span>
                            </div>
                        ) : (
                            <Button
                                size="mxs"
                                color="transparent"
                                onClick={() => handleMakePayment(invoiceData as MaterialRequisitionInvoiceData)}

                                style={{
                                    color: '#FFFFFF',
                                    padding: '4px 8px',
                                    backgroundColor: '#135BEC'
                                }}                    >
                                Make Payment
                            </Button>
                        )}

                    </div>
                </div>

                <div className="lg:col-span-5 pb-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FieldItem label="Invoice Amount" value={`₹ ${invoiceData?.InvoiceAmount?.toFixed(2)}`} />
                        <FieldItem label="Invoice Date" value={formatDate_dd_MonthName_yy(invoiceData?.InvoiceDate ?? '')} />
                        <FieldItem label="Due Date" value={formatDate_dd_MonthName_yy(invoiceData?.InvoiceDueDate ?? '')} />

                        {PendingAmount !== 0 && (
                            <FieldItem
                                label="Amount Paid Till Date"
                                value={
                                    <span className="text-green-600 font-semibold">
                                        {`₹ ${invoiceData?.InvoiceAmountPaidTillDate?.toFixed(2)}`}
                                    </span>
                                }
                            />
                        )}

                        <FieldItem label=" Amount to be Paid" value={
                            <span className="text-red-600 font-semibold">
                                {`₹ ${PendingAmount.toFixed(2)}`}
                            </span>
                        } />

                        <div>
                            <p className="text-gray-500">Invoice Document</p>
                            <MultiImageViewer
                                images={parseDocumentUrls(invoiceData?.UploadInvoiceURL)}
                                title="Attachment"
                                isIcon={false}
                                triggerLabel="-"
                            />
                        </div>

                        <div>
                            <p className="text-gray-500">Performance Report</p>
                            <MultiImageViewer
                                images={parseDocumentUrls(invoiceData?.PerformaInvoiceURL)}
                                title="Attachment"
                                isIcon={false}
                                triggerLabel="View"
                            />
                        </div>

                        <div>
                            <p className="text-gray-500">Measurement Report</p>
                            <MultiImageViewer
                                images={parseDocumentUrls(invoiceData?.MeasurementReportURL)}
                                title="Attachment"
                                isIcon={false}
                                triggerLabel="-"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 pt-2 pb-2">
                        <FieldItem label="Remarks" value={invoiceData?.Remarks} />
                    </div>
                </div>

                {paymentData.map((item, index) => (
                    <div className="gap-x-4 rounded-lg border border-gray-200 p-4 mb-4 bg-gray-50">
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 mb-3 ">
                            <FieldItem label="CreatedBy / Date" value={`${item.CreatedBy} ${formatDate_dd_MonthName_yy(item.CreatedDate ?? '')}`} />
                            <FieldItem label="Account Number" value={item.AccountNumber} />
                            <FieldItem label="Bank Name" value={<TooltipText text={item.BankName ?? ''} />} />
                            <FieldItem label="Amount Paid" value={`₹ ${item.AmountPaid?.toFixed(2)}`} />
                            <FieldItem label="TDS Amount" value={`₹ ${item.TDSAmount?.toFixed(2)}`} />
                            <FieldItem label="IFSC Code" value={item.IFSCCode ?? ''} />
                            <FieldItem label="Payment Type" value={item.PaymentType ?? ''} />
                            <FieldItem label="Payment Mode" value={item.PaymentMode ?? ''} />
                            <FieldItem label="Transaction Number" value={item.TransactionNumber ?? ''} />
                            <div>
                                <p className="text-gray-500">Transaction Receipt</p>
                                <MultiImageViewer
                                    images={parseDocumentUrls(item.TransactionReceiptURL)}
                                    title="Attachment"
                                    isIcon={false}
                                    triggerLabel="-"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <ApprovalLogModal
                isOpen={isApprovalLogModalOpen}
                titleText={invoiceNumber ?? ""}
                title='Invoice'
                onClose={() => setIsApprovalLogModalOpen(false)}
                request={approvalLogRequest}
            />

            <ApprovalActionModal
                title='Invoice'
                titleText={invoiceNumber ?? ""}
                isOpen={isApprovalActionModalOpen}
                onClose={() => setIsApprovalActionModalOpen(false)}
                actionType={approvalActionType}
                onSubmit={handleApprovalSubmit}
                loading={isLoading}
            />

        </div>
    )
}

export default InvoicePayment;