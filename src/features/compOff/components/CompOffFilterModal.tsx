import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { DatePickerInput } from '@/ui/components/forms/Datepicker';
import type { FilterInfo } from '@/ui/components/DataTable/DataTable';

interface CompOffFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: () => void;
    onClear: () => void;
    tempFilters: FilterInfo;
    onFilterChange: (key: string, value: string) => void;
}

export const CompOffFilterModal: React.FC<CompOffFilterModalProps> = ({
    isOpen,
    onClose,
    onApply,
    onClear,
    tempFilters,
    onFilterChange,
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Filter - Comp Off"
            onSubmit={(e) => {
                e.preventDefault();
                onApply();
            }}
            saveText="Apply"
            cancelText="Clear"
            onCancel={onClear}
            size="small-half"
        >
            <div className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <DatePickerInput
                            label="Start Date"
                            value={tempFilters.StartDate || ''}
                            onChange={(value) => onFilterChange('StartDate', value || '')}
                        />
                    </div>
                    <div>
                        <DatePickerInput
                            label="End Date"
                            value={tempFilters.EndDate || ''}
                            onChange={(value) => onFilterChange('EndDate', value || '')}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
};






