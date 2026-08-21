import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import type { FilterInfo } from '@/ui/components/DataTable/DataTable';

interface FilterField {
    key: string;
    label: string;
    placeholder?: string;
    type?: 'text';
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
        { key: 'FullName', label: 'Full Name', placeholder: 'Enter Full Name' },
        { key: 'MobileNumber', label: 'Mobile Number', placeholder: 'Enter Mobile Number' },
        { key: 'Address', label: 'Address', placeholder: 'Enter Address' },
        { key: 'Purpose', label: 'Purpose', placeholder: 'Enter Purpose' },
        { key: 'EmployeeName', label: 'Employee Name', placeholder: 'Enter Employee Name' },

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
                        />
                    </div>
                ))}
            </div>
        </Modal>
    );
};
