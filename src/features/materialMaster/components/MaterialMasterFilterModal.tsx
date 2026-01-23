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

interface MaterialMasterFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
  tempFilters: FilterInfo;
  onFilterChange: (key: string, value: string) => void;
  filterFields?: FilterField[];
}

export const MaterialMasterFilterModal: React.FC<MaterialMasterFilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  onClear,
  tempFilters,
  onFilterChange,
  filterFields = [
    { key: 'MaterialName', label: 'Material Name', placeholder: 'Enter Material Name' }
  ]
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Filter - Material Master"
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
            {filterFields.map((field) => (
              <Input
                key={field.key}
                label={field.label}
                type={field.type}
                value={tempFilters[field.key] ?? ''}
                onChange={(e) => onFilterChange(field.key, e.target.value)}
                placeholder={field.placeholder || ''}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
