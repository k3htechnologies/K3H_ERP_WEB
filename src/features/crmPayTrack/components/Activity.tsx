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
import type { FilterWithPaginationRefundAmountDetails, RefundAmountDetailsData } from '@/features/crmPayTrack/models/RefundAmountDetailsModel';
import { flatAlterationService } from '@/features/crmPayTrack/services/FlatAlterationService';
import { parkingModificationService } from '@/features/crmPayTrack/services/ParkingModificationService';
import { refundAmountDetailsCrmService } from '@/features/crmPayTrack/services/RefundAmountDetailsCrmService';
import * as E from 'fp-ts/Either';
import { ExpandableCard } from "@/ui/components/Card/ExpandableCard";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatCurrency, getSafeString } from '@/core/utils/comman';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import useToast from '@/core/hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { Edit } from 'lucide-react';
import { Button } from '@/ui/components/forms';

export const Activity: React.FC = () => {

    const [bookingApplicantModificationLst, setBookingApplicantModificationLst] = useState<BookingApplicantModificationDataRequest[]>([]);
    const [parkingModificationList, setParkingModificationList] = useState<ParkingModificationDetailsData[]>([]);
    const [flatAlterationList, setFlatAlterationList] = useState<FlatAlterationRequestData[]>([]);
    const [refundedAmountLedgerList, setRefundedAmountLedgerList] = useState<RefundAmountDetailsData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const { projectId } = useProject();
    const { listState } = usePayTrackBookingListState();
    const { bookingId } = listState;
    const { addToast } = useToast();
    const { pagination, setPagination } = usePagination(20);
    const navigate = useNavigate();

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
                };

                const response = await bookingApplicantModificationService.apiCallPullBookingApplicantModification(params);

                if (E.isRight(response)) {

                    const allApprovalStatusData = response.right.Data;
                    const allApprovalStatusDataHere = allApprovalStatusData.filter(item => item.ApprovalStatus === 'Approved');
                    setBookingApplicantModificationLst(allApprovalStatusDataHere);

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
                };

                const response = await flatAlterationService.apiCallPullFlatAlterationRequest(params);

                if (E.isRight(response)) {

                    const allFlatAlterationData = response.right.Data;
                    const allFlatAlterationDataHere = allFlatAlterationData.filter(item => item.ApprovalStatus === 'Approved');
                    setFlatAlterationList(allFlatAlterationDataHere);
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

    const loadRefundedAmountDetailsHistory = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationRefundAmountDetails = {
                    ProjectId: Number(projectId),
                    BookingId: bookingId,
                };

                const response = await refundAmountDetailsCrmService.apiCallPullRefundAmountDetails(params);

                if (E.isRight(response)) {

                    setRefundedAmountLedgerList(response.right.Data);

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
            "Loading Refunded Amount Details"
        )

    }

    return (
        <div >
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <div className="pt-5 space-y-6">
                <ExpandableCard
                    expandedheight={400}
                    showline={false}
                    onClick={(isOpen) => {
                        if (isOpen) {
                            loadBookingApplicantModificationRequestHistory(1);
                        }
                    }}
                    title={
                        <div className="font-semibold text-lg pt-4 pb-4">
                            Booking Applicant History
                        </div>
                    }
                    child={
                        <div>
                            {bookingApplicantModificationLst.length > 0 ? (
                                bookingApplicantModificationLst.map((data, index) => (
                                    <div key={data.BookingApplicantModificationRequestId || index}>
                                        <div className="flex items-center gap-3 px-2 py-2 -mt-5">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 tracking-wide">
                                                Version {data.VersionNumber}
                                            </span>
                                            <div className="flex-1 border-t border-gray-200" />
                                        </div>

                                        <div className="bg-white rounded-lg px-8 py-4 border border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-x-8 md:gap-y-3">
                                                <FieldItem label="Request Date" value={formatDate_dd_MonthName_yy(data.CreatedDate ?? '')} />
                                                <FieldItem label="Name" value={getSafeString(data.ApplicantName)} urls={data.PhotoURL} isIcon />
                                                <FieldItem label="Applicant Type" value={getSafeString(data.ApplicantType)} />
                                                <FieldItem label="Mobile Number" value={getSafeString(data.ApplicantMobileNumber)} />
                                                <FieldItem label="Email Id" value={getSafeString(data.ApplicantEmailId)} />
                                                <FieldItem label="Aadhar Card" value={getSafeString(data.AadharCardNumber)} urls={data.AadharCardURL} isIcon />
                                                <FieldItem label="Pan Card" value={getSafeString(data.PanNumber)} urls={data.PanCardURL} isIcon />
                                                <FieldItem label="Voting Id" value={getSafeString(data.VotingIdNumber)} urls={data.VotingIdURL} isIcon />
                                                <FieldItem label="Passport" value={getSafeString(data.PassportNumber)} urls={data.PassportURL} isIcon />
                                                <FieldItem label="Driving License" value={getSafeString(data.DrivingLicenseNumber)} urls={data.DrivingLicenseURL} isIcon />
                                                <FieldItem label="GST Number" value={getSafeString(data.GSTNumber)} urls={data.GSTNumberURL} isIcon />
                                                <FieldItem label="Cancelled Cheque" value={getSafeString(data?.CancelledChequeURL)} urls={data?.CancelledChequeURL} isIcon />
                                                <FieldItem label="POA" value={getSafeString(data?.POAURL)} urls={data?.POAURL} isIcon />
                                                <FieldItem label="Income Form 16 " value={getSafeString(data?.IncomeForm16ITRURL)} urls={data?.IncomeForm16ITRURL} isIcon />
                                                <FieldItem label="Nre/Nro/BankDetails" value={getSafeString(data?.NreNroBankDetailsURL)} urls={data?.NreNroBankDetailsURL} isIcon />
                                                <FieldItem label="Nominee Form" value={getSafeString(data?.NomineeFormURL)} urls={data?.NomineeFormURL} isIcon />
                                                <FieldItem label="Statement Of Source Of Funds" value={getSafeString(data?.StatementOfSourceOfFundsURL)} urls={data?.StatementOfSourceOfFundsURL} isIcon />
                                                <FieldItem label="Payment Proof" value={getSafeString(data?.PaymentProofURL)} urls={data?.PaymentProofURL} isIcon />
                                                <FieldItem label="Created By" value={getSafeString(data?.CreatedBy)} />
                                                <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy(data?.CreatedDate ?? '')} />
                                                <FieldItem label="Approval Status" value={getSafeString(data.ApprovalStatus)} />
                                            </div>
                                        </div>

                                        {index < bookingApplicantModificationLst.length - 1 && (
                                            <hr className="my-6 border-gray-200" />
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    No applicant history found.
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
                        <div className="font-semibold text-lg pt-4 pb-4">
                            Parking History
                        </div>
                    }
                    child={
                        <div className="space-y-4">
                            {parkingModificationList.length > 0 ? (
                                parkingModificationList.map((data) => (
                                    <div
                                        className="bg-white rounded-lg px-6 py-4 border border-gray-200 "
                                    >
                                        <div>
                                            {data.parkingData?.map((item, indx) => (
                                                <div key={indx} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-x-8 md:gap-y-3">
                                                    <FieldItem label="Requested Date" value={formatDate_dd_MonthName_yy(item.ParkingBookingCreatedDate ?? '')} />
                                                    <FieldItem label="Owner Name" value={getSafeString(item.OwnerName)} />
                                                    <FieldItem label="Parking Number" value={getSafeString(item.ParkingNumber)} />
                                                    <FieldItem label="Category" value={getSafeString(item.ParkingCategory)} />
                                                    <FieldItem label="Type" value={getSafeString(item.ParkingType)} />
                                                    <FieldItem label="Size" value={getSafeString(item.ParkingSubType)} />
                                                    <FieldItem label="Dimensions" value={getSafeString(item.ParkingDimensions)} />
                                                    <FieldItem label="EV Charging" value={getSafeString(item.IsEVChargingAvailable) ? 'Yes' : 'No'} />
                                                    <FieldItem label="Parking Status" value={getSafeString(item.ParkingStatus)} />
                                                    <FieldItem label="Inventory Building" value={getSafeString(item.InventoryBuildingId)} />
                                                    <FieldItem label="Inventory Wing" value={getSafeString(item.InventoryFlatFloorBasementPodiumWingId)} />
                                                    <FieldItem label="Inventory Floor" value={getSafeString(item.InventoryFloorId)} />
                                                    <FieldItem label="Booking Id" value={getSafeString(item.BookingId)} />
                                                    <FieldItem label="Approval Status" value={getSafeString(item.ApprovalStatus)} />
                                                    <FieldItem label="Requested By" value={getSafeString(item.ParkingBookingCreatedBy)} />
                                                </div>
                                            ))}

                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    No parking history found.
                                </div>
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
                        <div className="font-semibold text-lg pt-4 pb-4">
                            Flat Alteration History
                        </div>
                    }
                    child={
                        <div>
                            {flatAlterationList.length > 0 ? (
                                flatAlterationList.map((data, index) => (
                                    <div key={data.FlatAlterationRequestId || index}>

                                        <div className="bg-white rounded-lg px-8 py-4 border border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-x-8 md:gap-y-3">
                                                <FieldItem label="Flat Alteration Remark" value={getSafeString(data.FlatAlterationRemark)} />
                                                <FieldItem label="Approval Status" value={getSafeString(data.ApprovalStatus)} />
                                                <FieldItem label="Created By" value={getSafeString(data.CreatedBy)} />
                                                <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy(data.CreatedDate ?? '')} />
                                                <FieldItem label="Modified By" value={getSafeString(data.ModifiedBy)} />
                                                <FieldItem label="Modified Date" value={formatDate_dd_MonthName_yy(data.ModifiedDate ?? '')} />
                                            </div>
                                        </div>

                                        {index < flatAlterationList.length - 2 && (
                                            <hr className="my-6 border-gray-200" />
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    No flat alteration history found.
                                </div>
                            )}
                        </div>
                    }
                />

                <ExpandableCard
                    showline={false}
                    onClick={(isOpen) => {
                        if (isOpen) {
                            loadRefundedAmountDetailsHistory();
                        }
                    }}
                    title={
                        <div className="font-semibold text-lg pt-4 pb-4">
                            Refunded Amount Details History
                        </div>
                    }
                    child={
                        <div className="space-y-4">
                            {refundedAmountLedgerList.length > 0 ? (
                                refundedAmountLedgerList.map((data, index) => (
                                    <div
                                        key={data.RefundedAmountLedgerId || index}
                                        className="bg-white rounded-lg px-6 py-4 border border-gray-200"
                                    >
                                        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                            <div className="gap-6 text-sm text-gray-700">
                                                <FieldItem label="Refunded Amount" value={formatCurrency(data.RefundedAmount)} isRow />
                                                <FieldItem label="Payment Mode" value={getSafeString(data.PaymentMode ?? '-')} isRow />
                                            </div>
                                            <Button onClick={() => {
                                                navigate('/payTrack/view/addRefundDetails', { state: { refundData: data } });
                                            }}
                                                color="transparent"
                                                isborderRadius
                                                className="w-4 h-4"
                                            >
                                                <Edit size={18} />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm pt-5">

                                            <div className="space-y-3">
                                                <h3 className="font-semibold text-gray-900 mb-2">Developers Bank Details</h3>
                                                <FieldItem label="Account Number" value={getSafeString(data.ProjectAccountNumber ?? '-')} isRow={false} />
                                                <FieldItem label="Bank Name" value={getSafeString(data.ProjectBankName ?? '-')} isRow={false} />
                                                <FieldItem label="IFSC Code" value={getSafeString(data.ProjectIFSCCode ?? '-')} isRow={false} />
                                                <FieldItem label="Payment For" value={getSafeString(data.PaymentFor ?? '-')} isRow={false} />
                                            </div>

                                            <div className="space-y-3">
                                                <h3 className="font-semibold text-gray-900 mb-2">Customers Party Bank Details</h3>
                                                <FieldItem label="Account Holder" value={getSafeString(data.AccountHolderName ?? '-')} />
                                                <FieldItem label="Bank" value={getSafeString(data.BankName ?? '-')} />
                                                <FieldItem label="Transaction / Cheque / DD No" value={getSafeString(data.TransactionChequeDemandDraftNumber ?? '-')} urls={data.TransactionChequeDemandDraftURL} />
                                                <FieldItem label="Transaction / Cheque / DD Date" value={formatDate_dd_MonthName_yy(data.TransactionChequeDemandDraftDate ?? '') || '-'} />
                                                <FieldItem label="Transaction / Cheque / DD URL" value={data.TransactionChequeDemandDraftURL ? 'View Document' : '-'} urls={data.TransactionChequeDemandDraftURL} isIcon />
                                            </div>

                                            <div className="space-y-3">
                                                <h3 className="font-semibold text-gray-900 mb-2">Other Info</h3>

                                                <FieldItem
                                                    label="Request Date"
                                                    value={formatDate_dd_MonthName_yy(data.CreatedDate ?? '') || '-'}
                                                />
                                                <FieldItem label="Amount Type" value={getSafeString(data.AmountType ?? '-')} />
                                                <FieldItem label="Payment Type" value={getSafeString(data.PaymentType ?? '-')} />
                                                <FieldItem label="Created By" value={getSafeString(data.CreatedBy ?? '-')} />
                                                <FieldItem
                                                    label="Payment Receipt"
                                                    value={data.PaymentReceiptURL ? 'View Receipt' : '-'}
                                                    urls={data.PaymentReceiptURL}
                                                    isIcon
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-8 bg-gray-50">
                                    No refunded amount details history found.
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