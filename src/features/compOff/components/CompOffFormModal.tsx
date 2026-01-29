import React from 'react';
import { DateRangePickerModal } from '@/ui/components/forms/DateRangePickerModel';
import { DateInput } from '@/ui/components/forms/DateInput';
import { TextArea } from '@/ui/components/forms/Textarea';
import {
    convert_dd_mm_yyyy_To_Yyyy_mm_dd,
    formatDate_dd_mm_yyyy,
} from '@/core/utils/dateFormat';
import type { AddUpdateCompOff } from '@/features/compOff/models/compOff';

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
}) => {
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
            renderChildren={({ startDate, endDate, onSelectField, onClearField, editingField, onUpdateDate }) => {
                return (
                    <div className="space-y-4">
                        <DateInput
                            label="Working Date"
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

