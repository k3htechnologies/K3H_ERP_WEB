import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as E from "fp-ts/Either";
import { Trash2 } from "lucide-react";

import { Loader } from "@/core/utils/loader";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useContractRequisitionListState } from "@/features/contractRequisition/context/ContractRequisitionListStateContext";
import type { ContractRequisitionInvoiceData, FilterWithPaginationContractRequisitionInvoice } from "../../models/ContractRequisitionInvoiceModel";
import { runApiWithLoader } from "@/core/utils";
import { contractRequisitionInvoiceService } from "@/features/contractRequisition/services/ContractRequisitionInvoiceService";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatCurrency } from "@/core/utils/comman";
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";
import type { ContractRequisitionInvoicePaymentData, DeleteContractRequisitionInvoicePayment, FilterWithPaginationContractRequisitionInvoicePayment } from "../../models/ContractRequisitionInvoicePaymentModel";
import { contractRequisitionInvoicePaymentService } from "@/features/contractRequisition/services/ContractRequisitionInvoicePaymentService";
import { Button } from "@/ui/components/forms";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";

const ViewContractInvoicePayment: React.FC = () => {
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contractInvoiceData, setContractInvoiceData] = useState<ContractRequisitionInvoiceData>();
  const [paymentData, setPaymentData] = useState<ContractRequisitionInvoicePaymentData[]>([]);
  const [deletePaymentData, setDeletePaymentData] = useState<ContractRequisitionInvoicePaymentData | null>(null);
  const [isConfirmationDialogBoxOpenForDeletePayment, setIsConfirmationDialogBoxOpenForDeletePayment] = useState(false)

  const { listState } = useContractRequisitionListState();
  const { ContractRequisitionId, SystemGeneratedCode, ContractRequisitionStatus, VendorName, ContractRequisitionInvoiceId } = listState;
  const { projectId } = useProject();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { canAction } = useMenuPermissions('Make Payments');

  useEffect(() => {
    if (!projectId) return;

    loadInvoiceData();
  }, [projectId, ContractRequisitionId, ContractRequisitionInvoiceId]);

  const PendingAmount = useMemo(() => {
    const InvoiceAmount = contractInvoiceData?.InvoiceAmount ? Number(contractInvoiceData.InvoiceAmount) : 0;
    const amountPaid = contractInvoiceData?.InvoiceAmountPaidTillDate ? Number(contractInvoiceData.InvoiceAmountPaidTillDate) : 0;
    const tdsPaid = contractInvoiceData?.InvoiceTDSPaidTillDate ? Number(contractInvoiceData.InvoiceTDSPaidTillDate) : 0;

    return Math.max(InvoiceAmount - amountPaid - tdsPaid);
  }, [contractInvoiceData]);

  const loadInvoiceData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationContractRequisitionInvoice = {
          PageNumber: 1,
          PageSize: 1,
          ProjectId: Number(projectId),
          ContractRequisitionId: ContractRequisitionId,
          ContractRequisitionInvoiceId: ContractRequisitionInvoiceId
        };

        const response = await contractRequisitionInvoiceService.apiCallPullContractRequisitionInvoice(params);

        if (E.isRight(response)) {

          const data = response.right.Data;

          const invoice = Array.isArray(data) ? (data[0] ?? null) : data;

          setContractInvoiceData(invoice);

          if (invoice?.ContractRequisitionInvoiceId) {
            await loadPaymentData(invoice.ContractRequisitionInvoiceId);
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
        const params: FilterWithPaginationContractRequisitionInvoicePayment = {
          PageNumber: 1,
          PageSize: 10,
          ProjectId: Number(projectId),
          ContractRequisitionId: ContractRequisitionId,
          ContractRequisitionInvoiceId: invoiceId,
        };

        const response = await contractRequisitionInvoicePaymentService.apiCallPullContractRequisitionInvoicePayment(params);

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

  const handleConfirmationDialogBoxOpenForDeletePayment = useCallback((row: ContractRequisitionInvoicePaymentData) => {
    setDeletePaymentData(row);
    setIsConfirmationDialogBoxOpenForDeletePayment(true);
  }, [])

  const handleDeleteInvoicePayment = async () => {

    setIsConfirmationDialogBoxOpenForDeletePayment(false);

    if (!deletePaymentData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteContractRequisitionInvoicePayment = {
          ContractRequisitionId: ContractRequisitionId,
          ContractRequisitionPaymentId: deletePaymentData.ContractRequisitionPaymentId,
          UniqueKey: deletePaymentData.UniqueKey || "",
          ProjectId: Number(projectId),
        };

        const response = await contractRequisitionInvoicePaymentService.apiCallDeleteContractRequisitionInvoicePayment(params);

        if (E.isRight(response)) {

          await loadPaymentData(deletePaymentData.ContractRequisitionInvoiceId);

          addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

          await loadInvoiceData();

          setIsConfirmationDialogBoxOpenForDeletePayment(false);
          setDeletePaymentData(null);

        } else {
          addToast({ type: 'error', title: response.left.message });
          setIsConfirmationDialogBoxOpenForDeletePayment(false);
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
          subTitleText={SystemGeneratedCode ?? "-"}
          subSubTitleText={ContractRequisitionStatus ?? ''}
          subSubSubTitleText={VendorName ?? ''}
          cancelText="Cancel"
          onCancel={() =>
            navigate("/contractRequisition/view", {
              state: { activeTab: "Invoice" }
            })}
        />
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">

          <div className="mb-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
              <h3 className="text-md  font-semibold text-gray-700">
                Invoice Details (₹)
              </h3>

              <div className="flex items-center gap-2">
                {PendingAmount === 0 && (
                  <div>
                    <span className=" bg-[#15803D] text-[#CEFFCE] inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ">Fully Paid</span>
                  </div>
                )}

              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FieldItem label="Invoice Number" value={contractInvoiceData?.InvoiceNumber || "-"} />
              <FieldItem label="Invoice Amount" value={formatCurrency(contractInvoiceData?.InvoiceAmount)} />

              <FieldItem
                label="Amount Paid Till Date"
                value={
                  <span className="text-green-600 font-semibold">
                    {formatCurrency(contractInvoiceData?.InvoiceAmountPaidTillDate)}
                  </span>
                }
              />

              <FieldItem
                label="TDS Paid Till Date"
                value={
                  <span className="text-green-600 font-semibold">
                    {formatCurrency(contractInvoiceData?.InvoiceTDSPaidTillDate)}
                  </span>
                }

              />

              <FieldItem label=" Amount to be Paid"
                value={
                  <span className="text-red-600 font-semibold">
                    {formatCurrency(PendingAmount)}
                  </span>
                } />

              <FieldItem label="Invoice Date" value={formatDate_dd_MonthName_yy(contractInvoiceData?.InvoiceDate ?? '')} />
              <FieldItem label="Due Date" value={formatDate_dd_MonthName_yy(contractInvoiceData?.InvoiceDueDate ?? '')} />
              {
                contractInvoiceData?.Remarks &&
                <FieldInfoTooltip label="Remark" value={contractInvoiceData?.Remarks ?? ''} />
              }

            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-md font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">
              Document's Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FieldItem label="Invoice" urls={contractInvoiceData?.UploadInvoiceURL} isSetValue={false} isIcon />
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-md font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">
              Action Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FieldItem label="Created By" value={contractInvoiceData?.CreatedBy ?? "-"} />
              <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy_hh_mm(contractInvoiceData?.CreatedDate ?? "-")} />
              <FieldItem label="Modified By" value={contractInvoiceData?.ModifiedBy ?? "-"} />
              <FieldItem label="Modified Date" value={formatDate_dd_MonthName_yy_hh_mm(contractInvoiceData?.ModifiedDate ?? "-")} />
            </div>
          </div>
        </div>
        {paymentData.map((item, index) => (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-1">

            <div className="mb-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
                <h3 className="text-md font-semibold text-gray-700">
                  Customer Bank Details
                </h3>

                <div className="flex items-center gap-1">
                  {index === 0 && !["COMPLETED", "CLOSED"].includes(ContractRequisitionStatus?.toUpperCase()) && (

                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleConfirmationDialogBoxOpenForDeletePayment(item);
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FieldItem label="Amount Paid (₹)" value={formatCurrency(item.AmountPaid)} isIcon={true} />
                <FieldItem label="TDS Amount (₹)" value={formatCurrency(item.TDSAmount)} isIcon={true} />
                <FieldItem label="Payment Mode" value={item.PaymentMode || "-"} />
                {item.AccountNumber && (<FieldItem label="Account Number" value={item.AccountNumber || "-"} />)}
                {item.IFSCCode && (<FieldItem label="IFSC Code" value={item.IFSCCode || "-"} />)}
                {item.PaymentType && (<FieldItem label="Payment Type" value={item.PaymentType ?? ''} />)}
                {item.TransactionNumber && (<FieldItem
                  label="Transaction Number"
                  urls={item.TransactionReceiptURL}
                  value={item.TransactionNumber || "-"}
                  isIcon
                />)}

                {item.BankName && (<FieldItem label="Bank" value={item.BankName || "-"} />)}
                {item.IsAdvance && (<FieldItem label="Advance" value={item.IsAdvance === true ? "Yes" : "No"} />)}

              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-md font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">
                Developer Bank Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FieldItem label="Account Number" value={item.ProjectAccountNumber || "-"} isRow={false} />
                <FieldItem label="Bank Name" value={item.ProjectBankName || "-"} isRow={false} />
                <FieldItem label="IFSC Code" value={item.ProjectIFSCCode || "-"} isRow={false} />

                <div>
                  <p className="text-sm font-medium text-[#1D1D1D80] pb-1">
                    Nature Of Account
                  </p>

                  <span className="inline-block px-2 py-1 rounded text-sm font-medium bg-[#DBEAFE] text-[#1E40AF]">
                    {item.ProjectNatureOfAccount ?? "-"}
                  </span>
                </div>

                <FieldItem label="Account Type" value={item.ProjectAcType || "-"} isRow={false} />
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-md font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">
                Action Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FieldItem label="Created By" value={item?.CreatedBy ?? "-"} />
                <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy_hh_mm(item?.CreatedDate ?? "-")} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpenForDeletePayment}
        onClose={() => {
          setDeletePaymentData(null);
          setIsConfirmationDialogBoxOpenForDeletePayment(false);
        }}
        onConfirm={handleDeleteInvoicePayment}
        loading={isLoading}
        pageName="Invoice Payment"
      />
    </div>
  )
}

export default ViewContractInvoicePayment;
