import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type {
    LeaveCreditConfigurationData,
    FilterWithPaginationLeaveCreditConfigurationRequest,
} from '@/features/leaveCreditConfiguration/models/LeaveCreditConfigurationModel';
import { leaveCreditConfigurationService } from '@/features/leaveCreditConfiguration/services/LeaveCreditConfigurationService';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm, formatDate_dd_mm_yyyy } from '@/core/utils/dateFormat';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import { Loader } from '@/core/utils/loader';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { runApiWithLoader } from '@/core/utils/apiLoaderHelper';
import * as E from 'fp-ts/Either';
import useToast from '@/core/hooks/useToast';
import NoDataView from '@/ui/components/NoDataView/NoDataView';

const DEFAULT_LIST_STATE = {
    page: 1,
    filters: {},
    sortInfo: undefined,
    searchTerm: '',
};

const ViewLeaveCreditConfiguration: React.FC = () => {
    //#region STATE MANAGEMENT
    const [leaveCreditConfigurationData, setLeaveCreditConfigurationData] = useState<LeaveCreditConfigurationData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    //#endregion

    //#region LOCATION & NAVIGATION
    const location = useLocation() as {
        state?: {
            editLeaveCreditConfigurationData?: LeaveCreditConfigurationData | null;
            data?: LeaveCreditConfigurationData | null;
            listState?: {
                page: number;
                filters: any;
                sortInfo?: any;
                searchTerm?: string;
                LeaveCreditConfigurationId?: number;
            };
        };
    };

    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    //#endregion

    //#region PERMISSIONS
    const { canAction } = useMenuPermissions('/leaveCreditConfiguration');
    //#endregion

    //#region TOAST
    const { addToast } = useToast();
    //#endregion

    //#region LIST STATE
    const listState = location.state?.listState ?? DEFAULT_LIST_STATE;
    //#endregion

    //#region DATA LOADING | FETCH | LOAD LEAVE CREDIT CONFIGURATION
    const loadLeaveCreditConfiguration = useCallback(async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationLeaveCreditConfigurationRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    IsCheckPermission: false,
                    LeaveCreditConfigurationId: Number(id) || 0,
                };

                const response = await leaveCreditConfigurationService.apiCallPullLeaveCreditConfiguration(params);

                if (E.isRight(response)) {
                    const dataList = Array.isArray(response.right.Data) ? response.right.Data : [];
                    if (dataList.length > 0) {
                        setLeaveCreditConfigurationData(dataList[0]);
                    } else {
                        addToast({ type: 'error', title: 'Leave Credit Configuration not found' });
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
            'Loading Leave Credit Configuration'
        );
    }, [id, addToast]);
    //#endregion

    //#region INIT
    useEffect(() => {
        // Check if data is passed via location state first
        const stateData = location.state?.editLeaveCreditConfigurationData ?? location.state?.data;
        
        if (stateData) {
            setLeaveCreditConfigurationData(stateData);
        } else if (id) {
            // If no state data but we have an ID, fetch from API
            loadLeaveCreditConfiguration();
        }
    }, [id, location.state, loadLeaveCreditConfiguration]);
    //#endregion

    //#region DATA
    const data = leaveCreditConfigurationData;
    //#endregion

    //#region NO DATA HANDLE
    if (!data) {
        return (
            <div className="p-6">
                <NoDataView message="No Leave Credit Configuration Data Found" />
            </div>
        );
    }
    //#endregion

    //#region EDIT HANDLER
    const handleEditLeaveCreditConfiguration = (row: LeaveCreditConfigurationData) => {
        if (!row?.LeaveCreditConfigurationId) return;

        navigate(`/leaveCreditConfiguration/add/${row.LeaveCreditConfigurationId}`, {
            state: {
                editLeaveCreditConfigurationData: row,
                fromList: true,
                listState,
            },
        });
    };
    //#endregion

    //#region BACK HANDLER
    const handleBackToListLeaveCreditConfiguration = () => {
        navigate('/leaveCreditConfiguration', {
            state: {
                listState,
            },
        });
    };
    //#endregion

    //#region RENDER
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div />
            </Loader>

            {/* ================= HEADER ================= */}
            <HeaderActionBar
                titleText="Leave Credit Configuration"
                cancelText="Cancel"
                EditText="Edit"
                isLoading={isLoading}
                canAction={canAction}
                onCancel={handleBackToListLeaveCreditConfiguration}
                onEdit={() => handleEditLeaveCreditConfiguration(data)}
            />

            {/* ================= CONTENT ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">
                {/* ================= LEFT SIDE (2/3) ================= */}
                <div className="lg:col-span-2 space-y-6">
                    {/* ================= LEAVE CREDIT CONFIGURATION DETAILS ================= */}
                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
                            <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem
                                        label="Period Mode"
                                        value={data.LeavePeriodMode || '-'}
                                    />
                                    <FieldItem
                                        label="Financial Year Start Date"
                                        value={data.FinancialYearStartDate ? formatDate_dd_mm_yyyy(data.FinancialYearStartDate) : '-'}
                                    />
                                    <FieldItem
                                        label="Financial Year End Date"
                                        value={data.FinancialYearEndDate ? formatDate_dd_mm_yyyy(data.FinancialYearEndDate) : '-'}
                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem
                                        label="Department"
                                        value={data.DepartmentName || '-'}
                                    />
                                    <FieldItem
                                        label="Designation"
                                        value={
                                            data.DesignationName
                                                ? data.DesignationName
                                                    .split(',')
                                                    .map(d => d.trim())
                                                    .join(', ')
                                                : '-'
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ================= LEAVE BALANCE TYPES ================= */}
                    {data.LeaveBalanceType?.length > 0 && (
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Leave Balance Types
                            </h4>
                            <div className="space-y-3">
                                {data.LeaveBalanceType.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${index < data.LeaveBalanceType.length - 1 ? 'border-b border-[#135bec2e] pb-3' : ''}`}
                                    >
                                        <FieldItem
                                            label="Leave Type Name"
                                            value={item.LeaveTypeName || '-'}
                                        />
                                        <FieldItem
                                            label="Leave Credit"
                                            value={
                                                item.LeaveCredit && item.LeaveCredit > 0
                                                    ? item.LeaveCredit.toString()
                                                    : '-'
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
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
                                    <FieldItem
                                        label="Created By"
                                        value={data.CreatedBy || '-'}
                                    />
                                    <FieldItem
                                        label="Created Date"
                                        value={formatDate_dd_MonthName_yy_hh_mm(
                                            data.CreatedDate || '-'
                                        )}
                                    />
                                </div>
                            </div>

                            {data.ModifiedBy && (
                                <div className="lg:col-span-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem
                                            label="Modified By"
                                            value={data.ModifiedBy}
                                        />
                                        <FieldItem
                                            label="Modified Date"
                                            value={formatDate_dd_MonthName_yy_hh_mm(
                                                data.ModifiedDate || '-'
                                            )}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ViewLeaveCreditConfiguration;
