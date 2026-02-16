import React, { useEffect, useState, useCallback } from 'react';
import { Loader } from '@/core/utils/loader';
import { useNavigate, useParams } from 'react-router-dom';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import type { LeaveData, FilterWithPaginationLeaveRequest } from '@/features/leave/models/LeaveModel';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import { LeaveService } from '@/features/leave/services/LeaveService';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { useLeaveListState } from '@/features/leave/context/LeaveListStateContext';
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import { MultiImageViewer } from '@/ui/components/ImageViewer/ImageViewer';

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

    //#region BACK VIEW LEAVE PAGE TO TABLE LEAVE
    const handleBackToListLeave = useCallback(() => {
        navigate('/leave');
    }, [navigate]);
    //#endregion

    //#region EDIT LEAVE
    const handleEditLeave = useCallback(() => {
        if (!leaveData?.LeaveId) return;
        navigate(`/leave/add/${leaveData.LeaveId}`);
    }, [leaveData, navigate]);
    //#endregion

    //#region INITIALIZATION
    useEffect(() => {
        loadLeaveFromServer();
    }, [loadLeaveFromServer]);
    //#endregion

    //#region NO DATA HANDLE
    if (!leaveData) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
                <Loader loading={isLoading} title={loadingMessage}>
                    <div></div>
                </Loader>
                <HeaderActionBar
                    titleText={'Leave Details : '}
                    subTitleText={''}
                    cancelText="Cancel"
                    onCancel={handleBackToListLeave}
                    canAction={false}
                    isLoading={isLoading}
                />
                <div className="text-center py-8">
                    <p className="text-gray-500">No Leave Data Found</p>
                </div>
            </div>
        );
    }
    //#endregion

    //#region RENDER 
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <HeaderActionBar
                titleText={'Leave Details : '}
                subTitleText={leaveData.LeaveType ?? ''}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={handleBackToListLeave}
                canAction={canAction}
                onEdit={handleEditLeave}
                isLoading={isLoading}
            />

            {leaveData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">
                    {/* ================= LEFT SIDE (2/3) ================= */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* ================= LEAVE INFORMATION ================= */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Leave Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Leave Type" value={leaveData.LeaveType || '-'} />
                                        <FieldItem label="Leave Type Code" value={leaveData.LeaveTypeCode || '-'} />
                                        <FieldItem label="No Of Days" value={leaveData.NoOfDays?.toString() || '0'} />
                                    </div>
                                </div>

                                <div className="lg:col-span-3 pb-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Start Date" value={formatDate_dd_mm_yyyy(leaveData.StartDate)} />
                                        <FieldItem label="End Date" value={formatDate_dd_mm_yyyy(leaveData.EndDate)} />
                                        <FieldItem label="Start Duration" value={leaveData.StartDateLeaveDuration || '-'} />
                                    </div>
                                </div>

                                <div className="lg:col-span-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="End Duration" value={leaveData.EndDateLeaveDuration || '-'} />
                                        <FieldItem
                                            label="Leave Documents"
                                            value={
                                                leaveData.LeaveDocumentURL ? (() => {
                                                    const documentUrls = parseDocumentUrls(leaveData.LeaveDocumentURL);
                                                    return (
                                                        <MultiImageViewer
                                                            images={documentUrls}
                                                            title="Leave Documents"
                                                            isIcon={true}
                                                            triggerLabel={
                                                                <span className="flex items-center gap-2 text-sm font-medium">
                                                                    {documentUrls.length > 1 ? `View ${documentUrls.length} Documents` : 'View Document'}
                                                                </span>
                                                            }
                                                        />
                                                    );
                                                })() : (
                                                    <span className="text-gray-400 italic">No document uploaded</span>
                                                )
                                            }
                                            isRow={false}
                                        />
                                    </div>
                                </div>

                                {leaveData.Reason && (
                                    <div className="lg:col-span-3 pt-3">
                                        <FieldItem label="Reason" value={leaveData.Reason} />
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* ================= RIGHT SIDE (1/3) ================= */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* ================= ACTION DETAILS ================= */}
                        <section className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Action Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Created By" value={leaveData.CreatedBy || '-'} />
                                        <FieldItem
                                            label="Created Date"
                                            value={
                                                leaveData.CreatedDate
                                                    ? formatDate_dd_MonthName_yy_hh_mm(leaveData.CreatedDate)
                                                    : "-"
                                            }
                                        />
                                    </div>
                                </div>

                                {leaveData.ModifiedBy && (
                                    <div className="lg:col-span-3 pt-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                            <FieldItem label="Modified By" value={leaveData.ModifiedBy || '-'} />
                                            <FieldItem
                                                label="Modified Date"
                                                value={
                                                    leaveData.ModifiedDate
                                                        ? formatDate_dd_MonthName_yy_hh_mm(leaveData.ModifiedDate)
                                                        : "-"
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ViewLeave
