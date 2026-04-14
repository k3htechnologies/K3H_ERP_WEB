import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import type { AddUpdateDesignationMasterRequest } from '@/features/designationMaster/models/DesignationMasterModel';

interface DesignationMasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: AddUpdateDesignationMasterRequest;
  onFieldChange: (field: keyof AddUpdateDesignationMasterRequest, value: any) => void;
  errors: { [k: string]: string };
  editingData: any;
  loading: boolean;
}

export const DesignationMasterFormModal: React.FC<DesignationMasterFormModalProps> = ({
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
      title={editingData ? 'Update Designation' : 'Add Designation'}
      onSubmit={onSubmit}
      saveText={editingData ? 'Update' : 'Add'}
      loading={loading}
      size='xl'
    >
      <div className="space-y-10 p-6 bg-blue-100">
        <div className="space-y-4" >
          <div>
            <Input
              label='Designation Name'
              required
              error={errors.DesignationName}
              type="text"
              value={formData.DesignationName}
              maxLength={100}
              onChange={(e) => onFieldChange('DesignationName', e.target.value)}
              placeholder="Enter Designation Name"
            />
          </div>

          <div>
            <Input
              label='Notice Period (In Days)'
              required
              error={errors.NoticePeriod}
              type="text"
              value={formData.NoticePeriod ?? ''}
              maxLength={3}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '');
                onFieldChange('NoticePeriod', digits === '' ? 0 : Number(digits));
              }}
              placeholder="Enter Notice Period"
            />
          </div>
           <div>
            <Input
              label='Probation Period (In Days)'
              required
              error={errors.ProbationPeriod}
              type="text"
              value={formData.ProbationPeriod ?? ''}
              maxLength={3}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '');
                onFieldChange('ProbationPeriod', digits === '' ? 0 : Number(digits));
              }}
              placeholder="Enter Probation Period"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
