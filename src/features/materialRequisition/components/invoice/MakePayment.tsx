import { PAYMENT_MODE, PAYMENT_TYPE } from "@/core/constants/staticData";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import { fetchBankListMasterDropdown } from "@/features/bankListMaster/bankListMasterDropDown";
import { Input } from "@/ui/components/forms/Input";
import { filterIFSC, filterNumbers } from "@/core/utils/fileValidation";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import Checkbox from "@/ui/components/forms/Checkbox";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useNavigate, useParams } from "react-router-dom";
import { runApiWithLoader } from "@/core/utils/apiLoaderHelper";
import useToast from "@/core/hooks/useToast";
import * as E from "fp-ts/Either";
import { materialRequisitionPaymentService } from "../../services/MaterialRequisitionPaymentService";
import { useEffect, useState } from "react";
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext";
import { Loader } from "@/core/utils/loader";
import { useProject } from "@/features/projectMaster/context/ProjectContext";

const MakePayment: React.FC<{ totalAmount?: number; editData?: any }> = ({
    totalAmount = 0,
    editData
}) => {

    const initialFormState = () => ({
        PaymentMode: "",
        PaymentType: "",
        BankListMasterId: 0,
        BankName: "",
        AccountNumber: "",
        IFSCCode: "",
        AmountPaid: 0,
        PendingAmount: totalAmount,
        TDSAmount: 0,
        TransactionNumber: "",
        IsAdvance: false
    });

    const [formData, setFormData] = useState(initialFormState());
    const [errors, setErrors] = useState<any>({});
    const [dropdownLabels, setDropdownLabels] = useState<{ bankName?: string }>({});
    const [transactionFiles, setTransactionFiles] = useState<(File | string)[]>([]);
    const [removedFiles, setRemovedFiles] = useState<string[]>([]);
    const [existingURL, setExistingURL] = useState<string>();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const navigate = useNavigate();
    const { addToast } = useToast();
    const { MaterialRequisitionId } = useParams();
    const { MaterialRequisitionInvoiceId } = useParams();

    const { listState } = useMaterialRequisitionListState();
    const { projectId } = useProject();

    const currentMaterialRequisitionId =
        MaterialRequisitionId ? Number(MaterialRequisitionId) : listState.MaterialRequisitionId;

    const handleFieldChange = (field: string, value: any) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };

            if (field === "PaymentMode") {
                updated.BankListMasterId = 0;
                updated.AccountNumber = "";
                updated.IFSCCode = "";
            }

            if (field === "AmountPaid" || field === "TDSAmount") {
                const paid = Number(updated.AmountPaid) || 0;
                updated.PendingAmount = Math.max(totalAmount - paid, 0);
            }

            return updated;
        });

        if (errors[field]) {
            setErrors((prev: any) => ({ ...prev, [field]: "" }));
        }
    };

    const validate = () => {
        const newErrors: any = {};

        if (!formData.PaymentMode) newErrors.PaymentMode = "Required";
        if (!formData.PaymentType) newErrors.PaymentType = "Required";
        if (!formData.AmountPaid || Number(formData.AmountPaid) <= 0)
            newErrors.AmountPaid = "Invalid";
        if (!formData.TDSAmount) newErrors.TDSAmount = "Required";
        if (!formData.TransactionNumber) newErrors.TransactionNumber = "Required";

        const bankTransferModes = ["IMPS", "NEFT", "RTGS", "Online Transfer"];
        const ddChequeModes = ["Cheque", "Demand Draft"];

        if (bankTransferModes.includes(formData.PaymentMode)) {
            if (!formData.BankListMasterId) newErrors.BankListMasterId = "Required";
            if (!formData.AccountNumber) newErrors.AccountNumber = "Required";
            if (!formData.IFSCCode) newErrors.IFSCCode = "Required";
        }

        if (ddChequeModes.includes(formData.PaymentMode)) {
            if (!formData.BankListMasterId) newErrors.BankListMasterId = "Required";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };

    const pushPaymentData = (): FormData => {
        const fd = new FormData();
        fd.append("ProjectId", String(projectId))
        fd.append("MaterialRequisitionId", String(currentMaterialRequisitionId));
        fd.append("PaymentMode", formData.PaymentMode);
        fd.append("PaymentType", formData.PaymentType);
        fd.append("MaterialRequisitionInvoiceId", String(MaterialRequisitionInvoiceId ?? 0));
        fd.append("BankListMasterId", String(formData.BankListMasterId));
        fd.append("BankName", formData.BankName);
        fd.append("MaterialRequisitionInvoiceId", String())
        fd.append("AccountNumber", formData.AccountNumber);
        fd.append("IFSCCode", formData.IFSCCode);

        fd.append("AmountPaid", String(formData.AmountPaid));
        fd.append("OutstandingAmount", String(formData.PendingAmount));

        fd.append("TDSAmount", String(formData.TDSAmount));
        fd.append("TransactionNumber", formData.TransactionNumber);
        fd.append("IsAdvance", String(formData.IsAdvance));

        transactionFiles.forEach(file => {
            if (file instanceof File) {
                fd.append("TransactionReceiptURL", file);
            }
        });

        fd.append("RemoveTransactionReceiptURL", removedFiles.join(","));

        return fd;
    };

    const handleAddPayment = async () => {
        const validation = validate();

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await materialRequisitionPaymentService.apiCallAddUpdateMaterialRequisitionPayment(
                    pushPaymentData()
                );

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    navigate("/materialRequisition/view", {
                        state: { activeTab: "Invoice" }
                    });

                } else {
                    addToast({ type: "error", title: response.left?.message });
                }

                return response;
            }
        );
    };

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

    useEffect(() => {
        if (!editData) return;

        setFormData({
            ...initialFormState(),
            ...editData,
            PendingAmount: editData.OutstandingAmount
        });

        setDropdownLabels({ bankName: editData.BankName });
        setExistingURL(editData.TransactionReceiptURL);
    }, [editData]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5 lg:p-6">

            <Loader loading={isLoading} title={loadingMessage}>
                <div />
            </Loader>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleAddPayment();
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
            >

                <div className="col-span-full text-sm font-semibold text-gray-600">
                    Payment Details
                </div>

                <SinglePageSelection
                    label="Payment Mode"
                    required
                    value={formData.PaymentMode}
                    onChange={(e) => handleFieldChange("PaymentMode", String(e))}
                    options={PAYMENT_MODE.map(opt => ({
                        label: opt.name,
                        value: opt.id
                    }))}
                    error={errors.PaymentMode}
                />
                {["IMPS", "NEFT", "RTGS", "Online Transfer", "Cheque", "Demand Draft"].includes(formData.PaymentMode) && (
                    <>

                        <SingleSelectDropdownWithPagination
                            label="Bank Name"
                            title="Select Bank"
                            dataFetchCallBack={fetchBankListMasterDropdown}
                            initialValue={createDropdownInitialValue(
                                formData.BankListMasterId,
                                dropdownLabels.bankName
                            )}
                            onSelected={(item) => {
                                handleFieldChange("BankListMasterId", Number(item?.value || 0));
                                setDropdownLabels({ bankName: item?.label || "" });
                            }}
                            error={errors.BankListMasterId}
                        />
                    </>
                )}

                {["IMPS", "NEFT", "RTGS", "Online Transfer"].includes(formData.PaymentMode) && (
                    <Input
                        label="Account Number"
                        value={formData.AccountNumber}
                        onChange={(e) =>
                            handleFieldChange("AccountNumber", filterNumbers(e.target.value))
                        }
                        error={errors.AccountNumber}
                    />
                )}

                {["IMPS", "NEFT", "RTGS", "Online Transfer"].includes(formData.PaymentMode) && (
                    <Input
                        label="IFSC Code"
                        value={formData.IFSCCode}
                        onChange={(e) =>
                            handleFieldChange("IFSCCode", filterIFSC(e.target.value))
                        }
                        error={errors.IFSCCode}
                    />
                )}

                <SinglePageSelection
                    label="Payment Type"
                    required
                    value={formData.PaymentType}
                    onChange={(e) => handleFieldChange("PaymentType", String(e))}
                    options={PAYMENT_TYPE.map(opt => ({
                        label: opt.name,
                        value: opt.id
                    }))}
                    error={errors.PaymentType}
                />

                <Input
                    label="Amount Paid"
                    value={String(formData.AmountPaid)}
                    onChange={(e) =>
                        handleFieldChange("AmountPaid", filterNumbers(e.target.value))
                    }
                    error={errors.AmountPaid}
                />

                <Input
                    label="Pending Amount"
                    value={String(formData.PendingAmount)}
                    disabled
                />

                <Input
                    label="TDS Amount"
                    value={String(formData.TDSAmount)}
                    onChange={(e) =>
                        handleFieldChange("TDSAmount", filterNumbers(e.target.value))
                    }
                    error={errors.TDSAmount}
                />

                <Input
                    label={getTransactionLabel()}
                    className="sm:col-span-2 lg:col-span-2 xl:col-span-2"
                    value={formData.TransactionNumber}
                    onChange={(e) =>
                        handleFieldChange("TransactionNumber", e.target.value)
                    }
                    error={errors.TransactionNumber}
                />

                <MultiFilePicker
                    label="Transaction Receipt"
                    value={transactionFiles}
                    onChange={setTransactionFiles}
                    availableFilesURL={existingURL ?? ""}
                    maxFiles={1}
                />

                <div className="flex items-end h-full">
                    <Checkbox
                        label="Advance"
                        checked={formData.IsAdvance}
                        onChange={(e) =>
                            handleFieldChange("IsAdvance", e.target.checked)
                        }
                    />
                </div>

            </form>

            <BottomActionBar
                cancelText="Cancel"
                saveText="Save"
                onCancel={() => navigate("/materialRequisition/view", {
                    state: { activeTab: "Invoice" }
                })}
                onSave={handleAddPayment}
                isLoading={isLoading}
                canAction
            />

        </div>
    );
};

export default MakePayment;