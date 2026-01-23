import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import type { AddUpdateProjectRERADocumentCategoryMasterRequest } from '@/features/projectRERADocumentCategory/models/ProjectRERADocumentCategoryMasterModel';
import { filterNumbers } from '@/core/utils/fileValidation';

interface ProjectRERADocumentCategoryMasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: AddUpdateProjectRERADocumentCategoryMasterRequest;
  onFieldChange: (field: keyof AddUpdateProjectRERADocumentCategoryMasterRequest, value: any) => void;
  errors: { [k: string]: string };
  editingData: any;
  loading: boolean;
}

export const ProjectRERADocumentCategoryMasterFormModal: React.FC<ProjectRERADocumentCategoryMasterFormModalProps> = ({
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
      title={editingData ? 'Update Project RERA Document Category' : 'Add Project RERA Document Category'}
      onSubmit={onSubmit}
      saveText={editingData ? 'Update' : 'Add'}
      loading={loading}
      size="xl"
    >
      <div className="space-y-10 p-6 bg-blue-100">
        <div className="space-y-4">
          <div>
            <Input
              label="Project RERA Document Category"
              required
              error={errors.ProjectRERADocumentCategory}
              type="text"
              value={formData.ProjectRERADocumentCategory}
              maxLength={200}
              onChange={e => onFieldChange('ProjectRERADocumentCategory', e.target.value)}
              placeholder="Enter Project RERA Document Category"
            />
          </div>

          <div>
            <Input
              label="Sequence"
              required
              error={errors.OrderBy}
              value={formData.OrderBy.toString()}
              onChange={(e) => onFieldChange('OrderBy', filterNumbers(e.target.value) ? Number(filterNumbers(e.target.value)) : 0)}
              placeholder="Enter Sequence"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

