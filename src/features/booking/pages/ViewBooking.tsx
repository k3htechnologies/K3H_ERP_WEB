import React, { useEffect, useMemo, useState } from 'react';
import { Loader } from '@/core/utils/loader';
import type { BookingData, FilterWithPaginationBookingRequest } from '../models/BookingModel';
import { useNavigate, useLocation } from 'react-router-dom';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { bookingService } from '../services/BookingService';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useBookingListState } from '@/features/booking/context/BookingListStateContext';
import Tabs from '@/ui/components/Tab/Tab';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import type { EnquiryData, FilterWithPaginationEnquiryRequest } from '@/features/enquiry/models/EnquiryModel';
import { EnquiryService } from '@/features/enquiry/services/EnquiryServices';
import RichTextEditor from '@/ui/components/forms/RichTextEditor';
import { handleExportFile } from '@/core/utils/exportFile';
import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { formatCurrency, getSafeString } from '@/core/utils/comman';
import { FileText } from 'lucide-react';

export const ViewBooking: React.FC = () => {

    //#region STATE MANAGEMENT
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [editEnquiryData, setEditEnquiryData] = useState<EnquiryData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { canAction } = useMenuPermissions();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const { projectId } = useProject();

    const sourcePage = (location.state as any)?.sourcePage || 'booking';

    const { listState } = useBookingListState();
    const { bookingId, bookingName } = listState;

    const bookingTabList = [
        { id: 'Overview', label: 'Overview' },
        { id: 'Applicants', label: 'Applicants' },
        { id: 'Charges', label: 'Other Charges' },
        { id: 'Payment', label: 'Payment Schedule' },
    ];

    const [activeTab, setActiveTab] = useState<string>(bookingTabList[0].id);
    
    useEffect(() => {
        if (!projectId || !bookingId) return;

        loadBookingFromServer();

    }, [projectId, bookingId]);

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
                    IsCheckPermission: sourcePage === 'inventory' ? false : true
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
                    IsCheckPermission: sourcePage === 'inventory' ? false : true
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

    const handleExportBookings = async (exportType: 'Excel' | 'PDF' | 'BOOKING FORM PDF' | 'BOOKING FORM PDF ON MAIL') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationBookingRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    BookingId: bookingId,
                    ProjectId: Number(projectId),
                    ExportType: exportType
                };

                const response = await bookingService.apiCallPullBooking(params);

                if (exportType === "BOOKING FORM PDF ON MAIL") {
                    addToast({ type: 'success', title: "E-Mail sent successfully" })
                }
                else {

                    const pdfName = `Booking Form - ${bookingData?.ProjectName ?? ''} - ${bookingData?.ApplicantName ?? ''} - ${bookingData?.Flat ?? ''}`;
                    handleExportFile(response, 'PDF', pdfName, addToast);
                }


                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message || 'Export failed' });
            },
            undefined,
            'Preparing Export PDF'
        );
    };


    //#endregion

    //#endregion

    const paymentScheduleColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: "Type",
                label: "Type",
                sortable: false,
                width: "20",
                align: "left",
                render: (value) => value || "-",
            },
            {
                key: "Date",
                label: "Date / Stage",
                sortable: false,

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
                label: "Amount (₹)",
                sortable: false,

                width: "20",
                align: "right",
                render: (value) => formatCurrency(value) || "0",
            },
            {
                key: "PaymentScheduleGSTAmount",
                label: "GST Amount (₹)",

                width: "20",
                sortable: false,
                align: "right",
                render: (value) => formatCurrency(value) || "0",
            },
            {
                key: "PaymentScheduleTDSAmount",
                label: "TDS Amount (₹)",

                width: "20",
                sortable: false,
                align: "right",
                render: (value) => formatCurrency(value) || "0",
            },

        ],
        [],
    );

    const otherChargesColumns = useMemo<TableColumn[]>(
        () => [
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
                render: (value) => formatCurrency(value) || "0",
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
                render: (value) => formatCurrency(value) || "0",
            },
        ],
        [],
    );

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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <HeaderActionBar
                titleText={`Booking Details : ${bookingData.ApplicantName ?? bookingName}`}
                subTitleText={bookingData.BookingType ?? ""}
                subSubTitleText={bookingData.Flat ?? ""}
                cancelText="Back"
                EditText="Edit"
                onCancel={() => {

                    if (sourcePage === 'inventory') {
                        navigate('/inventory');
                    } else if (sourcePage === 'parking') {
                        navigate('/parking');
                    } else {
                        navigate('/booking');
                    }
                }}
                canAction={canAction && !bookingData.ApprovalStatus?.toUpperCase().includes("APPROVED") && sourcePage === 'booking' ? true : false}
                onEdit={() => navigate('/booking/add')}

                ExtraButtontitleText="PDF"
                ExtraButtontitleTextIcon={FileText}
                ExtraButtonText="Generate"
                onExtraButton={() => handleExportBookings("BOOKING FORM PDF")}
                canActionExtraButtonText={bookingData.ApprovalStatus?.toUpperCase().includes("APPROVED") ? true : false}

                ExtraExtraButtonText="Send E-Mail"
                onExtraExtraButton={() => handleExportBookings("BOOKING FORM PDF ON MAIL")}
                canActionExtraExtraButton={bookingData.ApprovalStatus?.toUpperCase().includes("APPROVED") ? true : false}
                isLoading={isLoading}
            />

            <div className='pt-5'>
                <Tabs
                    tabs={bookingTabList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => {
                        setActiveTab(t.id);
                    }}
                />
            </div>

            <div className="pt-5">
                {activeTab === 'Overview' && (
                    <>
                        {/* ===================== ENQUIRY DETAILS ===================== */}
                        {editEnquiryData && (

                            <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                    Enquiry Details
                                </h4>
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-3">

                                        <FieldItem label="Unique Code:" value={editEnquiryData?.SystemGeneratedCode || '-'} />

                                        <FieldItem label="Name" value={editEnquiryData?.Name || '-'} />

                                        <FieldItem label="E-Mail ID" value={editEnquiryData?.EmailId || '-'} />

                                        <FieldItem label="Mobile No:" value={getSafeString(editEnquiryData?.MobileNumber) ? `${editEnquiryData?.MobileNumberCountryCode || "+91"} ${editEnquiryData?.MobileNumber}` : '-'} />

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
                                {editEnquiryData?.Source === 'Direct Walking' && editEnquiryData?.SubSource === 'Reference' && (
                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 pt-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">

                                            <FieldItem label="Referral Unit Owner" value={editEnquiryData?.ReferralUnitOwnerName || '-'} />
                                            <FieldItem label="Referral Project" value={editEnquiryData?.ReferralProjectName || '-'} />
                                            <FieldItem label="Referral Unit No" value={editEnquiryData?.ReferralUnitNumber || '-'} />

                                        </div>
                                    </div>
                                )}

                                {/* ===================== DIRECT WALKING → LOYALTY ===================== */}
                                {editEnquiryData?.Source === 'Direct Walking' && editEnquiryData?.SubSource === 'Loyalty' && (
                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 pt-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">

                                            <FieldItem label="Existing Project" value={editEnquiryData?.LoyaltyExistingProjectName || '-'} />
                                            <FieldItem label="Existing Unit No" value={editEnquiryData?.LoyaltyExistingUnitNumber || '-'} />
                                            <FieldItem label="Existing Unit Owner" value={editEnquiryData?.LoyaltyExistingUnitOwnerName || '-'} />

                                        </div>
                                    </div>
                                )}

                                {/* ===================== DIRECT WALKING → EMPLOYEE REFERENCE ===================== */}
                                {editEnquiryData?.Source === 'Direct Walking' && editEnquiryData?.SubSource === 'Employee Reference' && (
                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 pt-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">

                                            <FieldItem label="Employee Name" value={editEnquiryData?.EmployeeReferenceName || '-'} />
                                            <FieldItem label="Employee Mobile" value={editEnquiryData?.EmployeeReferenceMobileNumber ? `+91 ${editEnquiryData?.EmployeeReferenceMobileNumber}` : '-'} />

                                        </div>
                                    </div>
                                )}

                                {/* ===================== CHANNEL PARTNER DETAILS ===================== */}
                                {editEnquiryData?.Source?.toUpperCase() === 'CHANNEL PARTNER' && (
                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg shadow-sm border border-blue-200 pt-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">

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

                            </section>
                        )}

                        {/* Applicant Details */}
                        <div className="pt-5">
                            <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                    Applicant Details
                                </h4>
                                <div className="space-y-5">
                                    {bookingData.BookingApplicantData && bookingData.BookingApplicantData.length > 0 ? (
                                        bookingData.BookingApplicantData.map((applicant, i) => (
                                            <div key={applicant.BookingApplicantId ?? i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                                    <FieldItem label="Cancelled Cheque" value="" urls={applicant?.CancelledChequeURL} isIcon />
                                                    <FieldItem label="POA (if NRI Execution)" value="" urls={applicant?.POAURL} isIcon />
                                                    <FieldItem label="Income Docs (Form 16 / ITR)" value="" urls={applicant?.IncomeForm16ITRURL} isIcon />
                                                    <FieldItem label="NRE / NRO Bank Details" value="" urls={applicant?.NreNroBankDetailsURL} isIcon />
                                                    <FieldItem label="Nominee Form" value="" urls={applicant?.NomineeFormURL} isIcon />
                                                    <FieldItem label="Statement of Source of Funds" value="" urls={applicant?.StatementOfSourceOfFundsURL} isIcon />
                                                    <FieldItem label="Payment Proof" value="" urls={applicant?.PaymentProofURL} isIcon />

                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-6 text-center text-gray-500 text-sm">
                                            <NoDataView message="No Applicant Data Found" />
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Project Details */}
                                <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Project Details
                                    </h4>
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
                                </section>

                                {/* Parking Details */}
                                {bookingData.ParkingData && bookingData.ParkingData.length > 0 && (
                                    <section className="bg-white rounded-xl shadow-sm  p-6 border-[0.1px] border-[#3333334f]">
                                        <h4 className="text-lg font-semibold text-gray-900">
                                            Parking Details
                                        </h4>

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
                                    </section>
                                )}

                                <section className="bg-white rounded-xl shadow-sm  p-6 border-[0.1px] border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Booking Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4">
                                        <FieldItem label="Expected Registration Date" value={bookingData.RegistrationDate ? formatDate_dd_MonthName_yy(bookingData.RegistrationDate) : '-'} />
                                        <FieldItem label="Final Registration Date" value={bookingData.FinalRegistrationDate ? formatDate_dd_MonthName_yy(bookingData.FinalRegistrationDate) : '-'} />
                                        <FieldItem label="Handover Type" value={getSafeString(bookingData.HandoverType)} />

                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
                                        <FieldItem label="Source Of Funding" value={getSafeString(bookingData.SourceOfFunding)} />
                                        <FieldItem label="Number Of Parking" value={getSafeString(bookingData.NumberOfParking)} />
                                    </div>
                                </section>

                                <section className="bg-white rounded-xl shadow-sm  p-6 border-[0.1px] border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Payment Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                        <FieldItem label="Cheque / RTGS No." value={getSafeString(bookingData.ChequeRTGSNumber)} />
                                        <FieldItem label="Cheque / RTGS Date" value={bookingData.ChequeRTGSDate ? formatDate_dd_MonthName_yy(bookingData.ChequeRTGSDate) : '-'} />
                                        <FieldItem label="Bank Name" value={getSafeString(bookingData.BankName)} />
                                    </div>
                                </section>


                            </div>

                            <div className="lg:col-span-1 space-y-6">
                                <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Booking Summary
                                    </h4>

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

                                        {editEnquiryData?.Source === 'Direct Walking' && editEnquiryData?.SubSource === 'Reference' && (
                                            <>
                                                <div className="py-4">
                                                    <FieldItem label="Referral (%)" value={getSafeString(bookingData.ReferralAmount)} isRow />
                                                </div>
                                                <div className="py-4">
                                                    <FieldItem label="Referral Amount (₹)" value={formatCurrency(bookingData.ReferralAmount)} isRow />
                                                </div>
                                            </>
                                        )}

                                        {editEnquiryData?.Source === 'Direct Walking' && editEnquiryData?.SubSource === 'Loyalty' && (
                                            <>
                                                <div className="py-4">
                                                    <FieldItem label="Loyalty (%)" value={getSafeString(bookingData.LoyaltyPercentage)} isRow />
                                                </div>
                                                <div className="py-4">
                                                    <FieldItem label="Loyalty Amount (₹)" value={formatCurrency(bookingData.LoyaltyAmount)} isRow />
                                                </div>
                                            </>
                                        )}

                                        {editEnquiryData?.Source === 'Direct Walking' && editEnquiryData?.SubSource === 'Employee Reference' && (
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
                                </section>

                            </div>

                        </div>

                        <section className="bg-white rounded-xl pt-5">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Other Charges
                            </h4>
                            <DataTable
                                data={bookingData?.BookingOtherChargesData || []}
                                columns={otherChargesColumns}
                                emptyMessage="No Other Charges Found"
                                fixedHeight={false}
                                recordsPerPage={20}
                                className="min-w-full" />

                        </section>

                        <section className="bg-white rounded-xl pt-5">

                            <h4 className="text-lg font-semibold text-gray-900  mb-4">
                                Payment Schedule{" "}
                                <span className="text-sm font-normal text-gray-500">
                                    ({getSafeString(bookingData.PaymentScheduleScheme)})
                                </span>
                            </h4>

                            <DataTable
                                data={bookingData.BookingPaymentScheduleData || []}
                                columns={paymentScheduleColumns}
                                emptyMessage="No Payment Schedule Found"
                                fixedHeight={false}
                                recordsPerPage={20}
                                className="min-w-full" />


                        </section>

                        {bookingData.FlatAlterationRemark && (
                            <section className="bg-white rounded-xl shadow-sm  p-6 border-[0.1px] border-[#3333334f] mt-5">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                    Flat Alteration Remarks
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <FieldItem label="Remarks" value={getSafeString(bookingData.FlatAlterationRemark)} />
                                </div>
                            </section>
                        )}


                        {bookingData.PaymentRemark && (
                            <section className="bg-white rounded-xl shadow-sm  p-6 border-[0.1px] border-[#3333334f] mt-5">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                    Payment Remarks
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <FieldItem label="Remarks" value={getSafeString(bookingData.PaymentRemark)} />
                                </div>
                            </section>
                        )}


                        {bookingData.OtherRemark && (
                            <section className="bg-white rounded-xl shadow-sm  p-6 border-[0.1px] border-[#3333334f] mt-5">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                    Other Remarks
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <FieldItem label="Remarks" value={getSafeString(bookingData.OtherRemark)} />
                                </div>
                            </section>
                        )}


                        {bookingData.TermsAndConditionsDescription && (
                            <section className="rounded-xl pt-5">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                    Terms & Conditions
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <RichTextEditor value={bookingData.TermsAndConditionsDescription ?? ""} onChange={() => { }} readOnly={true} />

                                </div>
                            </section>
                        )}

                        <div className='pt-5'>
                            <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                    Action Details
                                </h4>

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
                            </section>
                        </div>

                    </>
                )
                }

                {
                    activeTab === 'Applicants' && (
                        <div>
                            <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                    Applicant Details
                                </h4>
                                <div className="space-y-5">
                                    {bookingData.BookingApplicantData && bookingData.BookingApplicantData.length > 0 ? (
                                        bookingData.BookingApplicantData.map((applicant, i) => (
                                            <div key={applicant.BookingApplicantId ?? i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                                    <FieldItem label="Cancelled Cheque" value="" urls={applicant?.CancelledChequeURL} isIcon />
                                                    <FieldItem label="POA (if NRI Execution)" value="" urls={applicant?.POAURL} isIcon />
                                                    <FieldItem label="Income Docs (Form 16 / ITR)" value="" urls={applicant?.IncomeForm16ITRURL} isIcon />
                                                    <FieldItem label="NRE / NRO Bank Details" value="" urls={applicant?.NreNroBankDetailsURL} isIcon />
                                                    <FieldItem label="Nominee Form" value="" urls={applicant?.NomineeFormURL} isIcon />
                                                    <FieldItem label="Statement of Source of Funds" value="" urls={applicant?.StatementOfSourceOfFundsURL} isIcon />
                                                    <FieldItem label="Payment Proof" value="" urls={applicant?.PaymentProofURL} isIcon />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-6 text-center text-gray-500 text-sm">
                                            <NoDataView message="No Applicant Data Found" />
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    )
                }

                {
                    activeTab === 'Charges' && (
                        <div className="space-y-4">
                            <DataTable
                                data={bookingData.BookingOtherChargesData || []}
                                columns={otherChargesColumns}
                                emptyMessage="No Other Charges Found"
                                fixedHeight={false}
                                recordsPerPage={20}
                                className="min-w-full" />
                        </div>
                    )
                }

                {
                    activeTab === 'Payment' && (
                        <div className="space-y-4">
                            <DataTable
                                data={bookingData.BookingPaymentScheduleData || []}
                                columns={paymentScheduleColumns}
                                emptyMessage="No Payment Schedule Found"
                                fixedHeight={false}
                                recordsPerPage={20}
                                className="min-w-full" />

                        </div>
                    )
                }


            </div >
        </div >
    );
    //#endregion
};

export default ViewBooking;




