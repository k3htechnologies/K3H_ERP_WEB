import React, { useEffect, useState } from 'react';
import { DateRangePickerModal } from '@/ui/components/forms/DateRangePickerModel';
import { DateInput } from '@/ui/components/forms/DateInput';
import { TextArea } from '@/ui/components/forms/Textarea';
import {
    convert_dd_mm_yyyy_To_Yyyy_mm_dd,
    formatDate_dd_mm_yyyy,
    convert_yy_mm_dd_tt_mm_To_Yyyy_mm_dd,
} from '@/core/utils/dateFormat';
import type { AddUpdateCompOff, PullCompOffDatesRequest } from '@/features/compOff/models/compOff';
import { compOffService } from '@/features/compOff/services/CompOffServices';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import * as E from 'fp-ts/Either';

interface CompOffFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (startDate: string | null, endDate: string | null) => void;
    onReset: () => void;
    formData: AddUpdateCompOff;
    onFieldChange: (field: keyof AddUpdateCompOff, value: any) => void;
    errors: { [k: string]: string };
    editingData: any;
    loading: boolean;
    modalKey: number;
    filterStartDate?: string | null; // StartDate from DateRangeSelector filter
    filterEndDate?: string | null;   // EndDate from DateRangeSelector filter
}

export const CompOffFormModal: React.FC<CompOffFormModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    onReset,
    formData,
    onFieldChange,
    errors,
    editingData,
    loading,
    modalKey,
    filterStartDate,
    filterEndDate,
}) => {
    const [allowedDates, setAllowedDates] = useState<string[]>([]);
    const [, setIsLoadingDates] = useState(false);

    const fetchCompOffDates = (monthStart: string, monthEnd: string, abortController: AbortController) => {
        setIsLoadingDates(true);

        const employeeData = LocalStorageHelper.getStoredEmployeeData();
        const params: PullCompOffDatesRequest = {
            PageSize: 1000,
            PageNumber: 1,
            EmployeeId: employeeData?.EmployeeId,
            StartDate: monthStart,
            EndDate: monthEnd,
        };

        compOffService.apiCallPullCompOffDates(params, { signal: abortController.signal })
            .then((response) => {
                if (E.isRight(response)) {
                    const dates = (response.right.Data || [])
                        .map(item => {
                            if (item?.AttendanceDate) {
                                return convert_yy_mm_dd_tt_mm_To_Yyyy_mm_dd(item.AttendanceDate);
                            }
                            return null;
                        })
                        .filter((date): date is string => date !== null && date !== '');

                    setAllowedDates(dates);
                }
                setIsLoadingDates(false);
            })
            .catch(() => {
                setIsLoadingDates(false);
            });
    };

    // Handle month change from DateRangePickerModal
    const handleMonthChange = (monthStart: string, monthEnd: string) => {
        const abortController = new AbortController();
        fetchCompOffDates(monthStart, monthEnd, abortController);
    };

    useEffect(() => {
        if (isOpen && !editingData) {
            // Only fetch dates when adding (not editing)
            const abortController = new AbortController();

            let monthStart: string;
            let monthEnd: string;

            if (filterStartDate && filterEndDate) {
                // Use filter dates from DateRangeSelector
                monthStart = filterStartDate;
                monthEnd = filterEndDate;
            } else {
                // Fallback to current month's start and end dates
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth();
                monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
                const lastDay = new Date(year, month + 1, 0).getDate();
                monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
            }

            fetchCompOffDates(monthStart, monthEnd, abortController);

            return () => {
                abortController.abort();
            };
        } else if (isOpen && editingData) {
            // Clear allowed dates when editing (allow any date)
            setAllowedDates([]);
        }
    }, [isOpen, editingData, filterStartDate, filterEndDate]);

    return (
        <DateRangePickerModal
            key={modalKey}
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            onReset={onReset}
            title={editingData ? 'Update Comp Off' : 'Add Comp Off'}
            startDate={formData.WorkingDate || null}
            endDate={formData.CompOffDate || null}
            showTimePicker={false}
            confirmText="Save"
            cancelText=""
            loading={loading}
            showSummary={false}
            allowedDates={allowedDates}
            onMonthChange={handleMonthChange}
            renderChildren={({ startDate, endDate, onClearField, editingField, onUpdateDate }) => {
                return (
                    <div className="space-y-4">
                        <DateInput
                            label="Working Date"
                            required
                            value={startDate ? formatDate_dd_mm_yyyy(startDate) : null}
                            onChange={(value) => {
                                const converted = convert_dd_mm_yyyy_To_Yyyy_mm_dd(value);
                                if (converted !== null) {
                                    onUpdateDate?.('start', converted);
                                    onFieldChange('WorkingDate', converted);
                                } else {
                                    onClearField?.('start');
                                    onFieldChange('WorkingDate', null);
                                }
                            }}
                            onClear={() => {
                                onClearField?.('start');
                                onFieldChange('WorkingDate', null);
                            }}
                            isActive={editingField === 'start'}
                            error={errors.WorkingDate}
                            showClearButton={true}
                            openCalendarOnClick={false}
                        />
                        <DateInput
                            label="Comp Off Date"
                            required
                            value={endDate ? formatDate_dd_mm_yyyy(endDate) : null}
                            onChange={(value) => {
                                const converted = convert_dd_mm_yyyy_To_Yyyy_mm_dd(value);
                                if (converted !== null) {
                                    onUpdateDate?.('end', converted);
                                    onFieldChange('CompOffDate', converted);
                                } else {
                                    onClearField?.('end');
                                    onFieldChange('CompOffDate', null);
                                }
                            }}
                            onClear={() => {
                                onClearField?.('end');
                                onFieldChange('CompOffDate', null);
                            }}
                            isActive={editingField === 'end'}
                            error={errors.CompOffDate}
                            showClearButton={true}
                            openCalendarOnClick={false}
                        />
                        <TextArea
                            label="Reason"
                            required
                            value={formData.Reason || ''}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onFieldChange('Reason', e.target.value)}
                            error={errors.Reason}
                            placeholder="Enter Reason"
                            rows={3}
                        />
                    </div>
                );
            }}
        />
    );
};

