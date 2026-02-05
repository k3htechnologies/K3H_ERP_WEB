import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import Checkbox from '@/ui/components/forms/Checkbox';
import type { AddUpdateBranchMasterRequest } from '@/features/branchMaster/models/BranchMasterModel';
import { TextArea } from '@/ui/components/forms/Textarea';

interface BranchMasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  formData: AddUpdateBranchMasterRequest;
  onFieldChange: (field: keyof AddUpdateBranchMasterRequest, value: any) => void;
  errors: { [k: string]: string };
  editingData: any;
  loading: boolean;
}

export const BranchMasterFormModal: React.FC<BranchMasterFormModalProps> = ({
  isOpen,
  onClose,
  onCancel,
  onSubmit,
  onReset,
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
      title={editingData ? 'Update Branch' : 'Add Branch'}
      onSubmit={onSubmit}
      saveText={editingData ? 'Update' : 'Add'}
      onreset={onReset}
      loading={loading}
      size='xl'
    >
      <div className="space-y-10 p-6 bg-blue-100">
        <div className="space-y-4" >
          <div>
            <Input
              type="text"
              required
              label='Branch Name'
              value={formData.BranchName ?? ""}
              onChange={(e) => onFieldChange("BranchName", e.target.value)}
              placeholder="Enter Branch Name"
              maxLength={250}
              error={errors.BranchName}
            />
          </div>
          <div>
            <Input
              type="text"
              label='Branch Code'
              value={formData.BranchCode.toUpperCase() ?? ""}
              onChange={(e) => onFieldChange("BranchCode", e.target.value)}
              required
              maxLength={4}
              placeholder="Enter Branch Code"
              error={errors.BranchCode}
            />
          </div>
          <div>
            <TextArea
              label="Location"
              placeholder="Enter Location"
              required
              className='thin-scroll'
              value={formData.Location}
              onChange={(e) => onFieldChange("Location", e.target.value)}
              error={errors.Location} />
          </div>
          <div>
            <Checkbox
              label="Head Office"
              checked={formData.IsHeadOffice ?? false}
              onChange={(e) => onFieldChange("IsHeadOffice", e.target.checked)}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
