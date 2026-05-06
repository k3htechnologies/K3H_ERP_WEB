import { useCallback, useState, useEffect } from "react";
import { Loader } from "@/core/utils/loader"
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import type { AddUpdateRefundAmountDetailsRequest } from "@/features/crmPayTrack/models/RefundAmountDetailsModel";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import type { ProjectWithBankDetails } from "@/features/projectMaster/models/ProjectMasterModel";
import { fetchProjectBankDropdown } from "@/features/projectMaster/projectBankDropdown";
import { fetchBankListMasterDropdown } from '@/features/bankListMaster/bankListMasterDropDown';
import { Input } from "@/ui/components/forms";
import { filterIFSC, filterNumbers } from "@/core/utils/fileValidation";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { REFUNDED_DETAILS_AMOUNT_TYPE_OPTIONS, PAYMENT_MODE } from '@/core/constants';
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { refundAmountDetailsCrmService } from "@/features/crmPayTrack/services/RefundAmountDetailsCrmService";
import { usePayTrackBookingListState } from "@/features/crmPayTrack/context/PayTrackBookingListStateContext";
import { bookingService } from '@/features/booking/services/BookingService';
import { useNavigate, useLocation } from "react-router-dom";
import type { BookingData, FilterWithPaginationBookingRequest } from "@/features/booking/models/BookingModel";
import type { RefundAmountDetailsData } from "@/features/crmPayTrack/models/RefundAmountDetailsModel";

const initialFormState = (): AddUpdateRefundAmountDetailsRequest => ({
    RefundedAmountLedgerId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    BookingId: null,
    ProjectId: null,
    PaymentFor: '',
    PaymentMode: '',
    ProjectBankListMasterId: 0,
    ProjectBankName: '',
    ProjectAccountNumber: '',
    ProjectIFSCCode: '',
    PaymentReceiptURL: null,
    AccountHolderName: '',
    BankListMasterId: 0,
    BankName: '',
    AccountNumber: '',
    IFSCCode: '',
    AmountType: '',
    RefundedAmount: 0,
    TransactionChequeDemandDraftNumber: '',
    TransactionChequeDemandDraftURL: null,
    TransactionChequeDemandDraftDate: '',
});


export const AddRefundDetails: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [projectWithBankData, setProjectWithBankData] = useState<ProjectWithBankDetails | null>(null);
    const [formData, setFormData] = useState<AddUpdateRefundAmountDetailsRequest>(() => initialFormState());
    const [transactionChequeDemandFiles, setTransactionChequeDemandFiles] = useState<(File | string)[]>([]);
    const [removedTransactionChequeDemandUrls, setRemovedTransactionChequeDemandUrls] = useState<string[]>([]);
    const [transactionChequeDemandURL, _setTransactionChequeDemandURL] = useState<string>();
    const [paymentReceiptFiles, setPaymentReceiptFiles] = useState<(File | string)[]>([]);
    const [removedPaymentReceiptUrls, setRemovedPaymentReceiptUrls] = useState<string[]>([]);
    const [paymentReceiptURL, _setPaymentReceiptURL] = useState<string>();
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const { projectId } = useProject();
    const { listState, updateListState } = usePayTrackBookingListState();
    const { bookingId } = listState;
    const { canAction } = useMenuPermissions("/payTrack");
    const { addToast } = useToast();

    const navigate = useNavigate();
    const location = useLocation();

    const [dropdownLabels, setDropdownLabels] = useState<{
        projectBankName?: string;
        bankName?: string;
    }>({});

    useEffect(() => {
        if (location.state?.refundData) {
            const data = location.state.refundData as RefundAmountDetailsData;
            setFormData({
                RefundedAmountLedgerId: data.RefundedAmountLedgerId,
                Uniquekey: data.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                BookingId: data.BookingId,
                ProjectId: data.ProjectId,
                PaymentFor: data.PaymentFor,
                PaymentMode: data.PaymentMode,
                ProjectBankListMasterId: data.ProjectBankListMasterId,
                ProjectBankName: data.ProjectBankName,
                ProjectAccountNumber: data.ProjectAccountNumber,
                ProjectIFSCCode: data.ProjectIFSCCode,
                AccountHolderName: data.AccountHolderName,
                BankListMasterId: data.BankListMasterId,
                BankName: data.BankName,
                AccountNumber: data.AccountNumber,
                IFSCCode: data.IFSCCode,
                AmountType: data.AmountType,
                RefundedAmount: data.RefundedAmount,
                TransactionChequeDemandDraftNumber: data.TransactionChequeDemandDraftNumber,
                TransactionChequeDemandDraftURL: data.TransactionChequeDemandDraftURL,
                TransactionChequeDemandDraftDate: data.TransactionChequeDemandDraftDate,
                PaymentReceiptURL: data.PaymentReceiptURL,
            });

            if (data.TransactionChequeDemandDraftURL) {
                _setTransactionChequeDemandURL(data.TransactionChequeDemandDraftURL);
            }
            if (data.PaymentReceiptURL) {
                _setPaymentReceiptURL(data.PaymentReceiptURL);
            }

            setDropdownLabels({
                projectBankName: data.ProjectBankName || '',
                bankName: data.BankName || '',
            });

            setProjectWithBankData({
                AccountNumber: data.ProjectAccountNumber || '',
                IFSCCode: data.ProjectIFSCCode || '',
            } as ProjectWithBankDetails);
        }
    }, [location.state]);


    useEffect(() => {
        if (!projectId || !bookingId) return;

        loadBookingForSummary();

    }, [projectId, bookingId]);


    const fetchProjectBankList = useCallback
        (async (page: number) => {
            return fetchProjectBankDropdown(page, {
                projectId: Number(projectId)
            });
        },
            [projectId]
        );

    const validateAddRefundAmountDetails = (): {

        isValid: boolean

        errors: { [key: string]: string }

    } => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.ProjectBankListMasterId) {
            newErrors.ProjectBankListMasterId = 'Project Bank Name is required.';
        }
        if (!formData.ProjectAccountNumber) {
            newErrors.ProjectAccountNumber = 'Project Account Number is required.';
        }
        if (!formData.ProjectIFSCCode) {
            newErrors.ProjectIFSCCode = 'Project IFSC Code is required.';
        }
        if (!formData.AccountHolderName) {
            newErrors.AccountHolderName = 'Account Holder Name is required.';
        }
        if (!formData.BankListMasterId) {
            newErrors.BankListMasterId = 'Bank Name is required.';
        }
        if (!formData.AccountNumber) {
            newErrors.AccountNumber = 'Account Number is required.';
        }
        if (!formData.IFSCCode) {
            newErrors.IFSCCode = 'IFSC Code is required.';
        }
        if (!formData.PaymentFor) {
            newErrors.PaymentFor = 'Payment For is required.';
        }
        if (!formData.PaymentMode) {
            newErrors.PaymentMode = 'Payment Mode is required.';
        }
        if (!formData.AmountType) {
            newErrors.AmountType = 'Amount Type is required.';
        }
        if (!formData.RefundedAmount) {
            newErrors.RefundedAmount = 'Refundable Amount is required.';
        }

        if (formData?.RefundedAmount > (bookingData?.TotalAmountRefundedAgainstBooking ?? 0)) {
            newErrors.RefundedAmount = 'Refundable Amount is greater than Total Amount Refunded Against Booking.';
        }
        if (!formData.TransactionChequeDemandDraftNumber) {
            newErrors.TransactionChequeDemandDraftNumber = 'Transaction Cheque Demand Draft Number is required.';
        }
        if (!formData.TransactionChequeDemandDraftDate) {
            newErrors.TransactionChequeDemandDraftDate = 'Transaction Cheque Demand Draft Date is required.';
        }


        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };

    const PushAddUpdateRefundAmountDetailsData = (): FormData => {

        const fd = new FormData();

        fd.append("RefundedAmountLedgerId", formData.RefundedAmountLedgerId?.toString() ?? "");
        fd.append("Uniquekey", formData.Uniquekey ?? "");
        fd.append("ProjectId", projectId?.toString() ?? "");
        fd.append("BookingId", bookingId?.toString() ?? "");
        fd.append("PaymentFor", formData.PaymentFor ?? "");
        fd.append("PaymentMode", formData.PaymentMode ?? "");
        fd.append("ProjectBankListMasterId", formData.ProjectBankListMasterId?.toString() ?? "");
        fd.append("ProjectBankName", formData.ProjectBankName ?? "");
        fd.append("ProjectAccountNumber", formData.ProjectAccountNumber ?? "");
        fd.append("ProjectIFSCCode", formData.ProjectIFSCCode ?? "");
        fd.append("AccountHolderName", formData.AccountHolderName ?? "");
        fd.append("BankListMasterId", formData.BankListMasterId?.toString() ?? "");
        fd.append("BankName", formData.BankName ?? "");
        fd.append("AccountNumber", formData.AccountNumber ?? "");
        fd.append("IFSCCode", formData.IFSCCode ?? "");
        fd.append("AmountType", formData.AmountType ?? "");
        fd.append("RefundedAmount", formData.RefundedAmount?.toString() ?? "");
        fd.append('TransactionChequeDemandDraftNumber', formData.TransactionChequeDemandDraftNumber || '');
        fd.append('TransactionChequeDemandDraftDate', formData.TransactionChequeDemandDraftDate || '');

        transactionChequeDemandFiles.forEach(file => {
            if (file instanceof File) {
                fd.append('TransactionChequeDemandDraftURL', file);
            }
        });
        fd.append('RemoveTransactionChequeDemandDraftURL', removedTransactionChequeDemandUrls.join(','));

        paymentReceiptFiles.forEach(file => {
            if (file instanceof File) {
                fd.append('PaymentReceiptURL', file);
            }
        });
        fd.append('RemovePaymentReceiptURL', removedPaymentReceiptUrls.join(','));

        return fd;

    }

    const handleFieldChange = (field: keyof AddUpdateRefundAmountDetailsRequest, value: any) => {

        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const loadBookingForSummary = async () => {
        if (!bookingId) return;
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationBookingRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    BookingId: bookingId,
                    ProjectId: Number(projectId),
                    IsCheckPermission: false
                };

                const response = await bookingService.apiCallPullBooking(params);

                if (E.isRight(response)) {

                    const booking = response.right.Data?.[0] ?? null;

                    setBookingData(booking);

                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading Booking Data'
        );
    };


    const handleAddUpdateRefundedAmountLedgerDetails = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setErrors({});

        const validation = validateAddRefundAmountDetails();

        if (!validation.isValid) {

            setErrors(validation.errors);

            return;
        }

        await runApiWithLoader(

            setIsLoading,
            setLoadingMessage,

            async () => {
                const payload = PushAddUpdateRefundAmountDetailsData();

                const response = await refundAmountDetailsCrmService.apiCallAddUpdateRefundAmountDetails(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });
                    updateListState({ activeTab: 'ModifiedRequest', activeSubTab: 'Activity' });
                    navigate(`/payTrack/view`)

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
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}>
                {" "}
                <div>
                </div>{" "}
            </Loader>

            <div className="flex-1 overflow-y-auto thin-scroll ">
                <form onSubmit={handleAddUpdateRefundedAmountLedgerDetails}>

                    <div className="space-y-4 pb-2">

                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Developers Bank Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            <div>
                                <SingleSelectDropdownWithPagination
                                    label="Project Bank Name"
                                    required
                                    title='Select Project Bank Name'
                                    size="lg"
                                    dataFetchCallBack={fetchProjectBankList}
                                    onSelected={(item) => {
                                        if (!item) {
                                            handleFieldChange("ProjectBankListMasterId", null);
                                            setProjectWithBankData(null);
                                            return;
                                        }

                                        setProjectWithBankData(item as unknown as ProjectWithBankDetails);

                                        handleFieldChange("ProjectBankListMasterId", Number(item.value));
                                        handleFieldChange("ProjectAccountNumber", item.AccountNumber);
                                        handleFieldChange("ProjectIFSCCode", item.IFSCCode);
                                        handleFieldChange("ProjectBankName", item.label);
                                    }}
                                    initialValue={createDropdownInitialValue(formData.ProjectBankListMasterId, dropdownLabels.projectBankName)}
                                    error={errors.ProjectBankListMasterId}
                                />
                            </div>

                            <div>
                                <Input
                                    label="Account Number"
                                    placeholder="Enter Account Number"
                                    value={projectWithBankData?.AccountNumber || ""}
                                    disabled
                                />
                            </div>
                            <div>
                                <Input
                                    label="IFSC Code"
                                    placeholder="Enter IFSC Code"
                                    value={projectWithBankData?.IFSCCode || ""}
                                    disabled
                                />
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Customers Party Bank Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            <div>
                                <Input
                                    label="Account Holder Name"
                                    value={formData.AccountHolderName || ''}
                                    onChange={(e) => handleFieldChange('AccountHolderName', e.target.value)}
                                    error={errors.AccountHolderName}
                                    placeholder="Enter Account Holder Name"
                                    maxLength={100}
                                    required
                                />
                            </div>

                            <div>
                                <SingleSelectDropdownWithPagination
                                    label="Bank"
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
                                        handleFieldChange("BankName", item.label);
                                    }}
                                    initialValue={createDropdownInitialValue(formData.BankListMasterId, dropdownLabels.bankName)}
                                    error={errors.BankListMasterId}
                                />
                            </div>

                            <div>
                                <Input
                                    label="Account Number"
                                    value={formData.AccountNumber || ''}
                                    onChange={(e) => handleFieldChange('AccountNumber', filterNumbers(e.target.value))}
                                    error={errors.AccountNumber}
                                    placeholder="Enter Account Number"
                                    required
                                    maxLength={15}
                                />
                            </div>

                            <div>
                                <Input
                                    label="IFSC Code"
                                    value={formData.IFSCCode || ''}
                                    onChange={(e) => handleFieldChange("IFSCCode", filterIFSC(e.target.value))}
                                    error={errors.IFSCCode}
                                    placeholder="Enter IFSC Code"
                                    maxLength={11}
                                    required
                                />
                            </div>

                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Payment Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            <div>
                                <Input
                                    label="Payment For"
                                    value={formData.PaymentFor || ''}
                                    onChange={(e) => handleFieldChange('PaymentFor', e.target.value)}
                                    error={errors.PaymentFor}
                                    placeholder="Enter Payment For"
                                    required
                                />
                            </div>

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
                                    label="Amount Type"
                                    placeholder='Select Amount Type'
                                    required
                                    value={formData.AmountType || ''}
                                    onChange={(e) => handleFieldChange('AmountType', String(e))}
                                    options={REFUNDED_DETAILS_AMOUNT_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                                    error={errors.AmountType}
                                />
                            </div>

                            <div>
                                <Input
                                    label='Refundable Amount'
                                    required
                                    value={formData.RefundedAmount || ''}
                                    onChange={e => handleFieldChange('RefundedAmount', Number(e.target.value))}
                                    placeholder="Enter Refundable Amount"
                                    error={errors.RefundedAmount}
                                />
                            </div>

                            <div>
                                <Input
                                    label="Transaction No. / Cheque No. / Demand Draft Number"
                                    required
                                    value={formData.TransactionChequeDemandDraftNumber || ''}
                                    onChange={(e) => handleFieldChange('TransactionChequeDemandDraftNumber', e.target.value)}
                                    error={errors.TransactionChequeDemandDraftNumber}
                                    placeholder="Enter Transaction / Cheque / Demand Draft Number"

                                />
                            </div>

                            <div>
                                <MultiFilePicker
                                    label="Transaction / Cheque / Demand Draft Image"
                                    placeholder="Select File"
                                    error={errors.TransactionChequeDemandDraftURL}
                                    value={transactionChequeDemandFiles}
                                    onChange={setTransactionChequeDemandFiles}
                                    availableFilesURL={transactionChequeDemandURL ?? ""}
                                    allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                                    maxFiles={5}
                                    maxSizeMB={10}
                                    onRemoveExisting={(url) => {
                                        setRemovedTransactionChequeDemandUrls((prev) => [...prev, url])
                                    }}
                                />
                            </div>

                            <div>
                                <DatePickerInput
                                    label="Transaction / Cheque / Demand Draft Date"
                                    required
                                    value={formatDate_dd_mm_yyyy(formData.TransactionChequeDemandDraftDate)}
                                    error={errors.TransactionChequeDemandDraftDate}
                                    onChange={(val) => handleFieldChange('TransactionChequeDemandDraftDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                />
                            </div>

                            <div>
                                <MultiFilePicker
                                    label="Payment Receipt"
                                    placeholder="Select Payment Receipt"
                                    error={errors.PaymentReceiptURL}
                                    value={paymentReceiptFiles}
                                    onChange={setPaymentReceiptFiles}
                                    availableFilesURL={paymentReceiptURL ?? ""}
                                    allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                                    maxFiles={5}
                                    maxSizeMB={10}
                                    onRemoveExisting={(url) => {
                                        setRemovedPaymentReceiptUrls((prev) => [...prev, url])
                                    }}
                                />
                            </div>

                        </div>
                    </div>
                </form>
            </div>

            <div className="mt-4">
                <BottomActionBar
                    saveText={formData.RefundedAmountLedgerId ? "Update" : "Save"}
                    cancelText={"Cancel"}
                    canAction={canAction}
                    onSave={() => {
                        handleAddUpdateRefundedAmountLedgerDetails();
                    }}
                    onCancel={() => {
                        navigate(`/payTrack/view`)
                    }}

                    isLoading={isLoading}
                />
            </div>
        </div >
    )
}

export default AddRefundDetails