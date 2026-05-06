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
import { XIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { parkingModificationService } from '@/features/crmPayTrack/services/ParkingModificationService';
import type { FilterWithPaginationParkingModificationDetails } from '@/features/crmPayTrack/models/ParkingModificationModel';

const initialFormStateForInitialAmountRefundRequest = (): AddUpdateRefundAmountData => ({
    BookingId: 0,
    Uniquekey: "74b79e58-1b37-f111-854c-74563c524328",
    ProjectId: 0,
    TotalAmountRefundedAgainstBooking: 0,
});

export const Summary: React.FC = () => {

    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [swappedParkingData, setSwappedParkingData] = useState<any[] | null>(null);
    const [initiateRefund, setInitiateRefund] = useState(false);
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [addUpdateInitialAmountRefundRequest, setAddUpdateInitialAmountRefundRequest] = useState<AddUpdateRefundAmountData>(() => initialFormStateForInitialAmountRefundRequest());
    const { addToast } = useToast();
    const { projectId } = useProject();
    const { listState, triggerRefresh } = usePayTrackBookingListState();
    const { bookingId } = listState;
    const navigate = useNavigate();
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const applicantData = bookingData?.BookingApplicantData;
    const isBookingCancel = bookingData?.ApprovalStatus === 'Cancel';
    const isRefundStatus = bookingData?.ApprovalStatus === 'Refund';

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

                    const parkingParams: FilterWithPaginationParkingModificationDetails = {
                        PageNumber: 1,
                        PageSize: 100,
                        ProjectId: Number(projectId),
                        BookingId: Number(bookingId),
                    };
                    const parkingResponse = await parkingModificationService.apiCallPullParkingModificationDetails(parkingParams);
                    if (E.isRight(parkingResponse)) {
                        const approved = parkingResponse.right.Data?.filter(item => item.ApprovalStatus === 'Approved');
                        if (approved && approved.length > 0) {
                            approved.sort((a, b) => (b.ParkingModificationRequestId || 0) - (a.ParkingModificationRequestId || 0));
                            const latest = approved[0];
                            if (latest.parkingData && latest.parkingData.length > 0) {
                                setSwappedParkingData(latest.parkingData);
                            } else {
                                setSwappedParkingData(null);
                            }
                        } else {
                            setSwappedParkingData(null);
                        }
                    }

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
        else if (addUpdateInitialAmountRefundRequest.TotalAmountRefundedAgainstBooking > (bookingData?.BookingAmount ?? 0)) {
            errors.TotalAmountRefundedAgainstBooking = "Refund Amount cannot be greater than Booking Amount";
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

                    setInitiateRefund(false);

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
                {(!isBookingCancel && !isRefundStatus) && (
                    <Button
                        onClick={() => {
                            setIsConfirmationDialogBoxOpen(true);
                        }}
                        variant="solid"
                        color="red_light"
                        leftIcon={<XIcon className="h-6 w-6 text-red-600" />}
                        size="md"
                        style={{ width: '190px', height: '40px', outline: 'none', border: 'none' }}
                    >
                        Cancel Booking
                    </Button>
                )}

                {isBookingCancel && (
                    <>
                        <div className="flex justify-end items-center gap-3">

                            <Button
                                onClick={() => {
                                    setInitiateRefund(true);
                                }}
                                color="blue"
                                variant="solid"
                                colorMode="extraLight"
                                size="md"
                                style={{ width: '190px', height: '40px' }}
                            >
                                Initiate Refund
                            </Button>
                        </div>
                    </>
                )}

                {isRefundStatus && (
                    <>

                        <div className="flex justify-end items-center gap-3">

                            <Button
                                onClick={() => navigate(`/payTrack/view/addRefundDetails`)}
                                color="blue"
                                variant="solid"
                                size="md"
                                style={{ width: '190px', height: '40px' }}

                            >
                                Make Payment
                            </Button>
                        </div>
                    </>
                )}
            </div>


            <div className="pt-5">
                <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 ">
                        Applicant Details
                    </h4>
                    {applicantData && applicantData.length > 0 ? (
                        <div className="space-y-4">
                            {applicantData.map((applicant, i) => (
                                <div key={applicant.BookingApplicantId ?? i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <FieldItem label="Applicant Type" value={getSafeString(applicant?.ApplicantType)} className='text-blue-900 bold' />
                                        <FieldItem label="Name" value={getSafeString(applicant.ApplicantName)} urls={applicant?.PhotoURL} isIcon />
                                        <FieldItem label="Mobile Number" value={getSafeString(applicant?.ApplicantMobileNumber)} />
                                        <FieldItem label="Email Id" value={getSafeString(applicant?.ApplicantEmailId)} />
                                        <FieldItem label="Aadhar Card" value={getSafeString(applicant?.AadharCardNumber)} urls={applicant?.AadharCardURL} isIcon />
                                        <FieldItem label="Pan Card" value={getSafeString(applicant?.PanNumber)} urls={applicant?.PanCardURL} isIcon />
                                        <FieldItem label="Voting Id" value={getSafeString(applicant?.VotingIdNumber)} urls={applicant?.VotingIdURL} isIcon />
                                        <FieldItem label="Passport" value={getSafeString(applicant?.PassportNumber)} urls={applicant?.PassportURL} isIcon />
                                        <FieldItem label="Driving License" value={getSafeString(applicant?.DrivingLicenseNumber)} urls={applicant?.DrivingLicenseURL} isIcon />
                                        <FieldItem label="Voting ID Number" value={getSafeString(applicant?.VotingIdNumber)} urls={applicant?.VotingIdURL} isIcon />
                                        <FieldItem label="GST Number" value={getSafeString(applicant?.GSTNumber)} urls={applicant?.GSTNumberURL} isIcon />
                                        <FieldItem label="Cancelled Cheque" value={getSafeString(applicant?.CancelledChequeURL)} urls={applicant?.CancelledChequeURL} isIcon />
                                        <FieldItem label="POA" value={getSafeString(applicant?.POAURL)} urls={applicant?.POAURL} isIcon />
                                        <FieldItem label="Income Form 16 IT" value={getSafeString(applicant?.IncomeForm16ITRURL)} urls={applicant?.IncomeForm16ITRURL} isIcon />
                                        <FieldItem label="Nre/Nro/BankDetails" value={getSafeString(applicant?.NreNroBankDetailsURL)} urls={applicant?.NreNroBankDetailsURL} isIcon />
                                        <FieldItem label="Nominee Form" value={getSafeString(applicant?.NomineeFormURL)} urls={applicant?.NomineeFormURL} isIcon />
                                        <FieldItem label="Statement Of Source Of Funds" value={getSafeString(applicant?.StatementOfSourceOfFundsURL)} urls={applicant?.StatementOfSourceOfFundsURL} isIcon />
                                        <FieldItem label="Payment Proof" value={getSafeString(applicant?.PaymentProofURL)} urls={applicant?.PaymentProofURL} isIcon />
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
                </section>
            </div>

            <div className="pt-5">
                <section className="bg-white rounded-xl shadow-sm  p-6 border-[0.1px] border-[#3333334f]">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Parking Details
                    </h4>
                    {swappedParkingData ? (
                        <div className="space-y-4">
                            {swappedParkingData.map((parking, index) => (
                                <div key={parking.ParkingId || index}>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-[#135bec2e] pb-4">
                                        <FieldItem label="Parking Number" value={getSafeString(parking.ParkingNumber)} />
                                        <FieldItem label="Category" value={getSafeString(parking.ParkingCategory)} />
                                        <FieldItem label="Type" value={getSafeString(parking.ParkingType)} />
                                        <FieldItem label="Size" value={getSafeString(parking.ParkingSubType)} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-b border-[#135bec2e] pb-4">
                                        <FieldItem label="Dimensions" value={getSafeString(parking.ParkingDimensions)} />
                                        <FieldItem label="EV Charging" value={getSafeString(parking.IsEVChargingAvailable ? 'Yes' : 'No')} />
                                        <FieldItem label="Parking Status" value={getSafeString(parking.ParkingStatus)} />
                                        <FieldItem label="Building Number" value={getSafeString(parking.BuildingNumber)} />

                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-3">
                                        <FieldItem label="Wing" value={getSafeString(parking.Wing)} />
                                        <FieldItem label="Floor" value={getSafeString(parking.Floor)} />
                                        <FieldItem label="Approval Status" value={getSafeString(parking.ApprovalStatus)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : bookingData?.ParkingData && bookingData.ParkingData.length > 0 ? (
                        <div className="space-y-4">
                            {bookingData.ParkingData.map((parking, index) => (
                                <div key={parking.ParkingId || index}>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-[#135bec2e] pb-4">
                                        <FieldItem label="Parking Number" value={getSafeString(parking.ParkingNumber)} />
                                        <FieldItem label="Category" value={getSafeString(parking.ParkingCategory)} />
                                        <FieldItem label="Type" value={getSafeString(parking.ParkingType)} />
                                        <FieldItem label="Size" value={getSafeString(parking.ParkingSubType)} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-b border-[#135bec2e] pb-4">
                                        <FieldItem label="Dimensions" value={getSafeString(parking.ParkingDimensions)} />
                                        <FieldItem label="EV Charging" value={getSafeString(parking.IsEVChargingAvailable ? 'Yes' : 'No')} />
                                        <FieldItem label="Parking Status" value={getSafeString(parking.ParkingStatus)} />
                                        <FieldItem label="Building Number" value={getSafeString(parking.BuildingNumber)} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-3">
                                        <FieldItem label="Wing" value={getSafeString(parking.Wing)} />
                                        <FieldItem label="Floor" value={getSafeString(parking.Floor)} />
                                        <FieldItem label="Approval Status" value={getSafeString(parking.ApprovalStatus)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-6 text-center text-gray-500 text-sm">
                            <NoDataView message="No Parking Data Found" />
                        </div>
                    )}
                </section>
            </div>

            <div className="col-span-7 pt-5">
                <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4">
                    <h4 className="text-lg font-semibold text-gray-900 pb-2">Flat Specification Remark</h4>
                    <div className="lg:col-span-3 pt-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                            <FieldItem label="" value={bookingData?.FlatAlterationRemark || "-"} />
                        </div>
                    </div>
                </div>
            </div>

            {(isBookingCancel || isRefundStatus) && (
                <div className="col-span-7 pt-5">
                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4">
                        <h4 className="text-lg font-semibold text-gray-900 pb-2">Cancellation Summary</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <FieldItem label="Current Status" value={bookingData?.ApprovalStatus || "-"} />
                            <FieldItem label="Cancelled Date" value={formatDate_dd_MonthName_yy(bookingData?.CreatedDate ?? '')} />
                            <FieldItem label="Cancelled By" value={getSafeString(bookingData?.CreatedBy)} />
                        </div>
                    </div>
                </div>
            )}

            {isRefundStatus && (
                <div className="pt-5">
                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4">
                        <h4 className="text-lg font-semibold text-gray-900 pb-2">Refund Details</h4>
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <FieldItem label="Total Refunded Amount (₹)" value={formatCurrency(bookingData?.TotalAmountRefundedAgainstBooking) || "-"} />
                                <FieldItem label="Paid (₹)" value={formatCurrency(bookingData?.RefundedAmountOnTillDate) || "-"} />
                                <FieldItem label="Pending (₹)" value={`${formatCurrency((bookingData?.TotalAmountRefundedAgainstBooking || 0) - (bookingData?.RefundedAmountOnTillDate || 0))}`} />
                                <FieldItem label="Refund Status" value={bookingData?.ApprovalStatus || "-"} />
                                <FieldItem label="Ledger Count" value={bookingData?.LedgerCount || 0} />
                            </div>
                        </div>
                    </div>
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
                message="Please save all your work before confirming."
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
                }}
                onCancel={() => {
                    setInitiateRefund(false);
                    setAddUpdateInitialAmountRefundRequest(initialFormStateForInitialAmountRefundRequest());
                    setErrors({});
                }}
                title="Initiate Refund"
                saveText="Save"
                onSubmit={handleAddUpdateInitialAmountRefund}
                loading={isLoading}
                size='xl'
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div>
                        <Input
                            label='Refund Amount'
                            required
                            value={addUpdateInitialAmountRefundRequest.TotalAmountRefundedAgainstBooking || ''}
                            onChange={e => handleFieldChange('TotalAmountRefundedAgainstBooking', e.target.value)}
                            placeholder="Enter Refund Amount"
                            error={errors.TotalAmountRefundedAgainstBooking}
                        />
                    </div>
                </div>
            </Modal >

        </div>
    )
}

export default Summary