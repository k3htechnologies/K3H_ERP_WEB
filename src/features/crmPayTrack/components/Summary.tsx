import { runApiWithLoader } from "@/core/utils";
import React, { useEffect, useState } from "react";
import { bookingService } from '@/features/booking/services/BookingService';
import type { BookingData, FilterWithPaginationBookingRequest, CancelBookingRequest } from '@/features/booking/models/BookingModel';
import { useToast } from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import * as E from 'fp-ts/Either';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { usePayTrackBookingListState } from "../context/PayTrackBookingListStateContext";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatCurrency, getSafeString } from '@/core/utils/comman';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import { Button, Input } from "@/ui/components/forms";
import ConfirmationDialogBox from "@/core/utils/confirmationDialogBox";
import { Modal } from "@/ui/components/Modal/Modal";
import type { AddUpdateRefundAmountData, RefundAmountData } from "@/features/crmPayTrack/models/InitialRefundAmountModel";
import { initialRefundAmountService } from "@/features/crmPayTrack/services/InitialRefundAmountService";
import usePagination from "@/core/hooks/usePagination";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { fetchFlatListMasterDropdown } from '@/features/crmPayTrack/flatListMasterDropDown';
import { Search, XIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import type { ModulesApprovalStatusRequest, UpdateModulesWorkflowApprovalRequest } from '@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel';
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal";
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService";

const initialFormStateForInitialAmountRefundRequest = (): RefundAmountData => ({
    BookingId: 0,
    Uniquekey: "74b79e58-1b37-f111-854c-74563c524328",
    ProjectName: "",
    ProjectId: 0,
    EnquiryId: 0,
    SystemGeneratedCode: "",
    ApplicantName: "",
    BookingType: "",
    Flat: "",
    ParkingData: [],
    ParkingNumber: "",
    InventoryFlatId: 0,
    InventoryBuildingId: 0,
    InventoryFlatFloorBasementPodiumWingId: 0,
    BuildingNumber: "",
    Wing: "",
    Floor: "",
    RERACarpetAreaSqFt: 0,
    FlatType: "",
    FlatConfiguration: "",
    BookingApplicantData: [],
    PermanentAddress: "",
    CommunicationAddress: "",
    BrokeragePercentage: 0,
    BrokerageAmount: 0,
    ReferralPercentage: 0,
    ReferralAmount: 0,
    LoyaltyPercentage: 0,
    LoyaltyAmount: 0,
    EmployeeReferencePercentage: 0,
    EmployeeReferenceAmount: 0,
    RegistrationDate: "",
    AgreementValue: 0,
    AgreementValueTDS: 0,
    AgreementValueGSTPercentage: 0,
    AgreementValueGSTAmount: 0,
    StampDutyPercentage: 0,
    StampDutyAmount: 0,
    RegistrationFees: 0,
    ParkingId: "",
    NumberOfParking: 0,
    HandoverType: "",
    SourceOfFunding: "",
    BookingAmount: 0,
    ChequeRTGSNumber: "",
    ChequeRTGSDate: "",
    BankListMasterId: 0,
    BankName: "",
    FlatAlterationRemark: "",
    PaymentRemark: "",
    OtherRemark: "",
    TermsAndConditionsDescription: "",
    BookingOtherChargesData: [],
    PaymentScheduleSchemeMasterId: 0,
    PaymentScheduleScheme: "",
    BookingPaymentScheduleData: [],
    CreatedById: 0,
    CreatedBy: "",
    CreatedDate: "",
    ModifiedById: 0,
    ModifiedBy: "",
    ModifiedDate: "",
    IsApproval: false,
    ApprovalStatus: "",
    TotalAmountReceivedAgainstBooking: 0,
    TotalAmountRefundedAgainstBooking: 0,
    RefundedAmountOnTillDate: 0,
    FlatAlterationRequestIsApproval: false,
    FlatAlterationRequestApprovalStatus: "",
    ParkingModificationRequestIsApproval: false,
    ParkingModificationRequestApprovalStatus: "",
    BookingApplicantModificationRequestIsApproval: false,
    BookingApplicantModificationRequestApprovalStatus: "",
    TransferBookingId: 0,
    TransferFlat: "",
    TenantId: 0,
});

export const Summary: React.FC = () => {

    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [initiateRefund, setInitiateRefund] = useState(false);
    const [initiateTransfer, setInitiateTransfer] = useState(false);
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [isBookingCancelled, setIsBookingCancelled] = useState(false);
    const [isRefundSaved, setIsRefundSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [addUpdateInitialAmountRefundRequest, setAddUpdateInitialAmountRefundRequest] = useState<AddUpdateRefundAmountData>(() => initialFormStateForInitialAmountRefundRequest());
    const [flatListOptions, setFlatListOptions] = useState<{ label: string; value: string }[]>([]);
    const [selectedFlatId, setSelectedFlatId] = useState<string>('');
    const [searchBuildingWingFloorFlatTerm, setSearchBuildingWingFloorFlatTerm] = useState('');

    // APPROVAL LOG MODAL
    const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
    const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
    const [ownerName, setOwnerName] = useState<string | null>("");

    // APPROVAL ACTION MODAL
    const [isApprovalActionModalOpen, setIsApprovalActionModalOpen] = useState(false);
    const [approvalActionType, setApprovalActionType] = useState<"approve" | "reject">("approve");
    const [approvalRowData, setApprovalRowData] = useState<BookingData | null>(null);

    const { addToast } = useToast();
    const { projectId } = useProject();
    const { listState } = usePayTrackBookingListState();
    const { bookingId } = listState;
    const { pagination, setPagination } = usePagination(10);

    const navigate = useNavigate();

    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const applicantData = bookingData?.BookingApplicantData;

    const PushInitialAmountRefundFormData = (): AddUpdateRefundAmountData => {
        return {
            BookingId: bookingData?.BookingId ?? 0,
            Uniquekey: bookingData?.Uniquekey ?? "",
            ProjectId: Number(projectId),
            TotalAmountRefundedAgainstBooking: addUpdateInitialAmountRefundRequest.TotalAmountRefundedAgainstBooking,
        };
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

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    };

    const onCancelBooking = () => {
        setIsConfirmationDialogBoxOpen(false);
        setIsBookingCancelled(true);
        loadCancelBooking();
    }

    const handleInitiateRefund = () => {
        setInitiateRefund(true);
    }

    const handleInitiateTransfer = () => {
        setInitiateTransfer(true);
    }

    const handleCancelBooking = () => {
        setIsConfirmationDialogBoxOpen(true);
    }

    useEffect(() => {
        if (!projectId || !bookingId) return;

        loadBookingForSummary();

    }, [projectId, bookingId]);


    useEffect(() => {
        if (!initiateTransfer) return;
        const loadFlatList = async () => {
            const response = await fetchFlatListMasterDropdown(1, { projectId: Number(projectId) });
            setFlatListOptions(response.itemList);
        };
        loadFlatList();
    }, [initiateTransfer, projectId]);

    const handleAddFlatModal = (flatId: string) => {
        setSelectedFlatId(flatId);
    };

    const handleApprovalLog = (row: BookingData) => {
        const request: ModulesApprovalStatusRequest = {
            ModuleName: "BOOKING REFUND APPROVAL",
            Id: row.BookingId ?? 0,
            ProjectId: projectId ? Number(projectId) : 0,
            SubId: 0
        };
        setOwnerName(row.ApplicantName);
        setApprovalLogRequest(request);
        setIsApprovalLogModalOpen(true);
    };

    const handleApproveRejectDocument = (row: BookingData, approvalType: "approve" | "reject") => {
        setApprovalRowData(row);
        setOwnerName(row.ApplicantName);
        setApprovalActionType(approvalType);
        setIsApprovalActionModalOpen(true);
    };

    const handleApprovalSubmit = async (remark: string) => {

        if (!approvalRowData) return;

        const payload: UpdateModulesWorkflowApprovalRequest = {
            ModuleName: "BOOKING REFUND APPROVAL",
            Id: approvalRowData.BookingId ?? 0,
            ProjectId: projectId ? Number(projectId) : 0,
            IsApproved: approvalActionType === "approve",
            Remarks: remark ?? null,
            SubId: 0
        };

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await modulesWorkflowApprovalService.apiCallupdateModulesWorkflowApproval(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsApprovalActionModalOpen(false);
                    await loadBookingForSummary();

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
            approvalActionType === "approve" ? "Approving Refund" : "Rejecting Refund"
        );
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

                    if (booking) {
                        const cancelledStatuses = ['Cancelled', 'Booking Cancelled', 'Refund'];
                        if (booking.ApprovalStatus && cancelledStatuses.includes(booking.ApprovalStatus)) {
                            setIsBookingCancelled(true);
                        }
                        if (booking.TotalAmountRefundedAgainstBooking && booking.TotalAmountRefundedAgainstBooking > 0) {
                            setIsRefundSaved(true);
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

    const handleAddUpdateInitialAmountRefund = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({})

        const validation = validateInitialAmountRefundForm()

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const payload = PushInitialAmountRefundFormData();
                const response = await initialRefundAmountService.apiCallAddUpdateRefundAmount(payload);

                if (E.isRight(response)) {

                    setInitiateRefund(false);
                    setIsRefundSaved(true);

                    setBookingData(prev => prev ? {
                        ...prev,
                        TotalAmountRefundedAgainstBooking: Number(addUpdateInitialAmountRefundRequest.TotalAmountRefundedAgainstBooking) || 0
                    } : prev);

                    const isAdd = addUpdateInitialAmountRefundRequest.BookingId === 0;

                    if (isAdd) {
                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });
                        loadBookingForSummary();
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                        setAddUpdateInitialAmountRefundRequest(initialFormStateForInitialAmountRefundRequest());
                    } else {
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }

                } else {
                    addToast({ type: "error", title: response.left?.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
        )
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
            <div className="absolute top-5 right-2 z-10 flex gap-2">
                {!isBookingCancelled ? (
                    <Button
                        onClick={handleCancelBooking}
                        variant="solid"
                        color="red_light"
                        leftIcon={<XIcon className="h-6 w-6 text-red-600" />}
                        style={{ width: '190px', height: '40px', outline: 'none', border: 'none' }}
                    >
                        Cancel Booking
                    </Button>
                ) : (
                    <>
                        {isRefundSaved ? (
                            <div className="flex gap-2 items-center">

                                {bookingData && (
                                    <ApprovalActions
                                        approvalStatus={bookingData?.ApprovalStatus || "-"}
                                        showApproval={bookingData?.IsApproval}
                                        isIcons={true}
                                        onHistory={() => handleApprovalLog(bookingData)}
                                        onApprove={() => handleApproveRejectDocument(bookingData, "approve")}
                                        onReject={() => handleApproveRejectDocument(bookingData, "reject")}
                                    />
                                )}

                                <Button
                                    onClick={() => navigate(`/payTrack/view/addRefundDetails`)}
                                    color="green"
                                    variant="solid"
                                    size="md"
                                    style={{ width: '190px', height: '40px' }}
                                    disabled={bookingData?.ApprovalStatus !== "Approved" && bookingData?.ApprovalStatus !== "Refund"}
                                >
                                    Make Payment
                                </Button>
                            </div>

                        ) : (
                            <>
                                <Button
                                    onClick={handleInitiateRefund}
                                    color="blue"
                                    variant="solid"
                                    colorMode="extraLight"
                                    size="md"
                                    style={{ width: '190px', height: '40px' }}
                                >
                                    Initiate Refund
                                </Button>
                                <Button
                                    onClick={handleInitiateTransfer}
                                    color="blue"
                                    size="md"
                                    variant="solid"
                                    style={{ width: '190px', height: '40px' }}
                                >
                                    Initiate Transfer
                                </Button>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* =================Applicant Details ================= */}

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
                                        <FieldItem label="Income Form16IT" value={getSafeString(applicant?.IncomeForm16ITRURL)} urls={applicant?.IncomeForm16ITRURL} isIcon />
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
                        <div className="py-6 text-center text-gray-500 text-sm bg-gray-50 rounded-lg border border-gray-200">
                            <NoDataView message="No Applicant Data Found" />
                        </div>
                    )}
                </section>
            </div>

            {/* =================Parking Details ================= */}
            <div className="pt-5">
                <section className="bg-white rounded-xl shadow-sm  p-6 border-[0.1px] border-[#3333334f]">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Parking Details
                    </h4>
                    {bookingData?.ParkingData && bookingData.ParkingData.length > 0 ? (
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
                        <div>
                            <NoDataView message="No Parking Data Found" />
                        </div>
                    )}
                </section>
            </div>


            {/* =================Flat Specification Remark ================= */}
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

            {(isBookingCancelled && isRefundSaved) && (
                <div className="col-span-7 pt-5">

                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4">
                        <h4 className="text-lg font-semibold text-gray-900 pb-2">Cancellation Details</h4>
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <FieldItem label="Booking Status" value={bookingData?.ApprovalStatus || "-"} />
                                <FieldItem label="Booking Cancelled Date" value={formatDate_dd_MonthName_yy(bookingData?.ModifiedDate ?? '')} />
                                <FieldItem label="Cancelled By" value={getSafeString(bookingData?.ModifiedBy)} />
                                <FieldItem label="Refunded Amount (₹)" value={formatCurrency(bookingData?.TotalAmountRefundedAgainstBooking) || "-"} />
                            </div>
                        </div>
                    </div>

                    {/* Refund Details */}
                    <div className="col-span-7 pt-5">
                        <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4">
                            <h4 className="text-lg font-semibold text-gray-900 pb-2">Refund Details</h4>
                            <div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <FieldItem label="Total Refunded Amount (₹)" value={formatCurrency(bookingData?.TotalAmountRefundedAgainstBooking) || "-"} />
                                    <FieldItem label="Paid (₹)" value={formatCurrency(bookingData?.RefundedAmountOnTillDate) || "-"} />
                                    <FieldItem label="Pending (₹)" value={`${formatCurrency((bookingData?.TotalAmountRefundedAgainstBooking || 0) - (bookingData?.RefundedAmountOnTillDate || 0))}`} />
                                    <FieldItem label="Refund Status" value={bookingData?.ApprovalStatus || "-"} />
                                    {/* Add Ledger Count */}
                                </div>
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
                onConfirm={onCancelBooking}
                title="Are you sure you want to cancel this booking?"
                message="Please save all your work before confirming."
                confirmText="Yes"
                cancelText="No"
                loading={false}
                variant="logout"
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

            <Modal
                isOpen={initiateTransfer}
                onClose={() => {
                    setInitiateTransfer(false);
                    setSearchBuildingWingFloorFlatTerm('');
                    setErrors({});
                    setSelectedFlatId('');
                }}
                onCancel={() => {
                    setInitiateTransfer(false);
                    setSearchBuildingWingFloorFlatTerm('');
                    setErrors({});
                    setSelectedFlatId('');
                }}
                title="Select Flat"
                loading={isLoading}
                size="small-half"
            >
                <div>
                    <div className=" space-y-4 ">
                        <Input
                            type="text"
                            placeholder="Search"
                            value={searchBuildingWingFloorFlatTerm}
                            onChange={e => {
                                setSearchBuildingWingFloorFlatTerm(e.target.value);
                            }}
                            leftIcon={<Search className="h-8 w-8 pb-1 text-gray-400" />}
                            className="w-full p-12 border border-gray-300 rounded mb-1"
                        />
                    </div>

                    <div className="overflow-x-auto thin-scroll">
                        {flatListOptions
                            .filter(flat =>
                                (flat?.label || '').toLowerCase().includes(searchBuildingWingFloorFlatTerm.toLowerCase())
                            ).length === 0 ? (
                            <div className="flex items-center justify-center p-10 text-gray-500 text-sm">
                                <NoDataView />
                            </div>

                        ) : (
                            flatListOptions
                                .filter(flat =>
                                    (flat?.label || '').toLowerCase().includes(searchBuildingWingFloorFlatTerm.toLowerCase())
                                )
                                .map(flat => {
                                    const isChecked = selectedFlatId === flat.value;
                                    return (
                                        <label
                                            key={flat.value}
                                            className="flex items-center justify-between gap-2 px-6 py-3 border-b border-blue-200 cursor-pointer last:border-b-0"
                                        >
                                            <span className="text-gray-700 text-sm">{flat.label}</span>
                                            <input
                                                type="radio"
                                                name="select-flat"
                                                value={flat.value}
                                                checked={isChecked}
                                                onChange={() => {
                                                    handleAddFlatModal(flat.value);
                                                    navigate(`/booking/add/${bookingData?.BookingId}/${bookingData?.EnquiryId}/${flat.value}`)
                                                }}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                        </label>
                                    );
                                })
                        )}
                    </div>
                </div>
            </Modal>

            <ApprovalLogModal
                isOpen={isApprovalLogModalOpen}
                title='Refund Details'
                titleText={ownerName ?? ""}
                onClose={() => setIsApprovalLogModalOpen(false)}
                request={approvalLogRequest} />

            <ApprovalActionModal
                title="Refund Details"
                isOpen={isApprovalActionModalOpen}
                onClose={() => setIsApprovalActionModalOpen(false)}
                actionType={approvalActionType}
                titleText={ownerName ?? ""}
                onSubmit={handleApprovalSubmit}
                loading={isLoading}
            />
        </div>
    )
}

export default Summary