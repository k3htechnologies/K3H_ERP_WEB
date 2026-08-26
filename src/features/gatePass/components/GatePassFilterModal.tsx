import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import type { FilterInfo } from '@/ui/components/DataTable/DataTable';
import DatePickerInput from '@/ui/components/forms/Datepicker';

interface FilterField {
    key: string;
    label: string;
    placeholder?: string;
    type?: 'text';
    maxLength?: number
}

interface GatePassFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: () => void;
    onClear: () => void;
    tempFilters: FilterInfo;
    onFilterChange: (key: string, value: string) => void;
    filterFields?: FilterField[];
}

export const GatePassFilterModal: React.FC<GatePassFilterModalProps> = ({
    isOpen,
    onClose,
    onApply,
    onClear,
    tempFilters,
    onFilterChange,
    filterFields = [
        { key: 'FullName', label: 'Visitor Name', placeholder: 'Enter Visitor Name', maxLength: 250 },
        { key: 'MobileNumber', label: 'Mobile Number', placeholder: 'Enter Mobile Number', maxLength: 10 },
        { key: 'Address', label: 'Address', placeholder: 'Enter Address', maxLength: 250 },
        { key: 'Purpose', label: 'Purpose', placeholder: 'Enter Purpose', maxLength: 250 },
        { key: 'EmployeeName', label: 'Appointment With', placeholder: 'Enter Appointment With', maxLength: 250 },

    ]
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Filter - Gate Pass"
            onSubmit={(e) => {
                e.preventDefault();
                onApply();
            }}
            saveText="Apply"
            onCancel={onClear}

            cancelText="Clear"
            size="small-half"
        >
            <div className="space-y-6">
                {filterFields.map((field) => (
                    <div key={field.key} className="mb-5">
                        <Input
                            label={field.label}
                            type={field.type}
                            value={tempFilters[field.key] ?? ''}
                            onChange={(e) => onFilterChange(field.key, e.target.value)}
                            placeholder={field.placeholder || ''}
                            maxLength={field.maxLength}
                        />
                    </div>
                ))}
            </div>
            <div>
                <DatePickerInput
                    label='From Date'
                    value={tempFilters.FromDate || ''}
                    onChange={value => onFilterChange('FromDate', value || '')}
                    placeholder="Select From Date"
                />
            </div>

            <div>
                <DatePickerInput
                    label='To Date'
                    value={tempFilters.ToDate || ''}
                    onChange={value => onFilterChange('ToDate', value || '')}
                    placeholder="Select To Date"
                />
            </div>
        </Modal>
    );
};
