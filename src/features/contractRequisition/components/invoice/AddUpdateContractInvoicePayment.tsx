import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as E from "fp-ts/Either";

import { Loader } from "@/core/utils/loader";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import type { AddUpdateContractRequisitionInvoicePaymentRequest } from "@/features/contractRequisition/models/ContractRequisitionInvoicePaymentModel";
import { useContractRequisitionListState } from "@/features/contractRequisition/context/ContractRequisitionListStateContext";
import { contractRequisitionInvoicePaymentService } from "@/features/contractRequisition/services/ContractRequisitionInvoicePaymentService";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { PAYMENT_MODE } from "@/core/constants";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchBankListMasterDropdown } from "@/features/bankListMaster/bankListMasterDropDown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import { Input } from "@/ui/components/forms";
import { filterIFSC, filterNumbers, filterNumbersWithDecimal, hasAnyDocumentFile, isValidAccount, isValidIFSC } from "@/core/utils/fileValidation";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import Checkbox from "@/ui/components/forms/Checkbox";
import type { ProjectWithBankDetails } from "@/features/projectMaster/models/ProjectMasterModel";
import { fetchProjectBankDropdown } from "@/features/projectMaster/projectBankDropdown";
import type { FilterWithPaginationContractRequisitionInvoice } from "@/features/contractRequisition/models/ContractRequisitionInvoiceModel";
import { contractRequisitionInvoiceService } from "@/features/contractRequisition/services/ContractRequisitionInvoiceService";

const initialFormState = (): AddUpdateContractRequisitionInvoicePaymentRequest => ({
  ProjectId: 0,
  ContractRequisitionPaymentId: 0,
  UniqueKey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  ContractRequisitionId: 0,
  ContractRequisitionInvoiceId: 0,
  PaymentMode: "",
  PaymentType: "",
  BankListMasterId: 0,
  AccountNumber: "",
  IFSCCode: "",
  AmountPaid: 0,
  PendingAmount: 0,
  TDSAmount: 0,
  TransactionNumber: "",
  TransactionReceiptURL: "",
  RemoveTransactionReceiptURL: "",
  IsAdvance: false,
  ProjectBankListMasterId: 0,
});

const AddUpdateContractInvoicePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [formData, setFormData] = useState<AddUpdateContractRequisitionInvoicePaymentRequest>(() => initialFormState());
  const [transactionFiles, setTransactionFiles] = useState<(File | string)[]>([]);
  const [removedFiles, setRemovedFiles] = useState<string[]>([]);
  const [existingURL,] = useState<string>();
  const [dropdownLabels, setDropdownLabels] = useState<{ bankName?: string; projectBankName?: string; }>({});
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const navigate = useNavigate();
  const { listState } = useContractRequisitionListState();
  const { ContractRequisitionId, ContractRequisitionInvoiceId, ContractRequisitionStatus, SystemGeneratedCode } = listState;
  const { projectId } = useProject();
  const { addToast } = useToast();
  const { canAction: canMakePayments } = useMenuPermissions('Contract - Make Payments');
  const [remainingInvoiceAmount, setRemainingInvoiceAmount] = useState(0);

  const [projectWithBankData, setProjectWithBankData] = useState<ProjectWithBankDetails | null>(null);

  const fetchProjectBankList = useCallback(
    async (pageNumber: number, params?: { value?: string }) => {
      return fetchProjectBankDropdown(pageNumber, {
        projectId: projectId || 0,
        bankName: params?.value || "",
        isCheckPermission: false
      });
    },
    [projectId]
  );

  //#region HANDLE FIELD CHANGE EVENT
  const handleFieldChange = (field: keyof AddUpdateContractRequisitionInvoicePaymentRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddContractInvoicePaymentForm = (): {
    isValid: boolean
    errors: { [key: string]: string }

  } => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.PaymentMode) {
      newErrors.PaymentMode = " Payment Mode is Required";
    }

    if (!formData.AmountPaid) {
      newErrors.AmountPaid = " Amount Paid is Required";
    } else if (toNumber(formData.AmountPaid) <= 0) {
      newErrors.AmountPaid = "Invalid Amount";
    }
    if (toNumber(formData.AmountPaid) > remainingInvoiceAmount) {
      newErrors.AmountPaid = `Amount cannot exceed ₹${remainingInvoiceAmount}`;
    }

    if (toNumber(formData.AmountPaid) + toNumber(formData.TDSAmount) > remainingInvoiceAmount) {
      newErrors.AmountPaid = `Amount + TDS Amount cannot exceed invoice amount`;
    }

    if (!formData.TransactionNumber) {
      newErrors.TransactionNumber = `${getTransactionLabel()} is Required`;
    }

    const bankTransferModes = ["IMPS", "NEFT", "RTGS", "Online Transfer"];
    const ddChequeModes = ["Cheque", "Demand Draft"];

    if (bankTransferModes.includes(formData.PaymentMode)) {

      if (!formData.BankListMasterId) {
        newErrors.BankListMasterId = "Bank Name is required";
      }
      if (!formData.AccountNumber) {
        newErrors.AccountNumber = "Account Number is required";
      } else if (!isValidAccount(formData.AccountNumber)) {
        newErrors.AccountNumber = "Enter valid Account Number";
      }
      if (!formData.IFSCCode?.trim()) {
        newErrors.IFSCCode = 'IFSC Code is required.'
      } else if (formData.IFSCCode.trim().length > 12) {
        newErrors.IFSCCode = 'IFSC Code must be at most 50 characters'
      } else if (!isValidIFSC(formData.IFSCCode.trim())) {
        newErrors.IFSCCode = 'Enter a valid IFSC Code'
      }
    }

    if (ddChequeModes.includes(formData.PaymentMode)) {
      if (!formData.BankListMasterId) {
        newErrors.BankListMasterId = "Bank Name is required";
      }
    }
    if (!hasAnyDocumentFile(transactionFiles, existingURL, removedFiles)) {
      newErrors.TransactionReceiptURL = "Transaction Receipt is required";
    }

    if ((!formData.ProjectBankListMasterId || formData.ProjectBankListMasterId === 0)) {
      newErrors.ProjectBankListMasterId = "Project Bank Name is required";
    }
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };
  //#endregion

  //#region PUSH DATA
  const PushContractInvoicePaymentData = (): FormData => {
    const fd = new FormData();

    fd.append("ProjectId", projectId!.toString());
    fd.append("ContractRequisitionPaymentId", formData.ContractRequisitionPaymentId.toString());
    fd.append("UniqueKey", formData.UniqueKey ?? "");
    fd.append("ContractRequisitionId", ContractRequisitionId.toString());
    fd.append("ContractRequisitionInvoiceId", ContractRequisitionInvoiceId.toString());
    fd.append("PaymentMode", formData.PaymentMode);
    fd.append("PaymentType", formData.PaymentType);
    fd.append("BankListMasterId", String(formData.BankListMasterId));
    fd.append("AccountNumber", formData.AccountNumber);
    fd.append("IFSCCode", formData.IFSCCode);
    fd.append("AmountPaid", String(toNumber(formData.AmountPaid)));
    fd.append("TDSAmount", String(toNumber(formData.TDSAmount)));
    fd.append("TransactionNumber", formData.TransactionNumber);
    fd.append("IsAdvance", String(formData.IsAdvance));
    fd.append("ProjectBankListMasterId", String(formData.ProjectBankListMasterId));
    transactionFiles.forEach(file => {
      if (file instanceof File) {
        fd.append("TransactionReceiptURL", file);
      }
    });
    fd.append("RemoveTransactionReceiptURL", removedFiles.join(","));

    return fd;
  };
  //#endregion

  //#region HANDLE  ADD UPDATE Contracr INVOICE 
  const handleAddUpdateContractInvoicePayment = async () => {
    setErrors({});

    const validation = validateAddContractInvoicePaymentForm();

    if (!validation.isValid) {

      setErrors(validation.errors);

      return;
    }
    await runApiWithLoader(

      setIsLoading,
      setLoadingMessage,

      async () => {
        const payload = PushContractInvoicePaymentData();

        const response = await contractRequisitionInvoicePaymentService.apiCallAddUpdateContractRequisitionInvoicePayment(payload);

        if (E.isRight(response)) {

          addToast({ type: "success", title: response.right.SuccessMessage[0] });

          navigate(`/contractRequisition/view`, {
            state: {
              activeTab: "Invoice"
            }
          });

        } else {
          addToast({ type: "error", title: response.left?.message });
        }
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      'Add Contract Invoice Payment'
    );
  };
  //#endregion

  useEffect(() => {
    if (!ContractRequisitionInvoiceId || !projectId) return;

    const fetchInvoiceData = async () => {
      await runApiWithLoader(
        setIsLoading,
        setLoadingMessage,
        async () => {
          const params: FilterWithPaginationContractRequisitionInvoice = {
            PageNumber: 1,
            PageSize: 1,
            ProjectId: Number(projectId),
            ContractRequisitionId: Number(ContractRequisitionId),
            ContractRequisitionInvoiceId: Number(ContractRequisitionInvoiceId)
          };

          const response = await contractRequisitionInvoiceService.apiCallPullContractRequisitionInvoice(params);

          if (E.isRight(response)) {

            const data = response.right.Data;

            const invoice = Array.isArray(data) ? data[0] : data;

            if (invoice) {

              const invoiceAmt = toNumber(invoice.InvoiceAmount);

              const paidAmt = toNumber(invoice.InvoiceAmountPaidTillDate);

              const tdsAmt = toNumber(invoice.InvoiceTDSPaidTillDate);

              const pendingAmt = Math.max(invoiceAmt - paidAmt - tdsAmt, 0);

              setRemainingInvoiceAmount(pendingAmt);

              setFormData(prev => ({
                ...prev,
                PendingAmount: pendingAmt
              }));
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
        "Loading Invoice Data"
      );
    };
    fetchInvoiceData();
  }, [ContractRequisitionInvoiceId, projectId, ContractRequisitionId]);

  const toNumber = (value: any) => Number(value) || 0;

  const sanitizeAmount = (value: string) => value.replace(/[^0-9.]/g, "");

  const getTransactionLabel = () => {
    switch (formData.PaymentMode) {
      case "UPI":
        return "UPI Reference Number";

      case "Cheque":
        return "Cheque Number";

      case "Demand Draft":
        return "DD Number";

      default:
        return "Transaction Number";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5 lg:p-6">
      <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

      <div className="pb-5">
        <HeaderActionBar
          titleText={'Make Payment :'}
          subTitleText={SystemGeneratedCode ?? "-"}
          subSubTitleText={ContractRequisitionStatus ?? ''}
          subSubSubTitleText={String(ContractRequisitionInvoiceId) ?? ''}
          cancelText="Cancel"
          onCancel={() =>
            navigate("/contractRequisition/view", {
              state: { activeTab: "Invoice" }
            })}
        />
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Customer Bank Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6" >

          <SinglePageSelection
            label="Payment Mode"
            required
            value={formData.PaymentMode}
            onChange={(e) => handleFieldChange("PaymentMode", String(e))}
            options={PAYMENT_MODE.map(opt => ({ label: opt.name, value: opt.id }))}
            error={errors.PaymentMode}
          />

          {["IMPS", "NEFT", "RTGS", "Online Transfer", "Cheque", "Demand Draft"].includes(formData.PaymentMode) && (

            <SingleSelectDropdownWithPagination
              label="Bank Name"
              required
              title="Select Bank"
              dataFetchCallBack={fetchBankListMasterDropdown}
              initialValue={createDropdownInitialValue(formData.BankListMasterId, dropdownLabels.bankName)}
              onSelected={(item) => {
                handleFieldChange("BankListMasterId", Number(item?.value || 0));
                setDropdownLabels({ bankName: item?.label || "" });
              }}
              error={errors.BankListMasterId}
            />
          )}

          {["IMPS", "NEFT", "RTGS", "Online Transfer"].includes(formData.PaymentMode) && (

            <Input
              required
              label="Account Number"
              value={formData.AccountNumber}
              onChange={(e) => handleFieldChange("AccountNumber", filterNumbers(e.target.value))}
              error={errors.AccountNumber}
              placeholder="Enter Account Number"
              maxLength={18}
            />
          )}

          {["IMPS", "NEFT", "RTGS", "Online Transfer"].includes(formData.PaymentMode) && (

            <Input
              required
              label="IFSC Code"
              value={formData.IFSCCode}
              placeholder="Enter IFSC Code"
              onChange={(e) => handleFieldChange("IFSCCode", filterIFSC(e.target.value))}
              error={errors.IFSCCode}
            />
          )}

          <Input
            label="Invoice Amount"
            value={String(formData.PendingAmount)}
            disabled
            rightIcon="₹"
          />

          <Input
            required
            label="Amount Paid"
            value={String(formData.AmountPaid)}
            onChange={(e) => {
              const value = filterNumbersWithDecimal(e.target.value);

              if (
                value === "" ||
                Number(value) <= Number(remainingInvoiceAmount ?? 0)
              ) {
                handleFieldChange("AmountPaid", value);
              }
            }}
            error={errors.AmountPaid}
            rightIcon="₹"
          />

          <Input
            required
            label="TDS Amount"
            value={String(formData.TDSAmount)}
            onChange={(e) => handleFieldChange("TDSAmount", filterNumbersWithDecimal(sanitizeAmount(e.target.value)))}
            error={errors.TDSAmount}
            rightIcon="₹"
          />

          <Input
            label={getTransactionLabel()}
            placeholder={`Enter ${getTransactionLabel()}`}
            className="sm:col-span-2 lg:col-span-2 xl:col-span-2"
            value={formData.TransactionNumber}
            onChange={(e) => handleFieldChange("TransactionNumber", e.target.value)}
            error={errors.TransactionNumber}
            required
            maxLength={25}
          />

          <MultiFilePicker
            label="Transaction Receipt"
            placeholder="Upload Transaction Receipt"
            value={transactionFiles}
            onChange={setTransactionFiles}
            availableFilesURL={existingURL ?? ""}
            allowedTypes={["image/jpeg", "image/png", "application/pdf"]}
            maxFiles={1}
            maxSizeMB={5}
            onRemoveExisting={(url) => setRemovedFiles(prev => [...prev, url])}
            error={errors.TransactionReceiptURL}
            required
          />

          <div className="flex items-end h-full">
            <Checkbox
              label="Advance"
              checked={formData.IsAdvance}
              onChange={(e) => handleFieldChange("IsAdvance", e.target.checked)
              }
            />
          </div>
        </div>
        <div className="space-y-4 pt-5">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Developer Bank Details</h3>
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

                  handleFieldChange("ProjectBankListMasterId", Number(item.value));
                  setProjectWithBankData(item as unknown as ProjectWithBankDetails);
                }}
                initialValue={createDropdownInitialValue(formData.ProjectBankListMasterId, dropdownLabels.projectBankName)}
                error={errors.ProjectBankListMasterId}
              />
            </div>

            {projectWithBankData && Number(formData.ProjectBankListMasterId) > 0 && (
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
                <div>
                  <Input label="Nature Of Account" placeholder="Enter Nature Of Account" value={projectWithBankData?.NatureOfAccount || ""} disabled />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <BottomActionBar
        cancelText="Cancel"
        saveText="Save"
        onCancel={() => navigate(-1)}
        onSave={handleAddUpdateContractInvoicePayment}
        isLoading={isLoading}
        canAction={canMakePayments}
      />
    </div>
  )
}

export default AddUpdateContractInvoicePayment;