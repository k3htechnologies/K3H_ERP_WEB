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
import { Button } from "@/ui/components/forms";
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { DataTableWithHeadColor } from "@/ui/components/DataTable/DataTableWithHeadColor";
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import type { ModulesApprovalStatusRequest } from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel";
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import type { DeleteMaterialRequisitionPayment, FilterWithPaginationMaterialRequisitionPayment, MaterialRequisitionPaymentData } from "@/features/materialRequisition/models/MaterialRequisitionPaymentModel";
import { materialRequisitionPaymentService } from "@/features/materialRequisition/services/MaterialRequisitionPaymentService";
import { formatCurrency } from "@/core/utils/comman";
import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Trash2 } from "lucide-react";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";

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
    const materialRequisitionStatus = ["COMPLETED", "CLOSED"].includes(listState.MaterialRequisitionStatus?.toUpperCase())
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;
    const currentUniquekey = listState.Uniquekey
    const systemGeneratedCode = listState.SystemGeneratedCode;
    const navigate = useNavigate();
    const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
    const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
    const [paymentData, setPaymentData] = useState<MaterialRequisitionPaymentData[]>([]);
    const [invoiceNumber, setInvoiceNumber] = useState<string | null>("");
    const [invoiceAmount, setInvoiceAmount] = useState<number | null>(0);

    const [deletePaymentData, setDeletePaymentData] = useState<MaterialRequisitionPaymentData | null>(null);
    const [isConfirmationDialogBoxOpenForPayment, setIsConfirmationDialogBoxOpenForPayment] = useState(false)
    const { canAction } = useMenuPermissions('Make Payments');


    useEffect(() => {
        if (!projectId) return;

        loadmaterialRequisitionGRNData();
        loadInvoiceData();
    }, [projectId, currentMaterialRequisitionId]);

    const handleMakePayment = useCallback((row: MaterialRequisitionInvoiceData) => {
        navigate(`/materialRequisition/makePayment/add/${row.MaterialRequisitionInvoiceId}`);
    }, [navigate]);

    const handleApprovalLog = (row: MaterialRequisitionInvoiceData) => {
        const request: ModulesApprovalStatusRequest = {
            ModuleName: "ADD INVOICE",
            Id: currentMaterialRequisitionId ?? 0,
            SubId: row.MaterialRequisitionInvoiceId ?? 0,
            ProjectId: projectId ?? 0,
        };
        setInvoiceNumber(row.InvoiceNumber);
        setInvoiceAmount(row.InvoiceAmount);
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

    const MatrialRequisitionDetailColumns = useMemo<TableColumn[]>(() => {

        const isDirect = matrialRequisitionDetailGRNData?.[0]?.MaterialRequisitionType?.toUpperCase() === "DIRECT";

        const columns: TableColumn[] = [];

        if (isDirect) {
            columns.push(
                {
                    key: "Level1Name",
                    label: "Category",
                    align: "left",
                    width: "30",
                    render: (value) => value || "-"
                },
                {
                    key: "Level2Name",
                    label: "Sub Category",
                    align: "left",
                    width: "30",
                    render: (value) => value || "-"
                },
                {
                    key: "Level3Name",
                    label: "Description",
                    align: "left",
                    width: "30",
                    render: (value) => (
                        <TooltipText
                            text={value || "-"}
                            maxWidth="250px"
                            tooltipThreshold={25}
                        />
                    )
                },
                {
                    key: "Level4Name",
                    label: "Sub Material",
                    align: "left",
                    width: "30",
                    render: (value) => (
                        <TooltipText
                            text={value || "-"}
                            maxWidth="250px"
                            tooltipThreshold={25}
                        />
                    )
                },
            );
        } else {
            columns.push(
                {
                    key: "MaterialName",
                    label: "Material",
                    align: "left",
                    width: "30",
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
                    label: "Sub Material",
                    align: "left",
                    width: "30",
                    render: (value) => (
                        <TooltipText
                            text={value || "-"}
                            maxWidth="250px"
                            tooltipThreshold={25}
                        />
                    )
                },

            );
        }
        columns.push(
            {
                key: "RequiredDate",
                label: "Required Date",
                align: "left",
                width: "30",
                render: (value) =>
                    value ? formatDate_dd_MonthName_yy(value) : "-"
            },
            {
                key: "MaterialQuantity",
                label: "Quantity",
                align: "left",
                width: "30",
                render: (value, row) => {
                    return isDirect ? `${value ?? 0} ${row.Level4SubMaterialUomCode ?? ""}`.trim() : `${value ?? 0} ${row.UomCode ?? ""}`.trim() ?? 0;
                }
            },
            {
                key: 'TotalReceivedMaterialQuantity',
                label: 'Received Quantity',
                width: '10',
                sortable: false,
                align: 'center',
                render: (value?: string) => value || '-'
            },


        );

        return columns;
    }, [matrialRequisitionDetailGRNData]);

    const InvoiceAmount = invoiceData?.InvoiceAmount ? Number(invoiceData.InvoiceAmount) : 0;

    const amountPaid = invoiceData?.InvoiceAmountPaidTillDate ? Number(invoiceData.InvoiceAmountPaidTillDate) : 0;

    const tdsPaid = invoiceData?.InvoiceTDSPaidTillDate ? Number(invoiceData.InvoiceTDSPaidTillDate) : 0;

    const PendingAmount = Math.max(InvoiceAmount - amountPaid - tdsPaid);

    const handleConfirmationDialogBoxOpenForPayment = useCallback((row: MaterialRequisitionPaymentData) => {
        setDeletePaymentData(row)
        setIsConfirmationDialogBoxOpenForPayment(true)
    }, [])

    const handleDeleteInvoicePayment = async () => {

        setIsConfirmationDialogBoxOpenForPayment(false);

        if (!deletePaymentData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteMaterialRequisitionPayment = {
                    MaterialRequisitionPaymentId: deletePaymentData.MaterialRequisitionPaymentId || 0,
                    MaterialRequisitionId: deletePaymentData.MaterialRequisitionId || 0,
                    Uniquekey: deletePaymentData.Uniquekey || "",
                    ProjectId: Number(projectId),
                };

                const response = await materialRequisitionPaymentService.apiCallDeleteMaterialRequisitionPayment(params);

                if (E.isRight(response)) {

                    await loadPaymentData(deletePaymentData.MaterialRequisitionInvoiceId);

                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

                    await loadInvoiceData();

                    setIsConfirmationDialogBoxOpenForPayment(false);
                    setDeletePaymentData(null);

                } else {
                    addToast({ type: 'error', title: response.left.message });
                    setIsConfirmationDialogBoxOpenForPayment(false);
                }
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Deleting Invoice Payment"
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <Loader loading={isLoading} title={loadingMessage}>{" "} <div></div>{" "}</Loader>

            <div className="pb-4">
                <HeaderActionBar
                    titleText={'Make Payment :'}
                    subTitleText={systemGeneratedCode ?? "-"}
                    subSubTitleText={listState.MaterialRequisitionStatus ?? ''}
                    subSubSubTitleText={listState.VendorName ?? ''}
                    cancelText="Cancel"
                    onCancel={() =>
                        navigate("/materialRequisition/view", {
                            state: { activeTab: "Invoice" }
                        })}
                />
            </div>

            <div className="gap-x-4 bg-[#EFF6FF] rounded-lg shadow-sm border border-gray-300 p-4 mb-4">
                <div className="lg:col-span-5 pb-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                        <FieldItem label="Challan Number" value={materialRequisitionGRNData?.ChallanNumber || '-'} />
                        <FieldItem label="Challan" urls={materialRequisitionGRNData?.UploadChallanURL} isIcon isSetValue={false} />
                        <FieldItem label="Vehicle Number" value={materialRequisitionGRNData?.VehicleNumber || '-'} />
                        <FieldInfoTooltip label="Remarks" value={materialRequisitionGRNData?.Remarks || '-'} />
                        <FieldItem label="Created By / Date" value={materialRequisitionGRNData?.CreatedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(materialRequisitionGRNData?.CreatedDate || '-')} />

                        {materialRequisitionGRNData?.ModifiedBy !== '' ?
                            <FieldItem label="Modified By / Date" value={materialRequisitionGRNData?.ModifiedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(materialRequisitionGRNData?.ModifiedDate || '-')} />
                            :
                            ''}
                    </div>
                </div>

                <DataTableWithHeadColor
                    columns={MatrialRequisitionDetailColumns}
                    data={matrialRequisitionDetailGRNData}
                    emptyMessage="No Material Requisition Found"
                    fixedHeight={true}
                    recordsPerPage={3}
                    className="flex-1"
                />
            </div>

            <div className="space-y-4">
                <div className="relative bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-700">

                            <FieldItem label="Invoice Number" value={invoiceData?.InvoiceNumber || "-"} isRow />
                            <FieldItem label="Invoice Amount" value={formatCurrency(invoiceData?.InvoiceAmount)} isRow />

                            
                                    <FieldItem
                                        label="Amount Paid Till Date"
                                        isRow
                                        value={
                                            <span className="text-green-600 font-semibold">
                                                {formatCurrency(invoiceData?.InvoiceAmountPaidTillDate)}
                                            </span>
                                        }
                                    />

                                    <FieldItem
                                        label="TDS Paid Till Date"
                                        value={
                                            <span className="text-green-600 font-semibold">
                                                {formatCurrency(invoiceData?.InvoiceTDSPaidTillDate)}
                                            </span>
                                        }
                                        isRow
                                    />
                               
                            <FieldItem label=" Amount to be Paid"
                                isRow
                                value={
                                    <span className="text-red-600 font-semibold">
                                        {formatCurrency(PendingAmount)}
                                    </span>
                                } />

                            {PendingAmount === 0 && (
                                <div>
                                    <span className="border border-green-300 bg-green-100 text-green-600 font-semibold px-2 py-2 rounded-md inline-block">Fully Paid</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <ApprovalActions
                                approvalStatus={invoiceData?.InvoiceStatus}
                                isIcons={true}
                                onHistory={() => handleApprovalLog(invoiceData as MaterialRequisitionInvoiceData)}
                            />


                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 text-sm pt-5">
                        <div className="space-y-3">
                            <h3 className="font-semibold mb-2">Invoice Details</h3>


                            <FieldItem label="Invoice Date" value={formatDate_dd_MonthName_yy(invoiceData?.InvoiceDate ?? '')} />
                            <FieldItem label="Due Date" value={formatDate_dd_MonthName_yy(invoiceData?.InvoiceDueDate ?? '')} />

                            <FieldItem label="Remark" value={invoiceData?.Remarks ?? ''} />
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold mb-2">Document's Details</h3>



                            <FieldItem label="Invoice" urls={invoiceData?.UploadInvoiceURL} isSetValue={false} isIcon />

                            <FieldItem label="Performance Report" urls={invoiceData?.PerformaInvoiceURL} isSetValue={false} isIcon />
                            <FieldItem label="Measurement Report" urls={invoiceData?.MeasurementReportURL} isSetValue={false} isIcon />

                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold mb-2">Action Details</h3>

                            <FieldItem label="Created By" value={invoiceData?.CreatedBy ?? "-"} />

                            <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy_hh_mm(invoiceData?.CreatedDate ?? "-")} />
                            <FieldItem label="Modified By" value={invoiceData?.ModifiedBy ?? "-"} />
                            <FieldItem label="Modified Date" value={formatDate_dd_MonthName_yy_hh_mm(invoiceData?.ModifiedDate ?? "-")} />
                        </div>
                    </div>

                    {PendingAmount !== 0 && !materialRequisitionStatus && (
                        <div className="absolute bottom-4 right-4">
                            <Button
                                color="green"
                                onClick={() =>
                                    handleMakePayment(invoiceData as MaterialRequisitionInvoiceData)
                                }
                                size="sm"
                                style={{
                                    color: '#FFFFFF',
                                    padding: '4px 8px',
                                    background: "#00AC00"
                                }}
                            >
                                Make Payment
                            </Button>
                        </div>
                    )}
                </div>

                {paymentData.map((item, index) => (


                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-700">
                                <FieldItem label="Amount Paid (₹)" value={formatCurrency(item.AmountPaid)} isRow isIcon={true} />
                                <FieldItem label="TDS Amount (₹)" value={formatCurrency(item.TDSAmount)} isRow isIcon={true} />
                                <FieldItem label="Payment Mode" value={item.PaymentMode || "-"} isRow />

                            </div>

                            <div className="flex items-center gap-2 pb-8">
                                {index === 0 && (
                                    <Button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleConfirmationDialogBoxOpenForPayment(item);
                                        }}
                                        color="transparent"
                                        isborderRadius
                                        size="sm"
                                        style={{
                                            color: canAction ? "red" : "#9CA3AF",
                                            cursor: canAction ? "pointer" : "not-allowed",
                                            opacity: canAction ? 1 : 0.5,
                                        }}
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                        </div>

                        <div className="grid grid-cols-3 gap-6 text-sm pt-5">
                            <div className="space-y-3">
                                <h3 className="font-semibold mb-2">Developer Bank Details</h3>

                                <FieldItem label="Account Number" value={item.ProjectAccountNumber || "-"} isRow={false} />
                                <FieldItem label="Bank Name" value={item.ProjectBankName || "-"} isRow={false} />
                                <FieldItem label="IFSC Code" value={item.ProjectIFSCCode || "-"} isRow={false} />
                                <FieldItem label="Nature Of Account" value={item.ProjectNatureOfAccount || "-"} isRow={false} />
                                <FieldItem label="Account Type" value={item.ProjectAcType || "-"} isRow={false} />
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-semibold mb-2">Customer Bank Details</h3>

                                {item.AccountNumber && (<FieldItem label="Account Number" value={item.AccountNumber || "-"} />)}
                                {item.IFSCCode && (<FieldItem label="IFSC Code" value={item.IFSCCode || "-"} isRow={false} />)}

                                {item.BankName && (<FieldItem label="Bank" value={item.BankName || "-"} />)}
                                {item.PaymentType && (<FieldItem label="Payment Type" value={item.PaymentType ?? ''} />)}

                                {item.TransactionNumber && (<FieldItem
                                    label="Transaction Number"
                                    urls={item.TransactionReceiptURL}
                                    value={item.TransactionNumber || "-"}
                                    isIcon
                                />)}


                            </div>

                            <div className="space-y-3">
                                <h3 className="font-semibold mb-2">Action Details</h3>

                                <FieldItem label="Created By" value={item?.CreatedBy ?? "-"} />

                                <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy_hh_mm(item?.CreatedDate ?? "-")} />

                            </div>
                        </div>
                    </div>
                ))}
            </div>


            <ApprovalLogModal
                isOpen={isApprovalLogModalOpen}
                titleText={invoiceNumber ?? ""}
                subTitleText={String(invoiceAmount ?? 0)}
                title='Invoice Approval'
                onClose={() => setIsApprovalLogModalOpen(false)}
                request={approvalLogRequest}
            />

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpenForPayment}
                onClose={() => {
                    setDeletePaymentData(null);
                    setIsConfirmationDialogBoxOpenForPayment(false);
                }}
                onConfirm={handleDeleteInvoicePayment}
                loading={isLoading}
                pageName="Invoice Payment"
            />


        </div>
    )
}

export default InvoicePayment;