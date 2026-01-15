import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import type { AddUpdateDepartmentMasterRequest } from '@/features/departmentMaster/models/DepartmentMasterModel';

interface DepartmentMasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: AddUpdateDepartmentMasterRequest;
  onFieldChange: (field: keyof AddUpdateDepartmentMasterRequest, value: any) => void;
  errors: { [k: string]: string };
  editingData: any;
  loading: boolean;
}

export const DepartmentMasterFormModal: React.FC<DepartmentMasterFormModalProps> = ({
  isOpen,
  onClose,
  onCancel,
  onSubmit,
  formData,
  onFieldChange,
  errors,
  editingData,
  loading
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onCancel={onCancel}
      title={editingData ? 'Update Department' : 'Add Department'}
      onSubmit={onSubmit}
      saveText={editingData ? 'Update' : 'Add'}
      loading={loading}
      size='xl'
    >
      <div className="space-y-10 p-6 bg-blue-100">
        <div className="space-y-4" >
          <div>
            <Input
              label='Department Code'
              required
              error={errors.DepartmentCode}
              type="text"
              value={formData.DepartmentCode.toUpperCase()}
              maxLength={4}
              onChange={(e) => onFieldChange('DepartmentCode', e.target.value)}
              placeholder="Enter Department Code"
            />
          </div>

          <div>
            <Input
              label='Department Name'
              required
              error={errors.DepartmentName}
              type="text"
              value={formData.DepartmentName}
              maxLength={100}
              onChange={(e) => onFieldChange('DepartmentName', e.target.value)}
              placeholder="Enter Department Name"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
