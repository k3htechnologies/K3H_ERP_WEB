import { runApiWithLoader } from "@/core/utils";
import React, { useEffect, useState } from "react";
import { bookingService } from '@/features/booking/services/BookingService';
import type { BookingData, FilterWithPaginationBookingRequest, CancelBookingRequest } from '@/features/booking/models/BookingModel';
import { useToast } from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import * as E from 'fp-ts/Either';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { usePayTrackBookingListState } from "@/features/crmPayTrack/context/PayTrackBookingListStateContext";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatCurrency, getSafeString } from '@/core/utils/comman';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import { Button, Input } from "@/ui/components/forms";
import ConfirmationDialogBox from "@/core/utils/confirmationDialogBox";
import { Modal } from "@/ui/components/Modal/Modal";
import type { AddUpdateRefundAmountData } from "@/features/crmPayTrack/models/InitialRefundAmountModel";
import { initialRefundAmountService } from "@/features/crmPayTrack/services/InitialRefundAmountService";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { useNavigate } from 'react-router-dom';
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { filterNumbersWithDecimal } from "@/core/utils/fileValidation";
import type { FilterWithPaginationPayTrackBooking, PayTrackBookingData } from "@/features/crmPayTrack/models/PayTrackBookingModel";
import { payTrackBookingService } from "@/features/crmPayTrack/services/PayTrackBookingService";
import Checkbox from "@/ui/components/forms/Checkbox";

const initialFormStateForInitialAmountRefundRequest = (): AddUpdateRefundAmountData => ({
    BookingId: 0,
    Uniquekey: "74b79e58-1b37-f111-854c-74563c524328",
    ProjectId: 0,
    TotalAmountRefundedAgainstBooking: 0,
});

export const Summary: React.FC = () => {

    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [payTrackList, setPayTrackList] = useState<PayTrackBookingData | null>(null);
    const [initiateRefund, setInitiateRefund] = useState(false);
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [addUpdateInitialAmountRefundRequest, setAddUpdateInitialAmountRefundRequest] = useState<AddUpdateRefundAmountData>(() => initialFormStateForInitialAmountRefundRequest());
    const { addToast } = useToast();
    const { projectId } = useProject();
    const { listState, triggerRefresh, updateListState } = usePayTrackBookingListState();
    const { bookingId } = listState;
    const navigate = useNavigate();
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [isInitialRefundClause, setIsInitialRefundClause] = useState(false);

    const applicantData = bookingData?.BookingApplicantData;

    const isBookingCancel = bookingData?.ApprovalStatus === 'Cancel';

    const isRefundStatus = bookingData?.ApprovalStatus === 'Refund';

    const { canAction } = useMenuPermissions('/modificationRequest');

    useEffect(() => {
        if (!projectId || !bookingId) return;

        loadBookingForSummary();

    }, [projectId, bookingId]);

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

    const loadPaytrackBookingForSummary = async () => {

        if (!bookingId) return;
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationPayTrackBooking = {
                    PageNumber: 1,
                    PageSize: 1,
                    BookingId: bookingId,
                    ProjectId: Number(projectId),
                    IsCheckPermission: false
                };

                const response = await payTrackBookingService.apiCallPullPayTrackBooking(params);

                if (E.isRight(response)) {

                    const booking = response.right.Data?.[0] ?? null;

                    updateListState({

                        bookingData: booking,

                        bookingApprovalStatus: booking.BookingApprovalStatus || "Pending"
                    })

                    setPayTrackList(booking);

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

    const handleFieldChange = (field: keyof AddUpdateRefundAmountData, value: any) => {

        setAddUpdateInitialAmountRefundRequest((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validateInitialAmountRefundForm = (): {
        isValid: boolean;
        errors: { [k: string]: string };
    } => {
        const errors: { [k: string]: string } = {};

        if (!addUpdateInitialAmountRefundRequest.TotalAmountRefundedAgainstBooking) {
            errors.TotalAmountRefundedAgainstBooking = "Refund Amount is required";
        }
        else if (addUpdateInitialAmountRefundRequest.TotalAmountRefundedAgainstBooking > (bookingData?.TotalAmountReceivedAgainstBooking ?? 0)) {
            errors.TotalAmountRefundedAgainstBooking = "Refund Amount cannot be greater than Total Received Amount";
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    };



    const PushInitialAmountRefundFormData = (): AddUpdateRefundAmountData => {
        return {
            BookingId: bookingData?.BookingId ?? 0,
            Uniquekey: bookingData?.Uniquekey ?? "",
            ProjectId: Number(projectId),
            TotalAmountRefundedAgainstBooking: addUpdateInitialAmountRefundRequest.TotalAmountRefundedAgainstBooking,
        };
    };

    const handleAddUpdateInitialAmountRefund = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        const validation = validateInitialAmountRefundForm();

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushInitialAmountRefundFormData();

                const response = await initialRefundAmountService.apiCallAddUpdateRefundAmount(payload);

                if (E.isRight(response)) {

                    updateListState({ totalAmountRefundedAgainstBooking: addUpdateInitialAmountRefundRequest.TotalAmountRefundedAgainstBooking || 0 });


                    setInitiateRefund(false);

                    setIsInitialRefundClause(false);

                    triggerRefresh();

                    await loadBookingForSummary();

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    setAddUpdateInitialAmountRefundRequest(initialFormStateForInitialAmountRefundRequest());

                } else {
                    addToast({ type: "error", title: response.left?.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            }
        );
    };

    const loadCancelBooking = async () => {

        if (!bookingId) return;
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: CancelBookingRequest = {
                    BookingId: bookingId,
                    ProjectId: Number(projectId),
                    Uniquekey: bookingData?.Uniquekey || '',
                    InventoryFlatId: bookingData?.InventoryFlatId || 0,
                    ParkingId: bookingData?.ParkingId || '',
                };

                const response = await bookingService.apiCallCancelBooking(params);

                if (E.isRight(response)) {

                    const booking = response.right.Data;

                    const item = Array.isArray(booking) ? booking[0] : booking;

                    setBookingData(item);

                    triggerRefresh();

                    loadPaytrackBookingForSummary();

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });
                }
                else {

                    addToast({ type: 'error', title: response.left.message });

                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Cancelling Booking'
        );
    };

    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>
            <div className="absolute top-5 right-2 z-10  gap-2">

                {canAction && bookingData && (!isBookingCancel && !isRefundStatus) && (
                    <Button
                        onClick={() => {
                            setIsConfirmationDialogBoxOpen(true);
                        }}
                        variant="solid"
                        color="red_light"
                        disabled={!canAction}
                        size="md"
                        style={{ width: '160px', height: '37px', outline: 'none', border: 'none' }}
                    >
                        Cancel Booking
                    </Button>
                )}

                {canAction && bookingData && isBookingCancel && (
                    <>
                        <div className="flex justify-end items-center gap-3">

                            <Button
                                onClick={async () => {
                                    await loadPaytrackBookingForSummary();
                                    setInitiateRefund(true);
                                }}
                                color="blue"
                                variant="solid"
                                colorMode="extraLight"
                                size="md"
                                style={{ width: '160px', height: '37px' }}
                            >
                                Initiate Refund
                            </Button>
                        </div>
                    </>
                )}

                {canAction && bookingData && isRefundStatus && Number(bookingData?.TotalAmountRefundedAgainstBooking || 0) > Number(bookingData?.RefundedAmountOnTillDate || 0) && (
                    <>

                        <div className="flex justify-end items-center gap-3">

                            <Button
                                onClick={() => navigate(`/payTrack/view/addRefundDetails`)}
                                color="blue"
                                variant="solid"
                                size="md"
                                style={{ width: '160px', height: '37px' }}

                            >
                                Make Payment
                            </Button>
                        </div>
                    </>
                )}
            </div>


            <div className="pt-5">
                <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                    <div className="bg-[#FFF6EB] px-3 py-2 border-b border-[#D0D7DE]">
                        <h4 className="text-sm font-semibold text-[#C2410C]">
                            Applicant Details
                        </h4>
                    </div>
                    <div className="p-4 bg-white">
                        {applicantData && applicantData.length > 0 ? (
                            <div className="space-y-4">
                                {applicantData.map((applicant, i) => (
                                    <div key={applicant.BookingApplicantId ?? i} className="bg-gray-50 rounded-lg p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <FieldItem label="Applicant Type" value={getSafeString(applicant?.ApplicantType)} className='text-blue-900 bold' />
                                            <FieldItem label="Applicant Name" value={getSafeString(applicant.ApplicantName)} urls={applicant?.PhotoURL} isIcon />
                                            <FieldItem label="Mobile Number" value={getSafeString(applicant?.ApplicantMobileNumber)} />
                                            <FieldItem label="Email Id" value={getSafeString(applicant?.ApplicantEmailId)} />
                                            <FieldItem label="Aadhaar Card No." value={getSafeString(applicant?.AadharCardNumber)} urls={applicant?.AadharCardURL} isIcon />
                                            <FieldItem label="PAN No." value={getSafeString(applicant?.PanNumber)} urls={applicant?.PanCardURL} isIcon />
                                            <FieldItem label="Driving License" value={getSafeString(applicant?.DrivingLicenseNumber)} urls={applicant?.DrivingLicenseURL} isIcon />
                                            <FieldItem label="Voting ID No." value={getSafeString(applicant?.VotingIdNumber)} urls={applicant?.VotingIdURL} isIcon />
                                            <FieldItem label="Passport No." value={getSafeString(applicant?.PassportNumber)} urls={applicant?.PassportURL} isIcon />
                                            <FieldItem label="GST No." value={getSafeString(applicant?.GSTNumber)} urls={applicant?.GSTNumberURL} isIcon />
                                            <FieldItem label="Cancelled Cheque" value={getSafeString(applicant?.CancelledChequeURL)} urls={applicant?.CancelledChequeURL} isIcon isSetValue={false} />
                                            <FieldItem label="POA (if NRI Execution)" value={getSafeString(applicant?.POAURL)} urls={applicant?.POAURL} isIcon isSetValue={false} />
                                            <FieldItem label="Income Docs (Form 16 / ITR)" value={getSafeString(applicant?.IncomeForm16ITRURL)} urls={applicant?.IncomeForm16ITRURL} isIcon isSetValue={false} />
                                            <FieldItem label="NRE / NRO Bank Details" value={getSafeString(applicant?.NreNroBankDetailsURL)} urls={applicant?.NreNroBankDetailsURL} isIcon isSetValue={false} />
                                            <FieldItem label="Nominee Form" value={getSafeString(applicant?.NomineeFormURL)} urls={applicant?.NomineeFormURL} isIcon isSetValue={false} />
                                            <FieldItem label="Statement of Source of Funds" value={getSafeString(applicant?.StatementOfSourceOfFundsURL)} urls={applicant?.StatementOfSourceOfFundsURL} isIcon isSetValue={false} />
                                            <FieldItem label="Payment Proof" value={getSafeString(applicant?.PaymentProofURL)} urls={applicant?.PaymentProofURL} isIcon isSetValue={false} />
                                            <FieldItem label="Created By" value={getSafeString(applicant?.CreatedBy)} />
                                            <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy(applicant?.CreatedDate ?? '')} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-6 text-center text-gray-500 text-sm">
                                <NoDataView message="No Applicant Data Found" />
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <div className="pt-5">
                <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                    <div className="bg-[#F6F9FF] px-3 py-2 border-b border-[#D0D7DE]">
                        <h4 className="text-sm font-semibold text-[#13367A]">
                            Parking Details
                        </h4>
                    </div>
                    <div className="p-4 bg-white">
                        {bookingData?.ParkingData && bookingData.ParkingData.length > 0 ? (
                            <div className="space-y-4">
                                {bookingData.ParkingData.map((parking, index) => {

                                    const isLast = index === (bookingData.ParkingData?.length ?? 0) - 1;

                                    return (
                                        <div key={parking.ParkingId || index} className="pt-4">
                                            <h3 className="text-sm font-semibold text-gray-500">
                                                Parking {index + 1}
                                            </h3>
                                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 ${!isLast ? "border-b border-[#135bec2e] pb-4" : "border-b border-[#135bec2e] pb-4 pt-4"} `} >
                                                <FieldItem label="Parking Number" value={getSafeString(parking.ParkingNumber)} />
                                                <FieldItem label="Building" value={getSafeString(parking.BuildingNumber)} />
                                                <FieldItem label="Wing" value={getSafeString(parking.Wing)} />
                                                <FieldItem label="Floor" value={getSafeString(parking.Floor)} />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-[#135bec2e] pt-4 pb-4">

                                                <FieldItem label="Category" value={getSafeString(parking.ParkingCategory)} />
                                                <FieldItem label="Type" value={getSafeString(parking.ParkingType)} />
                                                <FieldItem label="Size" value={getSafeString(parking.ParkingSubType)} />
                                                <FieldItem label="Dimensions" value={getSafeString(parking.ParkingDimensions)} />
                                            </div>
                                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 ${!isLast ? "border-b border-[#135bec2e] pb-4" : ""} `} >

                                                <FieldItem label="EV Charging" value={parking.IsEVChargingAvailable ? 'Yes' : 'No'} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-6 text-center text-gray-500 text-sm">
                                <NoDataView message="No Parking Data Found" />
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <div className="pt-5">
                <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                    <div className="bg-[#FBF9F9] px-3 py-2 border-b border-[#D0D7DE]">
                        <h4 className="text-sm font-semibold text-[#1D1D1D]">
                            Flat Alteration Remarks
                        </h4>
                    </div>
                    <div className="p-4 bg-white">

                        <div className="grid grid-cols-1 gap-4">
                            <FieldItem label="" value={bookingData?.FlatAlterationRemark || "-"} />
                        </div>
                    </div>
                </section>
            </div>

            {(isBookingCancel || isRefundStatus) && (

                <div className="pt-5">
                    <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                        <div className="bg-[#FBF9F9] px-3 py-2 border-b border-[#D0D7DE]">
                            <h4 className="text-sm font-semibold text-[#1D1D1D]">
                                Cancellation Summary
                            </h4>
                        </div>
                        <div className="p-4 bg-white">

                            <div className="grid grid-cols-2 gap-4">
                                <FieldItem label="Cancelled Date" value={formatDate_dd_MonthName_yy(bookingData?.CancelledDate ?? '')} />
                                <FieldItem label="Cancelled By" value={getSafeString(bookingData?.CancelledBy)} />
                            </div>
                        </div>
                    </section>
                </div>

            )}

            {isRefundStatus && (

                <div className="pt-5">
                    <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                        <div className="bg-[#FBF9F9] px-3 py-2 border-b border-[#D0D7DE]">
                            <h4 className="text-sm font-semibold text-[#1D1D1D]">
                                Refund Amount Details
                            </h4>
                        </div>
                        <div className="p-4 bg-white">

                            <div className="grid grid-cols-3 gap-4">
                               <FieldItem label="Total Refunded (₹)" value={formatCurrency(bookingData?.TotalAmountRefundedAgainstBooking) || "-"} />
                                <FieldItem label="Paid (₹)" value={formatCurrency(bookingData?.RefundedAmountOnTillDate) || "-"} />
                                <FieldItem label="Pending (₹)" value={`${formatCurrency((bookingData?.TotalAmountRefundedAgainstBooking || 0) - (bookingData?.RefundedAmountOnTillDate || 0))}`} />
                                <FieldItem label="Refund Status" value={bookingData?.ApprovalStatus || "-"} />
                            </div>
                        </div>
                    </section>
                </div>

            )}

            <ConfirmationDialogBox
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false)
                }}
                onConfirm={() => {
                    setIsConfirmationDialogBoxOpen(false);
                    loadCancelBooking();
                }}
                title="Are you sure you want to cancel this booking?"
                message="Ensure that all required approvals are completed before proceeding.Once cancelled, this booking cannot be restored"
                confirmText="Yes"
                cancelText="No"
                loading={false}
            />

            <Modal
                isOpen={initiateRefund}
                onClose={() => {
                    setInitiateRefund(false);
                    setAddUpdateInitialAmountRefundRequest(initialFormStateForInitialAmountRefundRequest());
                    setErrors({});
                    setIsInitialRefundClause(false);
                }}
                onCancel={() => {
                    setInitiateRefund(false);
                    setAddUpdateInitialAmountRefundRequest(initialFormStateForInitialAmountRefundRequest());
                    setErrors({});
                    setIsInitialRefundClause(false);
                }}
                title="Initiate Refund"
                saveText={isInitialRefundClause ? "Save" : ""}
                onSubmit={handleAddUpdateInitialAmountRefund}
                loading={isLoading}
                size='xl'
            >
                <div className="space-y-6 bg-white-100">

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="font-semibold mb-2">Received Amount</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FieldItem label="Stamp Duty" value={formatCurrency(payTrackList?.ReceivedStampDutyAmount)} />
                            <FieldItem label="Registration Fees" value={formatCurrency(payTrackList?.ReceivedRegistrationFees)} />
                            <FieldItem label="Agreement Value(Without TDS)" value={formatCurrency(payTrackList?.ReceivedAgreementValue)} />
                            <FieldItem label="Agreement Value GST" value={formatCurrency(payTrackList?.ReceivedAgreementValueGSTAmount)} />
                            <FieldItem label="Agreement Value TDS" value={formatCurrency(payTrackList?.ReceivedAgreementValueTDS)} />
                            <FieldItem label="Other Charges" value={formatCurrency(payTrackList?.ReceivedOtherChargesAmount)} />
                            <FieldItem label="Other Charges GST" value={formatCurrency(payTrackList?.ReceivedOtherChargesGSTAmount)} />
                            <FieldItem label="Total Received" value={formatCurrency(payTrackList?.TotalAmountReceivedAgainstBooking)} />

                        </div>
                    </div>

                    <div>
                        <Input
                            label='Refund Amount'
                            required
                            value={addUpdateInitialAmountRefundRequest.TotalAmountRefundedAgainstBooking || ''}
                            onChange={e => handleFieldChange('TotalAmountRefundedAgainstBooking', filterNumbersWithDecimal(e.target.value))}
                            placeholder="Enter Refund Amount"
                            error={errors.TotalAmountRefundedAgainstBooking}
                        />
                    </div>
                    <div>
                        <Checkbox
                            label="Finalize Refund Amount (No Further Changes Allowed)"
                            checked={isInitialRefundClause}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setIsInitialRefundClause(checked);
                            }}
                        />
                        <p className="text-sm text-[#00000080] pt-3">By selecting this option, the Initial Refund Amount will be finalized and cannot be changed later.</p>
                    </div>
                </div>
            </Modal >

        </div>
    )
}

export default Summary