// import React, { useEffect, useState } from 'react';
// import { Loader } from '@/core/utils/loader';
// import type { BookingData, FilterWithPaginationBookingRequest } from '../models/BookingModel';
// import { useNavigate } from 'react-router-dom';
// import { FieldItem } from '@/ui/components/forms/FieldItem';
// import { runApiWithLoader } from '@/core/utils';
// import * as E from 'fp-ts/Either';
// import { useToast } from '@/core/hooks/useToast';
// import { bookingService } from '../services/BookingService';
// import { useProject } from '@/features/projectMaster/context/ProjectContext';
// import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
// import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
// import { useBookingListState } from '@/features/booking/context/BookingListStateContext';
// import Tabs from '@/ui/components/Tab/Tab';
// import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
// import Accordion from '@/ui/components/Card/Accordion';
// import MultiImageViewer from '@/ui/components/ImageViewer/ImageViewer';
// import { parseDocumentUrls } from '@/core/utils/documentUtils';

// export const ViewBooking: React.FC = () => {

//     //#region STATE MANAGEMENT
//     const [bookingData, setBookingData] = useState<BookingData | null>(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [loadingMessage, setLoadingMessage] = useState('');
//     const { canAction } = useMenuPermissions();
//     const { addToast } = useToast();
//     const navigate = useNavigate();
//     const { projectId } = useProject();
    
//     //#region BOOKING LIST STATE CONTEXT
//     const { listState } = useBookingListState();
//     const { bookingId, bookingName } = listState;
//     //#endregion
//     //#endregion

//     //#region TAB ACTIVITY
//     const bookingTabList = [
//         { id: 'Overview', label: 'Overview' },
//         { id: 'Applicants', label: 'Applicants' },
//         { id: 'Charges', label: 'Other Charges' },
//         { id: 'Payment', label: 'Payment Schedule' },
//     ];

//     const [activeTab, setActiveTab] = useState<string>(bookingTabList[0].id);
//     //#endregion

//     //#region INIT
//     useEffect(() => {
//         if (!projectId || !bookingId) return;
//         loadBookingFromServer();
//     }, [projectId, bookingId]);
//     //#endregion

//     //#region DATA LOAD OVERVIEW
//     const loadBookingFromServer = async () => {
//         if (!bookingId) return;
//         await runApiWithLoader(
//             setIsLoading,
//             setLoadingMessage,
//             async () => {

//                 const params: FilterWithPaginationBookingRequest = {
//                     PageNumber: 1,
//                     PageSize: 1,
//                     BookingId: bookingId,
//                     IsCheckPermission: false,
//                     ProjectId: Number(projectId)
//                 };

//                 const response = await bookingService.apiCallPullBooking(params);

//                 if (E.isRight(response)) {

//                     setBookingData(response.right.Data?.[0] ?? null);

//                 } else {
//                     addToast({ type: 'error', title: response.left.message });
//                 }

//                 return response;
//             },
//             undefined,
//             (error: any) => {
//                 addToast({ type: 'error', title: error.message });
//             },
//             undefined,
//             'Loading Booking Data'
//         );
//     };

//     //#endregion

//     //#region HELPER FUNCTIONS
//     const safe = (value: any): string => {
//         if (value === null || value === undefined) return '-';
//         if (typeof value === 'boolean') return value ? 'Yes' : 'No';
//         if (typeof value === 'number') return value.toString();
//         return String(value).trim() || '-';
//     };

//     const formatCurrency = (value: number | null | undefined): string => {
//         if (value === null || value === undefined) return '-';
//         return `₹${Number(value).toLocaleString('en-IN')}`;
//     };
//     //#endregion

//     //#region RENDER
//     if (!bookingData) {
//         return (
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//                 <Loader loading={isLoading} title={loadingMessage}>
//                     <div>No booking data found</div>
//                 </Loader>
//             </div>
//         );
//     }

//     return (
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <Loader loading={isLoading} title={loadingMessage}>
//                 <div></div>
//             </Loader>

//             <HeaderActionBar
//                 titleText={'Booking Details : '}
//                 subTitleText={bookingData.ApplicantName ?? bookingName}
//                 cancelText="Back"
//                 EditText="Edit"
//                 onCancel={() => navigate('/booking')}
//                 canAction={canAction}
//                 onEdit={() => navigate(`/booking/edit`)}
//                 isLoading={isLoading}
//             />

//             <Tabs
//                 tabs={bookingTabList}
//                 activeTab={activeTab}
//                 onTabChange={setActiveTab}
//             />

//             <div className="mt-6">
//                 {activeTab === 'Overview' && (
//                     <div className="space-y-6">
//                         {/* PROJECT DETAILS */}
//                         <section className="p-4">
//                             <h4 className="text-lg font-semibold text-gray-900 mb-4">
//                                 Project Details
//                             </h4>
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                                 <FieldItem label="Project Name" value={safe(bookingData.ProjectName)} />
//                                 <FieldItem label="Booking Type" value={safe(bookingData.BookingType)} />
//                                 <FieldItem label="Flat" value={safe(bookingData.Flat)} />
//                                 <FieldItem label="Wing" value={safe(bookingData.Wing)} />
//                                 <FieldItem label="Floor" value={safe(bookingData.Floor)} />
//                                 <FieldItem label="Building Number" value={safe(bookingData.BuildingNumber)} />
//                                 <FieldItem label="Flat Type" value={safe(bookingData.FlatType)} />
//                                 <FieldItem label="Flat Configuration" value={safe(bookingData.FlatConfiguration)} />
//                                 <FieldItem label="RERA Carpet Area (SqFt)" value={safe(bookingData.RERACarpetAreaSqFt)} />
//                             </div>
//                         </section>

//                         <hr className="border-t border-gray-200" />

//                         {/* APPLICANT DETAILS */}
//                         <section className="p-4">
//                             <h4 className="text-lg font-semibold text-gray-900 mb-4">
//                                 Applicant Details
//                             </h4>
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                                 <FieldItem label="Applicant Name" value={safe(bookingData.ApplicantName)} />
//                                 <FieldItem label="Permanent Address" value={safe(bookingData.PermanentAddress)} />
//                                 <FieldItem label="Communication Address" value={safe(bookingData.CommunicationAddress)} />
//                             </div>
//                         </section>

//                         <hr className="border-t border-gray-200" />

//                         {/* SOURCE DETAILS */}
//                         <section className="p-4">
//                             <h4 className="text-lg font-semibold text-gray-900 mb-4">
//                                 Source Details
//                             </h4>
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                                 <FieldItem label="Source" value={safe(bookingData.Source)} />
//                                 <FieldItem label="Sub Source" value={safe(bookingData.SubSource)} />
//                                 <FieldItem label="Channel Partner" value={safe(bookingData.ChannelPartnerName)} />
//                                 <FieldItem label="Channel Partner Company" value={safe(bookingData.ChannelPartnerCompany)} />
//                                 <FieldItem label="Channel Mobile Number" value={safe(bookingData.ChannelPartnerMobileNumber)} />
//                                 <FieldItem label="Brokerage (%)" value={safe(bookingData.BrokeragePercentage)} />
//                                 <FieldItem label="Brokerage Amount (₹)" value={formatCurrency(bookingData.BrokerageAmount)} />
//                             </div>
//                         </section>

//                         <hr className="border-t border-gray-200" />

//                         {/* BOOKING DETAILS */}
//                         <section className="p-4">
//                             <h4 className="text-lg font-semibold text-gray-900 mb-4">
//                                 Booking Details
//                             </h4>
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                                 <FieldItem label="Registration Date" value={bookingData.RegistrationDate ? formatDate_dd_MonthName_yy_hh_mm(bookingData.RegistrationDate) : '-'} />
//                                 <FieldItem label="Agreement Value (₹)" value={formatCurrency(bookingData.AgreementValue)} />
//                                 <FieldItem label="TDS (₹)" value={formatCurrency(bookingData.AgreementValueTDS)} />
//                                 <FieldItem label="GST (%)" value={safe(bookingData.AgreementValueGSTPercentage)} />
//                                 <FieldItem label="GST (₹)" value={formatCurrency(bookingData.AgreementValueGSTAmount)} />
//                                 <FieldItem label="Stamp Duty (%)" value={safe(bookingData.StampDutyPercentage)} />
//                                 <FieldItem label="Stamp Duty (₹)" value={formatCurrency(bookingData.StampDutyAmount)} />
//                                 <FieldItem label="Registration Fees (₹)" value={formatCurrency(bookingData.RegistrationFees)} />
//                                 <FieldItem label="Handover Type" value={safe(bookingData.HandoverType)} />
//                                 <FieldItem label="Mode Of Payment" value={safe(bookingData.ModeOfPayment)} />
//                                 <FieldItem label="Booking Amount (₹)" value={formatCurrency(bookingData.BookingAmount)} />
//                                 <FieldItem label="Parking Number" value={safe(bookingData.ParkingNumber)} />
//                             </div>
//                         </section>

//                         <hr className="border-t border-gray-200" />

//                         {/* FLAT ALTERATION */}
//                         {bookingData.FlatAlterationRemark && (
//                             <>
//                                 <section className="p-4">
//                                     <h4 className="text-lg font-semibold text-gray-900 mb-4">
//                                         Flat Alteration Remarks
//                                     </h4>
//                                     <div className="grid grid-cols-1 gap-4">
//                                         <FieldItem label="Remarks" value={safe(bookingData.FlatAlterationRemark)} />
//                                     </div>
//                                 </section>
//                                 <hr className="border-t border-gray-200" />
//                             </>
//                         )}

//                         {/* TERMS & CONDITIONS */}
//                         {bookingData.TermsAndConditionsDescription && (
//                             <>
//                                 <section className="p-4">
//                                     <h4 className="text-lg font-semibold text-gray-900 mb-4">
//                                         Terms & Conditions
//                                     </h4>
//                                     <div className="grid grid-cols-1 gap-4">
//                                         <FieldItem label="Description" value={safe(bookingData.TermsAndConditionsDescription)} />
//                                     </div>
//                                 </section>
//                                 <hr className="border-t border-gray-200" />
//                             </>
//                         )}

//                         {/* USER DETAILS */}
//                         <section className="p-4">
//                             <h4 className="text-lg font-semibold text-gray-900 mb-4">
//                                 User Details
//                             </h4>
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                                 <FieldItem label="Created By" value={safe(bookingData.CreatedBy)} />
//                                 <FieldItem label="Created Date" value={bookingData.CreatedDate ? formatDate_dd_MonthName_yy_hh_mm(bookingData.CreatedDate) : '-'} />
//                                 <FieldItem label="Modified By" value={safe(bookingData.ModifiedBy)} />
//                                 <FieldItem label="Modified Date" value={bookingData.ModifiedDate ? formatDate_dd_MonthName_yy_hh_mm(bookingData.ModifiedDate) : '-'} />
//                                 <FieldItem label="Approval Status" value={safe(bookingData.ApprovalStatus)} />
//                             </div>
//                         </section>
//                     </div>
//                 )}

//                 {activeTab === 'Applicants' && bookingData.BookingApplicantData && bookingData.BookingApplicantData.length > 0 && (
//                     <div className="space-y-4">
//                         {bookingData.BookingApplicantData.map((applicant, index) => (
//                             <Accordion
//                                 key={index}
//                                 title={`Applicant ${index + 1}: ${applicant.ApplicantName || 'N/A'}`}
//                                 defaultOpen={index === 0}
//                             >
//                                 <div className="p-4 space-y-4">
//                                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                                         <FieldItem label="Applicant Type" value={safe(applicant.ApplicantType)} />
//                                         <FieldItem label="Applicant Name" value={safe(applicant.ApplicantName)} />
//                                         <FieldItem label="Mobile Number" value={safe(applicant.ApplicantMobileNumber)} />
//                                         <FieldItem label="Email Id" value={safe(applicant.ApplicantEmailId)} />
//                                         <FieldItem label="Aadhar Card Number" value={safe(applicant.AadharCardNumber)} />
//                                         <FieldItem label="PAN Number" value={safe(applicant.PanNumber)} />
//                                         <FieldItem label="Passport Number" value={safe(applicant.PassportNumber)} />
//                                         <FieldItem label="Driving License Number" value={safe(applicant.DrivingLicenseNumber)} />
//                                         <FieldItem label="Voting ID Number" value={safe(applicant.VotingIdNumber)} />
//                                         <FieldItem label="GST Number" value={safe(applicant.GSTNumber)} />
//                                     </div>

//                                     {/* Document Images */}
//                                     <div className="space-y-4 mt-4">
//                                         {applicant.PhotoURL && (
//                                             <div>
//                                                 <h5 className="font-semibold mb-2">Photo</h5>
//                                                 <MultiImageViewer
//                                                     images={parseDocumentUrls(applicant.PhotoURL)}
//                                                     alt="Applicant Photo"
//                                                 />
//                                             </div>
//                                         )}
//                                         {applicant.AadharCardURL && (
//                                             <div>
//                                                 <h5 className="font-semibold mb-2">Aadhar Card</h5>
//                                                 <MultiImageViewer
//                                                     images={parseDocumentUrls(applicant.AadharCardURL)}
//                                                     alt="Aadhar Card"
//                                                 />
//                                             </div>
//                                         )}
//                                         {applicant.PanCardURL && (
//                                             <div>
//                                                 <h5 className="font-semibold mb-2">PAN Card</h5>
//                                                 <MultiImageViewer
//                                                     images={parseDocumentUrls(applicant.PanCardURL)}
//                                                     alt="PAN Card"
//                                                 />
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             </Accordion>
//                         ))}
//                     </div>
//                 )}

//                 {activeTab === 'Charges' && bookingData.BookingOtherChargesData && bookingData.BookingOtherChargesData.length > 0 && (
//                     <div className="space-y-4">
//                         <div className="overflow-x-auto">
//                             <table className="min-w-full divide-y divide-gray-200">
//                                 <thead className="bg-gray-50">
//                                     <tr>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charge Name</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calculated On</th>
//                                         <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value (₹)</th>
//                                         <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">GST (%)</th>
//                                         <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">GST Value (₹)</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="bg-white divide-y divide-gray-200">
//                                     {bookingData.BookingOtherChargesData.map((charge, index) => (
//                                         <tr key={index}>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safe(charge.ChargeName)}</td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safe(charge.CalculatedOn)}</td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(charge.Value)}</td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{safe(charge.GSTPercentage)}</td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(charge.GSTValue)}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 )}

//                 {activeTab === 'Payment' && bookingData.BookingPaymentScheduleData && bookingData.BookingPaymentScheduleData.length > 0 && (
//                     <div className="space-y-4">
//                         <div className="overflow-x-auto">
//                             <table className="min-w-full divide-y divide-gray-200">
//                                 <thead className="bg-gray-50">
//                                     <tr>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//                                         <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                                         <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage (%)</th>
//                                         <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (₹)</th>
//                                         <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">GST (₹)</th>
//                                         <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">TDS (₹)</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="bg-white divide-y divide-gray-200">
//                                     {bookingData.BookingPaymentScheduleData.map((schedule, index) => (
//                                         <tr key={index}>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safe(schedule.Type)}</td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safe(schedule.Name)}</td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{schedule.Date ? formatDate_dd_MonthName_yy_hh_mm(schedule.Date) : '-'}</td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{safe(schedule.PaymentSchedulePercentage)}</td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(schedule.PaymentScheduleAmount)}</td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(schedule.PaymentScheduleGSTAmount)}</td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(schedule.PaymentScheduleTDSAmount)}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
//     //#endregion
// };

// export default ViewBooking;

import React from "react";

const ViewBooking: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Add / Update Booking
            </h2>

            <p className="text-sm text-gray-600">
                Booking form content will go here.
            </p>
        </div>
    );
};

export default ViewBooking;


