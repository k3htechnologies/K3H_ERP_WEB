import { runApiWithLoader } from "@/core/utils";
import React, { useEffect, useState } from "react";
import { bookingService } from '@/features/booking/services/BookingService';
import { useToast } from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import * as E from 'fp-ts/Either';
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { useNavigate, useParams } from 'react-router-dom';
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import type { EnquiryData, FilterWithPaginationEnquiryRequest } from '@/features/enquiry/models/EnquiryModel';
import { EnquiryService } from '@/features/enquiry/services/EnquiryServices';
import type { BookingData, FilterWithPaginationBookingRequest } from '@/features/booking/models/BookingModel';
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import RichTextEditor from "@/ui/components/forms/RichTextEditor";


export const BookingFrom: React.FC = () => {

    //#region STATE MANAGEMENT
    const [payTrackBookingData, setPayTrackBookingData] = useState<BookingData | null>(null);
    const [enquiryData, setEnquiryData] = useState<EnquiryData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { projectId } = useProject();

    const { BookingId } = useParams<{ BookingId?: string }>();
    const bookingId = BookingId ? Number(BookingId) : 0;

    //#region HELPER FUNCTIONS
    const safe = (value: any): string => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'number') return value.toString();
        return String(value).trim() || '-';
    };

    const formatCurrency = (value: number | null | undefined): string => {
        if (value === null || value === undefined) return '-';
        return `₹${Number(value).toLocaleString('en-IN')}`;
    };
    //#endregion

    //#region INIT
    useEffect(() => {
        if (!projectId || !bookingId) return;

        loadPayTrackBookingDetailsFromServer();

    }, [projectId, bookingId]);
    //#endregion

    //#region DATA LOADING |  LOAD | SEARCH 

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
                };

                const response = await EnquiryService.apiCallPullEnquiry(params);

                if (E.isRight(response)) {

                    const enquiryList = response.right.Data?.[0] ?? null;;

                    setEnquiryData(enquiryList);

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

    const loadPayTrackBookingDetailsFromServer = async () => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationBookingRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    BookingId: bookingId,
                    ProjectId: Number(projectId),
                };

                const response = await bookingService.apiCallPullBooking(params);

                if (E.isRight(response)) {
                    const booking = response.right.Data?.[0] ?? null;

                    setPayTrackBookingData(booking);

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

    return (
        <div className=""
        >
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <HeaderActionBar
                titleText={'Booking Details : '}
                onCancel={() => {
                    navigate('/paytrack')
                }}
            />

            <div className="mt-3">
                {/* ===================== ENQUIRY DETAILS ===================== */}
                {enquiryData && (
                    <div className="space-y-4 pt-3 pb-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                            Enquiry Details
                        </h3>
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-3">
                                <FieldItem label="Unique Code:" value={enquiryData?.SystemGeneratedCode || '-'} />
                                <FieldItem label="Name" value={enquiryData?.Name || '-'} />

                                <FieldItem label="Mobile No:" value={safe(enquiryData?.MobileNumber) ? `+91 ${enquiryData?.MobileNumber}` : '-'} />
                                <FieldItem label="Source" value={enquiryData?.Source || '-'} />
                                <FieldItem label="Sub Source" value={enquiryData?.SubSource || '-'} />
                                {enquiryData?.Source?.toUpperCase() !== 'CHANNEL PARTNER' && !!enquiryData?.SubSubSource?.trim() && (
                                    <FieldItem label="Sub Sub Source" value={enquiryData?.SubSubSource || '-'} />
                                )}

                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-3 pt-3">
                                <FieldItem label="Sales Advisor" value={enquiryData?.SalesAdvisor ?? '-'} />
                                <FieldItem label="Sourcing Manager" value={enquiryData?.SourcingManager ?? '-'} />

                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-1 gap-3 pt-3">
                                <FieldItem label="Current Location" value={enquiryData?.CurrentLocation || '-'} />
                            </div>
                        </div>
                    </div>
                )}

                {/* ===================== DIRECT WALKING → REFERENCE ===================== */}
                {enquiryData?.Source === 'Direct Walking' && enquiryData?.SubSource === 'Reference' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">

                            <FieldItem label="Referral Unit Owner" value={enquiryData?.ReferelUnitOwnerName || '-'} />
                            <FieldItem label="Referral Project" value={enquiryData?.ReferelProjectName || '-'} />
                            <FieldItem label="Referral Unit No" value={enquiryData?.ReferelUnitNumber || '-'} />

                        </div>
                    </div>
                )}

                {/* ===================== DIRECT WALKING → LOYALTY ===================== */}
                {enquiryData?.Source === 'Direct Walking' && enquiryData?.SubSource === 'Loyalty' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">

                            <FieldItem label="Existing Project" value={enquiryData?.LoyaltyExistingProjectName || '-'} />
                            <FieldItem label="Existing Unit No" value={enquiryData?.LoyaltyExistingUnitNumber || '-'} />
                            <FieldItem label="Existing Unit Owner" value={enquiryData?.LoyaltyExistingUnitOwnerName || '-'} />

                        </div>
                    </div>
                )}

                {/* ===================== DIRECT WALKING → EMPLOYEE REFERENCE ===================== */}
                {enquiryData?.Source === 'Direct Walking' && enquiryData?.SubSource === 'Employee Reference' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">

                            <FieldItem label="Employee Name" value={enquiryData?.EmployeeReferenceName || '-'} />
                            <FieldItem label="Employee Mobile" value={enquiryData?.EmployeeReferenceMobileNumber ? `+91 ${enquiryData?.EmployeeReferenceMobileNumber}` : '-'} />

                        </div>
                    </div>
                )}

                {/* ===================== CHANNEL PARTNER DETAILS ===================== */}
                {enquiryData?.Source?.toUpperCase() === 'CHANNEL PARTNER' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">

                            <FieldItem label="Channel Partner" value={enquiryData?.ChannelPartnerName || '-'} />
                            <FieldItem label="CP Mobile" value={enquiryData?.ChannelPartnerMobileNumber ? `+91 ${enquiryData?.ChannelPartnerMobileNumber}` : '-'} />
                            <FieldItem label="CP Team Member" value={enquiryData?.ChannelPartnerTeamMemberName || '-'} />
                            <FieldItem label="CP Team Mobile" value={enquiryData?.ChannelPartnerTeamMemberMobileNumber || '-'} />

                        </div>
                    </div>
                )}

                {/* Applicant Details */}
                <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f] mt-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Applicant Details
                    </h4>

                    <div className="space-y-10">
                        {payTrackBookingData?.BookingApplicantData && payTrackBookingData?.BookingApplicantData.length > 0 ? (
                            payTrackBookingData?.BookingApplicantData.map((applicant, i) => (
                                <div key={applicant.BookingApplicantId ?? i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <FieldItem label="Type" value={safe(applicant.ApplicantType)} className='text-blue-900 bold' />
                                        <FieldItem label="Applicant Name" value={safe(applicant.ApplicantName)} urls={applicant?.PhotoURL} isIcon />
                                        <FieldItem label="Contact Number" value={safe(applicant?.ApplicantMobileNumber)} />
                                        <FieldItem label="E-Mail ID" value={safe(applicant?.ApplicantEmailId)} />
                                        <FieldItem label="Aadhaar Card No." value={safe(applicant?.AadharCardNumber)} urls={applicant?.AadharCardURL} isIcon />
                                        <FieldItem label="PAN No." value={safe(applicant?.PanNumber)} urls={applicant?.PanCardURL} isIcon />
                                        <FieldItem label="Driving License" value={safe(applicant?.DrivingLicenseNumber)} urls={applicant?.DrivingLicenseURL} isIcon />
                                        <FieldItem label="Voting ID No." value={safe(applicant?.VotingIdNumber)} urls={applicant?.VotingIdURL} isIcon />
                                        <FieldItem label="Passport No." value={safe(applicant?.PassportNumber)} urls={applicant?.PassportURL} isIcon />
                                        <FieldItem label="GST No." value={safe(applicant?.GSTNumber)} urls={applicant?.GSTNumberURL} isIcon />
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Project Details */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Project Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FieldItem label="Project Name" value={safe(payTrackBookingData?.ProjectName)} />
                                <FieldItem label="Booking Type" value={safe(payTrackBookingData?.BookingType)} />

                                {payTrackBookingData?.BookingType?.toUpperCase() === "FLAT" && (
                                    <>
                                        <FieldItem label="Flat" value={safe(payTrackBookingData?.Flat)} />
                                        <FieldItem label="Wing" value={safe(payTrackBookingData?.Wing)} />
                                        <FieldItem label="Floor" value={safe(payTrackBookingData?.Floor)} />
                                        <FieldItem label="Building Number" value={safe(payTrackBookingData?.BuildingNumber)} />
                                        <FieldItem label="Flat Type" value={safe(payTrackBookingData?.FlatType)} />
                                        <FieldItem label="Flat Configuration" value={safe(payTrackBookingData?.FlatConfiguration)} />
                                        <FieldItem label="RERA Carpet Area (SqFt)" value={safe(payTrackBookingData?.RERACarpetAreaSqFt)} />
                                    </>
                                )}

                                {payTrackBookingData?.BookingType?.toUpperCase() === "PARKING" && (
                                    <FieldItem label="Parking Number" value={safe(payTrackBookingData?.ParkingNumber)} />
                                )}
                            </div>
                        </section>

                        {/* Parking Details */}
                        {payTrackBookingData?.ParkingData && payTrackBookingData?.ParkingData.length > 0 && (
                            <section className="bg-white rounded-xl p-6 border-[0.1px] border-[#3333334f]">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                    Parking Details
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {payTrackBookingData?.ParkingData.map((parking, index) => (
                                        <React.Fragment key={parking.ParkingId || index}>
                                            <FieldItem label="Parking Number" value={safe(parking.ParkingNumber)} />
                                            <FieldItem label="Building" value={safe(parking.BuildingNumber)} />
                                            <FieldItem label="Wing" value={safe(parking.Wing)} />
                                            <FieldItem label="Floor" value={safe(parking.Floor)} />
                                            <FieldItem label="Category" value={safe(parking.ParkingCategory)} />
                                            <FieldItem label="Type" value={safe(parking.ParkingType)} />
                                            <FieldItem label="Size" value={safe(parking.ParkingSubType)} />
                                            <FieldItem label="Dimensions" value={safe(parking.ParkingDimensions)} />
                                            <FieldItem label="EV Charging" value={parking.IsEVChargingAvailable ? 'Yes' : 'No'} />
                                        </React.Fragment>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className="bg-white rounded-xl  p-6 border-[0.1px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Booking Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FieldItem label="Expected Registration Date" value={payTrackBookingData?.RegistrationDate ? formatDate_dd_MonthName_yy(payTrackBookingData?.RegistrationDate) : '-'} />
                                <FieldItem label="Handover Type" value={safe(payTrackBookingData?.HandoverType)} />
                                <FieldItem label="Source Of Funding" value={safe(payTrackBookingData?.SourceOfFunding)} />
                                <FieldItem label="Number Of Parking" value={safe(payTrackBookingData?.NumberOfParking)} />
                            </div>
                        </section>

                        {/* Flat Alteration Remarks */}

                        {payTrackBookingData?.FlatAlterationRemark && (
                            <section className="bg-white rounded-xl p-6 border-[0.1px] border-[#3333334f]">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                    Flat Alteration Remarks
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <FieldItem label="Remarks" value={safe(payTrackBookingData?.FlatAlterationRemark)} />
                                </div>
                            </section>
                        )}
                        {payTrackBookingData?.PaymentRemark && (
                            <section className="bg-white rounded-xl p-6 border-[0.1px] border-[#3333334f]">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                    Payment Remarks
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <FieldItem label="Remarks" value={safe(payTrackBookingData?.PaymentRemark)} />
                                </div>
                            </section>
                        )}

                        {payTrackBookingData?.OtherRemark && (
                            <section className="bg-white rounded-xl p-6 border-[0.1px] border-[#3333334f]">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                    Other Remarks
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <FieldItem label="Remarks" value={safe(payTrackBookingData?.OtherRemark)} />
                                </div>
                            </section>
                        )}

                        {/* Terms & Conditions */}
                        {payTrackBookingData?.TermsAndConditionsDescription && (
                            <section className="bg-white rounded-xl p-6 border-[0.1px] border-[#3333334f]">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                    Terms & Conditions
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <RichTextEditor value={payTrackBookingData?.TermsAndConditionsDescription ?? ""} onChange={() => { }} readOnly={true} />

                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right side summary card */}
                    <div className="lg:col-span-1 space-y-6">
                        <section className="bg-white rounded-xl  p-6 border-[0.1px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Booking Summary
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                                <FieldItem label="Agreement Value (₹)" value={formatCurrency(payTrackBookingData?.AgreementValue)} isRow />
                                <FieldItem label="TDS (₹)" value={formatCurrency(payTrackBookingData?.AgreementValueTDS)} isRow />
                                <FieldItem label="GST (%)" value={safe(payTrackBookingData?.AgreementValueGSTPercentage)} isRow />
                                <FieldItem label="GST (₹)" value={formatCurrency(payTrackBookingData?.AgreementValueGSTAmount)} isRow />
                                <FieldItem label="Stamp Duty (%)" value={safe(payTrackBookingData?.StampDutyPercentage)} isRow />
                                <FieldItem label="Stamp Duty (₹)" value={formatCurrency(payTrackBookingData?.StampDutyAmount)} isRow />
                                <FieldItem label="Registration Fees (₹)" value={formatCurrency(payTrackBookingData?.RegistrationFees)} isRow />
                                <FieldItem label="Booking Amount (₹)" value={formatCurrency(payTrackBookingData?.BookingAmount)} isRow />
                                {enquiryData?.Source?.toUpperCase() === 'CHANNEL PARTNER' && (
                                    <>
                                        <FieldItem label="Brokerage (%)" value={safe(payTrackBookingData?.BrokeragePercentage)} isRow />
                                        <FieldItem label="Brokerage Amount (₹)" value={formatCurrency(payTrackBookingData?.BrokerageAmount)} isRow />
                                    </>
                                )}
                                {enquiryData?.Source === 'Direct Walking' && enquiryData?.SubSource === 'Reference' && (
                                    <>
                                        <FieldItem label="Referel (%)" value={safe(payTrackBookingData?.ReferelAmount)} isRow />
                                        <FieldItem label="Referel Amount (₹)" value={formatCurrency(payTrackBookingData?.ReferelAmount)} isRow />
                                    </>
                                )}
                                {enquiryData?.Source === 'Direct Walking' && enquiryData?.SubSource === 'Loyalty' && (
                                    <>
                                        <FieldItem label="Loyalty (%)" value={safe(payTrackBookingData?.LoyaltyPercentage)} isRow />
                                        <FieldItem label="Loyalty Amount (₹)" value={formatCurrency(payTrackBookingData?.LoyaltyAmount)} isRow />
                                    </>
                                )}
                                {enquiryData?.Source === 'Direct Walking' && enquiryData?.SubSource === 'Employee Reference' && (
                                    <>
                                        <FieldItem label="Employee Reference (%)" value={safe(payTrackBookingData?.EmployeeReferencePercentage)} isRow />
                                        <FieldItem label="Employee Reference Amount (₹)" value={formatCurrency(payTrackBookingData?.EmployeeReferenceAmount)} isRow />
                                    </>
                                )}
                            </div>
                        </section>

                        {/* Action / User Details card */}

                        <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Action Details
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 border-b border-[#135bec2e] pb-4">
                                <FieldItem label="Created By" value={safe(payTrackBookingData?.CreatedBy)} />
                                <FieldItem
                                    label="Created Date"
                                    value={
                                        payTrackBookingData?.CreatedDate
                                            ? formatDate_dd_MonthName_yy_hh_mm(payTrackBookingData?.CreatedDate)
                                            : '-'
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pt-4">
                                <FieldItem label="Modified By" value={safe(payTrackBookingData?.ModifiedBy)} />
                                <FieldItem
                                    label="Modified Date"
                                    value={
                                        payTrackBookingData?.ModifiedDate
                                            ? formatDate_dd_MonthName_yy_hh_mm(payTrackBookingData?.ModifiedDate)
                                            : '-'
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 pt-4">
                                <FieldItem label="Approval Status" value={safe(payTrackBookingData?.ApprovalStatus)} />
                            </div>
                        </section>

                    </div>
                </div>

                <div className="mt-4">
                    {/* Other Charges Summary */}
                    {payTrackBookingData?.BookingOtherChargesData && payTrackBookingData?.BookingOtherChargesData.length > 0 && (
                        <section className="bg-white rounded-xl p-6 border-[0.1px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Other Charges
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charge Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calculated On</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value (₹)</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">GST (%)</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">GST Value (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {payTrackBookingData?.BookingOtherChargesData.map((charge, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safe(charge.ChargeName)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safe(charge.CalculatedOn)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(charge.Value)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{safe(charge.GSTPercentage)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(charge.GSTValue)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}
                </div>

                <div className='pt-3'>
                    {/* Payment Schedule Summary */}
                    {payTrackBookingData?.BookingPaymentScheduleData && payTrackBookingData?.BookingPaymentScheduleData.length > 0 && (
                        <section className="bg-white rounded-xl p-6 border-[0.1px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Payment Schedule
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage (%)</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (₹)</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">GST (₹)</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">TDS (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {payTrackBookingData?.BookingPaymentScheduleData.map((schedule, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safe(schedule.Type)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safe(schedule.Name)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                                    {schedule.Date ? formatDate_dd_MonthName_yy(schedule.Date) : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{safe(schedule.PaymentSchedulePercentage)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(schedule.PaymentScheduleAmount)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(schedule.PaymentScheduleGSTAmount)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(schedule.PaymentScheduleTDSAmount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}
                </div>


            </div>
        </div>
    )

}

export default BookingFrom
