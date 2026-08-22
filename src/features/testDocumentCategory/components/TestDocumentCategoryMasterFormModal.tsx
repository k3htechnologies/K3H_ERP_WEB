import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import type { AddUpdateTestDocumentCategoryMasterRequest } from '@/features/testDocumentCategory/models/TestDocumentCategoryMasterModel';
import { filterNumbers } from '@/core/utils/fileValidation';

interface TestDocumentCategoryMasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: AddUpdateTestDocumentCategoryMasterRequest;
  onFieldChange: (field: keyof AddUpdateTestDocumentCategoryMasterRequest, value: any) => void;
  errors: { [k: string]: string };
  editingData: any;
  loading: boolean;
}

export const TestDocumentCategoryMasterFormModal: React.FC<TestDocumentCategoryMasterFormModalProps> = ({
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
      title={editingData ? 'Update Test Document Category' : 'Add Test Document Category'}
      onSubmit={onSubmit}
      saveText={editingData ? 'Update' : 'Add'}
      loading={loading}
      size="xl"
    >
      <div className="space-y-10 p-6 bg-blue-100">
        <div className="space-y-4">
          <div>
            <Input
              label="Test Document Category"
              required
              error={errors.projectDocumentCategory}
              type="text"
              value={formData.TestDocumentCategory}
              maxLength={200}
              onChange={e => onFieldChange('TestDocumentCategory', e.target.value)}
              placeholder="Enter Test Document Category"
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
              maxLength={5}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

