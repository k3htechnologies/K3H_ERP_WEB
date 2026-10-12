import React, { useEffect, useMemo, useState } from 'react';
import { Loader } from '@/core/utils/loader';
import type { BookingData, FilterWithPaginationBookingRequest } from '@/features/booking/models/BookingModel';
import { useNavigate, useLocation } from 'react-router-dom';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { bookingService } from '@/features/booking/services/BookingService';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useTenantBookingListState } from '@/features/tenantBooking/context/TenantBookingListStateContext';
import Tabs from '@/ui/components/Tab/Tab';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import RichTextEditor from '@/ui/components/forms/RichTextEditor';
import { handleExportFile } from '@/core/utils/exportFile';
import {  type TableColumn } from '@/ui/components/DataTable/DataTable';
import { formatCurrency, getSafeString } from '@/core/utils/comman';
import { FileText } from 'lucide-react';
import type { FilterWithPaginationTenantRequest, TenantData } from '@/features/tenant/models/TenantModel';
import { tenantService } from '@/features/tenant/services/TenantService';
import { DataTableWithHeaderRowDivider } from '@/ui/components/DataTable/DataTableWithHeaderRowDivider';

export const ViewTenantBooking: React.FC = () => {

    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [tenantList, setTenantList] = useState<TenantData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { canAction } = useMenuPermissions();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const { projectId } = useProject();

    const sourcePage = (location.state as any)?.sourcePage || 'booking';

    const { listState } = useTenantBookingListState();
    const { bookingId, bookingName } = listState;

    const bookingTabList = [
        { id: 'Overview', label: 'Overview' },
        { id: 'Applicants', label: 'Applicants' },
        { id: 'Charges', label: 'Other Charges' },
        { id: 'Payment', label: 'Payment Schedule' },
        { id: 'Terms & Condition', label: 'Terms & Condition' },
    ];

    const [activeTab, setActiveTab] = useState<string>(bookingTabList[0].id);

    useEffect(() => {
        if (!projectId || !bookingId) return;

        loadBookingFromServer();

    }, [projectId, bookingId]);

    const fetchTenantDetails = async (tenantIdToFetch: number, buildingId: number) => {

        if (!tenantIdToFetch || tenantIdToFetch === 0) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationTenantRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    TenantId: tenantIdToFetch,
                    ProjectId: Number(projectId),
                    IsCheckPermission: sourcePage === 'inventory' ? false : true,
                    BuildingId: buildingId,
                };

                const response = await tenantService.apiCallPullTenant(params);;

                if (E.isRight(response)) {

                    const tenantList = response.right.Data?.[0] ?? null;;

                    setTenantList(tenantList);


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
            'Loading Tenant Details'
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
                    IsCheckPermission: sourcePage === 'inventory' ? false : true,
                    BookingSearchKey:"TENANT BOOKING",
                };

                const response = await bookingService.apiCallPullBooking(params);

                if (E.isRight(response)) {
                    const booking = response.right.Data?.[0] ?? null;

                    setBookingData(booking);

                    if (booking?.TenantId && booking.TenantId > 0) {

                        await fetchTenantDetails(Number(booking.TenantId), Number(booking.TenantBuildingId) || 0);
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
            'Loading Tenant Booking Data'
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
                    ExportType: exportType,
                    BookingSearchKey:"TENANT BOOKING",
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

        const boldIfTotal = (row: any) => row.isTotal ? "font-bold text-gray-500" : "";

        return [
            
            {
                key: "Date",
                label: "Date / Stage (Milestone)",
                sortable: false,

                width: "20",
                align: "left",
                render: (_value, row) => {
                    if (row.isTotal) return <span className={boldIfTotal(row)}>TOTAL</span>;

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
                align: "left",
                render: (value, row) => (
                    <span className={boldIfTotal(row)}>
                        {value || "-"}
                    </span>
                ),
            },
            {
                key: "PaymentScheduleAmount",
                label: "Amount  Without TDS (₹)",
                sortable: false,

                width: "20",
                align: "left",
                render: (value, row) => (
                    <span className={boldIfTotal(row)}>
                        {formatCurrency(value) || "0"}
                    </span>
                ),
            },
            {
                key: "PaymentScheduleGSTAmount",
                label: "GST Amount (₹)",

                width: "20",
                sortable: false,
                align: "left",
                render: (value, row) => (
                    <span className={boldIfTotal(row)}>
                        {formatCurrency(value) || "0"}
                    </span>
                ),
            },
            {
                key: "PaymentScheduleTDSAmount",
                label: "TDS Amount (₹)",
                width: "20",
                sortable: false,
                align: "left",
                render: (value, row) => (
                    <span className={boldIfTotal(row)}>
                        {formatCurrency(value) || "0"}
                    </span>
                ),
            },

            {
                key: "PaymentScheduleTotalAmount",
                label: "Total Amount With TDS (₹)",
                sortable: false,
                width: "20",
                align: "left",
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
                render: (value, row) => (
                    <span className={boldIfTotal(row)}>
                        {row.isTotal ? "" : value || "-"}
                    </span>
                ),
            },
            {
                key: "CalculatedOn",
                label: "Calculated On",
                sortable: false,
                align: "left",
                render: (value, row) => (
                    <span className={boldIfTotal(row)}>
                        {row.isTotal ? "TOTAL" : value || "-"}
                    </span>
                ),
            },
            {
                key: "Value",
                label: "Value (₹)",
                sortable: false,
                align: "right",
                render: (value, row) => (
                    <span className={boldIfTotal(row)}>
                        {formatCurrency(value) || "0"}
                    </span>
                ),
            },
            {
                key: "GSTPercentage",
                label: "GST (%)",
                sortable: false,
                align: "right",
                render: (value, row) => (
                    <span className={boldIfTotal(row)}>
                        {`${value || 0} %`}
                    </span>
                ),
            },
            {
                key: "GSTValue",
                label: "GST Value (₹)",
                sortable: false,
                align: "right",
                render: (value, row) => (
                    <span className={boldIfTotal(row)}>
                        {formatCurrency(value) || "0"}
                    </span>
                ),
            },
        ];
    }, []);

    if (!bookingData) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <Loader loading={isLoading} title={loadingMessage}>
                    <div>No tenant booking data found</div>
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
                titleText={`Tenant Booking Details : ${bookingData.ApplicantName ?? bookingName}`}
                subTitleText={bookingData.BookingType ?? ""}
                subSubTitleText={bookingData.Flat ?? ""}
                subSubSubTitleText={bookingData.ApprovalStatus ?? ""}
                cancelText="Back"
                EditText="Edit"
                onCancel={() => {

                    if (sourcePage === 'inventory') {
                        navigate('/inventory');
                    } else if (sourcePage === 'parking') {
                        navigate('/parking');
                    } else if (sourcePage === 'tenant') {
                        navigate('/tenant');
                    } 
                    else {
                        navigate('/tenantBooking');
                    }
                }}
                canAction={canAction && bookingData.ApprovalStatus?.toUpperCase().includes("PENDING") && sourcePage === 'booking' ? true : false}
                onEdit={() => navigate('/tenantBooking/add')}

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


                    <div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                            <div className="lg:col-span-2 space-y-6">

                                {tenantList && (

                                    <>
                                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                                            <div className="bg-[#F6F9FF] px-3 py-2 border-b border-[#D0D7DE]">
                                                <h4 className="text-sm font-semibold text-[#13367A]">
                                                    Exisiting Unit Details
                                                </h4>
                                            </div>
                                            <div className="p-4 bg-white">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                                    <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            <FieldItem label="Tenant Code" value={tenantList?.SystemGeneratedCode} />
                                                            <FieldItem label="Unit / Annexure / Survey Number" value={tenantList?.UnitAnnexureSurveyNumber} />
                                                            <FieldItem label="Unit Type" value={tenantList?.UnitType} />
                                                        </div>
                                                    </div>

                                                    <div className="lg:col-span-3 pt-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {tenantList?.UnitType?.toUpperCase() !== "GYM"
                                                                ?
                                                                <FieldItem label="Unit Configuration" value={tenantList?.UnitConfiguration} />
                                                                : <FieldItem label="Unit Carpet Area (SqFt)" value={tenantList?.UnitCarpetAreaSqFt} />
                                                            }

                                                            {tenantList?.UnitType?.toUpperCase() !== "GYM"
                                                                ?
                                                                <FieldItem label="Unit Carpet Area (SqFt)" value={tenantList?.UnitCarpetAreaSqFt} />
                                                                : ""
                                                            }
                                                            <FieldItem label="Unit Facing" value={tenantList?.UnitFacing} />

                                                        </div>
                                                    </div>


                                                </div>

                                            </div>
                                        </section>

                                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden mt-5">

                                            <div className="bg-[#FFFFE4] px-3 py-2 border-b border-[#D0D7DE]">
                                                <h4 className="text-sm font-semibold text-[#7B6B28]">
                                                    Eligibility Details in Carpet Area (SqFt)
                                                </h4>
                                            </div>
                                            <div className="p-4 bg-white">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                                    <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            <FieldItem label="Extra Free Carpet Area Offered (%)" value={tenantList?.ExtraFreeCarpetAreaOfferedPercent} />
                                                            <FieldItem label="Free MOFA Carpet Area (SqFt)" value={tenantList?.FreeMOFACarpetAreaSqFt} />

                                                        </div>
                                                    </div>


                                                    <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            <FieldItem label="Existing Terrace Area (SqFt)" value={tenantList?.ExistingTerraceAreaSqFt} />
                                                            <FieldItem label="New Eligibility MOFA Carpet Area (SqFt)" value={tenantList?.NewEligibilityMOFACarpetAreaSqFt} />
                                                            <FieldItem label="New Eligibility RERA Carpet Area (SqFt)" value={tenantList?.NewEligibilityRERACarpetAreaSqFt} />


                                                        </div>
                                                    </div>


                                                    <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            <FieldItem label="(A) Area Against Terrace (SqFt)" value={tenantList?.AreaAgainstTerraceSqFt} />
                                                            <FieldItem label="MOFA Carpet Area Purchased (SqFt)" value={tenantList?.MOFACarpetAreaPurchasedSqFt} />
                                                            <FieldItem label="RERA Carpet Area Purchased (SqFt)" value={tenantList?.RERACarpetAreaPurchasedSqFt} />


                                                        </div>
                                                    </div>
                                                    <div className="lg:col-span-3 pt-3 pb-3 border-b border-[#135bec2e] pb-3 pt-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            <FieldItem label="(B) Deck Area (SqFt)" value={tenantList?.DeckAreaSqFt} />
                                                            <FieldItem label="Total New MOFA Carpet Area (SqFt)" value={tenantList?.TotalNewMOFACarpetAreaSqFt} />
                                                            <FieldItem label="(C) Total New Rera Carpet Area (SqFt)" value={tenantList?.TotalNewRERACarpetAreaSqFt} />



                                                        </div>
                                                    </div>
                                                    <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                                        <div className='flex'>
                                                            <FieldItem
                                                                label="Area Against Terrace + Deck Area + Total New RERA Carpet Area (SqFt) (A + B + C)"
                                                                value={(
                                                                    (Number(tenantList?.TotalNewRERACarpetAreaSqFt) || 0) +
                                                                    (Number(tenantList?.DeckAreaSqFt) || 0) +
                                                                    (Number(tenantList?.AreaAgainstTerraceSqFt) || 0)
                                                                ).toFixed(2)}
                                                            />
                                                        </div>

                                                    </div>

                                                    <div className="lg:col-span-3 pt-3">
                                                        <div className='flex'>
                                                            <FieldItem label="Remark" value={tenantList?.Remark} />
                                                        </div>

                                                    </div>


                                                </div>
                                            </div>

                                        </section>
                                    </>
                                )}


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

                                            <div className="py-1">
                                                <FieldItem label="Booking From" value={bookingData.CarpetAreaPurchasedSqFt} isRow />
                                            </div>

                                            <div className="py-4">
                                                {bookingData.CarpetAreaPurchasedSqFt==="MOFA" ? (
                                                    <FieldItem label="Carpet Area Purchased" value={`${tenantList?.MOFACarpetAreaPurchasedSqFt ?? 0} SqFt`} isRow />
                                                ) : (
                                                    <FieldItem label="Carpet Area Purchased" value={`${tenantList?.RERACarpetAreaPurchasedSqFt ?? 0} SqFt`} isRow />
                                                )}
                                            </div>
                                                

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


                                        </div>
                                    </div>
                                </section>



                            </div>

                        </div>

                        <div className="pt-5">
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

                            <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden mt-5">

                                <div className="bg-[#D0D7DE] px-3 py-2 border-b border-[#D0D7DE]">
                                    <h4 className="text-sm font-semibold text-[#12A3DD]">
                                        Address Details
                                    </h4>
                                </div>
                                <div className="p-4 bg-white">

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

                                        <FieldItem label="Communication Address" value={getSafeString(bookingData.CommunicationAddress)} />
                                        <FieldItem label="Permanent Address" value={getSafeString(bookingData.PermanentAddress)} />
                                    </div>
                                </div>
                            </section>

                            <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden mt-5">

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
                                <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden mt-5">

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

                            <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden mt-5">

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
                                        

                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
                                        <FieldItem label="Handover Type" value={getSafeString(bookingData.HandoverType)} />
                                        <FieldItem label="Source Of Funding" value={getSafeString(bookingData.SourceOfFunding)} />
                                        <FieldItem label="Number Of Parking" value={getSafeString(bookingData.NumberOfParking)} />
                                    </div>
                                </div>
                            </section>

                            <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden mt-5">

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

                        <div className="pt-5">
                            <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                                <div className="bg-[#FCF1FF] px-3 py-2 border-b border-[#D0D7DE]">
                                    <h4 className="text-sm font-semibold text-[#561F64]">
                                        Other Charges
                                    </h4>
                                </div>
                                <div className="bg-white">

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
                                <div className="bg-white">

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


                )
                }

                {
                    activeTab === 'Applicants' && (
                        <div>
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
                                </div>
                            </section>
                        </div>
                    )
                }

                {
                    activeTab === 'Charges' && (
                        <div className="space-y-4">
                            <DataTableWithHeaderRowDivider
                                data={otherChargesDataWithTotal || []}
                                columns={otherChargesColumns}
                                emptyMessage="No Other Charges Found"
                                fixedHeight={true}
                                recordsPerPage={20}
                                className="flex-1" />
                        </div>
                    )
                }

                {activeTab === 'Payment' && (
                    <div className="space-y-4">
                        <DataTableWithHeaderRowDivider
                            data={paymentScheduleDataWithTotal || []}
                            columns={paymentScheduleColumns}
                            emptyMessage="No Payment Schedule Found"
                            fixedHeight={true}
                            recordsPerPage={20}
                            className="flex-1" />

                    </div>
                )
                }
                {activeTab === 'Terms & Condition' && (
                    <div className="space-y-3">
                        {bookingData.TermsAndConditionsDescription ? (
                            <section className="bg-white rounded-xl shadow-sm">
                                <RichTextEditor value={bookingData.TermsAndConditionsDescription ?? ""} onChange={() => { }} readOnly={true} />
                            </section>

                        ) : (
                            <section className="md:col-span-4 bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                <NoDataView message="No Terms & Conditions Found" />
                            </section>
                        )}
                    </div>
                )}
            </div >
        </div >
    );
    //#endregion
};

export default ViewTenantBooking;




