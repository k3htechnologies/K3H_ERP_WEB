import { runApiWithLoader } from "@/core/utils";
import React, { useEffect, useMemo, useState } from "react";
import { bookingService } from '@/features/booking/services/BookingService';
import { useToast } from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import * as E from 'fp-ts/Either';
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { EnquiryData, FilterWithPaginationEnquiryRequest } from '@/features/enquiry/models/EnquiryModel';
import { EnquiryService } from '@/features/enquiry/services/EnquiryServices';
import type { BookingData, FilterWithPaginationBookingRequest } from '@/features/booking/models/BookingModel';
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import RichTextEditor from "@/ui/components/forms/RichTextEditor";
import { usePayTrackBookingListState } from "../context/PayTrackBookingListStateContext";
import {  type TableColumn } from "@/ui/components/DataTable/DataTable";
import { formatCurrency, getSafeString } from "@/core/utils/comman";
import type { CallLogData, FilterWithPaginationCallLogRequest } from "../models/CallLogModel";
import { callLogService } from "../services/CallLogService";
import { Modal } from "@/ui/components/Modal/Modal";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { fetchParkingDropdown } from "@/features/parking/parkingDropDown";
import { useMultiSelectDropdown } from "@/core/hooks/useMultiSelectDropdown";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import { getCallStatuscolor } from "../utils/Status";
import Checkbox from "@/ui/components/forms/Checkbox";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import { hasAnyDocumentFile } from "@/core/utils/fileValidation";
import { DataTableWithHeaderRowDivider } from "@/ui/components/DataTable/DataTableWithHeaderRowDivider";

interface BookingProps {
    modalOpen: boolean;
    setModalOpen: (val: boolean) => void;
    welcome: string;
    setWelcome: (val: string) => void;
}

type FormDataType = {
    FinalRegistrationDate: string | null;
    ParkingId: string;
    IsFinalRegistrationCompleted: boolean;
    FinalRegistrationURL: string;
    RemoveFinalRegistrationURL: string;
};

export const BookingFrom: React.FC<BookingProps> = ({ modalOpen, setModalOpen, welcome, setWelcome }) => {

    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [editEnquiryData, setEditEnquiryData] = useState<EnquiryData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isUpdateBookingRDPModalOpen, setIsUpdateBookingRDPModalOpen] = useState(false);
    const [selectedParkingValues, setSelectedParkingValues] = useState<string | number | null>(null);

    const [finalRegistrationFiles, setFinalRegistrationFiles] = useState<(File | string)[]>([]);
    const [RemoveFinalRegistrationUrls, setRemoveFinalRegistrationUrls] = useState<string[]>([]);
    const [finalRegistrationURL, setFinalRegistrationURL] = useState<string>();

    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const [formData, setFormData] = useState<FormDataType>({
        FinalRegistrationDate: null,
        ParkingId: '',
        IsFinalRegistrationCompleted: false,
        FinalRegistrationURL: '',
        RemoveFinalRegistrationURL: ''
    });

    const { addToast } = useToast();
    const { projectId } = useProject();

    const { listState, updateListState } = usePayTrackBookingListState();
    const { bookingId } = listState;

    //#region INIT
    useEffect(() => {
        if (!projectId || !bookingId) return;

        loadBookingFromServer();

    }, [projectId, bookingId]);

    useEffect(() => {
        if (!welcome) return;

        handleExportBookings();

    }, [welcome]);

    useEffect(() => {
        if (!bookingId) return;

        setCallLogList([]);
        setPageNumber(1);
        setHasMore(true);

        loadCallLogData(1);

    }, [bookingId]);

    useEffect(() => {
        setFormData({
            FinalRegistrationDate: bookingData?.FinalRegistrationDate || null,
            ParkingId: bookingData?.ParkingId?.toString() || '',
            IsFinalRegistrationCompleted: bookingData?.IsFinalRegistrationCompleted || false,
            FinalRegistrationURL: bookingData?.FinalRegistrationURL || '',
            RemoveFinalRegistrationURL: ''
        });

        setSelectedParkingValues(bookingData?.ParkingId?.toString() || "");

        setIsUpdateBookingRDPModalOpen(modalOpen);
    }, [modalOpen, bookingData]);

    const fetchEnquiryDetails = async (enquiryIdToFetch: number) => {

        if (!enquiryIdToFetch || enquiryIdToFetch === 0) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationEnquiryRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    EnquiryId: enquiryIdToFetch,
                    ProjectId: Number(projectId),
                    IsCheckPermission: false
                };

                const response = await EnquiryService.apiCallPullEnquiry(params);

                if (E.isRight(response)) {

                    const enquiryList = response.right.Data?.[0] ?? null;;

                    setEditEnquiryData(enquiryList);

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
            'Loading Enquiry Details'
        );
    };


    const loadBookingFromServer = async () => {
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
                    IsCheckPermission: false,
                };

                const response = await bookingService.apiCallPullBooking(params);

                if (E.isRight(response)) {
                    const booking = response.right.Data?.[0] ?? null;

                    setBookingData(booking);

                    if (booking?.EnquiryId && booking.EnquiryId > 0) {

                        await fetchEnquiryDetails(booking.EnquiryId);

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

    const handleExportBookings = async () => {
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
                    IsCheckPermission: false,
                    ExportType: welcome === "E-Mail" ? 'WELCOME MESSAGE ON MAIL' : 'WELCOME MESSAGE'
                };

                const response = await bookingService.apiCallPullBooking(params);

                addToast({ type: 'success', title: `${welcome} sent successfully` })

                setWelcome("");

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Sending'
        );
    };

    const loadCallLogData = useCallback(async (page = 1) => {

        if (!bookingId) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {


                setIsFetchingMore(true);

                const params: FilterWithPaginationCallLogRequest = {
                    PageNumber: page,
                    PageSize: PAGE_SIZE,
                    ProjectId: Number(projectId),
                    BookingId: Number(bookingId),
                };

                const response = await callLogService.apiCallPullPayTrackCallLog(params);

                if (E.isRight(response)) {

                    const newData = response.right.Data || [];

                    setCallLogList(prev =>
                        page === 1 ? newData : [...prev, ...newData]
                    );

                    setHasMore(newData.length === PAGE_SIZE);
                }

                setIsFetchingMore(false);
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading Booking Data'
        );


    }, [projectId, bookingId]);

    const paymentScheduleDataWithTotal = useMemo(() => {
        const data = bookingData?.BookingPaymentScheduleData || [];

        const totals = data.reduce(
            (acc, row) => {
                acc.PaymentScheduleAmount += row.PaymentScheduleAmount || 0;
                acc.PaymentScheduleGSTAmount += row.PaymentScheduleGSTAmount || 0;
                acc.PaymentSchedulePercentage += row.PaymentSchedulePercentage || 0;
                acc.PaymentScheduleTDSAmount += row.PaymentScheduleTDSAmount || 0;
                return acc;
            },
            {
                PaymentScheduleAmount: 0,
                PaymentScheduleGSTAmount: 0,
                PaymentSchedulePercentage: 0,
                PaymentScheduleTDSAmount: 0,
            }
        );

        return [
            ...data,
            {
                Name: "TOTAL",
                Type: "Stage",
                PaymentSchedulePercentage: totals.PaymentSchedulePercentage,
                PaymentScheduleAmount: totals.PaymentScheduleAmount,
                PaymentScheduleGSTAmount: totals.PaymentScheduleGSTAmount,
                PaymentScheduleTDSAmount: totals.PaymentScheduleTDSAmount,
                isTotal: true,
            },
        ];
    }, [bookingData]);

    const paymentScheduleColumns = useMemo<TableColumn[]>(() => {

        const boldIfTotal = (row: any) =>
            row.isTotal ? "font-bold text-gray-500" : "";

        return [
            {
                key: "Date",
                label: "Date / Stage (Milestone)",
                width: "30",
                align: "center",
                render: (_value, row) => {

                    if (row.Type === "Date" && row.Date) {

                        return formatDate_dd_MonthName_yy(row.Date);

                    } else if (row.Type === "Stage" && row.Name) {

                        return row.Name;
                    }
                    return "-";
                },
            },
            {
                key: "PaymentSchedulePercentage",
                label: "Percentage (%)",
                sortable: false,

                width: "20",
                align: "right",
                render: (value) => `${value || 0}%`,
            },
            {
                key: "PaymentScheduleAmount",
                label: "Amount Without TDS (₹)",
                width: "20",
                align: "right",
                render: (value) => value || "-",
            },
            {
                key: "PaymentScheduleGSTAmount",
                label: "GST Amount (₹)",

                width: "20",
                sortable: false,
                align: "right",
                render: (value) => value || "-",
            },
            {
                key: "PaymentScheduleTDSAmount",
                label: "TDS Amount (₹)",

                width: "20",
                sortable: false,
                align: "right",
                render: (value) => value || "-",
            },

            {
                key: "PaymentScheduleTotalAmount",
                label: "Total Amount With TDS (₹)",
                sortable: false,
                width: "20",
                align: "right",
                render: (_, row) =>
                    <span className={boldIfTotal(row)}>
                        {formatCurrency(
                            (row?.PaymentScheduleAmount || 0) +
                            (row?.PaymentScheduleTDSAmount || 0)
                        ) || "0"}
                    </span>
            },
        ];
    }, []);

    const otherChargesDataWithTotal = useMemo(() => {
        const data = bookingData?.BookingOtherChargesData || [];

        if (data.length === 0) return [];

        const totals = data.reduce(
            (acc, row) => {

                acc.Value += row.Value || 0;
                acc.GSTPercentage += row.GSTPercentage || 0;
                acc.GSTValue += row.GSTValue || 0;
                return acc;

            },
            {
                Value: 0,
                GSTPercentage: 0,
                GSTValue: 0,
            }
        );

        return [
            ...data,
            {
                ChargeName: "TOTAL",
                CalculatedOn: "",
                Value: totals.Value,
                GSTPercentage: totals.GSTPercentage || 0,
                GSTValue: totals.GSTValue,
                isTotal: true,
            },
        ];
    }, [bookingData]);


    const otherChargesColumns = useMemo<TableColumn[]>(() => {

        const boldIfTotal = (row: any) =>
            row.isTotal ? "font-bold text-gray-500" : "";

        return [
            {
                key: "ChargeName",
                label: "Charges",
                sortable: false,
                align: "left",
                fixed: "left",
                render: (value) => value || "-",
            },
            {
                key: "CalculatedOn",
                label: "Calculated On",
                sortable: false,
                align: "left",
                render: (value) => value || "-",
            },
            {
                key: "Value",
                label: "Value (₹)",
                sortable: false,
                align: "right",
                render: (value) => value || "-",
            },
            {
                key: "GSTPercentage",
                label: "GST (%)",
                sortable: false,
                align: "right",
                render: (value) => `${value || 0}%`,
            },
            {
                key: "GSTValue",
                label: "GST Value (₹)",
                sortable: false,
                align: "right",
                render: (value) => value || "-",
            },
        ];
    }, []);

    const fetchParkingProjectWise = useCallback(async (pageNumber: number, params?: { value?: string }) => {
        return fetchParkingDropdown(pageNumber, {
            ...params,
            value: params?.value || "",
            projectId: projectId || 0,
            displayParkingId: bookingData?.ParkingId || "",
        });
    }, [projectId, bookingData?.ParkingId]);

    const parkingDropdown = useMultiSelectDropdown({
        value: selectedParkingValues,
        fetchCallback: fetchParkingProjectWise,
        autoFetchOptions: true,
    });


    const handleFieldChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCloseBookingRDPModal = () => {
        setFormData({
            FinalRegistrationDate: null,
            ParkingId: '',
            IsFinalRegistrationCompleted: false,
            FinalRegistrationURL: '',
            RemoveFinalRegistrationURL: ''
        });
        setSelectedParkingValues("");

        setFinalRegistrationFiles([]);
        setFinalRegistrationURL("");
        setRemoveFinalRegistrationUrls([]);

        setIsUpdateBookingRDPModalOpen(false);
        setModalOpen(false);
        setErrors({});
    };

    const validateUpdateBookingRDPForm = (): {
        isValid: boolean;
        errors: { [k: string]: string };
    } => {
        const errors: { [k: string]: string } = {};

        if (formData.IsFinalRegistrationCompleted === true && !formData.FinalRegistrationDate) {
            errors.FinalRegistrationDate = "Final Registration Date is required.";
        }

        if (formData.IsFinalRegistrationCompleted === true && !hasAnyDocumentFile(finalRegistrationFiles, finalRegistrationURL, RemoveFinalRegistrationUrls)) {
            errors.FinalRegistrationURL = "Final Registration Copy is required.";
        }
        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    };

    const PushUpdatePayTrackBookingRegistrationDateParkingFormData = (): FormData => {
        const fd = new FormData();

        fd.append("BookingId", String(bookingId)),
            fd.append("Uniquekey", bookingData?.Uniquekey ?? "7b14cc10-2533-f111-854a-c7681b271aa8"),
            fd.append("FinalRegistrationDate", formData.FinalRegistrationDate ? formData.FinalRegistrationDate.toString() : "");
        fd.append("ProjectId", String(projectId)),
            fd.append("ParkingId", formData.ParkingId),
            fd.append("IsFinalRegistrationCompleted", String(formData.IsFinalRegistrationCompleted))

        finalRegistrationFiles.forEach((file) => {
            if (file instanceof File) {
                fd.append("FinalRegistrationURL", file);
            }
        });

        fd.append("RemoveProofOfDocumentURL", RemoveFinalRegistrationUrls.join(","));

        return fd;

    };

    const handleUpdateBookingRDPSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({});

        const validation = validateUpdateBookingRDPForm()

        if (!validation.isValid) {

            setErrors(validation.errors)

            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushUpdatePayTrackBookingRegistrationDateParkingFormData();

                const response = await bookingService.apiCallUpdatePayTrackBookingRegistrationDateParking(payload);

                if (E.isRight(response)) {

                    const booking = response.right.Data?.[0] ?? null;

                    setBookingData(booking);

                    setIsUpdateBookingRDPModalOpen(false);

                    setModalOpen(false);

                    setSelectedParkingValues("");

                    setFormData({
                        FinalRegistrationDate: null,
                        ParkingId: "",
                        IsFinalRegistrationCompleted: false,
                        FinalRegistrationURL: '',
                        RemoveFinalRegistrationURL: ''
                    });

                    setFinalRegistrationFiles([]);
                    setFinalRegistrationURL("");
                    setRemoveFinalRegistrationUrls([]);
                    setErrors({});

                    updateListState({ parkingNumber: booking.ParkingNumber || "", isFinalRegistrationCompleted: booking.IsFinalRegistrationCompleted || false });

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    setIsUpdateBookingRDPModalOpen(false);

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
            'Update Booking'
        );
    };

    if (!bookingData) {
            return (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <Loader loading={isLoading} title={loadingMessage}>
                        <div>No booking data found</div>
                    </Loader>
                </div>
            );
        }
    

    return (
        <div className="">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>


            <div className="pt-5">
                {/* ===================== ENQUIRY DETAILS ===================== */}
                        {editEnquiryData && (

                            <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                                <div className="bg-[#E7F2FF] px-3 py-2 border-b border-[#D0D7DE]">
                                    <h4 className="text-sm font-semibold text-[#1D4ED8]">
                                        Enquiry Details
                                    </h4>
                                </div>
                                <div className="p-4 bg-white">
                                    <div className="rounded-lg">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-3">

                                            <FieldItem label="Enquiry Code:" value={editEnquiryData?.SystemGeneratedCode || '-'} />

                                            <FieldItem label="Name" value={editEnquiryData?.Name || '-'} />

                                            <FieldItem label="E-Mail ID" value={editEnquiryData?.EmailId || '-'} />

                                            <FieldItem label="Mobile No" value={!getSafeString(editEnquiryData?.MobileNumber) ? "-" : `${editEnquiryData?.MobileNumberCountryCode ?? "+91"}  ${editEnquiryData?.MobileNumber}`} />


                                            <FieldItem label="Source" value={editEnquiryData?.Source || '-'} />

                                            <FieldItem label="Sub Source" value={editEnquiryData?.SubSource || '-'} />

                                            {editEnquiryData?.Source?.toUpperCase() !== 'CHANNEL PARTNER' && !!editEnquiryData?.SubSubSource?.trim() && (
                                                <FieldItem label="Sub Sub Source" value={editEnquiryData?.SubSubSource || '-'} />
                                            )}

                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-3 pt-3">
                                            <FieldItem label="Sales Advisor" value={editEnquiryData?.SalesAdvisor ?? '-'} />
                                            <FieldItem label="Sourcing Manager" value={editEnquiryData?.SourcingManager ?? '-'} />

                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-1 gap-3 pt-3">
                                            <FieldItem label="Current Location" value={editEnquiryData?.CurrentLocation || '-'} />
                                        </div>

                                    </div>
                                    {/* ===================== DIRECT WALKING → REFERENCE ===================== */}
                                    {editEnquiryData?.Source === 'Direct Walkin' && editEnquiryData?.SubSource === 'Reference' && (
                                        <div className="mt-4 rounded-lg pt-5">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">

                                                <FieldItem label="Referral Unit Owner" value={editEnquiryData?.ReferralUnitOwnerName || '-'} />
                                                <FieldItem label="Referral Project" value={editEnquiryData?.ReferralProjectName || '-'} />
                                                <FieldItem label="Referral Unit No" value={editEnquiryData?.ReferralUnitNumber || '-'} />

                                            </div>
                                        </div>
                                    )}

                                    {/* ===================== DIRECT WALKING → LOYALTY ===================== */}
                                    {editEnquiryData?.Source === 'Direct Walkin' && editEnquiryData?.SubSource === 'Loyalty' && (
                                        <div className="mt-4 p-4 rounded-lg border border-blue-200 pt-5">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">

                                                <FieldItem label="Existing Project" value={editEnquiryData?.LoyaltyExistingProjectName || '-'} />
                                                <FieldItem label="Existing Unit No" value={editEnquiryData?.LoyaltyExistingUnitNumber || '-'} />
                                                <FieldItem label="Existing Unit Owner" value={editEnquiryData?.LoyaltyExistingUnitOwnerName || '-'} />

                                            </div>
                                        </div>
                                    )}

                                    {/* ===================== DIRECT WALKING → EMPLOYEE REFERENCE ===================== */}
                                    {editEnquiryData?.Source === 'Direct Walkin' && editEnquiryData?.SubSource === 'Employee Reference' && (
                                        <div className="mt-2 rounded-lg pt-5">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">

                                                <FieldItem label="Employee Name" value={editEnquiryData?.EmployeeReferenceName || '-'} />
                                                <FieldItem label="Employee Mobile" value={editEnquiryData?.EmployeeReferenceMobileNumber ? `+91 ${editEnquiryData?.EmployeeReferenceMobileNumber}` : '-'} />

                                            </div>
                                        </div>
                                    )}

                                    {/* ===================== CHANNEL PARTNER DETAILS ===================== */}
                                    {editEnquiryData?.Source?.toUpperCase() === 'CHANNEL PARTNER' && (
                                        <div className="mt-2 rounded-lg pt-5">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">

                                                <FieldItem label="CP Code" value={editEnquiryData?.ChannelPartnerCode || '-'} />
                                                <FieldItem label="CP Name" value={editEnquiryData?.ChannelPartnerName || '-'} />
                                                <FieldItem label="CP Mobile Number" value={editEnquiryData?.ChannelPartnerMobileNumber ? `${editEnquiryData?.ChannelPartnerMobileNumberCountryCode} ${editEnquiryData?.ChannelPartnerMobileNumber}` : '-'} />
                                                <FieldItem label="CP E-Mail ID" value={editEnquiryData?.ChannelPartnerEmailId || '-'} />
                                                <FieldItem label="CP Team Member Name" value={editEnquiryData?.ChannelPartnerTeamMemberName || '-'} />
                                                <FieldItem label="CP Team Mobile Number" value={editEnquiryData?.ChannelPartnerTeamMemberMobileNumber ? `${editEnquiryData?.ChannelPartnerTeamMemberMobileNumberCountryCode} ${editEnquiryData?.ChannelPartnerTeamMemberMobileNumber}` : '-'} />
                                                <FieldItem label="CP  Team E-Mail ID" value={editEnquiryData?.ChannelPartnerTeamMemberEmailId || '-'} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}
                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                            <div className="bg-[#FFF6EB] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#C2410C]">
                                    Applicant Details
                                </h4>
                            </div>
                            <div className="p-4 bg-white">

                                <div className="space-y-5">
                                    {bookingData.BookingApplicantData && bookingData.BookingApplicantData.length > 0 ? (
                                        bookingData.BookingApplicantData.map((applicant, i) => (
                                            <div key={applicant.BookingApplicantId ?? i} className="bg-gray-50 rounded-lg p-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    <FieldItem label="Type" value={getSafeString(applicant.ApplicantType)} className='text-blue-900 bold' />
                                                    <FieldItem label="Applicant Name" value={getSafeString(applicant.ApplicantName)} urls={applicant?.PhotoURL} isIcon />
                                                    <FieldItem label="Mobile Number" value={`${getSafeString(applicant?.ApplicantMobileNumberCountryCode ?? "+91")}  ${getSafeString(applicant?.ApplicantMobileNumber)}`} />
                                                    <FieldItem label="E-Mail ID" value={getSafeString(applicant?.ApplicantEmailId)} />
                                                    <FieldItem label="Aadhaar Card No." value={getSafeString(applicant?.AadharCardNumber)} urls={applicant?.AadharCardURL} isIcon />
                                                    <FieldItem label="PAN No." value={getSafeString(applicant?.PanNumber)} urls={applicant?.PanCardURL} isIcon />
                                                    <FieldItem label="Driving License" value={getSafeString(applicant?.DrivingLicenseNumber)} urls={applicant?.DrivingLicenseURL} isIcon />
                                                    <FieldItem label="Voting ID No." value={getSafeString(applicant?.VotingIdNumber)} urls={applicant?.VotingIdURL} isIcon />
                                                    <FieldItem label="Passport No." value={getSafeString(applicant?.PassportNumber)} urls={applicant?.PassportURL} isIcon />
                                                    <FieldItem label="GST No." value={getSafeString(applicant?.GSTNumber)} urls={applicant?.GSTNumberURL} isIcon />
                                                    <FieldItem label="Cancelled Cheque" value="" isSetValue={false} urls={applicant?.CancelledChequeURL} isIcon />
                                                    <FieldItem label="POA (if NRI Execution)" isSetValue={false} value="" urls={applicant?.POAURL} isIcon />
                                                    <FieldItem label="Income Docs (Form 16 / ITR)" isSetValue={false} urls={applicant?.IncomeForm16ITRURL} isIcon />
                                                    <FieldItem label="NRE / NRO Bank Details" isSetValue={false} value="" urls={applicant?.NreNroBankDetailsURL} isIcon />
                                                    <FieldItem label="Nominee Form" value="" isSetValue={false} urls={applicant?.NomineeFormURL} isIcon />
                                                    <FieldItem label="Statement of Source of Funds" isSetValue={false} value="" urls={applicant?.StatementOfSourceOfFundsURL} isIcon />
                                                    <FieldItem label="Payment Proof" value="" isSetValue={false} urls={applicant?.PaymentProofURL} isIcon />

                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-6 text-center text-gray-500 text-sm">
                                            <NoDataView message="No Applicant Data Found" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                            <div className="bg-[#F6F9FF] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#13367A]">
                                    Project Details
                                </h4>
                            </div>
                            <div className="p-4 bg-white">

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4">
                                    <FieldItem label="Project Name" value={getSafeString(bookingData.ProjectName)} />
                                    <FieldItem label="Booking Type" value={getSafeString(bookingData.BookingType)} />

                                    {bookingData.BookingType?.toUpperCase() === "FLAT" && (

                                        <FieldItem label="Unit No" value={getSafeString(bookingData.Flat)} />)}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pt-4 pb-4">
                                    <FieldItem label="Wing" value={getSafeString(bookingData.Wing)} />
                                    <FieldItem label="Floor" value={getSafeString(bookingData.Floor)} />
                                    <FieldItem label="Building Number" value={getSafeString(bookingData.BuildingNumber)} />
                                </div>

                                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 ${bookingData.ParkingNumber !== "" ? "border-b border-[#135bec2e] pb-4" : ""} `} >
                                    <FieldItem label="Flat Type" value={getSafeString(bookingData.FlatType)} />
                                    <FieldItem label="Flat Configuration" value={getSafeString(bookingData.FlatConfiguration)} />
                                    <FieldItem label="RERA Carpet Area (SqFt)" value={getSafeString(bookingData.RERACarpetAreaSqFt)} />
                                </div>

                                {bookingData.ParkingNumber !== "" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 pt-5">
                                        <FieldItem label="Parking Number" value={getSafeString(bookingData.ParkingNumber)} />
                                    </div>
                                )}
                            </div>
                        </section>

                        {bookingData.ParkingData && bookingData.ParkingData.length > 0 && (
                            <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                                <div className="bg-[#F6F9FF] px-3 py-2 border-b border-[#D0D7DE]">
                                    <h4 className="text-sm font-semibold text-[#13367A]">
                                        Parking Details
                                    </h4>
                                </div>
                                <div className="p-4 bg-white">


                                    {bookingData.ParkingData.map((parking, index) => {

                                        const isLast = index === (bookingData.ParkingData?.length ?? 0) - 1;

                                        return (
                                            <div key={parking.ParkingId || index} className="pt-4">
                                                <h3 className="text-sm font-semibold text-gray-500">
                                                    Parking {index + 1}
                                                </h3>
                                                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 ${!isLast ? "border-b border-[#135bec2e] pb-4" : "border-b border-[#135bec2e] pb-4 pt-4"} `} >
                                                    <FieldItem label="Parking Number" value={getSafeString(parking.ParkingNumber)} />
                                                    <FieldItem label="Building" value={getSafeString(parking.BuildingNumber)} />
                                                    <FieldItem label="Wing" value={getSafeString(parking.Wing)} />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pt-4 pb-4">
                                                    <FieldItem label="Floor" value={getSafeString(parking.Floor)} />
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

                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                            <div className="bg-[#EAFCFF] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#12A3DD]">
                                    Booking Details
                                </h4>
                            </div>
                            <div className="p-4 bg-white">

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4">
                                    <FieldItem label="Expected Registration Date" value={bookingData.RegistrationDate ? formatDate_dd_MonthName_yy(bookingData.RegistrationDate) : '-'} />
                                    <FieldItem label="Final Registration Date" value={bookingData.FinalRegistrationDate ? formatDate_dd_MonthName_yy(bookingData.FinalRegistrationDate) : '-'} />
                                    <FieldItem label="Final Registration Completed" value={getSafeString(bookingData.IsFinalRegistrationCompleted === true ? 'Yes' : 'No')} urls={bookingData.FinalRegistrationURL} isIcon />
                                    <FieldItem label="Handover Type" value={getSafeString(bookingData.HandoverType)} />

                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
                                    <FieldItem label="Source Of Funding" value={getSafeString(bookingData.SourceOfFunding)} />
                                    <FieldItem label="Number Of Parking" value={getSafeString(bookingData.NumberOfParking)} />
                                </div>
                            </div>
                        </section>

                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                            <div className="bg-[#FFFFE4] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#7B6B28]">
                                    Payment Details
                                </h4>
                            </div>
                            <div className="p-4 bg-white">

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                    <FieldItem label="Cheque / RTGS No." value={getSafeString(bookingData.ChequeRTGSNumber)} />
                                    <FieldItem label="Cheque / RTGS Date" value={bookingData.ChequeRTGSDate ? formatDate_dd_MonthName_yy(bookingData.ChequeRTGSDate) : '-'} />
                                    <FieldItem label="Bank Name" value={getSafeString(bookingData.BankName)} />
                                </div>
                            </div>
                        </section>

                    </div>

                    <div className="lg:col-span-1 space-y-6">

                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                            <div className="bg-[#F3F0FE] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#6D28D9]">
                                    Booking Summary
                                </h4>
                            </div>
                            <div className="p-4 bg-white">


                                <div className="divide-y divide-[#135bec2e]">

                                    <div className="py-4">
                                        <FieldItem label="Agreement Value (With TDS) (₹)" value={formatCurrency(bookingData.AgreementValue)} isRow />
                                    </div>

                                    <div className="py-4">
                                        <FieldItem label="TDS (₹)" value={formatCurrency(bookingData.AgreementValueTDS)} isRow />
                                    </div>

                                    <div className="py-4">
                                        <FieldItem
                                            label="Agreement Value (Without TDS)"
                                            value={formatCurrency((bookingData?.AgreementValue ?? 0) - (bookingData?.AgreementValueTDS ?? 0))}
                                            isRow
                                        />
                                    </div>

                                    <div className="py-4">
                                        <FieldItem label="GST (%)" value={getSafeString(bookingData.AgreementValueGSTPercentage)} isRow />
                                    </div>

                                    <div className="py-4">
                                        <FieldItem label="GST (₹)" value={formatCurrency(bookingData.AgreementValueGSTAmount)} isRow />
                                    </div>

                                    <div className="py-4">
                                        <FieldItem label="Stamp Duty (%)" value={getSafeString(bookingData.StampDutyPercentage)} isRow />
                                    </div>

                                    <div className="py-4">
                                        <FieldItem label="Stamp Duty (₹)" value={formatCurrency(bookingData.StampDutyAmount)} isRow />
                                    </div>

                                    <div className="py-4">
                                        <FieldItem label="Registration Fees (₹)" value={formatCurrency(bookingData.RegistrationFees)} isRow />
                                    </div>

                                    <div className="py-4">
                                        <FieldItem label="Booking Amount (₹)" value={formatCurrency(bookingData.BookingAmount)} isRow />
                                    </div>
                                    {editEnquiryData?.Source?.toUpperCase() === 'CHANNEL PARTNER' && (
                                        <>
                                            <div className="py-4">
                                                <FieldItem label="Brokerage (%)" value={getSafeString(bookingData.BrokeragePercentage)} isRow />
                                            </div>
                                            <div className="py-4">
                                                <FieldItem label="Brokerage Amount (₹)" value={formatCurrency(bookingData.BrokerageAmount)} isRow />
                                            </div>
                                        </>
                                    )}

                                    {editEnquiryData?.Source === 'Direct Walkin' && editEnquiryData?.SubSource === 'Reference' && (
                                        <>
                                            <div className="py-4">
                                                <FieldItem label="Referral (%)" value={getSafeString(bookingData.ReferralAmount)} isRow />
                                            </div>
                                            <div className="py-4">
                                                <FieldItem label="Referral Amount (₹)" value={formatCurrency(bookingData.ReferralAmount)} isRow />
                                            </div>
                                        </>
                                    )}

                                    {editEnquiryData?.Source === 'Direct Walkin' && editEnquiryData?.SubSource === 'Loyalty' && (
                                        <>
                                            <div className="py-4">
                                                <FieldItem label="Loyalty (%)" value={getSafeString(bookingData.LoyaltyPercentage)} isRow />
                                            </div>
                                            <div className="py-4">
                                                <FieldItem label="Loyalty Amount (₹)" value={formatCurrency(bookingData.LoyaltyAmount)} isRow />
                                            </div>
                                        </>
                                    )}

                                    {editEnquiryData?.Source === 'Direct Walkin' && editEnquiryData?.SubSource === 'Employee Reference' && (
                                        <>
                                            <div className="py-4">
                                                <FieldItem label="Employee Reference (%)" value={getSafeString(bookingData.EmployeeReferencePercentage)} isRow />
                                            </div>
                                            <div className="py-4">
                                                <FieldItem label="Employee Reference Amount (₹)" value={formatCurrency(bookingData.EmployeeReferenceAmount)} isRow />
                                            </div>
                                        </>
                                    )}


                                </div>
                            </div>
                        </section>

                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                            <div className="bg-[#E6FFE6] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#00A800]">
                                    Call Log History
                                </h4>
                            </div>
                            <div className="p-4 bg-white">


                                {callLogList.length > 0 ? (

                                    <div className="relative">

                                        <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-blue-500"></div>

                                        <div
                                            className="space-y-4 flex-1 max-h-[870px] overflow-y-auto thin-scroll pr-1"
                                            onScroll={(e) => {
                                                const target = e.currentTarget;

                                                if (
                                                    target.scrollHeight - target.scrollTop <= target.clientHeight + 50 &&
                                                    hasMore &&
                                                    !isFetchingMore
                                                ) {
                                                    const nextPage = pageNumber + 1;
                                                    setPageNumber(nextPage);
                                                    loadCallLogData(nextPage);
                                                }
                                            }}
                                        >

                                            {callLogList.map((log, index) => (
                                                <div key={index} className="grid grid-cols-[24px_1fr] gap-3 relative">

                                                    <div className="flex justify-center">
                                                        <div className="h-4 w-4 rounded-full bg-blue-600 z-10"></div>
                                                    </div>

                                                    <div>

                                                        <div className="flex items-center gap-3">

                                                            <span className="font-semibold text-gray-900">
                                                                {formatDate_dd_MonthName_yy_hh_mm(log.CallDate || "-")}
                                                            </span>

                                                            <div className="ml-auto mr-3 text-xs font-semibold text-right">
                                                                {(() => {
                                                                    const { bg, text } = getCallStatuscolor(log.CallStatus || "");
                                                                    return (
                                                                        <span
                                                                            className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                                                                            style={{
                                                                                backgroundColor: bg,
                                                                                color: text
                                                                            }}
                                                                        >
                                                                            {log.CallStatus || "-"}
                                                                        </span>
                                                                    );
                                                                })()}
                                                            </div>

                                                        </div>

                                                        <span className="text-sm text-gray-400">
                                                            {log.CreatedBy || "-"}
                                                        </span>

                                                        {log.CallPurpose && (
                                                            <div className="text-xs  font-semibold text-gray-500 mt-1">
                                                                Purpose: {log.CallPurpose}
                                                            </div>
                                                        )}

                                                        {Number(log.PromiseAmount) > 0 && (
                                                            <div className="text-xs text-green-600 font-semibold mt-1">
                                                                Promise Amount: ₹ {log.PromiseAmount}
                                                            </div>
                                                        )}

                                                        {log.Remark && (
                                                            <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                                                                {log.Remark}
                                                            </p>
                                                        )}

                                                    </div>
                                                </div>
                                            ))}

                                            {isFetchingMore && (
                                                <div className="text-center text-xs text-gray-500 py-2">
                                                    Loading more...
                                                </div>
                                            )}

                                            {!hasMore && (
                                                <div className="text-center text-xs text-gray-400 py-2">
                                                    No more records
                                                </div>
                                            )}

                                        </div>
                                    </div>

                                ) : (
                                    <NoDataView message="No Call Logs Found" />
                                )}
                            </div>
                        </section>

                    </div>

                </div>
                <div className="pt-5">
                    <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                        <div className="bg-[#FCF1FF] px-3 py-2 border-b border-[#D0D7DE]">
                            <h4 className="text-sm font-semibold text-[#561F64]">
                                Other Charges
                            </h4>
                        </div>
                        <div className="p-4 bg-white">

                            <DataTableWithHeaderRowDivider
                                data={otherChargesDataWithTotal}
                                columns={otherChargesColumns}
                                emptyMessage="No Other Charges Found"
                                fixedHeight={true}
                                recordsPerPage={20}
                                className="flex-1" />
                        </div>
                    </section>
                </div>

                <div className="pt-5">
                    <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                        <div className="bg-[#D1E1FF] px-3 py-2 border-b border-[#D0D7DE]">
                            <h4 className="text-sm font-semibold text-[#13367A]">
                                Payment Schedule{" "}
                                <span className="text-sm font-normal text-gray-500">
                                    ({getSafeString(bookingData.PaymentScheduleScheme)})
                                </span>
                            </h4>
                        </div>
                        <div className="p-4 bg-white">

                            <DataTableWithHeaderRowDivider
                                data={paymentScheduleDataWithTotal}
                                columns={paymentScheduleColumns}
                                emptyMessage="No Payment Schedule Found"
                                fixedHeight={true}
                                recordsPerPage={20}
                                className="flex-1" />

                        </div>
                    </section>
                </div>

                <div className="pt-5">
                    <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                        <div className="bg-[#FBF9F9] px-3 py-2 border-b border-[#D0D7DE]">
                            <h4 className="text-sm font-semibold text-[#1D1D1D]">
                                Unit / Modulation / Customization Remark
                            </h4>
                        </div>
                        <div className="p-4 bg-white">

                            <div className="grid grid-cols-1 gap-4">
                                <FieldItem label="" value={getSafeString(bookingData.FlatAlterationRemark)} />
                            </div>
                        </div>
                    </section>
                </div>
                <div className="pt-5">
                    <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                        <div className="bg-[#FBF9F9] px-3 py-2 border-b border-[#D0D7DE]">
                            <h4 className="text-sm font-semibold text-[#1D1D1D]">
                                Payment Related Remark
                            </h4>
                        </div>
                        <div className="p-4 bg-white">

                            <div className="grid grid-cols-1 gap-4">
                                <FieldItem label="" value={getSafeString(bookingData.PaymentRemark)} />
                            </div>
                        </div>
                    </section>
                </div>
                <div className="pt-5">
                    <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                        <div className="bg-[#FBF9F9] px-3 py-2 border-b border-[#D0D7DE]">
                            <h4 className="text-sm font-semibold text-[#1D1D1D]">
                                Other Remarks
                            </h4>
                        </div>
                        <div className="p-4 bg-white">

                            <div className="grid grid-cols-1 gap-4">
                                <FieldItem label="" value={getSafeString(bookingData.OtherRemark)} />
                            </div>
                        </div>
                    </section>
                </div>

                <div className='pt-5'>
                    <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">
                        <div className="bg-[#FFECEC] px-3 py-2 border-b border-[#D0D7DE]">
                            <h4 className="text-sm font-semibold text-[#E92C2C]">
                                Terms & Conditions
                            </h4>
                        </div>
                        <div className="p-4 bg-white">
                            <div className="grid grid-cols-1 gap-4">
                                {bookingData.TermsAndConditionsDescription ? (
                                    <RichTextEditor value={bookingData.TermsAndConditionsDescription} onChange={() => { }} readOnly />
                                ) : (
                                    <FieldItem label="Terms & Conditions" value={getSafeString(bookingData.TermsAndConditionsDescription)} />
                                )}
                            </div>
                        </div>
                    </section>
                </div>


                <div className='pt-5'>
                    <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                        <div className="bg-[#E1E2E4] px-3 py-2 border-b border-[#D0D7DE]">
                            <h4 className="text-sm font-semibold text-[#333333]">
                                Action Details
                            </h4>
                        </div>
                        <div className="p-4 bg-white">


                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 border-b border-[#135bec2e] pb-4">
                                <FieldItem label="Created By" value={getSafeString(bookingData.CreatedBy)} />
                                <FieldItem
                                    label="Created Date"
                                    value={
                                        bookingData.CreatedDate
                                            ? formatDate_dd_MonthName_yy_hh_mm(bookingData.CreatedDate)
                                            : '-'
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 border-b border-[#135bec2e] pb-4 pt-4">
                                <FieldItem label="Modified By" value={getSafeString(bookingData.ModifiedBy)} />
                                <FieldItem
                                    label="Modified Date"
                                    value={
                                        bookingData.ModifiedDate
                                            ? formatDate_dd_MonthName_yy_hh_mm(bookingData.ModifiedDate)
                                            : '-'
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 pt-4">
                                <FieldItem label="Approval Status" value={getSafeString(bookingData.ApprovalStatus)} />
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <Modal
                isOpen={isUpdateBookingRDPModalOpen}
                onClose={handleCloseBookingRDPModal}
                title={"Update Registration Date & Parking"}
                onSubmit={handleUpdateBookingRDPSubmit}
                saveText="Save"
                loading={isLoading}
                size="xl"
            >
                <div className="space-y-6 p-6 bg-blue-100">

                    <DatePickerInput
                        label="Final Registration Date"
                        required={formData.IsFinalRegistrationCompleted}
                        value={formatDate_dd_mm_yyyy(formData.FinalRegistrationDate)}
                        error={errors.FinalRegistrationDate}
                        onChange={(val) => handleFieldChange("FinalRegistrationDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))} />

                    <MultiSelectPagination
                        label="Parking"
                        dataFetchCallBack={fetchParkingProjectWise}
                        selectedValues={parkingDropdown.selectedValues}
                        options={parkingDropdown.initialOptions}
                        onChange={(values) => {
                            const { idsString } = parkingDropdown.handleChange(values);
                            setSelectedParkingValues(idsString || null);
                            handleFieldChange("ParkingId", idsString);
                        }}
                    />

                    <Checkbox
                        label="Mark as Final Registration (Cannot Be Change)"
                        checked={formData.IsFinalRegistrationCompleted}
                        onChange={(e) => {
                            handleFieldChange("IsFinalRegistrationCompleted", e.target.checked)
                        }}
                    />
                    <p className="text-sm text-[#00000080] pt-3">By selecting this option, the <b>Registration</b>  will be finalized and cannot be changed later.</p>

                    {formData.IsFinalRegistrationCompleted && (
                        <MultiFilePicker
                            label="Final Registered Agreement"
                            placeholder="Select Final Registered Agreement"
                            required
                            value={finalRegistrationFiles}
                            onChange={setFinalRegistrationFiles}
                            availableFilesURL={finalRegistrationURL ?? ""}
                            allowedTypes={["application/pdf"]}
                            error={errors.FinalRegistrationURL}
                            maxFiles={1}
                            onRemoveExisting={(url) => {
                                setRemoveFinalRegistrationUrls((prev) => [...prev, url]);
                            }}
                        />
                    )
                    }
                </div>

            </Modal>

        </div>
    )

}

export default BookingFrom
