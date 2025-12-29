import React, { useState } from 'react';
import { Loader } from '@/core/utils/loader';
import { useLocation, useNavigate } from 'react-router-dom';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import type { LeaveData } from '@/features/leave/models/LeaveModel';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import { FileText } from 'lucide-react';

export const ViewLeave: React.FC = () => {

    //#region STATE MANAGEMENT
    const [isLoading] = useState(false);
    const [loadingMessage] = useState('');

    //LOCATION
    const navigate = useNavigate();

    const location = useLocation() as {
        state?: {
            editLeaveData?: LeaveData | null;
            fromList?: boolean;
            listState?: {
                page: number;
                filters: any;
                sortInfo?: any;
                searchTerm?: string;
            };
        };
    };
    const preservedListState = location.state?.listState;

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/leave');
    //#endregion


    //#region Get LEAVE DATA FROM LOCATION STATE
    const editLeaveData = (location.state?.editLeaveData ?? null) as LeaveData | null;
    //#endregion

    //#endregion

    //#region NO DATA HANDLE
    if (!editLeaveData) return <div>No Leave Data Found</div>;
    //#endregion

    //#region BACK VIEW LEAVE PAGE TO TABLE LEAVE
    const handleBackToListLeave = () => {
        navigate('/leave', {
            state: { listState: preservedListState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '' } }
        });
    };
    //#endregion

    //#region EDIT LEAVE
    const handleEditLeave = () => {
        if (!editLeaveData?.LeaveId) return;
        navigate(`/leave/add/${editLeaveData.LeaveId}`, {
            state: {
                data: editLeaveData,
                fromList: true,
                listState: preservedListState ?? {
                    page: 1,
                    filters: {},
                    sortInfo: undefined,
                    searchTerm: ''
                }
            },
        });
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
                                        <FieldItem label="Leave Type" value={editLeaveData.LeaveType || '-'} isRow={false} />
                                        <FieldItem label="Leave Type Code" value={editLeaveData.LeaveTypeCode || '-'} isRow={false} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                                        <FieldItem label="Start Date" value={formatDate_dd_mm_yyyy(editLeaveData.StartDate)} isRow={false} />
                                        <FieldItem label="End Date" value={formatDate_dd_mm_yyyy(editLeaveData.EndDate)} isRow={false} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                                        <FieldItem label="Start Duration" value={editLeaveData.StartDateLeaveDuration || '-'} isRow={false} />
                                        <FieldItem label="End Duration" value={editLeaveData.EndDateLeaveDuration || '-'} isRow={false} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                                        <FieldItem label="No Of Days" value={editLeaveData.NoOfDays?.toString() || '0'} isRow={false} />
                                        <FieldItem label="Document URL" value={editLeaveData.LeaveDocumentURL || '-'} isRow={false} />
                                    </div>
                                    <div className="pb-3 border-b border-gray-200 last:border-b-0">
                                        <FieldItem label="Reason" value={editLeaveData.Reason || '-'} isRow={false} />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 rounded border border-gray-200">
                                <div className="px-4 py-2">
                                    <h4 className="font-semibold text-sm text-gray-800">Action Details</h4>
                                </div>
                                <div className="p-4 space-y-2">
                                    <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                                        <FieldItem label="Created By" value={editLeaveData.CreatedBy || '-'} isRow={false} />
                                        <FieldItem
                                            label="Created Date"
                                            value={formatDate_dd_MonthName_yy_hh_mm(editLeaveData.CreatedDate || '-')}
                                            isRow={false}
                                        />
                                    </div>
                                    {editLeaveData.ModifiedBy ? (
                                        <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                                            <FieldItem label="Modified By" value={editLeaveData.ModifiedBy ?? '-'} isRow={false} />
                                            <FieldItem
                                                label="Modified Date"
                                                value={formatDate_dd_MonthName_yy_hh_mm(editLeaveData.ModifiedDate || '-')}
                                                isRow={false}
                                            />
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {editLeaveData.LeaveDocumentURL ? (
                                <div className="mt-6 rounded border border-gray-200">
                                    <div className="px-4 py-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-700" />
                                        <h4 className="font-semibold text-sm text-gray-800">Leave Document</h4>
                                    </div>
                                    <div className="p-4">
                                        <a
                                            href={editLeaveData.LeaveDocumentURL}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 hover:text-blue-800 break-all"
                                        >
                                            {editLeaveData.LeaveDocumentURL}
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
