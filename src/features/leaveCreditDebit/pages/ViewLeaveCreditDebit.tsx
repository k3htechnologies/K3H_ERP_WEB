import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type {
    LeaveCreditDebitData,
    DeleteLeaveCreditDebitRequest,
} from '@/features/leaveCreditDebit/models/leaveCreditDebit';

import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { Button } from '@/ui/components/forms/Button';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { Loader } from '@/core/utils/loader';
import { leaveCreditDebitService } from '@/features/leaveCreditDebit/services/LeaveCreditDebitService';
import { runApiWithLoader } from '@/core/utils';
import useToast from '@/core/hooks/useToast';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import * as E from 'fp-ts/Either';

const DEFAULT_LIST_STATE = {
    page: 1,
    filters: {},
    sortInfo: undefined,
    searchTerm: '',
};

const ViewLeaveCreditDebit: React.FC = () => {
    //#region LOADING STATE
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] =
        useState(false);
    //#endregion

    //#region LOCATION & NAVIGATION
    const location = useLocation() as {
        state?: {
            editLeaveCreditDebitData?: LeaveCreditDebitData | null;
            data?: LeaveCreditDebitData | null;
            listState?: typeof DEFAULT_LIST_STATE;
        };
    };

    const navigate = useNavigate();
    //#endregion

    //#region PERMISSIONS
    const { canAction } = useMenuPermissions('/leaveCreditDebit');
    //#endregion

    //#region DATA
    const data =
        location.state?.editLeaveCreditDebitData ??
        location.state?.data ??
        null;

    const listState = location.state?.listState ?? DEFAULT_LIST_STATE;
    //#endregion

    const { addToast } = useToast();

    //#region EDIT HANDLER
    const handleEditLeaveCreditDebit = (row: LeaveCreditDebitData) => {
        if (!row?.LeaveCreditDebitId) return;

        navigate(`/leaveCreditDebit/add/${row.LeaveCreditDebitId}`, {
            state: {
                editLeaveCreditDebitData: row,
                fromList: true,
                listState,
            },
        });
    };
    //#endregion

    //#region BACK HANDLER
    const handleBackToListLeaveCreditDebit = () => {
        navigate('/leaveCreditDebit', {
            state: {
                listState,
            },
        });
    };
    //#endregion

    //#region DELETE HANDLER
    const handleDeleteLeaveCreditDebit = async () => {
        if (!data?.LeaveCreditDebitId || !data?.Uniquekey) return;

        const payload: DeleteLeaveCreditDebitRequest = {
            LeaveCreditDebitId: data.LeaveCreditDebitId,
            Uniquekey: data.Uniquekey,
        };

        setIsDeleting(true);

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const response =
                    await leaveCreditDebitService.apiCallDeleteLeaveCreditDebit(
                        payload
                    );

                if (E.isRight(response)) {
                    addToast({
                        type: 'success',
                        title:
                            response.right.SuccessMessage?.[0] ||
                            'Deleted successfully',
                    });

                    handleBackToListLeaveCreditDebit();
                } else {
                    addToast({
                        type: 'error',
                        title: response.left.message || 'Delete failed',
                    });
                }

                return response;
            },
            undefined,
            (error: any) =>
                addToast({
                    type: 'error',
                    title: error?.message || 'Delete failed',
                }),
            undefined,
            'Deleting Leave Credit / Debit'
        );

        setIsDeleting(false);
    };
    //#endregion

    //#region NO DATA
    if (!data) {
        return (
            <div className="p-6">
                <div className="bg-white border border-gray-200 rounded p-6 shadow-sm text-center">
                    <p className="text-gray-600 mb-4">
                        No record to view.
                    </p>
                    <Button
                        onClick={handleBackToListLeaveCreditDebit}
                        color="blue"
                        size="sm"
                    >
                        Back
                    </Button>
                </div>
            </div>
        );
    }
    //#endregion

    return (
        <div className="p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div />
            </Loader>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* ================= HEADER ================= */}
                <HeaderActionBar
                    titleText="Leave Credit / Debit"
                    cancelText="Cancel"
                    EditText="Edit"
                    isLoading={isLoading}
                    canAction={canAction}
                    onCancel={handleBackToListLeaveCreditDebit}
                    onEdit={() => handleEditLeaveCreditDebit(data)}
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
                                            label="Month"
                                            value={data.Month || '-'}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 border-b pb-3">
                                        <FieldItem
                                            label="Financial Year"
                                            value={
                                                data.FYyear && data.FYyear > 0
                                                    ? data.FYyear.toString()
                                                    : '-'
                                            }
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

            {/* ================= DELETE CONFIRMATION ================= */}
            <ConfirmationDialogBox
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => setIsConfirmationDialogBoxOpen(false)}
                onConfirm={() => {
                    setIsConfirmationDialogBoxOpen(false);
                    void handleDeleteLeaveCreditDebit();
                }}
                title="You are about to delete Leave Credit / Debit"
                message="Are you sure you want to delete Leave Credit Debit?"
                confirmText="Delete"
                cancelText="Cancel"
                loading={isDeleting}
                variant="danger"
            />
        </div>
    );
};

export default ViewLeaveCreditDebit;
