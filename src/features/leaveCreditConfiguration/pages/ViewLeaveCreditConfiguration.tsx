import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type {
    LeaveCreditConfigurationData,
} from '@/features/leaveCreditConfiguration/models/leaveCreditConfiguration';

import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm, formatDate_dd_mm_yyyy } from '@/core/utils/dateFormat';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import { Loader } from '@/core/utils/loader';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';

const DEFAULT_LIST_STATE = {
    page: 1,
    filters: {},
    sortInfo: undefined,
    searchTerm: '',
};

const ViewLeaveCreditConfiguration: React.FC = () => {
    //#region LOADING STATE
    const [isLoading] = useState(false);
    const [loadingMessage] = useState('');
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
                searchTerm?: string
            };
        };
    };

    const navigate = useNavigate();
    //#endregion

    //#region PERMISSIONS
    const { canAction } = useMenuPermissions('/leaveCreditConfiguration');
    //#endregion

    //#region DATA
    const data =
        location.state?.editLeaveCreditConfigurationData ??
        location.state?.data ??
        null;

    const listState = location.state?.listState ?? DEFAULT_LIST_STATE;
    //#endregion

    //#region NO DATA HANDLE
    if (!data) return <div>No Leave Credit Configuration Data Found</div>;
    //endregion

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
        <div className="p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div />
            </Loader>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                <div className="space-y-6 pt-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* LEFT */}
                        <div className="space-y-4">
                            {/* DETAILS */}
                            <section className="rounded border border-gray-200">
                                <div className="px-4 py-2">
                                    <h4 className="font-semibold text-sm text-gray-800">
                                        Details
                                    </h4>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="grid grid-cols-2 gap-4 border-b pb-3">
                                        <FieldItem
                                            label="Period Mode"
                                            value={data.LeavePeriodMode || '-'}
                                        />
                                        <FieldItem
                                            label="Financial Year Start Date"
                                            value={data.FinancialYearStartDate ? formatDate_dd_mm_yyyy(data.FinancialYearStartDate) : '-'}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 border-b pb-3">
                                        <FieldItem
                                            label="Financial Year End Date"
                                            value={data.FinancialYearEndDate ? formatDate_dd_mm_yyyy(data.FinancialYearEndDate) : '-'}
                                        />
                                        <FieldItem
                                            label="Department"
                                            value={data.DepartmentName || '-'}
                                        />
                                    </div>

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
                            </section>

                            {/* ACTION DETAILS */}
                            <section className="rounded border border-gray-200">
                                <div className="px-4 py-2">
                                    <h4 className="font-semibold text-sm text-gray-800">
                                        Action Details
                                    </h4>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="grid grid-cols-2 gap-4 border-b pb-3">
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

                                    {data.ModifiedBy && (
                                        <div className="grid grid-cols-2 gap-4">
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
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* RIGHT */}
                        <div>
                            {data.LeaveBalanceType?.length > 0 && (
                                <section className="rounded border border-gray-200">
                                    <div className="px-4 py-2">
                                        <h4 className="font-semibold text-sm text-gray-800">
                                            Leave Balance Types
                                        </h4>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {data.LeaveBalanceType.map((item, index) => (
                                            <div
                                                key={index}
                                                className="grid grid-cols-2 gap-4 border-b pb-3 last:border-b-0"
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewLeaveCreditConfiguration;
