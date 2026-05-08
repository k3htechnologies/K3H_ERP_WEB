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
import { materialRequisitionPaymentService } from "@/features/materialRequisition/services/MaterialRequisitionPaymentService";
import { useEffect, useState } from "react";
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext";
import { Loader } from "@/core/utils/loader";

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
        OutstandingAmount: totalAmount,
        TDSAmount: 0,
        TransactionNumber: "",
        IsAdvance: false
    });

    const [formData, setFormData] = useState(initialFormState());
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [dropdownLabels, setDropdownLabels] = useState<{ bankName?: string }>({});
    const [transactionFiles, setTransactionFiles] = useState<(File | string)[]>([]);
    const [removedFiles, setRemovedFiles] = useState<string[]>([]);
    const [existingURL, setExistingURL] = useState<string>();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;

    const handleAddPayment = async () => {
        setErrors({});

        const validation = validate();
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = pushPaymentData();

                const response = await materialRequisitionPaymentService.apiCallAddUpdateMaterialRequisitionPayment(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    navigate(-1);

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
            "Saving Payment"
        );
    };

    const handleFieldChange = (field: string, value: any) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };
            if (field === "AmountPaid" || field === "TDSAmount") {
                const paid = Number(updated.AmountPaid) || 0;
                updated.OutstandingAmount = Math.max(totalAmount - paid, 0);
            }
            return updated;
        });
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    useEffect(() => {
        if (!editData) return;
        setFormData({
            ...initialFormState(),
            ...editData
        });
        setDropdownLabels({
            bankName: editData.BankName || ""
        });
        setExistingURL(editData.TransactionReceiptURL);
        setTransactionFiles([]);
        setRemovedFiles([]);
    }, [editData]);

    const validate = () => {
        const newErrors: any = {};
        if (!formData.PaymentMode) newErrors.PaymentMode = " PaymentMode is Required";
        if (!formData.PaymentType) newErrors.PaymentType = " PaymentType is Required";
        if (!formData.AmountPaid || Number(formData.AmountPaid) <= 0) newErrors.AmountPaid = "Invalid amount";
        if (!formData.TDSAmount) newErrors.TDSAmount = " TDSAmount is Required";
        if (formData.PaymentMode === "BANK") {
            if (!formData.BankListMasterId) newErrors.BankListMasterId = "Bank required";
            if (!formData.AccountNumber) newErrors.AccountNumber = "Account required";
            if (!formData.IFSCCode) newErrors.IFSCCode = "IFSC required";
        }
        if (!formData.TransactionNumber) newErrors.TransactionNumber = "TransactionNumber is Required";
        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };

    const pushPaymentData = (): FormData => {
        const fd = new FormData();

        fd.append("MaterialRequisitionId", String(currentMaterialRequisitionId ?? ""));
        // fd.append("Uniquekey", currentUniquekey ?? "");

        fd.append("PaymentMode", formData.PaymentMode ?? "");
        fd.append("PaymentType", formData.PaymentType ?? "");

        fd.append("BankListMasterId", String(formData.BankListMasterId ?? 0));
        fd.append("BankName", formData.BankName ?? "");

        fd.append("AccountNumber", formData.AccountNumber ?? "");
        fd.append("IFSCCode", formData.IFSCCode ?? "");

        fd.append("AmountPaid", String(formData.AmountPaid ?? 0));
        fd.append("OutstandingAmount", String(formData.OutstandingAmount ?? 0));
        fd.append("TDSAmount", String(formData.TDSAmount ?? 0));

        fd.append("TransactionNumber", formData.TransactionNumber ?? "");
        fd.append("IsAdvance", String(formData.IsAdvance ?? false));

        transactionFiles.forEach(file => {
            if (file instanceof File) {
                fd.append("TransactionReceiptURL", file);
            }
        });

        fd.append("RemoveTransactionReceiptURL", removedFiles.join(","));

        return fd;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}>  <div />  </Loader>
            <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll">

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleAddPayment();
                    }}
                >

                    <div className="space-y-6">

                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                            Make Payment
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <SinglePageSelection
                                label="Payment Mode"
                                required
                                value={formData.PaymentMode || ''}
                                onChange={(e) => handleFieldChange("PaymentMode", String(e))}
                                options={PAYMENT_MODE.map(opt => ({
                                    label: opt.name,
                                    value: opt.id
                                }))}
                                error={errors.PaymentMode}
                            />

                            <SinglePageSelection
                                label="Payment Type"
                                required
                                value={formData.PaymentType || ''}
                                onChange={(e) => handleFieldChange("PaymentType", String(e))}
                                options={PAYMENT_TYPE.map(opt => ({
                                    label: opt.name,
                                    value: opt.id
                                }))}
                                error={errors.PaymentType}
                            />

                            <Input
                                label="Amount Paid"
                                value={formData.AmountPaid?.toString() ?? ''}
                                onChange={(e) => handleFieldChange("AmountPaid", filterNumbers(e.target.value))}
                                error={errors.AmountPaid}
                            />

                            <Input
                                label="Outstanding Amount"
                                value={formData.OutstandingAmount?.toString() ?? ''}
                                disabled
                            />

                            <Input
                                label="TDS Amount"
                                value={formData.TDSAmount?.toString() ?? ''}
                                onChange={(e) => handleFieldChange("TDSAmount", filterNumbers(e.target.value))}
                                error={errors.TDSAmount}
                            />

                            {formData.PaymentMode === "BANK" && (
                                <>
                                    <SingleSelectDropdownWithPagination
                                        label="Bank Name"
                                        required
                                        title="Select Bank"
                                        size="lg"
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

                                    <Input
                                        label="Account Number"
                                        value={formData.AccountNumber ?? ''}
                                        onChange={(e) => handleFieldChange("AccountNumber", filterNumbers(e.target.value))}
                                        error={errors.AccountNumber}
                                    />

                                    <Input
                                        label="IFSC Code"
                                        value={formData.IFSCCode ?? ''}
                                        onChange={(e) => handleFieldChange("IFSCCode", filterIFSC(e.target.value))}
                                        error={errors.IFSCCode}
                                    />
                                </>
                            )}

                            <Input
                                label="Transaction / Cheque Number"
                                value={formData.TransactionNumber ?? ''}
                                onChange={(e) => handleFieldChange("TransactionNumber", e.target.value)}
                                error={errors.TransactionNumber}
                            />

                            <MultiFilePicker
                                label="Transaction / Cheque Receipt"
                                value={transactionFiles}
                                onChange={setTransactionFiles}
                                availableFilesURL={existingURL ?? ""}
                                maxFiles={1}
                                onRemoveExisting={(url) =>
                                    setRemovedFiles(prev => [...prev, url])
                                }
                            />

                            <Checkbox
                                label="Advance"
                                checked={formData.IsAdvance}
                                onChange={(e) => handleFieldChange("IsAdvance", e.target.checked)}
                            />

                        </div>
                    </div>
                </form>
            </div>

            <BottomActionBar
                cancelText="Cancel"
                saveText="Save"
                onCancel={() => navigate(-1)}
                onSave={handleAddPayment}
                isLoading={isLoading}
                canAction={true}
            />

        </div>
    );
};

export default MakePayment;


