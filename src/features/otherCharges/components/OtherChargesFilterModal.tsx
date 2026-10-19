import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import type { FilterInfo } from '@/ui/components/DataTable/DataTable';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { APPLICABLE_FOR_OPTIONS } from '@/core/constants';

interface FilterField {
  key: string;
  label: string;
  placeholder?: string;
  type?: 'text';
}

interface OtherChargesFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
  tempFilters: FilterInfo;
  onFilterChange: (key: string, value: string) => void;
  filterFields?: FilterField[];
  canActionSale: boolean;
  canActionTenant: boolean;
}

export const OtherChargesFilterModal: React.FC<OtherChargesFilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  onClear,
  tempFilters,
  onFilterChange,
  filterFields = [
    { key: 'ChargeName', label: 'Charge Name', placeholder: 'Enter Charge Name' }
  ],
  canActionSale,
  canActionTenant
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Filter - Other Charges"
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

        <div>
          <SinglePageSelection
            label="Applicable For"
            placeholder="Select Applicable For"
            value={tempFilters.ApplicableFor ?? ''}
            onChange={e => onFilterChange('ApplicableFor', String(e))}
            options={APPLICABLE_FOR_OPTIONS .filter(opt => { const applicableFor = opt.id.trim().toUpperCase(); if (applicableFor === 'SALE') return canActionSale; if (applicableFor === 'TENANT') return canActionTenant; return false; }) .map(opt => ({ label: opt.name, value: opt.id }))}
            required
          />
        </div>
      </div>
    </Modal>
  );
};


