import { useCallback, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { INVOICE_PAYMENT_TYPE, PAYMENT_MODE } from "@/core/constants";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { useBookingBrokerageListState } from "@/features/brokerage/context/BookingBrokerageListStateContext";
import { filterNumbersWithDecimal, hasAnyDocumentFile } from "@/core/utils/fileValidation";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { fetchProjectBankDropdown } from "@/features/projectMaster/projectBankDropdown";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import type { ProjectWithBankDetails } from "@/features/projectMaster/models/ProjectMasterModel";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { formatCurrency } from "@/core/utils/comman";

const initialFormState = (): AddUpdatePaidBrokerageBookingRequest => ({
    PaidBrokerageBookingId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    ProjectId: 0,
    ProjectBankListMasterId: 0,
    BookingId: 0,
    BrokerageInvoiceId: 0,
    PaymentMode: '',
    PaymentType: '',
    AmountPaid: 0,
    TDSAmount: 0,
    TransactionReceiptURL: '',
    RemoveTransactionReceiptURL: '',
    TransactionNumber: '',
    ProjectBankName: '',
    TransactionChequeDemandDraftDate: "",
})

export const AddUpdatePaidBrokerageBooking: React.FC = () => {

    //#region STATE MANAGEMENT
    const [formData, setFormData] = useState<AddUpdatePaidBrokerageBookingRequest>(() => initialFormState());
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [projectWithBankData, setProjectWithBankData] = useState<ProjectWithBankDetails | null>(null);
    const [transactionReceiptURLFiles, setTransactionReceiptURLFiles] = useState<(File | string)[]>([]);
    const [removeTransactionReceiptURLUrls, SetRemoveTransactionReceiptURLUrls] = useState<string[]>([]);
    const [transactionReceiptURL,] = useState<string>();
    const navigate = useNavigate();

    const location = useLocation();
    const routeState = (location.state as { InvoiceAmount?: number; PaidAmount?: number, InvoiceNumber: string, InvoiceDate: string }) || {};
    const invoiceAmount = Number(routeState.InvoiceAmount || 0);
    const alreadyPaidAmount = Number(routeState.PaidAmount || 0);
    const pendingAmount = invoiceAmount - alreadyPaidAmount;
    const [currentPendingAmount, setCurrentPendingAmount] = useState(0);
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

    const fetchProjectBankList = useCallback(async (pageNumber: number, params?: { value?: string }) => {
        return fetchProjectBankDropdown(pageNumber, {
            projectId: projectId || 0,
            bankName: params?.value || ""
        });
    }, [projectId]);

    const [dropdownLabels, setDropdownLabels] = useState<{
        projectBankName?: string;
    }>({});

    //#region HANDLE FIELD CHANGE EVENT
    const handleFieldChange = (
        field: keyof AddUpdatePaidBrokerageBookingRequest,
        value: any
    ) => {
        setFormData((prev) => {
            const updated = { ...prev, [field]: value };

            if (field === "PaymentType") {
                if (value === "Full") {
                    updated.AmountPaid = pendingAmount;
                    setCurrentPendingAmount(0);
                }

                if (value === "Partial") {
                    updated.AmountPaid = 0;
                    setCurrentPendingAmount(pendingAmount);
                }
            }

            if (field === "AmountPaid") {
                const paid = Number(value) || 0;

                setCurrentPendingAmount(
                    Math.max(pendingAmount - paid, 0)
                );
            }

            return updated;
        });

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
        if (!formData.ProjectBankListMasterId) {
            newErrors.ProjectBankListMasterId = "Project Bank Name is required";
        }
        if (!formData.PaymentType) {
            newErrors.PaymentType = 'Payment Type is required.';
        }
        if (!formData.TransactionChequeDemandDraftDate) {
            newErrors.TransactionChequeDemandDraftDate = 'Transaction / Cheque / Demand Draft Date is required';
        }

        if (!formData.AmountPaid) {
            newErrors.AmountPaid = "Amount is required";
        } else if (formData.AmountPaid <= 0) {
            newErrors.AmountPaid = "Amount cannot be zero or negative";
        } else if (pendingAmount > 0 && Number(formData.AmountPaid) > pendingAmount) {
            newErrors.AmountPaid = `Amount cannot be greater than pending amount of ₹${pendingAmount.toLocaleString('en-IN')}`;
        }

        if (!formData.TransactionNumber) {
            newErrors.TransactionNumber = 'Transaction / Cheque / Demand draft No is required.';
        }

        if (Number(formData.TDSAmount) != 0 && (Number(formData.TDSAmount) || 0) >= (Number(formData.AmountPaid) || 0)) {
            newErrors.TDSAmount = 'TDS amount cannot be greater than Paid Amount.';
        }

        if (!hasAnyDocumentFile(transactionReceiptURLFiles, transactionReceiptURL, removeTransactionReceiptURLUrls)) {
            newErrors.TransactionReceiptURL = "Transaction / Cheque / Demand Draft Image is required";
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
        fd.append("ProjectBankListMasterId", formData.ProjectBankListMasterId.toString());
        fd.append("BrokerageInvoiceId", currentBrokerageInvoiceId.toString());
        fd.append("PaymentMode", formData.PaymentMode ?? "");
        fd.append("PaymentType", formData.PaymentType ?? "");
        fd.append("TDSAmount", formData.TDSAmount.toString());
        fd.append("AmountPaid", formData.AmountPaid.toString());
        fd.append("TransactionNumber", formData.TransactionNumber ?? "");
        fd.append("TransactionChequeDemandDraftDate", formData.TransactionChequeDemandDraftDate ?? "");

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

                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-3">
                            <FieldItem label="Invoice Number" value={routeState.InvoiceNumber} />
                            <FieldItem label="Invoice Date" value={formatDate_dd_MonthName_yy(routeState.InvoiceDate)} />
                            <FieldItem label="Invoice Amount" value={formatCurrency(routeState.InvoiceAmount)} />
                            <FieldItem label="Paid Invoice Amount" value={formatCurrency(routeState.PaidAmount)} />
                            <FieldItem label="Pending Amount" value={formatCurrency(pendingAmount)} />
                        </div>
                    </div>

                    {/* Paid Amount Details */}

                    <div className="space-y-4 pb-3">

                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Developer Bank Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <SingleSelectDropdownWithPagination
                                    label="Project Bank Name"
                                    title="Select Project Bank Name"
                                    size="lg"
                                    required
                                    dataFetchCallBack={fetchProjectBankList}
                                    onSelected={(item) => {
                                        if (!item) {
                                            handleFieldChange("ProjectBankListMasterId", null);
                                            setProjectWithBankData(null);
                                            setDropdownLabels((prev) => ({
                                                ...prev,
                                                projectBankName: "",
                                            }));
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
                                <SinglePageSelection
                                    label="Payment Type"
                                    placeholder="Select Payment Type"
                                    required
                                    value={formData.PaymentType || ""}
                                    onChange={(e) => handleFieldChange("PaymentType", String(e))}
                                    options={INVOICE_PAYMENT_TYPE.map((opt) => ({ label: opt.name, value: opt.id, }))}
                                    error={errors.PaymentType}
                                />
                            </div>
                       

                            <div>
                                <Input
                                    label="Amount (₹)"
                                    required
                                    type="text"
                                    value={formData.AmountPaid}
                                    placeholder="Enter Amount"
                                    maxLength={15}
                                    disabled={formData.PaymentType === "Full"}
                                    onChange={(e) => handleFieldChange("AmountPaid", filterNumbersWithDecimal(e.target.value) || 0)}
                                    error={errors.AmountPaid}
                                />
                            </div>

                            <div>
                                <Input
                                    label="Pending Amount (₹)"
                                    value={currentPendingAmount.toFixed(2)}
                                    disabled
                                />
                            </div>

                            <div>
                                <Input
                                    label='TDS Amount (₹)'
                                    type="text"
                                    value={formData.TDSAmount}
                                    placeholder="Enter TDS Amount"
                                    maxLength={15}
                                    onChange={(e) => handleFieldChange("TDSAmount", filterNumbersWithDecimal(e.target.value) || 0)}
                                    error={errors.TDSAmount}
                                />
                            </div>

                            <div>
                                <Input
                                    type="text"
                                    required
                                    label='Transaction / Cheque / Demand Draft No'
                                    value={formData.TransactionNumber ?? ""}
                                    onChange={(e) => handleFieldChange("TransactionNumber", e.target.value)}
                                    placeholder="Enter Transaction / Cheque / Demand Draft No"
                                    maxLength={15}
                                    error={errors.TransactionNumber}
                                />
                            </div>

                            <div>
                                <MultiFilePicker
                                    label="Transaction / Cheque / Demand Draft Image"
                                    placeholder="Select Transaction / Cheque / Demand Draft Image"
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

                            <div>
                                <DatePickerInput
                                    label="Transaction / Cheque / Demand Draft Date"
                                    required
                                    value={formatDate_dd_mm_yyyy(formData.TransactionChequeDemandDraftDate)}
                                    onChange={(val) => handleFieldChange('TransactionChequeDemandDraftDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                    error={errors.TransactionChequeDemandDraftDate}
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
