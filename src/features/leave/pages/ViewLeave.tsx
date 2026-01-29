import React, { useEffect, useState, useCallback } from 'react';
import { Loader } from '@/core/utils/loader';
import { useNavigate, useParams } from 'react-router-dom';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import type { LeaveData, FilterWithPaginationLeaveRequest } from '@/features/leave/models/LeaveModel';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import { FileText } from 'lucide-react';
import { LeaveService } from '@/features/leave/services/LeaveService';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { useLeaveListState } from '@/features/leave/context/LeaveListStateContext';

export const ViewLeave: React.FC = () => {

    //#region STATE MANAGEMENT
    const [leaveData, setLeaveData] = useState<LeaveData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    //LOCATION
    const navigate = useNavigate();

    //GET VALUE FROM URL :ID
    const { id } = useParams<{ id?: string }>();

    // TOAST
    const { addToast } = useToast();

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/leave');
    //#endregion

    //#region LEAVE LIST STATE CONTEXT
    const { listState } = useLeaveListState();
    const { leaveId } = listState;
    //#endregion

    //#endregion

    //#region FETCH LEAVE DETAILS
    const loadLeaveFromServer = useCallback(async () => {
        const targetLeaveId = leaveId || (id ? Number(id) : 0);
        if (!targetLeaveId) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationLeaveRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    LeaveId: targetLeaveId
                };

                const response = await LeaveService.apiCallPullLeave(params);

                if (E.isRight(response)) {
                    setLeaveData(response.right.Data?.[0] ?? null);
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
            'Loading Leave Data'
        );
    }, [leaveId, id, addToast]);
    //#endregion

    //#region INITIALIZATION
    useEffect(() => {
        loadLeaveFromServer();
    }, [loadLeaveFromServer]);
    //#endregion

    //#region NO DATA HANDLE
    if (!leaveData) {
        return (
            <div className="p-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="text-center py-8">
                        <p className="text-gray-500">No Leave Data Found</p>
                    </div>
                </div>
            </div>
        );
    }
    //#endregion

    //#region BACK VIEW LEAVE PAGE TO TABLE LEAVE
    const handleBackToListLeave = () => {
        navigate('/leave');
    };
    //#endregion

    //#region EDIT LEAVE
    const handleEditLeave = () => {
        if (!leaveData?.LeaveId) return;
        navigate(`/leave/add/${leaveData.LeaveId}`);
    };
    //#endregion

    //#region RENDER 
    return (
        <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <Loader loading={isLoading} title={loadingMessage}>
                    <div />
                </Loader>
                <HeaderActionBar
                    titleText="Leave Details"
                    onCancel={handleBackToListLeave}
                    onEdit={canAction ? handleEditLeave : undefined}
                    canAction={canAction}
                />

                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="mt-6 rounded border border-gray-200">
                                <div className="px-4 py-2">
                                    <h4 className="font-semibold text-sm text-gray-800">Details</h4>
                                </div>
                                <div className="p-4 space-y-2">
                                    <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                                        <FieldItem label="Leave Type" value={leaveData.LeaveType || '-'} isRow={false} />
                                        <FieldItem label="Leave Type Code" value={leaveData.LeaveTypeCode || '-'} isRow={false} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                                        <FieldItem label="Start Date" value={formatDate_dd_mm_yyyy(leaveData.StartDate)} isRow={false} />
                                        <FieldItem label="End Date" value={formatDate_dd_mm_yyyy(leaveData.EndDate)} isRow={false} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                                        <FieldItem label="Start Duration" value={leaveData.StartDateLeaveDuration || '-'} isRow={false} />
                                        <FieldItem label="End Duration" value={leaveData.EndDateLeaveDuration || '-'} isRow={false} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                                        <FieldItem label="No Of Days" value={leaveData.NoOfDays?.toString() || '0'} isRow={false} />
                                        <FieldItem label="Document URL" value={leaveData.LeaveDocumentURL || '-'} isRow={false} />
                                    </div>
                                    <div className="pb-3 border-b border-gray-200 last:border-b-0">
                                        <FieldItem label="Reason" value={leaveData.Reason || '-'} isRow={false} />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 rounded border border-gray-200">
                                <div className="px-4 py-2">
                                    <h4 className="font-semibold text-sm text-gray-800">Action Details</h4>
                                </div>
                                <div className="p-4 space-y-2">
                                    <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                                        <FieldItem label="Created By" value={leaveData.CreatedBy || '-'} isRow={false} />
                                        <FieldItem
                                            label="Created Date"
                                            value={formatDate_dd_MonthName_yy_hh_mm(leaveData.CreatedDate || '-')}
                                            isRow={false}
                                        />
                                    </div>
                                    {leaveData.ModifiedBy ? (
                                        <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                                            <FieldItem label="Modified By" value={leaveData.ModifiedBy ?? '-'} isRow={false} />
                                            <FieldItem
                                                label="Modified Date"
                                                value={formatDate_dd_MonthName_yy_hh_mm(leaveData.ModifiedDate || '-')}
                                                isRow={false}
                                            />
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {leaveData.LeaveDocumentURL ? (
                                <div className="mt-6 rounded border border-gray-200">
                                    <div className="px-4 py-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-700" />
                                        <h4 className="font-semibold text-sm text-gray-800">Leave Document</h4>
                                    </div>
                                    <div className="p-4">
                                        <a
                                            href={leaveData.LeaveDocumentURL}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 hover:text-blue-800 break-all"
                                        >
                                            {leaveData.LeaveDocumentURL}
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-6 rounded border border-gray-200">
                                    <div className="px-4 py-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-700" />
                                        <h4 className="font-semibold text-sm text-gray-800">Leave Document</h4>
                                    </div>
                                    <div className="p-4 text-gray-500 text-sm">No document uploaded.</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ViewLeave
