import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import type { AddUpdateDrawingDocumentCategoryMasterRequest } from '@/features/drawingDocumentCategory/models/DrawingDocumentCategoryMasterModel';
import { filterNumbers } from '@/core/utils/fileValidation';

interface DrawingDocumentCategoryMasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: AddUpdateDrawingDocumentCategoryMasterRequest;
  onFieldChange: (field: keyof AddUpdateDrawingDocumentCategoryMasterRequest, value: any) => void;
  errors: { [k: string]: string };
  editingData: any;
  loading: boolean;
}

export const DrawingDocumentCategoryMasterFormModal: React.FC<DrawingDocumentCategoryMasterFormModalProps> = ({
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
      title={editingData ? 'Update Drawing Document Category' : 'Add Drawing Document Category'}
      onSubmit={onSubmit}
      saveText={editingData ? 'Update' : 'Add'}
      loading={loading}
      size="xl"
    >
      <div className="space-y-10 p-6 bg-blue-100">
        <div className="space-y-4">
          <div>
            <Input
              label="Drawing Document Category"
              required
              error={errors.projectDocumentCategory}
              type="text"
              value={formData.DrawingDocumentCategory}
              maxLength={200}
              onChange={e => onFieldChange('DrawingDocumentCategory', e.target.value)}
              placeholder="Enter Drawing Document Category"
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

