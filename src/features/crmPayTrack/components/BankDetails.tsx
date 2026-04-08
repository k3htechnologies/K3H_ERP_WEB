import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Input } from "@/ui/components/forms";
import { useState, useEffect } from "react";
import { SingleSelectDropdownWithPagination } from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchBankListMasterDropdown } from "@/features/bankListMaster/bankListMasterDropDown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import type { AddUpdateBookingLoanDetailsRequest, FilterWithPaginationBookingLoanDetails } from '@/features/crmPayTrack/models/BookingLoanDetailsModel';
import { runApiWithLoader } from "@/core/utils";
import useToast from "@/core/hooks/useToast";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { bookingLoanDetailsService } from "@/features/crmPayTrack/services/BookingLoanDetailsService";
import * as E from "fp-ts/Either";
import { Loader } from '@/core/utils/loader';
import { usePayTrackBookingListState } from "@/features/crmPayTrack/context/PayTrackBookingListStateContext";
import { allowPercentage, filterLetters, filterNumbers, filterNumbersWithDecimal } from "@/core/utils/fileValidation";
import { TextArea } from "@/ui/components/forms/Textarea";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";

const initialFormState = (): AddUpdateBookingLoanDetailsRequest => ({
    BookingLoanDetailsId: 0,
    Uniquekey: null,
    BookingId: 0,
    ProjectId: 0,
    LoanSanctionAmount: 0,
    LoanSanctionDate: null,
    BankListMasterId: 0,
    LoanAccountNumber: "",
    BankBranchName: "",
    Address: ""
});

export const BankDetails: React.FC = () => {

    // STATES MANAGEMENT
    const [formData, setFormData] = useState<AddUpdateBookingLoanDetailsRequest>(() => initialFormState());
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const { canAction } = useMenuPermissions("/payTrack");

    const { listState } = usePayTrackBookingListState();
    const { bookingId } = listState;

    const { addToast } = useToast();
    const { projectId } = useProject();

    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const [dropdownLabels, setDropdownLabels] = useState<{
        bankName?: string;
    }>({});

    //#endregion

    //#region HANDLE FILED CHNAGE EVENT
    const handleFieldChange = (field: keyof AddUpdateBookingLoanDetailsRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };
    //#endregion

    useEffect(() => {
        if (projectId && bookingId) {
            fetchBankLoanDetails();
        }
    }, [projectId, bookingId])



    // #region DATA LOAD|FETCH
    const fetchBankLoanDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationBookingLoanDetails = {
                    PageNumber: 1,
                    PageSize: 1,
                    ProjectId: Number(projectId),
                    BookingId: bookingId,
                };
                const response = await bookingLoanDetailsService.apiCallPullBookingLoanDetails(params);

                if (E.isRight(response)) {
                    const e = response.right.Data?.[0];

                    if (e) {
                        setFormData((prev) => ({
                            ...prev,
                            BookingLoanDetailsId: e.BookingLoanDetailsId ?? prev.BookingLoanDetailsId,
                            Uniquekey: e.Uniquekey ?? prev.Uniquekey,
                            BookingId: e.BookingId ?? prev.BookingId,
                            ProjectId: e.ProjectId ?? prev.ProjectId,
                            LoanSanctionDate: e.LoanSanctionDate ?? prev.LoanSanctionDate,
                            LoanSanctionAmount: e.LoanSanctionAmount ?? prev.LoanSanctionAmount,
                            BankListMasterId: e.BankListMasterId ?? prev.BankListMasterId,
                            LoanAccountNumber: e.LoanAccountNumber ?? prev.LoanAccountNumber,
                            BankBranchName: e.BankBranchName ?? prev.BankBranchName,
                            Address: e.Address ?? prev.Address,
                        }));

                        setDropdownLabels({
                            bankName: e.BankName || "",
                        });


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
            "Loading Bank Loan Details",
        );
    };
    //#endregion

    //#region BANK DETAILS VALIDATION | ADD | UPDATE ACTION
    // ============================================================= [VALIDATION FUNCTION] =============================================================================================
    const validateAddBankDetails = (): {
        isValid: boolean;

        errors: { [key: string]: string };
    } => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.BankListMasterId) {
            newErrors.BankListMasterId = "Bank Name is required";
        }

        if (!formData.BankBranchName?.trim()) {
            newErrors.BankBranchName = "Branch Name is required.";
        } else if (formData.BankBranchName.trim().length > 250) {
            newErrors.BankBranchName = "Branch Name must be at most 250 characters";
        }


        if (!formData.LoanAccountNumber?.trim()) {
            newErrors.LoanAccountNumber = "Account Number is required.";
        } else if (formData.LoanAccountNumber.trim().length > 18) {
            newErrors.LoanAccountNumber = "Account Number must be at most 50 characters";
        }

        if (!formData.LoanSanctionAmount) {
            newErrors.LoanSanctionAmount = "Loan Sanction Amount is required";
        }else if (formData.LoanSanctionAmount <= 0) {
            newErrors.LoanSanctionAmount = "Loan Sanction Amount cannot be zero or negative";
        }

        if (!formData.LoanSanctionDate) {
            newErrors.LoanSanctionDate = "Loan Sanction Date is required";
        }

        if (!formData.Address?.trim()) {
            newErrors.Address = "Address is required";
        } else if (formData.Address.trim().length > 500) {
            newErrors.Address = "Address must be at most 500 characters";
        }
        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const PushBankDetailsFormData = (): AddUpdateBookingLoanDetailsRequest => {
        return {
            BookingLoanDetailsId: formData.BookingLoanDetailsId,
            Uniquekey: formData.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            BookingId: bookingId,
            ProjectId: Number(projectId),
            LoanSanctionAmount: formData.LoanSanctionAmount ?? 0,
            LoanSanctionDate: formData.LoanSanctionDate === "" ? null : formData.LoanSanctionDate,
            BankListMasterId: formData.BankListMasterId,
            LoanAccountNumber: formData.LoanAccountNumber,
            BankBranchName: formData.BankBranchName,
            Address: formData.Address,
        };
    };

    const handleSubmit = async () => {
        setErrors({});

        const validation = validateAddBankDetails();

        if (!validation.isValid) {

            setErrors(validation.errors);

            addToast({ type: "error", title: "Please fill the required filed" });

            return;
        }

        await runApiWithLoader(
            setIsLoading,

            setLoadingMessage,
            async () => {
                const payload = PushBankDetailsFormData();

                const response = await bookingLoanDetailsService.apiCallAddUpdateBookingLoanDetails(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

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

            Number(formData.BankListMasterId) === 0 ? "Add Bank Loan Details" : "Update Bank Loan Details",
        );
    };

    //#endregion


    return (
        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-5">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
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
                                }}
                                initialValue={createDropdownInitialValue(formData.BankListMasterId, dropdownLabels.bankName)}
                                error={errors.BankListMasterId}
                            />
                        </div>

                        {/* Branch */}
                        <div>
                            <Input
                                label="Branch Name"
                                placeholder="Enter Bank Branch Name"
                                required value={formData.BankBranchName}
                                maxLength={250}
                                onChange={(e) => handleFieldChange("BankBranchName", filterLetters(e.target.value))}
                                error={errors.BankBranchName} />
                        </div>

                        {/* Account Number */}
                        <div>
                            <Input
                                label="Account Number"
                                placeholder="Enter Account Number"
                                required
                                value={formData.LoanAccountNumber}
                                maxLength={18}
                                onChange={(e) => handleFieldChange("LoanAccountNumber", filterNumbers(e.target.value))}
                                error={errors.LoanAccountNumber} />
                        </div>

                        {/* Loan Sanction Amount */}
                        <div>
                            <Input
                                label="Loan Sanction Amount (₹)"
                                value={formData.LoanSanctionAmount?.toString() ?? ""}
                                required
                                onChange={(e) => {
                                    const val = allowPercentage(e.target.value);
                                    if (val !== null) {
                                        const loanSanctionAmount = filterNumbersWithDecimal(e.target.value);

                                        handleFieldChange("LoanSanctionAmount", loanSanctionAmount);
                                    }
                                }}
                                placeholder="Loan Sanction Amount (₹)"
                                rightIcon="₹"
                                error={errors.LoanSanctionAmount}
                            />
                        </div>
                        {/* Loan Sanction Date */}
                        <div>
                            <DatePickerInput
                                label="Sanction Date"
                                value={formatDate_dd_mm_yyyy(formData.LoanSanctionDate)}
                                onChange={(val) => handleFieldChange("LoanSanctionDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                required error={errors.LoanSanctionDate} />
                        </div>
                        {/* Address */}
                        <div>
                            <TextArea
                                label="Address"
                                placeholder="Enter Address"
                                required
                                maxLength={500}
                                className="thin-scroll"
                                value={formData.Address}
                                onChange={(e) => handleFieldChange("Address", e.target.value)}
                                error={errors.Address} />
                        </div>
                    </div>
                </form>
            </div>


            <BottomActionBar
                saveText={"Add"}
                canAction={canAction}
                onSave={() => {
                    handleSubmit();
                }}
                isLoading={isLoading}
            />
        </div>
    );
};

export default BankDetails;