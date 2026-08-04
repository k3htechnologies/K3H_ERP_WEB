import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { useState } from 'react';
import { usePayTrackBookingListState } from '@/features/crmPayTrack/context/PayTrackBookingListStateContext';
import { runApiWithLoader } from '@/core/utils';
import { Loader } from '@/core/utils/loader';
import usePagination from '@/core/hooks/usePagination';
import { bookingApplicantModificationService } from '@/features/crmPayTrack/services/BookingApplicantModelCrmService';
import type { FilterWithPaginationBookingApplicantModificationRequest, BookingApplicantModificationDataRequest } from '@/features/crmPayTrack/models/BookingApplicantModificationModel';
import type { FilterWithPaginationParkingModificationDetails, ParkingModificationDetailsData } from '@/features/crmPayTrack/models/ParkingModificationModel';
import type { FilterWithPaginationFlatAlterationRequest, FlatAlterationRequestData } from '@/features/crmPayTrack/models/FlatAlterationRequestModel';
import { flatAlterationService } from '@/features/crmPayTrack/services/FlatAlterationService';
import { parkingModificationService } from '@/features/crmPayTrack/services/ParkingModificationService';
import * as E from 'fp-ts/Either';
import { ExpandableCard } from "@/ui/components/Card/ExpandableCard";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { getSafeString } from '@/core/utils/comman';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import useToast from '@/core/hooks/useToast';
import NoDataView from '@/ui/components/NoDataView/NoDataView';

export const Activity: React.FC = () => {

    const [bookingApplicantModificationLst, setBookingApplicantModificationLst] = useState<BookingApplicantModificationDataRequest[]>([]);
    const [parkingModificationList, setParkingModificationList] = useState<ParkingModificationDetailsData[]>([]);
    const [flatAlterationList, setFlatAlterationList] = useState<FlatAlterationRequestData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const { projectId } = useProject();
    const { listState } = usePayTrackBookingListState();
    const { bookingId } = listState;
    const { addToast } = useToast();
    const { pagination, setPagination } = usePagination(20);

    const loadBookingApplicantModificationRequestHistory = async (page: number) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationBookingApplicantModificationRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    BookingId: Number(bookingId),
                    TabName:"ACTIVITY",
                };

                const response = await bookingApplicantModificationService.apiCallPullBookingApplicantModification(params);

                if (E.isRight(response)) {

                    setBookingApplicantModificationLst(response.right.Data);

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize)
                    });
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

        );
    };

    const loadParkingModificationRequestHistory = async (page: number) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationParkingModificationDetails = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    BookingId: Number(bookingId),
                    TabName:"ACTIVITY",
                };

                const response = await parkingModificationService.apiCallPullParkingModificationDetails(params);

                if (E.isRight(response)) {

                    setParkingModificationList(response.right.Data);

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize)
                    });
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
        );
    };

    const loadFlatAlterationRequestHistory = async (page: number) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationFlatAlterationRequest = {
                    PageNumber: page,
                    PageSize: 100,
                    ProjectId: Number(projectId),
                    BookingId: Number(bookingId),
                    TabName:"ACTIVITY",
                };

                const response = await flatAlterationService.apiCallPullFlatAlterationRequest(params);

                if (E.isRight(response)) {

                    setFlatAlterationList(response.right.Data);

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize)
                    });
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

        );
    };
    return (
        <div >
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <div className="pt-5 space-y-6">
                <ExpandableCard
                    expandedheight={600}
                    showline={false}
                    onClick={(isOpen) => {
                        if (isOpen) {
                            loadBookingApplicantModificationRequestHistory(1);
                        }
                    }}
                    title={
                        <div className="font-medium text-md">
                            Booking Applicant History
                        </div>
                    }
                    child={
                        <div>
                            {bookingApplicantModificationLst.length > 0 ? (() => {
                                const grouped = bookingApplicantModificationLst.reduce<
                                    Record<string, BookingApplicantModificationDataRequest[]>
                                >((acc, item) => {
                                    const key = String(item.VersionNumber ?? '');
                                    if (!acc[key]) acc[key] = [];
                                    acc[key].push(item);
                                    return acc;
                                }, {});

                                const versionKeys = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

                                return versionKeys.map((version, vIdx) => (
                                    <div key={version}>
                                        <div className="flex items-center gap-3 px-2 py-2 -mt-5">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 tracking-wide">
                                                Version {version}
                                            </span>
                                            
                                        </div>

                                        <div className="space-y-3">
                                            {grouped[version].map((data, rowIdx) => (
                                                <div key={data.BookingApplicantModificationRequestId || rowIdx} className="bg-white rounded-lg px-8 py-4 border border-gray-200">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-x-8 md:gap-y-3">
                                                        <FieldItem label="Proof Of Document" value={getSafeString(data?.ProofOfDocumentURL)} urls={data?.ProofOfDocumentURL} isIcon isSetValue={false} />
                                                        <FieldItem label="Type" value={getSafeString(data.ApplicantType)} />
                                                        <FieldItem label="Applicant Name" value={getSafeString(data.ApplicantName)} urls={data.PhotoURL} isIcon />
                                                        <FieldItem label="Mobile Number" value={getSafeString(data?.ApplicantMobileNumber) ? `${data?.ApplicantMobileNumberCountryCode || "+91"} ${data?.ApplicantMobileNumber}` : '-'} />
                                                        <FieldItem label="E-Mail ID" value={getSafeString(data.ApplicantEmailId)} />
                                                        <FieldItem label="Aadhaar Card No." value={getSafeString(data.AadharCardNumber)} urls={data.AadharCardURL} isIcon />
                                                        <FieldItem label="PAN No." value={getSafeString(data.PanNumber)} urls={data.PanCardURL} isIcon />
                                                        <FieldItem label="Driving License" value={getSafeString(data.DrivingLicenseNumber)} urls={data.DrivingLicenseURL} isIcon />
                                                        <FieldItem label="Voting ID No." value={getSafeString(data.VotingIdNumber)} urls={data.VotingIdURL} isIcon />
                                                        <FieldItem label="Passport No." value={getSafeString(data.PassportNumber)} urls={data.PassportURL} isIcon />
                                                        <FieldItem label="GST No." value={getSafeString(data.GSTNumber)} urls={data.GSTNumberURL} isIcon />
                                                        <FieldItem label="Cancelled Cheque" value={getSafeString(data?.CancelledChequeURL)} urls={data?.CancelledChequeURL} isIcon isSetValue={false} />
                                                        <FieldItem label="POA (if NRI Execution)" value={getSafeString(data?.POAURL)} urls={data?.POAURL} isIcon isSetValue={false} />
                                                        <FieldItem label="Income Docs (Form 16 / ITR)" value={getSafeString(data?.IncomeForm16ITRURL)} urls={data?.IncomeForm16ITRURL} isIcon isSetValue={false} />
                                                        <FieldItem label="NRE / NRO Bank Details" value={getSafeString(data?.NreNroBankDetailsURL)} urls={data?.NreNroBankDetailsURL} isIcon isSetValue={false} />
                                                        <FieldItem label="Nominee Form" value={getSafeString(data?.NomineeFormURL)} urls={data?.NomineeFormURL} isIcon isSetValue={false} />
                                                        <FieldItem label="Statement of Source of Funds" value={getSafeString(data?.StatementOfSourceOfFundsURL)} urls={data?.StatementOfSourceOfFundsURL} isIcon isSetValue={false} />
                                                        <FieldItem label="Payment Proof" value={getSafeString(data?.PaymentProofURL)} urls={data?.PaymentProofURL} isIcon isSetValue={false} />
                                                        <FieldItem label="Created By" value={getSafeString(data?.CreatedBy)} />
                                                        <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy(data?.CreatedDate ?? '')} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {vIdx < versionKeys.length - 1 && (
                                            <div className="my-6" />
                                        )}
                                    </div>
                                ));
                            })() : (
                                <div className="text-center text-gray-500 py-8">
                                    <NoDataView message='No applicant history found' />
                                </div>
                            )}
                        </div>
                    }
                />

                <ExpandableCard
                    showline={false}
                    onClick={(isOpen) => {
                        if (isOpen) {
                            loadParkingModificationRequestHistory(1);
                        }
                    }}
                    title={
                        <div className="font-medium text-md">
                            Parking History
                        </div>
                    }
                    child={

                        <div>
                            {parkingModificationList.length > 0 ? (() => {

                                const grouped = parkingModificationList.reduce<

                                    Record<string, ParkingModificationDetailsData[]>
                                >((acc, item) => {

                                    const key = String(item.VersionNumber);

                                    if (!acc[key]) {
                                        acc[key] = [];
                                    }

                                    acc[key].push(item);

                                    return acc;
                                }, {});

                                const versionKeys = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

                                return versionKeys.map((version,vIdx) => (
                                    <div key={version}>
                                        <div className="flex items-center gap-3 px-2 py-2 -mt-5">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                Version {version}
                                            </span>
                                            
                                        </div>

                                        <div className="space-y-3">
                                            {grouped[version].flatMap((data, dataIdx) =>
                                                (data.parkingData ?? []).map((item, idx) => (
                                                    <div
                                                        key={`${version}-${dataIdx}-${idx}`}
                                                        className="bg-white rounded-lg px-8 py-4 border border-gray-200"
                                                    >
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                             <FieldItem label="Proof Of Document" value={getSafeString(data.ProofOfDocumentURL)} urls={data.ProofOfDocumentURL} isIcon isSetValue={false} />
                                                            <FieldItem label="Parking Number" value={getSafeString(item.ParkingNumber)} />
                                                            <FieldItem label="Category" value={getSafeString(item.ParkingCategory)} />
                                                            <FieldItem label="Type" value={getSafeString(item.ParkingType)} />
                                                            <FieldItem label="Size" value={getSafeString(item.ParkingSubType)} />
                                                            <FieldItem label="Dimensions" value={getSafeString(item.ParkingDimensions)} />
                                                            <FieldItem label="EV Charging" value={item.IsEVChargingAvailable ? "Yes" : "No"} />
                                                            <FieldItem label="Created By" value={getSafeString(data.CreatedBy)} />
                                                            <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy(data.CreatedDate ?? '')} />

                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {vIdx < versionKeys.length - 1 && (
                                            <div className="my-6" />
                                        )}

                                    </div>
                                ));
                            })() : (
                                <NoDataView message="No parking history found" />
                            )}
                        </div>

                    }
                />

                <ExpandableCard
                    showline={false}
                    onClick={(isOpen) => {
                        if (isOpen) {
                            loadFlatAlterationRequestHistory(1);
                        }
                    }}
                    title={
                        <div className="font-medium text-md">
                            Unit / Modulation / Customization History
                        </div>
                    }
                    child={
                        <div>
                            {flatAlterationList.length > 0 ? (() => {

                                const grouped = flatAlterationList.reduce<
                                    Record<string, FlatAlterationRequestData[]>
                                >((acc, item) => {

                                    const key = String(item.VersionNumber);

                                    if (!acc[key]) {
                                        acc[key] = [];
                                    }

                                    acc[key].push(item);

                                    return acc;
                                }, {});

                                const versionKeys = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

                                return versionKeys.map((version,vIdx) => (

                                    <div key={version}>

                                        <div className="flex items-center gap-3 px-2 py-2 -mt-5">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                Version {version}
                                            </span>
                                           
                                        </div>

                                        <div className="space-y-3">
                                            {grouped[version].map((data, index) => (
                                                <div
                                                    key={data.FlatAlterationRequestId || index}
                                                    className="bg-white rounded-lg px-8 py-4 border border-gray-200"
                                                >
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-x-8 md:gap-y-3">

                                                        <FieldItem label="Unit / Modulation / Customization Remark" value={getSafeString(data.FlatAlterationRemark)} urls={data.ProofOfDocumentURL} isIcon />
                                                        
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-x-8 md:gap-y-3 pt-5">

                                                        <FieldItem label="Created By" value={getSafeString(data.CreatedBy)} />
                                                        <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy(data.CreatedDate ?? '')} />
                                                        <FieldItem label="Modified By" value={getSafeString(data.ModifiedBy)} />
                                                        <FieldItem label="Modified Date" value={formatDate_dd_MonthName_yy(data.ModifiedDate ?? '')} />

                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {vIdx < versionKeys.length - 1 && (
                                            <div className="my-6" />
                                        )}
                                    </div>
                                ));
                            })() : (
                                <div className="text-center text-gray-500 py-8">
                                    <NoDataView message="No flat alteration history found" />
                                </div>
                            )}
                        </div>
                    }
                
                />

            </div>
        </div>
    )
}

export default Activity