import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useToast from "@/core/hooks/useToast";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { Input } from "@/ui/components/forms";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { Loader } from "@/core/utils/loader";
import type { AddUpdatePaidBrokerageBookingRequest } from "@/features/brokerage/models/PaidBrokerageBookingModel";
import { PaidBrokerageBookingService } from "@/features/brokerage/services/PaidBrokerageBookingService";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import { fetchBankListMasterDropdown } from "@/features/bankListMaster/bankListMasterDropDown";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { PAYMENT_MODE, PAYMENT_TYPE } from "@/core/constants";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { useBookingBrokerageListState } from "@/features/brokerage/context/BookingBrokerageListStateContext";
import { hasAnyDocumentFile } from "@/core/utils/fileValidation";

const initialFormState = (): AddUpdatePaidBrokerageBookingRequest => ({
    PaidBrokerageBookingId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    ProjectId: 0,
    BankListMasterId: 0,
    BookingId: 0,
    BrokerageInvoiceId: 0,
    PaymentMode: '',
    PaymentType: '',
    AmountPaid: 0,
    TDSAmount: 0,
    TransactionReceiptURL: '',
    RemoveTransactionReceiptURL: '',
    TransactionNumber: '',
    BankName: ''
})

export const AddUpdatePaidBrokerageBooking: React.FC = () => {

    //#region STATE MANAGEMENT
    const [formData, setFormData] = useState<AddUpdatePaidBrokerageBookingRequest>(() => initialFormState());
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const [transactionReceiptURLFiles, setTransactionReceiptURLFiles] = useState<(File | string)[]>([]);
    const [removeTransactionReceiptURLUrls, SetRemoveTransactionReceiptURLUrls] = useState<string[]>([]);
    const [transactionReceiptURL, ] = useState<string>();

    const navigate = useNavigate();

    const { BrokerageInvoiceId } = useParams<{
        BrokerageInvoiceId?: string;
    }>();

    const { listState } = useBookingBrokerageListState();

    const currentBookingId = listState.bookingId || 0;
    const currentBrokerageInvoiceId = BrokerageInvoiceId ? Number(BrokerageInvoiceId) : 0;

    // ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const { projectId } = useProject();

    // TOAST
    const { addToast } = useToast();
    //#endregion

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/makePayment');
    //#endregion

    //#region HANDLE FIELD CHANGE EVENT
    const handleFieldChange = (field: keyof AddUpdatePaidBrokerageBookingRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };
    //#endregion

   
    // ============================================================= [VALIDATION FUNCTION] =============================================================================================
    const validateAddPaidBrokerageForm = (): {

        isValid: boolean

        errors: { [key: string]: string }

    } => {
        const newErrors: { [key: string]: string } = {};


        if (!formData.PaymentMode) {
            newErrors.PaymentMode = 'Payment Mode is required.';
        }
        if (!formData.BankListMasterId) {
            newErrors.BankListMasterId = "Bank Name is required";
        }
        if (!formData.PaymentType) {
            newErrors.PaymentType = 'Payment Type is required.';
        }

        if (!formData.AmountPaid) {
            newErrors.AmountPaid = "Amount is required";
        } else if (formData.AmountPaid <= 0) {
            newErrors.AmountPaid = "Amount cannot be zero or negative";
        }

        if (!formData.TransactionNumber) {
            newErrors.TransactionNumber = 'Transaction Number is required.';
        }

        if (Number(formData.TDSAmount) != 0 && (Number(formData.TDSAmount) || 0) >= (Number(formData.AmountPaid) || 0)) {
            newErrors.TDSAmount = 'TDS amount cannot be greater than Paid Amount.';
        }

        if (!hasAnyDocumentFile(transactionReceiptURLFiles, transactionReceiptURL, removeTransactionReceiptURLUrls)) {
            newErrors.TransactionReceiptURL = "Transaction Receipt is required";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };
    //#endregion

    const PushPaidBrokerageBookingData = (): FormData => {
        const fd = new FormData();

        fd.append("PaidBrokerageBookingId", formData.PaidBrokerageBookingId.toString());
        fd.append("Uniquekey", formData.Uniquekey ?? "");
        fd.append("ProjectId", projectId!.toString());
        fd.append("BookingId", currentBookingId.toString());
        fd.append("BankListMasterId", formData.BankListMasterId.toString());
        fd.append("BrokerageInvoiceId", currentBrokerageInvoiceId.toString());
        fd.append("PaymentMode", formData.PaymentMode ?? "");
        fd.append("PaymentType", formData.PaymentType ?? "");
        fd.append("TDSAmount", formData.TDSAmount.toString());
        fd.append("AmountPaid", formData.AmountPaid.toString());
        fd.append("TransactionNumber", formData.TransactionNumber ?? "");

        transactionReceiptURLFiles.forEach((file) => {
            if (file instanceof File) {
                fd.append("transactionReceiptURL", file);
            }
        });

        fd.append("RemoveTransactionReceiptURL", removeTransactionReceiptURLUrls.join(","));
        return fd;
    };
    //#endregion

    //#region HANDLE ADD UPDATE PAID AMOUNT
    const handleAddUpdatePaidBrokerageBooking = async () => {
        setErrors({});

        const validation = validateAddPaidBrokerageForm();

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,

            async () => {
                const payload = PushPaidBrokerageBookingData();

                const response = await PaidBrokerageBookingService.apiCallAddUpdatePaidBrokerageBooking(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });


                    navigate("/brokerage/brokerageInvoice/view");

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
            'Add Brokerage Settlement'
        );
    };
    //#endregion

    //#region
    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            {/* Loader */}

            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">

                <form onSubmit={handleAddUpdatePaidBrokerageBooking}>

                    {/* Paid Amount Details */}

                    <div className="space-y-4 pb-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Make Payment</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            <div>
                                <SinglePageSelection
                                    label="Payment Mode"
                                    required
                                    placeholder='Select Payment Mode'
                                    value={formData.PaymentMode || ''}
                                    onChange={(e) => handleFieldChange('PaymentMode', String(e))}
                                    options={PAYMENT_MODE.map((opt) => ({ label: opt.name, value: opt.id }))}
                                    error={errors.PaymentMode}
                                />
                            </div>

                            <div>
                                <SingleSelectDropdownWithPagination
                                    label="Bank Name"
                                    required
                                    title="Select Bank"
                                    size="lg"
                                    dataFetchCallBack={fetchBankListMasterDropdown}
                                    onSelected={(item) => {
                                        if (!item) {
                                            handleFieldChange("BankListMasterId", null);
                                            return;
                                        }

                                        handleFieldChange("BankListMasterId", Number(item.value));
                                    }}
                                    error={errors.BankListMasterId}
                                />
                            </div>

                            <div>
                                <SinglePageSelection
                                    label="Payment Type"
                                    placeholder='Select Payment Type'
                                    required
                                    value={formData.PaymentType || ''}
                                    onChange={(e) => handleFieldChange('PaymentType', String(e))}
                                    options={PAYMENT_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))}
                                    error={errors.PaymentType}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div>
                                <Input
                                    label='Amount (₹)'
                                    required
                                    type="text"
                                    value={formData.AmountPaid}
                                    placeholder="Enter Amount"
                                    maxLength={15}
                                    onChange={(e) => {
                                        const digits = e.target.value.replace(/\D/g, '');
                                        handleFieldChange("AmountPaid", (digits));
                                    }}
                                    error={errors.AmountPaid}
                                />
                            </div>

                            <div>
                                <Input
                                    label='TDS Amount (₹)'
                                    type="text"
                                    value={formData.TDSAmount}
                                    placeholder="Enter TDS Amount"
                                    maxLength={15}
                                    onChange={(e) => {
                                        const digits = e.target.value.replace(/\D/g, '');
                                        handleFieldChange("TDSAmount", (digits));
                                    }}
                                    error={errors.TDSAmount}
                                />
                            </div>

                            <div>
                                <Input
                                    type="text"
                                    required
                                    label='Transaction / Cheque Number'
                                    value={formData.TransactionNumber ?? ""}
                                    onChange={(e) => handleFieldChange("TransactionNumber", e.target.value)}
                                    placeholder="Enter Transaction Number"
                                    maxLength={15}
                                    error={errors.TransactionNumber}
                                />
                            </div>

                            <div>
                                <MultiFilePicker
                                    label="Transaction / Cheque Receipt"
                                    placeholder="Select Transaction / Cheque Receipt"
                                    required
                                    value={transactionReceiptURLFiles}
                                    onChange={setTransactionReceiptURLFiles}
                                    availableFilesURL={transactionReceiptURL ?? ""}
                                    allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                                    maxFiles={1}
                                    error={errors.TransactionReceiptURL}
                                    onRemoveExisting={(url) => {
                                        SetRemoveTransactionReceiptURLUrls((prev) => [...prev, url])
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <BottomActionBar
                cancelText="Cancel"
                saveText={formData.PaidBrokerageBookingId ? "Update" : "Add"}
                onCancel={() => navigate(-1)}
                canAction={canAction}
                onSave={() => {
                    handleAddUpdatePaidBrokerageBooking();
                }}
                isLoading={isLoading}
            />
        </div>
    );
};

export default AddUpdatePaidBrokerageBooking;
