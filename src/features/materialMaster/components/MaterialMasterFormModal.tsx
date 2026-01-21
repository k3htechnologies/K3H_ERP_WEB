import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import type { AddUpdateMaterialMasterRequest } from '@/features/materialMaster/models/MaterialMasterModel';

interface MaterialMasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: AddUpdateMaterialMasterRequest;
  onFieldChange: (field: keyof AddUpdateMaterialMasterRequest, value: any) => void;
  errors: { [k: string]: string };
  editingData: any;
  loading: boolean;
}

export const MaterialMasterFormModal: React.FC<MaterialMasterFormModalProps> = ({
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
      title={editingData ? 'Update Material' : 'Add Material'}
      onSubmit={onSubmit}
      saveText={editingData ? 'Update' : 'Add'}
      loading={loading}
      size='xl'
    >
      <div className="space-y-10 p-6 bg-blue-100">
        <div className="space-y-4" >
          <div>
            <Input
              label='Material Code'
              required
              error={errors.MaterialCode}
              type="text"
              value={formData.MaterialCode.toUpperCase()}
              maxLength={4}
              onChange={(e) => onFieldChange('MaterialCode', e.target.value)}
              placeholder="Enter Material Code"
            />
          </div>
          <div>
            <Input
              label='Material Name'
              required
              error={errors.MaterialName}
              type="text"
              value={formData.MaterialName}
              maxLength={500}
              onChange={(e) => onFieldChange('MaterialName', e.target.value)}
              placeholder="Enter Material Name"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
