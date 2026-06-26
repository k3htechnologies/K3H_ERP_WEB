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
import { filterIFSC, filterNumbers, filterNumbersWithDecimal, hasAnyDocumentFile, isValidIFSC } from "@/core/utils/fileValidation";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { PAYMENT_MODE } from '@/core/constants';
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { refundAmountDetailsCrmService } from "@/features/crmPayTrack/services/RefundAmountDetailsCrmService";
import { usePayTrackBookingListState } from "@/features/crmPayTrack/context/PayTrackBookingListStateContext";
import { useNavigate, useLocation } from "react-router-dom";
import type { RefundAmountDetailsData } from "@/features/crmPayTrack/models/RefundAmountDetailsModel";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatCurrency, getSafeString } from "@/core/utils/comman";

const initialFormState = (): AddUpdateRefundAmountDetailsRequest => ({
    RefundedAmountLedgerId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    BookingId: null,
    ProjectId: null,
    PaymentMode: '',
    ProjectBankListMasterId: 0,
    ProjectBankName: '',
    ProjectAccountNumber: '',
    ProjectIFSCCode: '',
    AccountHolderName: '',
    BankListMasterId: 0,
    BankName: '',
    AccountNumber: '',
    IFSCCode: '',
    RefundedAmount: 0,
    TransactionChequeDemandDraftNumber: '',
    TransactionChequeDemandDraftURL: null,
    RemoveTransactionChequeDemandDraftURL: "",
    TransactionChequeDemandDraftDate: '',
});


export const AddRefundDetails: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [projectWithBankData, setProjectWithBankData] = useState<ProjectWithBankDetails | null>(null);
    const [formData, setFormData] = useState<AddUpdateRefundAmountDetailsRequest>(() => initialFormState());

    const [documentFiles, setDocumentFiles] = useState<(File | string)[]>([]);
    const [removedDocumentURLs, setRemovedDocumentURLs] = useState<string[]>([]);
    const [documentURL, setDocumentURL] = useState<string>();
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const { projectId } = useProject();
    const { listState, updateListState } = usePayTrackBookingListState();
    const { bookingId, totalAmountRefundedAgainstBooking,bookingData } = listState;
    const { canAction } = useMenuPermissions("/modificationRequest");
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
                RefundedAmount: data.RefundedAmount,
                TransactionChequeDemandDraftNumber: data.TransactionChequeDemandDraftNumber,
                TransactionChequeDemandDraftURL: data.TransactionChequeDemandDraftURL,
                RemoveTransactionChequeDemandDraftURL: "",
                TransactionChequeDemandDraftDate: data.TransactionChequeDemandDraftDate,
            });

            setDocumentFiles([]);
            setDocumentURL(data.TransactionChequeDemandDraftURL || "");
            setRemovedDocumentURLs([]);

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


    const fetchProjectBankList = useCallback(
        async (pageNumber: number, params?: { value?: string }) => {
            return fetchProjectBankDropdown(pageNumber, {
                projectId: projectId || 0,
                bankName: params?.value || ""
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
        if (!formData.AccountNumber?.trim()) {
            newErrors.AccountNumber = "Account Number is required.";
        } else if (formData.AccountNumber.trim().length > 18) {
            newErrors.AccountNumber = "Account Number must be at most 50 characters";
        }
        if (!formData.IFSCCode?.trim()) {
            newErrors.IFSCCode = "IFSC Code is required.";
        } else if (formData.IFSCCode.trim().length > 12) {
            newErrors.IFSCCode = "IFSC Code must be at most 50 characters";
        } else if (!isValidIFSC(formData.IFSCCode.trim())) {
            newErrors.IFSCCode = "Enter a valid IFSC Code";
        }

        if (!formData.PaymentMode) {
            newErrors.PaymentMode = 'Payment Mode is required.';
        }
        if (!formData.RefundedAmount) {
            newErrors.RefundedAmount = 'Refundable Amount is required.';
        }

        if (formData?.RefundedAmount > (bookingData?.TotalAmountRefundedAgainstBooking ?? 0) - (bookingData?.RefundedAmountOnTillDate ?? 0)) {
            newErrors.RefundedAmount = `Refundable Amount cannot be greater than ₹ ${(
                (bookingData?.TotalAmountRefundedAgainstBooking ?? 0) -
                (bookingData?.RefundedAmountOnTillDate ?? 0)).toFixed(2)}.`
        }
        if (!formData.TransactionChequeDemandDraftNumber) {
            newErrors.TransactionChequeDemandDraftNumber = 'Transaction / Cheque / Demand Draft No. is required.';
        }
        if (!formData.TransactionChequeDemandDraftDate) {
            newErrors.TransactionChequeDemandDraftDate = 'Transaction / Cheque / Demand Draft Date is required.';
        }

        if (!hasAnyDocumentFile(documentFiles, documentURL, removedDocumentURLs)) {
            newErrors.documentFiles = "Transaction / Cheque / Demand Draft Image is required.";
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
        fd.append("RefundedAmount", formData.RefundedAmount?.toString() ?? "");
        fd.append('TransactionChequeDemandDraftNumber', formData.TransactionChequeDemandDraftNumber || '');
        fd.append('TransactionChequeDemandDraftDate', formData.TransactionChequeDemandDraftDate || '');

        documentFiles.forEach((file) => {
            if (file instanceof File) {
                fd.append("TransactionChequeDemandDraftURL", file);
            }
        });

        fd.append("RemoveTransactionChequeDemandDraftURL", removedDocumentURLs.join(","));

        return fd;

    }

    const handleFieldChange = (field: keyof AddUpdateRefundAmountDetailsRequest, value: any) => {

        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
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

                    updateListState({ activeTab: 'ModifiedRequest', activeSubTab: 'Refund Payment Ledger' });

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
            <Loader loading={isLoading} title={loadingMessage}> {" "}
                <div> </div>{" "}
            </Loader>
            <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">
                <form onSubmit={handleAddUpdateRefundedAmountLedgerDetails}>
                    <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                        <div className="bg-[#F6F9FF] px-3 py-2 border-b border-[#D0D7DE]">
                            <h4 className="text-sm font-semibold text-[#13367A]">
                                Unit Details
                            </h4>
                        </div>
                        <div className="p-4 bg-white">
                            <div className="grid grid-cols-4 gap-4 bg-white rounded-lg pt-4">
                                <FieldItem label="Project Name" value={getSafeString(bookingData?.ProjectName)} />
                                <FieldItem label="Wing" value={getSafeString(bookingData?.Wing)} />
                                <FieldItem label="Floor" value={getSafeString(bookingData?.Floor)} />
                                <FieldItem label="Unit Number" value={getSafeString(bookingData?.Flat)} />
                                <FieldItem label="Configuration" value={getSafeString(bookingData?.FlatConfiguration)} />
                                <FieldItem label="RERA Carpet Area (SqFt)" value={getSafeString(bookingData?.RERACarpetAreaSqFt)} />
                                <FieldItem label="Agreement Value (With TDS) (₹)" value={formatCurrency(bookingData?.AgreementValue)} />
                                <FieldItem label="Number Of Parking" value={getSafeString(bookingData?.NumberOfParking)} />

                            </div>
                        </div>
                    </section>

                    {bookingData?.BookingApplicantData && bookingData?.BookingApplicantData.length > 0 && (
                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden mt-5">

                            <div className="bg-[#FFF6EB] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#C2410C]">
                                    Applicant & Co - Applicant Details
                                </h4>
                            </div>
                            <div className="p-4 bg-white">
                                {bookingData?.BookingApplicantData.map((applicant, i) => (
                                    <div key={applicant.BookingApplicantId ?? i} className="">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <FieldItem label="Type" value={getSafeString(applicant.ApplicantType)} className='text-blue-900 bold' />
                                            <FieldItem label="Applicant Name" value={getSafeString(applicant.ApplicantName)} urls={applicant?.PhotoURL} isIcon />
                                            <FieldItem label="Mobile Number" value={`${getSafeString(applicant?.ApplicantMobileNumberCountryCode ?? "+91")}  ${getSafeString(applicant?.ApplicantMobileNumber)}`} />

                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {bookingData?.ParkingData && bookingData?.ParkingData.length > 0 && (
                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden mt-5">

                            <div className="bg-[#F6F9FF] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#13367A]">
                                    Parking Details
                                </h4>
                            </div>
                            <div className="p-4 bg-white">
                                {bookingData?.ParkingData.map((parking, index) => {

                                    const isLast = index === (bookingData?.ParkingData?.length ?? 0) - 1;

                                    return (
                                        <div key={parking.ParkingId || index} className="pt-4">
                                            <h3 className="text-sm font-semibold text-gray-500">
                                                Parking {index + 1}
                                            </h3>
                                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 ${!isLast ? "border-b border-[#135bec2e] pb-4" : "border-b border-[#135bec2e] pb-4 pt-4"} `} >
                                                <FieldItem label="Parking Number" value={getSafeString(parking.ParkingNumber)} />
                                                <FieldItem label="Category" value={getSafeString(parking.ParkingCategory)} />
                                                <FieldItem label="Type" value={getSafeString(parking.ParkingType)} />
                                            </div>

                                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 ${!isLast ? "border-b border-[#135bec2e] pb-4" : ""} `} >
                                                <FieldItem label="Size" value={getSafeString(parking.ParkingSubType)} />
                                                <FieldItem label="Dimensions" value={getSafeString(parking.ParkingDimensions)} />
                                                <FieldItem label="EV Charging" value={parking.IsEVChargingAvailable ? 'Yes' : 'No'} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="font-semibold mb-2">
                            Note: This is the refund amount finalized for this booking. Please consider this amount while initiating any further refund process.
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <FieldItem label="Amount" value={formatCurrency(totalAmountRefundedAgainstBooking)} isSetValue />

                        </div>
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="font-semibold mb-2">Received Amount</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <FieldItem label="Stamp Duty" value={formatCurrency(bookingData?.ReceivedStampDutyAmount)} />
                            <FieldItem label="Registration Fees" value={formatCurrency(bookingData?.ReceivedRegistrationFees)} />
                            <FieldItem label="Agreement Value(Without TDS)" value={formatCurrency(bookingData?.ReceivedAgreementValue)} />
                            <FieldItem label="Agreement Value GST" value={formatCurrency(bookingData?.ReceivedAgreementValueGSTAmount)} />
                            <FieldItem label="Agreement Value TDS" value={formatCurrency(bookingData?.ReceivedAgreementValueTDS)} />
                            <FieldItem label="Other Charges" value={formatCurrency(bookingData?.ReceivedOtherChargesAmount)} />
                            <FieldItem label="Other Charges GST" value={formatCurrency(bookingData?.ReceivedOtherChargesGSTAmount)} />
                            <FieldItem label="Total Received" value={formatCurrency(bookingData?.RefundedAmountOnTillDate)} />

                        </div>
                    </div>
                    <div className="space-y-4 pt-5">

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
                            <div>
                                <Input label="Branch" placeholder="Enter Branch" value={projectWithBankData?.Branch || ""} disabled />
                            </div>
                            <div>
                                <Input label="Account Type" placeholder="Enter Account Type" value={projectWithBankData?.AcType || ""} disabled />
                            </div>
                            <div>
                                <Input label="Nature Of Account" placeholder="Enter Nature Of Account" value={projectWithBankData?.NatureOfAccount || ""} disabled />
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Customers Bank Details</h3>
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
                                    title="Select Bank Name"
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
                                    maxLength={18}
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

                                <Input
                                    label="Refundable Amount (₹)"
                                    placeholder="Enter Refundable Amount (₹)"
                                    required
                                    value={formData.RefundedAmount || ""}
                                    onChange={(e) => {
                                        const val = filterNumbersWithDecimal(e.target.value);
                                        if (val !== null) {
                                            const refundedAmountAmount = filterNumbersWithDecimal(e.target.value);

                                            handleFieldChange("RefundedAmount", refundedAmountAmount);
                                        }
                                    }}

                                    rightIcon="₹"
                                    error={errors.RefundedAmount}
                                />
                            </div>

                            <div>
                                <Input
                                    label="Transaction / Cheque / Demand Draft No."
                                    required
                                    value={formData.TransactionChequeDemandDraftNumber || ''}
                                    onChange={(e) => handleFieldChange('TransactionChequeDemandDraftNumber', e.target.value)}
                                    error={errors.TransactionChequeDemandDraftNumber}
                                    placeholder="Enter Transaction / Cheque / Demand Draft No"
                                    maxLength={25}

                                />
                            </div>

                            <div>
                                <MultiFilePicker
                                    label="Transaction / Cheque / Demand Draft Image"
                                    placeholder="Select Transaction / Cheque / Demand Draft Image"
                                    required
                                    value={documentFiles}
                                    onChange={(files) => {
                                        setDocumentFiles(files);
                                        if (errors.documentFiles) {
                                            setErrors((prev) => ({ ...prev, documentFiles: "" }));
                                        }
                                    }}
                                    availableFilesURL={documentURL ?? ""}
                                    allowedTypes={["image/jpeg", "image/png", "application/pdf"]}
                                    onRemoveExisting={(url) => {
                                        setRemovedDocumentURLs((prev) => [...prev, url]);
                                    }}
                                    error={errors.documentFiles}
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