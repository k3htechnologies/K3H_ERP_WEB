import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Input } from "@/ui/components/forms";
import { useState, useEffect } from "react";
import { SingleSelectDropdownWithPagination } from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchBankListMasterDropdown } from "@/features/bankListMaster/bankListMasterDropDown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import type { BookingLoanDetailsData, FilterWithPaginationBookingLoanDetails, AddUpdateBookingLoanDetailsRequest } from '@/features/crmPayTrackScreen/models/BookingLoanDetailsModel';
import { runApiWithLoader } from "@/core/utils";
import useToast from "@/core/hooks/useToast";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { bookingLoanDetailsService } from "../services/BookingLoanDetailsService";
import * as E from "fp-ts/Either";
import { useParams } from 'react-router-dom';
import { Loader } from '@/core/utils/loader';

export const BankDetails: React.FC = () => {
    // STATES
    const [bankLoanDetailsList, setBankLoanDetailsList] = useState<BookingLoanDetailsData[]>([]);
    const [bankListMasterId, setBankListMasterId] = useState<number | null>(null);
    const [bankName, setBankName] = useState<string>("");
    const [branchName, setBranchName] = useState<string>("");
    const [accountNumber, setAccountNumber] = useState<string>("");
    const [loanSanctionAmount, setLoanSanctionAmount] = useState<number>(0);
    const [loanSanctionDate, setLoanSanctionDate] = useState<string>();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [address, setAddress] = useState<string>("");
    const [isEditMode, setIsEditMode] = useState(true);

    const { canAction } = useMenuPermissions("/payTrack");

    const handleActionClick = () => {
        if (!isEditMode) {
            fetchBankLoanDetails();
            saveBankLoanDetails();
            setIsEditMode(true);
        } else {
            setIsEditMode(false);
        }
    };

    const { addToast } = useToast();

    //#region PROJECT SELECTION GET ID
    const { projectId } = useProject();
    //#endregion

    //#region BOOKING ID
    const { BookingId } = useParams<{ BookingId?: string }>();
    const bookingId = BookingId ? Number(BookingId) : 0;
    //#endregion


    useEffect(() => {
        if (projectId && bookingId) {
            fetchBankLoanDetails();
        }
    }, [projectId, bookingId])


    //#region Save 
    const saveBankLoanDetails = async () => {

        const isUpdate = bankLoanDetailsList.length > 0;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                let params: AddUpdateBookingLoanDetailsRequest;

                if (isUpdate) {

                    const existing = bankLoanDetailsList[0];
                    // UPDATE
                    params = {
                        BookingLoanDetailsId: existing.BookingLoanDetailsId,
                        Uniquekey: existing.Uniquekey,
                        BookingId: existing.BookingId,
                        ProjectId: existing.ProjectId,
                        BankListMasterId: Number(bankListMasterId),
                        BankBranchName: branchName,
                        LoanAccountNumber: accountNumber,
                        LoanSanctionAmount: loanSanctionAmount,
                        LoanSanctionDate: loanSanctionDate,
                        Address: address,
                        BankName: bankName,
                        CreatedById: existing.CreatedById,
                        CreatedBy: existing.CreatedBy,
                        CreatedDate: existing.CreatedDate,
                        ModifiedById: existing.ModifiedById,
                        ModifiedBy: existing.ModifiedBy,
                        ModifiedDate: existing.ModifiedDate
                    };

                } else {

                    // ADD
                    params = {
                        BookingLoanDetailsId: 0,
                        Uniquekey: '345f2698-c51e-f111-af70-a0b9bd2bb8fe',
                        BookingId: bookingId,
                        ProjectId: Number(projectId),
                        BankListMasterId: Number(bankListMasterId),
                        BankBranchName: branchName,
                        LoanAccountNumber: accountNumber,
                        LoanSanctionAmount: loanSanctionAmount,
                        LoanSanctionDate: loanSanctionDate,
                        Address: address,
                        BankName: bankName,
                        CreatedById: 0,
                        CreatedBy: '',
                        CreatedDate: null,
                        ModifiedById: 0,
                        ModifiedBy: '',
                        ModifiedDate: null
                    };

                }


                const response = await bookingLoanDetailsService.apiCallAddUpdateBookingLoanDetails(params);


                if (E.isRight(response)) {
                    addToast({ type: "success", title: response.right.SuccessMessage[0] });
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
            "Saving Bank Loan Details",
        );
    };


    // #region DATA LOAD|FETCH
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
                    const data = response.right.Data;
                    setBankLoanDetailsList(data);
                    if (data && data.length > 0) {
                        const firstItem = data[0];
                        setBankListMasterId(firstItem.BankListMasterId || null);
                        setBankName(firstItem.BankName || "");
                        setBranchName(firstItem.BankBranchName || "");
                        setAccountNumber(firstItem.LoanAccountNumber || "");
                        setLoanSanctionAmount(firstItem.LoanSanctionAmount || 0);
                        setLoanSanctionDate(firstItem.LoanSanctionDate || undefined);
                        setAddress(firstItem.Address || "");
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

    return (
        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-3">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                {/* Bank Name Dropdown */}
                <div className={isEditMode ? "pointer-events-none opacity-80" : ""}>
                    <SingleSelectDropdownWithPagination
                        label="Bank Name"
                        required
                        title="Select Bank Name"
                        size="lg"
                        dataFetchCallBack={fetchBankListMasterDropdown}
                        onSelected={(item) => {
                            if (!item) {
                                setBankListMasterId(null);
                                setBankName("");
                                return;
                            }
                            setBankListMasterId(Number(item.value));
                            setBankName(item.label);
                        }}
                        initialValue={createDropdownInitialValue(bankListMasterId, bankName)}
                    />
                </div>

                {/* Branch */}
                <div>
                    <Input
                        label="Branch"
                        placeholder="Enter Bank Branch Name"
                        required
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                    />
                </div>

                {/* Account Number */}
                <div>
                    <Input
                        label="Account Number"
                        placeholder="Enter Account Number"
                        required
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                    />
                </div>

                {/* Loan Sanction Amount */}
                <div>
                    <Input
                        label="Loan Sanction Amount"
                        placeholder="Enter Loan Sanction Amount"
                        required
                        value={loanSanctionAmount}
                        onChange={(e) => setLoanSanctionAmount(Number(e.target.value))}
                    />
                </div>
                {/* Loan Sanction Date */}
                <DatePickerInput
                    label="Loan Sanction Date"
                    value={formatDate_dd_mm_yyyy(loanSanctionDate)}
                    onChange={(val) => setLoanSanctionDate(val || "")}
                    required
                />

                {/* Address */}
                <div>
                    <Input
                        label="Address"
                        placeholder="Enter Address"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>
            </div>
            {canAction && (
                <div className="flex justify-end mt-4">
                    {isEditMode ? (
                        <button
                            onClick={handleActionClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-medium transition-colors"
                        >
                            Update
                        </button>
                    ) : (
                        <button
                            onClick={handleActionClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-medium transition-colors"
                        >
                            Save
                        </button>
                    )}

                </div>
            )}


        </div>
    );
};

export default BankDetails;