import React, { useEffect, useState } from 'react';
import { Loader } from '@/core/utils/loader';
import type { BookingData, FilterWithPaginationBookingRequest } from '../models/BookingModel';
import { useNavigate } from 'react-router-dom';
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
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm, formatDate_MonthName_yy } from '@/core/utils/dateFormat';
import NoDataView from '@/ui/components/NoDataView/NoDataView';

export const ViewBooking: React.FC = () => {

    //#region STATE MANAGEMENT
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { canAction } = useMenuPermissions();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { projectId } = useProject();

    //#region BOOKING LIST STATE CONTEXT
    const { listState } = useBookingListState();
    const { bookingId, bookingName } = listState;
    //#endregion
    //#endregion

    //#region TAB ACTIVITY
    const bookingTabList = [
        { id: 'Overview', label: 'Overview' },
        { id: 'Applicants', label: 'Applicants' },
        { id: 'Charges', label: 'Other Charges' },
        { id: 'Payment', label: 'Payment Schedule' },
    ];

    const [activeTab, setActiveTab] = useState<string>(bookingTabList[0].id);
    //#endregion

    //#region INIT
    useEffect(() => {
        if (!projectId || !bookingId) return;

        loadBookingFromServer();

    }, [projectId, bookingId]);
    //#endregion

    //#region DATA LOAD OVERVIEW
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
                    ProjectId: Number(projectId)
                };

                const response = await bookingService.apiCallPullBooking(params);

                if (E.isRight(response)) {

                    setBookingData(response.right.Data?.[0] ?? null);

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

    //#endregion

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

    //#region RENDER
    if (!bookingData) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <Loader loading={isLoading} title={loadingMessage}>
                    <div>No booking data found</div>
                </Loader>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <HeaderActionBar
                titleText={'Booking Details : '}
                subTitleText={bookingData.ApplicantName ?? bookingName}
                cancelText="Back"
                EditText="Edit"
                onCancel={() => navigate('/booking')}
                canAction={canAction}
                onEdit={() => navigate(`/booking/edit`)}
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

            <div className="mt-3">
                {activeTab === 'Overview' && (
                    <>
                        {/* Applicant Details */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Applicant Details
                            </h4>
                            <div className="space-y-5">
                                {bookingData.BookingApplicantData && bookingData.BookingApplicantData.length > 0 ? (
                                    bookingData.BookingApplicantData.map((applicant, i) => (
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

                        {/* Project & Source Details + Booking Summary */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Project Details */}
                                <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Project Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Project Name" value={safe(bookingData.ProjectName)} />
                                        <FieldItem label="Booking Type" value={safe(bookingData.BookingType)} />
                                        <FieldItem label="Flat" value={safe(bookingData.Flat)} />
                                        <FieldItem label="Wing" value={safe(bookingData.Wing)} />
                                        <FieldItem label="Floor" value={safe(bookingData.Floor)} />
                                        <FieldItem label="Building Number" value={safe(bookingData.BuildingNumber)} />
                                        <FieldItem label="Flat Type" value={safe(bookingData.FlatType)} />
                                        <FieldItem label="Flat Configuration" value={safe(bookingData.FlatConfiguration)} />
                                        <FieldItem label="RERA Carpet Area (SqFt)" value={safe(bookingData.RERACarpetAreaSqFt)} />
                                        <FieldItem label="Parking Number" value={safe(bookingData.ParkingNumber)} />
                                    </div>
                                </section>

                                {/* Source Details */}
                                <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Source Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Brokerage (%)" value={safe(bookingData.BrokeragePercentage)} />
                                        <FieldItem label="Brokerage Amount (₹)" value={formatCurrency(bookingData.BrokerageAmount)} />
                                    </div>
                                </section>
                            </div>

                            {/* Right side summary card */}
                            <div className="lg:col-span-1 space-y-6">
                                <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Booking Summary
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        <FieldItem label="Agreement Value (₹)" value={formatCurrency(bookingData.AgreementValue)} isRow />
                                        <FieldItem label="TDS (₹)" value={formatCurrency(bookingData.AgreementValueTDS)} isRow />
                                        <FieldItem label="GST (%)" value={safe(bookingData.AgreementValueGSTPercentage)} isRow />
                                        <FieldItem label="GST (₹)" value={formatCurrency(bookingData.AgreementValueGSTAmount)} isRow />
                                        <FieldItem label="Stamp Duty (%)" value={safe(bookingData.StampDutyPercentage)} isRow />
                                        <FieldItem label="Stamp Duty (₹)" value={formatCurrency(bookingData.StampDutyAmount)} isRow />
                                        <FieldItem label="Registration Fees (₹)" value={formatCurrency(bookingData.RegistrationFees)} isRow />
                                        <FieldItem label="Booking Amount (₹)" value={formatCurrency(bookingData.BookingAmount)} isRow />
                                        <FieldItem label="Brokerage (%)" value={safe(bookingData.BrokeragePercentage)} isRow />
                                        <FieldItem label="Brokerage Amount (₹)" value={formatCurrency(bookingData.BrokerageAmount)} isRow />
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* Booking details, remarks, terms, action details */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Booking Details */}
                                <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Booking Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem
                                            label="Registration Date"
                                            value={
                                                bookingData.RegistrationDate
                                                    ? formatDate_dd_MonthName_yy_hh_mm(bookingData.RegistrationDate)
                                                    : '-'
                                            }
                                        />
                                        <FieldItem label="Handover Type" value={safe(bookingData.HandoverType)} />
                                        <FieldItem label="Mode Of Payment" value={safe(bookingData.ModeOfPayment)} />
                                    </div>
                                </section>

                                {/* Flat Alteration Remarks */}
                                {bookingData.FlatAlterationRemark && (
                                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                            Flat Alteration Remarks
                                        </h4>
                                        <div className="grid grid-cols-1 gap-4">
                                            <FieldItem label="Remarks" value={safe(bookingData.FlatAlterationRemark)} />
                                        </div>
                                    </section>
                                )}

                                {/* Terms & Conditions */}
                                {bookingData.TermsAndConditionsDescription && (
                                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                            Terms & Conditions
                                        </h4>
                                        <div className="grid grid-cols-1 gap-4">
                                            <FieldItem label="Description" value={safe(bookingData.TermsAndConditionsDescription)} />
                                        </div>
                                    </section>
                                )}

                                {/* Other Charges Summary */}
                                {bookingData.BookingOtherChargesData && bookingData.BookingOtherChargesData.length > 0 && (
                                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
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
                                                    {bookingData.BookingOtherChargesData.map((charge, index) => (
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

                                {/* Payment Schedule Summary */}
                                {bookingData.BookingPaymentScheduleData && bookingData.BookingPaymentScheduleData.length > 0 && (
                                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
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
                                                    {bookingData.BookingPaymentScheduleData.map((schedule, index) => (
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

                            {/* Action / User Details card */}
                            <div className="lg:col-span-1 space-y-6">
                                <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Action Details
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 border-b border-[#135bec2e] pb-4">
                                        <FieldItem label="Created By" value={safe(bookingData.CreatedBy)} />
                                        <FieldItem
                                            label="Created Date"
                                            value={
                                                bookingData.CreatedDate
                                                    ? formatDate_dd_MonthName_yy_hh_mm(bookingData.CreatedDate)
                                                    : '-'
                                            }
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pt-4">
                                        <FieldItem label="Modified By" value={safe(bookingData.ModifiedBy)} />
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
                                        <FieldItem label="Approval Status" value={safe(bookingData.ApprovalStatus)} />
                                    </div>
                                </section>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'Applicants' && (
                    <div className="mt-3">
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Applicant Details
                            </h4>
                            <div className="space-y-5">
                                {bookingData.BookingApplicantData && bookingData.BookingApplicantData.length > 0 ? (
                                    bookingData.BookingApplicantData.map((applicant, i) => (
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
                    </div>
                )}

                {activeTab === 'Charges' && bookingData.BookingOtherChargesData && bookingData.BookingOtherChargesData.length > 0 && (
                    <div className="space-y-4">
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
                                    {bookingData.BookingOtherChargesData.map((charge, index) => (
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
                    </div>
                )}

                {activeTab === 'Payment' && bookingData.BookingPaymentScheduleData && bookingData.BookingPaymentScheduleData.length > 0 && (
                    <div className="space-y-4">
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
                                    {bookingData.BookingPaymentScheduleData.map((schedule, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safe(schedule.Type)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safe(schedule.Name)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{schedule.Date ? formatDate_MonthName_yy(schedule.Date) : '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{safe(schedule.PaymentSchedulePercentage)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(schedule.PaymentScheduleAmount)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(schedule.PaymentScheduleGSTAmount)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(schedule.PaymentScheduleTDSAmount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
    //#endregion
};

export default ViewBooking;




