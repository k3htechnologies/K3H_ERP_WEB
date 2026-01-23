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

interface WeekOffMappingMasterFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
  tempFilters: FilterInfo;
  onFilterChange: (key: string, value: string) => void;
  filterFields?: FilterField[];
}

export const WeekOffMappingMasterFilterModal: React.FC<WeekOffMappingMasterFilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  onClear,
  tempFilters,
  onFilterChange,
  filterFields = [
    { key: 'WeekOffPolicyName', label: 'Weekoff Policy Name', placeholder: 'Enter Weekoff Policy Name' },
    { key: 'DepartmentName', label: 'Department Name', placeholder: 'Enter Department Name' },
    { key: 'EmployeeName', label: 'Employee Name', placeholder: 'Enter Employee Name' },
  ]
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Filter - Week Off Mapping Master"
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
