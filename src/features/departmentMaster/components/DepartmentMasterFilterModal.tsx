import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import type { FilterInfo } from '@/ui/components/DataTable/DataTable';

interface DepartmentFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
  tempFilters: FilterInfo;
  onFilterChange: (key: string, value: string) => void;
}

export const DepartmentMasterFilterModal: React.FC<DepartmentFilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  onClear,
  tempFilters,
  onFilterChange
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Filter - Department Master"
      onSubmit={(e) => {
        e.preventDefault();
        onApply();
      }}
      saveText="Apply Filter"
      onCancel={onClear}
      resetText=''
      cancelText="Clear Filter"
      size="small-half"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <Input
              label='Department Name'
              type="text"
              value={tempFilters.DepartmentName || ''}
              onChange={(e) => onFilterChange('DepartmentName', e.target.value)}
              placeholder="Enter Department Name"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
