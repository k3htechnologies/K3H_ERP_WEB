import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import type { AddUpdateApprovalDocumentCategoryMasterRequest } from '@/features/approvalDocumentCategory/models/ApprovalDocumentCategoryMasterModel';
import { filterNumbers } from '@/core/utils/fileValidation';

interface ApprovalDocumentCategoryMasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: AddUpdateApprovalDocumentCategoryMasterRequest;
  onFieldChange: (field: keyof AddUpdateApprovalDocumentCategoryMasterRequest, value: any) => void;
  errors: { [k: string]: string };
  editingData: any;
  loading: boolean;
}

export const ApprovalDocumentCategoryMasterFormModal: React.FC<ApprovalDocumentCategoryMasterFormModalProps> = ({
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
      title={editingData ? 'Update Approval Document Category' : 'Add Approval Document Category'}
      onSubmit={onSubmit}
      saveText={editingData ? 'Update' : 'Add'}
      loading={loading}
      size="xl"
    >
      <div className="space-y-10 p-6 bg-blue-100">
        <div className="space-y-4">
          <div>
            <Input
              label="Approval Document Category"
              required
              error={errors.approvalDocumentCategory}
              type="text"
              value={formData.ApprovalDocumentCategory}
              maxLength={200}
              onChange={e => onFieldChange('ApprovalDocumentCategory', e.target.value)}
              placeholder="Enter Approval Document Category"
            />
          </div>

          <div>
            <Input
              label="Sequence"
              required
              error={errors.OrderBy}
              value={formData.OrderBy}
              onChange={(e) => onFieldChange('OrderBy', filterNumbers(e.target.value) ? Number(filterNumbers(e.target.value)) : 0)}
              placeholder="Enter Sequence"
              maxLength={5}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

