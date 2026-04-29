import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Button, Input } from "@/ui/components/forms";
import { useState, useEffect, useCallback } from "react";
import { SingleSelectDropdownWithPagination } from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchBankListMasterDropdown } from "@/features/bankListMaster/bankListMasterDropDown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import type {
    AddUpdateBookingLoanDetailsRequest,
    BookingLoanDetailsData,
    DeleteBookingLoanDetailsRequest,
    FilterWithPaginationBookingLoanDetails,
    UpdateBookingLoanDetailsStatusRequest,
} from "@/features/crmPayTrack/models/BookingLoanDetailsModel";
import { runApiWithLoader } from "@/core/utils";
import useToast from "@/core/hooks/useToast";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { bookingLoanDetailsService } from "@/features/crmPayTrack/services/BookingLoanDetailsService";
import * as E from "fp-ts/Either";
import { Loader } from "@/core/utils/loader";
import { usePayTrackBookingListState } from "@/features/crmPayTrack/context/PayTrackBookingListStateContext";
import { filterLetters, filterNumbers, filterNumbersWithDecimal } from "@/core/utils/fileValidation";
import { TextArea } from "@/ui/components/forms/Textarea";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import Checkbox from "@/ui/components/forms/Checkbox";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { Edit, Trash2 } from "lucide-react";
import { formatCurrency, getSafeString } from "@/core/utils/comman";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";

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
    Address: "",
});

export const BankDetails: React.FC = () => {
    const [formData, setFormData] = useState<AddUpdateBookingLoanDetailsRequest>(() => initialFormState());
    const [bookingLoanDetailsList, setBookingLoanDetailsList] = useState<BookingLoanDetailsData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const { canAction } = useMenuPermissions("/bankLoan");

    const { listState } = usePayTrackBookingListState();
    const { bookingId, totalUnitCost } = listState;

    const { addToast } = useToast();
    const { projectId } = useProject();

    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const [dropdownLabels, setDropdownLabels] = useState<{
        bankName?: string;
    }>({});

    const [mode, setMode] = useState<"view" | "edit">("view");
    const [isDeactivate, setIsDeactivate] = useState(false);

    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);

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
    }, [projectId, bookingId]);

    const fetchBankLoanDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationBookingLoanDetails = {
                    PageNumber: 1,
                    PageSize: 100,
                    ProjectId: Number(projectId),
                    BookingId: bookingId,
                };
                const response = await bookingLoanDetailsService.apiCallPullBookingLoanDetails(params);

                if (E.isRight(response)) {
                    setBookingLoanDetailsList(response.right.Data);
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

    const setBankLoanDetailsData = (e: BookingLoanDetailsData | null) => {
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

        } else {
            setFormData(initialFormState());
            setDropdownLabels({
                bankName: "",
            });
        }
    };

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
        } else if (formData.LoanSanctionAmount <= 0) {
            newErrors.LoanSanctionAmount = "Loan Sanction Amount cannot be zero or negative";
        } else if (formData.LoanSanctionAmount > totalUnitCost) {
            newErrors.LoanSanctionAmount = `Loan Sanction Amount cannot be greater than Total Unit Cost (${formatCurrency(totalUnitCost)})`;
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
            Uniquekey: formData.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
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

                    if (formData.BookingLoanDetailsId == 0) {
                        setBookingLoanDetailsList((prev) => [response.right.Data?.[0], ...prev]);
                    }
                    else {
                        setBookingLoanDetailsList((prev) =>
                            prev.map((x) =>
                                x.BookingLoanDetailsId === response.right.Data?.[0].BookingLoanDetailsId
                                    ? response.right.Data?.[0]
                                    : x
                            )
                        );
                    }
                    setMode("view");

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

    const handleConfirmationDialogBoxOpen = useCallback(() => {
        setIsConfirmationDialogBoxOpen(true);
    }, []);

    const handleDeleteBankLoanDetails = async () => {
        setIsConfirmationDialogBoxOpen(false);

       const deleteId = activeLoans?.[0]?.BookingLoanDetailsId;

       if (!deleteId) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteBookingLoanDetailsRequest = {
                    BookingLoanDetailsId: activeLoans?.[0]?.BookingLoanDetailsId ?? 0,
                    Uniquekey: activeLoans?.[0]?.Uniquekey ?? "",
                    BookingId: activeLoans?.[0]?.BookingId ?? 0,
                    ProjectId: Number(projectId),
                };

                const response = await bookingLoanDetailsService.apiCallDeleteBookingLoanDetails(params);

                if (E.isRight(response)) {

                    setBookingLoanDetailsList((prev) =>
                        prev.filter(
                            (x) => x.BookingLoanDetailsId !== deleteId
                        )
                    );

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsConfirmationDialogBoxOpen(false);

                } else {
                    addToast({ type: "error", title: response.left.message });

                    setIsConfirmationDialogBoxOpen(false);
                }

                return response;
            },
            undefined,
            (error: unknown) => {
                const err = error as { message?: string };
                addToast({ type: "error", title: err.message || "An error occurred" });
            },
            undefined,

            "Delete Bank Loan Details",
        );
    };

    const handleSubmitClosedBankDetails = async (item: BookingLoanDetailsData) => {
        setErrors({});

        await runApiWithLoader(
            setIsLoading,

            setLoadingMessage,
            async () => {

                const params: UpdateBookingLoanDetailsStatusRequest = {
                    BookingLoanDetailsId: item.BookingLoanDetailsId ?? 0,
                    Uniquekey: item.Uniquekey ?? "",
                    BookingId: item.BookingId ?? 0,
                    ProjectId: Number(projectId),
                };

                const response = await bookingLoanDetailsService.apiCallUpdateBookingLoanDetailsStatus(params);

                if (E.isRight(response)) {

                    setBookingLoanDetailsList((prev) =>
                        prev.map((x) =>
                            x.BookingLoanDetailsId === item.BookingLoanDetailsId
                                ? { ...x, BankStatusClosedActive: "Closed" }
                                : x
                        )
                    );

                    setIsDeactivate(false);

                    setMode("view");

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

    const activeLoans = bookingLoanDetailsList.filter((x) => x.BankStatusClosedActive !== "Closed");

    const canDeleteActiveBank = canAction && !activeLoans[0]?.NoOfBankDocument && activeLoans[0]?.BankStatusClosedActive !== "Closed";

    const canClosedBank = canAction && activeLoans[0]?.NoOfBankDocument > 0 && activeLoans[0]?.BankStatusClosedActive !== "Closed";

    const closedLoans = bookingLoanDetailsList.filter((x) => x.BankStatusClosedActive === "Closed");

    return (
        <div >
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            {mode === "view" && (
                <>
                    {activeLoans.length === 0 && (
                        <div className="pt-5">
                            <section className="bg-white rounded-xl p-3 border-[0.1px] border-[#3333330f]">

                                <div className="flex justify-between items-center">

                                    <h4 className="text-sm font-medium text-gray-500">
                                        No Active Bank
                                    </h4>
                                    
                                    {canAction && (
                                        <Button
                                            color="primary"
                                            size="sm"
                                            onClick={() => {
                                                setMode("edit");
                                                setErrors({});
                                                setFormData(initialFormState());
                                                setDropdownLabels({
                                                    bankName: "",
                                                });
                                            }}
                                        >
                                            Add Bank Details
                                        </Button>
                                    )}
                                </div>

                            </section>
                        </div>
                    )}

                    {activeLoans.length > 0 && (
                        <>
                            <div className="pt-5">
                                <section className="bg-white rounded-xl shadow-sm p-3 border-[0.1px] border-[#3333334f]">

                                    <div className="flex justify-between items-center">


                                        <h4 className="text-lg font-semibold text-gray-900 pl-3">
                                            Active Bank
                                        </h4>


                                        <div className="flex items-center gap-2">

                                            <Button
                                                color="transparent"
                                                size="sm"
                                                isborderRadius
                                                title="Edit Bank Details"
                                                disabled={!canDeleteActiveBank}
                                                style={{
                                                    color: canDeleteActiveBank ? "" : "#9CA3AF",
                                                    cursor: canDeleteActiveBank ? "pointer" : "not-allowed",
                                                    opacity: canDeleteActiveBank ? 1 : 0.5,
                                                }}
                                                leftIcon={<Edit className="h-4 w-4" />}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (!canDeleteActiveBank) return;
                                                    setBankLoanDetailsData(activeLoans[0]);
                                                    setMode("edit");
                                                }}
                                            />

                                            <Button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (!canDeleteActiveBank) return;
                                                    handleConfirmationDialogBoxOpen();
                                                }}
                                                disabled={!canDeleteActiveBank}
                                                color="transparent"
                                                isborderRadius
                                                size="sm"
                                                style={{
                                                    color: canDeleteActiveBank ? "red" : "#9CA3AF",
                                                }}
                                                title="Delete Bank Loan Details"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>

                                        </div>
                                    </div>

                                    <div className="space-y-5">

                                        {activeLoans.map((item, index) => {
                                            return (

                                                <div key={item.BookingLoanDetailsId || index} className="bg-white p-3 rounded-xl">

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                                        <FieldItem label="Bank Name" value={item.BankName ?? "-"} />
                                                        <FieldItem label="Branch Name" value={item.BankBranchName ?? "-"} />
                                                        <FieldItem label="Account Number" value={item.LoanAccountNumber ?? "-"} />
                                                        <FieldItem label="Loan Sanction Amount" value={formatCurrency(item.LoanSanctionAmount) ?? "-"} />
                                                        <FieldItem label="Sanction Date" value={formatDate_dd_mm_yyyy(item.LoanSanctionDate)} />
                                                        <FieldItem label="No of Bank Documents" value={item.NoOfBankDocument ?? 0} />
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4 text-sm pt-5">
                                                        <FieldItem label="Address" value={item.Address ?? "-"} />
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm pt-5">
                                                        <FieldItem label="Created By" value={getSafeString(item.CreatedBy)} />
                                                        <FieldItem
                                                            label="Created Date"
                                                            value={
                                                                item.CreatedDate
                                                                    ? formatDate_dd_MonthName_yy_hh_mm(item.CreatedDate)
                                                                    : '-'
                                                            }
                                                        />
                                                        <FieldItem label="Modified By" value={getSafeString(item.ModifiedBy)} />
                                                        <FieldItem
                                                            label="Modified Date"
                                                            value={
                                                                item.ModifiedDate
                                                                    ? formatDate_dd_MonthName_yy_hh_mm(item.ModifiedDate)
                                                                    : '-'
                                                            }
                                                        />
                                                    </div>

                                                    {canClosedBank && (
                                                        <div className="mt-5 flex justify-between items-center">
                                                            <Checkbox
                                                                label="Do you want to closed this account?"
                                                                checked={isDeactivate}
                                                                onChange={(e) => setIsDeactivate(e.target.checked)}
                                                            />

                                                            {isDeactivate && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        handleSubmitClosedBankDetails(item);
                                                                    }}
                                                                >
                                                                    Closed Account
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                            )
                                        })}
                                    </div>
                                </section>
                            </div>
                        </>
                    )}

                    {closedLoans.length > 0 && (
                        <>
                            <div className="pt-5">
                                <section className="bg-white rounded-xl shadow-sm p-3 border-[0.1px] border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Closed Bank
                                    </h4>
                                    <div className="space-y-5">
                                        {closedLoans.map((item, index) => {
                                            return (

                                                <div key={item.BookingLoanDetailsId || index} className="bg-gray-100 p-3 rounded-xl">

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                                        <FieldItem label="Bank Name" value={item.BankName ?? "-"} />
                                                        <FieldItem label="Branch Name" value={item.BankBranchName ?? "-"} />
                                                        <FieldItem label="Account Number" value={item.LoanAccountNumber ?? "-"} />
                                                        <FieldItem label="Loan Sanction Amount" value={formatCurrency(item.LoanSanctionAmount) ?? "-"} />
                                                        <FieldItem label="Sanction Date" value={formatDate_dd_mm_yyyy(item.LoanSanctionDate)} />
                                                        <FieldItem label="No of Bank Documents" value={item.NoOfBankDocument ?? 0} />
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4 text-sm pt-5">
                                                        <FieldItem label="Address" value={item.Address ?? "-"} />
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm pt-5">
                                                        <FieldItem label="Created By" value={getSafeString(item.CreatedBy)} />
                                                        <FieldItem
                                                            label="Created Date"
                                                            value={
                                                                item.CreatedDate
                                                                    ? formatDate_dd_MonthName_yy_hh_mm(item.CreatedDate)
                                                                    : '-'
                                                            }
                                                        />
                                                        <FieldItem label="Modified By" value={getSafeString(item.ModifiedBy)} />
                                                        <FieldItem
                                                            label="Modified Date"
                                                            value={
                                                                item.ModifiedDate
                                                                    ? formatDate_dd_MonthName_yy_hh_mm(item.ModifiedDate)
                                                                    : '-'
                                                            }
                                                        />
                                                    </div>

                                                </div>

                                            )
                                        })}
                                    </div>
                                </section>
                            </div>
                        </>
                    )}
                </>
            )}

            {mode === "edit" && (
                <>
                    <div className="flex-1 space-y-2 px-2 py-3 pt-5  overflow-y-auto thin-scroll">
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
                                        required
                                        value={formData.BankBranchName}
                                        maxLength={250}
                                        onChange={(e) => handleFieldChange("BankBranchName", filterLetters(e.target.value))}
                                        error={errors.BankBranchName}
                                    />
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
                                        error={errors.LoanAccountNumber}
                                    />
                                </div>

                                {/* Loan Sanction Amount */}
                                <div>
                                    <Input
                                        label="Loan Sanction Amount (₹)"
                                        value={formData.LoanSanctionAmount?.toString() ?? ""}
                                        required
                                        onChange={(e) => {
                                            const val = filterNumbersWithDecimal(e.target.value);
                                            if (val !== null) {
                                                const loanSanctionAmount = filterNumbersWithDecimal(e.target.value);

                                                handleFieldChange("LoanSanctionAmount", loanSanctionAmount);
                                            }
                                        }}
                                        placeholder="Enter Loan Sanction Amount (₹)"
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
                                        required
                                        error={errors.LoanSanctionDate}
                                    />
                                </div>
                            </div>
                            {/* Address */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 pt-5">
                                <TextArea
                                    label="Address"
                                    placeholder="Enter Address"
                                    required
                                    maxLength={500}
                                    className="thin-scroll"
                                    value={formData.Address}
                                    onChange={(e) => handleFieldChange("Address", e.target.value)}
                                    error={errors.Address}
                                />
                            </div>
                        </form>
                    </div>

                    <div className="pt-5">

                        <BottomActionBar
                            saveText={Number(formData.BookingLoanDetailsId) > 0 ? "Update" : "Add"}
                            cancelText="Cancel"
                            canAction={canAction}
                            onSave={() => {
                                handleSubmit();
                            }}
                            onCancel={() => setMode("view")}
                            isLoading={isLoading}
                        />
                    </div>
                </>
            )}

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false);
                }}
                onConfirm={handleDeleteBankLoanDetails}
                loading={isLoading}
                pageName="Bank Loan Details"
            />
        </div>
    );
};

export default BankDetails;
