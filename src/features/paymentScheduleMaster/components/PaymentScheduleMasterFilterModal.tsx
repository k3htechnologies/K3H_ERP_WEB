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

interface PaymentScheduleMasterFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
  tempFilters: FilterInfo;
  onFilterChange: (key: string, value: string) => void;
  filterFields?: FilterField[];
}

export const PaymentScheduleMasterFilterModal: React.FC<PaymentScheduleMasterFilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  onClear,
  tempFilters,
  onFilterChange,
  filterFields = [
    { key: 'Type', label: 'Type', placeholder: 'Enter Type' }
  ]
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Filter - Payment Schedule Master"
      onSubmit={e => {
        e.preventDefault();
        onApply();
      }}
      saveText="Apply "
      onCancel={onClear}
      cancelText="Clear"
      size="small-half"
    >
      <div className="space-y-6">
        {filterFields.map(field => (
          <div key={field.key} className="mb-5">
            <Input
              label={field.label}
              type={field.type}
              value={tempFilters[field.key] ?? ''}
              onChange={e => onFilterChange(field.key, e.target.value)}
              placeholder={field.placeholder || ''}
            />
          </div>
        ))}
      </div>
    </Modal>
  );
};


