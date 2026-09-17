import { INVOICE_PAYMENT_TYPE, PAYMENT_MODE } from "@/core/constants/staticData";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import { fetchBankListMasterDropdown } from "@/features/bankListMaster/bankListMasterDropDown";
import { Input } from "@/ui/components/forms/Input";
import { filterIFSC, filterNumbers, filterNumbersWithDecimal, hasAnyDocumentFile, isValidAccount, isValidIFSC } from "@/core/utils/fileValidation";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import Checkbox from "@/ui/components/forms/Checkbox";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useNavigate, useParams } from "react-router-dom";
import { runApiWithLoader } from "@/core/utils/apiLoaderHelper";
import useToast from "@/core/hooks/useToast";
import * as E from "fp-ts/Either";
import { materialRequisitionPaymentService } from "@/features/materialRequisition/services/MaterialRequisitionPaymentService";
import { materialRequisitionInvoiceService } from "@/features/materialRequisition/services/MaterialRequisitionInvoiceService";
import type { FilterWithPaginationMaterialRequisitionInvoice } from "@/features/materialRequisition/models/MaterialRequisitionInvoiceModel";
import { useCallback, useEffect, useState } from "react";
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext";
import { Loader } from "@/core/utils/loader";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { fetchProjectBankDropdown } from "@/features/projectMaster/projectBankDropdown";
import type { ProjectWithBankDetails } from "@/features/projectMaster/models/ProjectMasterModel";

const MakePayment: React.FC<{ totalAmount?: number; editData?: any }> = ({ totalAmount = 0, editData }) => {

    const navigate = useNavigate();
    const { addToast } = useToast();
    const { MaterialRequisitionId, MaterialRequisitionInvoiceId } = useParams();
    const { listState } = useMaterialRequisitionListState();
    const { projectId } = useProject();
    const { canAction: canMakePayments } = useMenuPermissions('Make Payments');
    const currentMaterialRequisitionId = MaterialRequisitionId ? Number(MaterialRequisitionId) : listState.MaterialRequisitionId;
    const [remainingInvoiceAmount, setRemainingInvoiceAmount] = useState(totalAmount);
    const systemGeneratedCode = listState.SystemGeneratedCode;

    const initialFormState = () => ({
        PaymentMode: "",
        PaymentType: "",
        ProjectBankListMasterId: 0,
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
    const [dropdownLabels, setDropdownLabels] = useState<{ bankName?: string; projectBankName?: string; }>({});
    const [transactionFiles, setTransactionFiles] = useState<(File | string)[]>([]);
    const [removedFiles, setRemovedFiles] = useState<string[]>([]);
    const [existingURL, setExistingURL] = useState<string>();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const toNumber = (value: any) => Number(value) || 0;

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

    const sanitizeAmount = (value: string) => value.replace(/[^0-9.]/g, "");

    const handleFieldChange = (field: string, value: any) => {
        setFormData(prev => {
            const updated = {
                ...prev, [field]: value
            };

            if (field === "PaymentMode") {
                updated.BankListMasterId = 0;
                updated.BankName = "";
                updated.AccountNumber = "";
                updated.IFSCCode = "";
            }

            if (field === "PaymentType") {
                if (value === "Full") {
                    updated.AmountPaid = remainingInvoiceAmount;
                    updated.PendingAmount = 0;
                }

                if (value === "Partial") {
                    updated.AmountPaid = 0;
                    updated.PendingAmount = remainingInvoiceAmount;
                }
            }

            if (field === "AmountPaid") {
                const paid = toNumber(updated.AmountPaid);

                updated.PendingAmount = Math.max(
                    remainingInvoiceAmount - paid,
                    0
                );
            }
            return updated;
        });

        if (errors[field]) {
            setErrors((prev: any) => ({
                ...prev, [field]: ""
            }));
        }

        setErrors({});


    };

    const validate = () => {

        const newErrors: any = {};

        if (!formData.PaymentMode) {
            newErrors.PaymentMode = " Payment Mode is Required";
        }
        if (!formData.PaymentType) {
            newErrors.PaymentType = " Payment Type is Required";
        }
        if (!formData.AmountPaid) {
            newErrors.AmountPaid = " Amount Paid is Required";
        } else if (toNumber(formData.AmountPaid) <= 0) {
            newErrors.AmountPaid = "Invalid Amount";
        }
        if (toNumber(formData.AmountPaid) > remainingInvoiceAmount) {
            newErrors.AmountPaid =
                `Amount cannot exceed ₹${remainingInvoiceAmount}`;
        }
        if (!formData.TDSAmount) {
            newErrors.TDSAmount = " TDS Amount is Required";

        } else if (toNumber(formData.TDSAmount) < 0) {
            newErrors.TDSAmount = "Invalid";
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

    const pushPaymentData = () => {

        const fd = new FormData();

        fd.append("ProjectId", String(projectId));
        fd.append("ProjectBankListMasterId", String(formData.ProjectBankListMasterId));
        fd.append("MaterialRequisitionId", String(currentMaterialRequisitionId));
        fd.append("MaterialRequisitionInvoiceId", String(MaterialRequisitionInvoiceId ?? 0));
        fd.append("PaymentMode", formData.PaymentMode);
        fd.append("PaymentType", formData.PaymentType);
        fd.append("BankListMasterId", String(formData.BankListMasterId));
        fd.append("BankName", formData.BankName);
        fd.append("AccountNumber", formData.AccountNumber);
        fd.append("IFSCCode", formData.IFSCCode);
        fd.append("AmountPaid", String(toNumber(formData.AmountPaid)));
        fd.append("OutstandingAmount", String(toNumber(formData.PendingAmount)));
        fd.append("TDSAmount", String(toNumber(formData.TDSAmount)));
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

                const response = await materialRequisitionPaymentService.apiCallAddUpdateMaterialRequisitionPayment(pushPaymentData());

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
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Add Payment'
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

    useEffect(() => {
        if (!MaterialRequisitionInvoiceId || !projectId) return;

        const fetchInvoiceData = async () => {
            await runApiWithLoader(
                setIsLoading,
                setLoadingMessage,
                async () => {
                    const params: FilterWithPaginationMaterialRequisitionInvoice = {
                        PageNumber: 1,
                        PageSize: 1,
                        ProjectId: Number(projectId),
                        MaterialRequisitionId: Number(currentMaterialRequisitionId),
                        MaterialRequisitionInvoiceId: Number(MaterialRequisitionInvoiceId)
                    };

                    const response = await materialRequisitionInvoiceService.apiCallPullMaterialRequisitionInvoice(params);

                    if (E.isRight(response)) {

                        const data = response.right.Data;

                        const invoice = Array.isArray(data) ? data[0] : data;

                        if (invoice) {

                            const invoiceAmt = toNumber(invoice.InvoiceAmount);

                            const paidAmt = toNumber(invoice.InvoiceAmountPaidTillDate);

                            const pendingAmt = Math.max(invoiceAmt - paidAmt, 0);

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
    }, [MaterialRequisitionInvoiceId, projectId, currentMaterialRequisitionId]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5 lg:p-6">
            <Loader loading={isLoading} title={loadingMessage}> <div /> </Loader>

            <div className="pb-5">
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
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Customer Bank Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"  >

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
                                handleFieldChange("BankName", item?.label || "");
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

                    <SinglePageSelection
                        label="Payment Type"
                        required
                        value={formData.PaymentType}
                        onChange={(e) => handleFieldChange("PaymentType", String(e))}
                        options={INVOICE_PAYMENT_TYPE.map(opt => ({ label: opt.name, value: opt.id }))}
                        error={errors.PaymentType}
                    />

                    <Input
                        required
                        label="Amount Paid"
                        value={String(formData.AmountPaid)}
                        disabled={formData.PaymentType === "Full"}
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
                        label="Pending Amount"
                        value={String(formData.PendingAmount)}
                        disabled
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

            <BottomActionBar
                cancelText="Cancel"
                saveText="Add"
                onCancel={() => navigate(-1)}
                onSave={handleAddPayment}
                isLoading={isLoading}
                canAction={canMakePayments}
            />

        </div>
    );
};

export default MakePayment;