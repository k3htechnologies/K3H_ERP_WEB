import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import type { AddUpdateUomMasterRequest } from '@/features/uomMaster/models/UOMMasterModel';

interface UomMasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: AddUpdateUomMasterRequest;
  onFieldChange: (field: keyof AddUpdateUomMasterRequest, value: any) => void;
  errors: { [k: string]: string };
  editingData: any;
  loading: boolean;
}

export const UomMasterFormModal: React.FC<UomMasterFormModalProps> = ({
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
      title={editingData ? 'Update UOM' : 'Add UOM'}
      onSubmit={onSubmit}
      saveText={editingData ? 'Update' : 'Add'}
      loading={loading}
      size='xl'
    >
      <div className="space-y-10 p-6 bg-blue-100">
        <div className="space-y-4" >
          <div>
            <Input
              label='UOM Code'
              required
              error={errors.UomCode}
              type="text"
              value={formData.UomCode}
              maxLength={10}
              onChange={(e) => onFieldChange('UomCode', e.target.value)}
              placeholder="Enter UOM Code"
            />
          </div>
          <div>
            <Input
              label='UOM Name'
              required
              error={errors.UomName}
              type="text"
              value={formData.UomName}
              maxLength={100}
              onChange={(e) => onFieldChange('UomName', e.target.value)}
              placeholder="Enter UOM Name"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
