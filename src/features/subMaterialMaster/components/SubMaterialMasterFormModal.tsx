import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import { SingleSelectDropdownWithPagination } from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { fetchMaterialMasterDropdown } from '@/features/materialMaster/materialMasterDropdown';
import { fetchUOMMasterDropdown } from '@/features/uomMaster/uomMasterDropdown';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
import type { AddUpdateSubMaterialMasterRequest } from '@/features/subMaterialMaster/models/SubMaterialMasterModel';

interface SubMaterialMasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: AddUpdateSubMaterialMasterRequest;
  onFieldChange: (field: keyof AddUpdateSubMaterialMasterRequest, value: any) => void;
  errors: { [k: string]: string };
  editingData: any;
  loading: boolean;
  dropdownLabels: { materialName?: string; uom?: string };
  dropdownResetKey: number;
}

export const SubMaterialMasterFormModal: React.FC<SubMaterialMasterFormModalProps> = ({
  isOpen,
  onClose,
  onCancel,
  onSubmit,
  formData,
  onFieldChange,
  errors,
  editingData,
  loading,
  dropdownLabels,
  dropdownResetKey
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onCancel={onCancel}
      title={editingData ? 'Update Sub Material' : 'Add Sub Material'}
      onSubmit={onSubmit}
      saveText={editingData ? 'Update' : 'Add'}
      loading={loading}
      size='xl'
    >
      <div className="space-y-10 p-6 bg-blue-100">
        <div className="space-y-4" >
          <div>
            <Input
              label='Sub Material Name'
              required
              error={errors.SubMaterialName}
              type="text"
              value={formData.SubMaterialName}
              maxLength={100}
              onChange={(e) => onFieldChange('SubMaterialName', e.target.value)}
              placeholder="Enter Sub Material Name"
            />
          </div>
          <div>
            <SingleSelectDropdownWithPagination
              required
              label="Material"
              key={dropdownResetKey}
              title="Select Material"
              size="lg"
              dataFetchCallBack={fetchMaterialMasterDropdown}
              onSelected={(item) => {
                if (!item) {
                  onFieldChange("MaterialMasterId", null);
                  return;
                }

                onFieldChange("MaterialMasterId", Number(item.value));
              }}
              initialValue={createDropdownInitialValue(formData.MaterialMasterId, dropdownLabels.materialName)}
              error={errors.MaterialMasterId}
            />
          </div>
          <div>
            <SingleSelectDropdownWithPagination
              required
              label="UOM"
              key={dropdownResetKey}
              title="Select UOM"
              size="lg"
              dataFetchCallBack={fetchUOMMasterDropdown}
              onSelected={(item) => {
                if (!item) {
                  onFieldChange("UomMasterId", null);
                  return;
                }

                onFieldChange("UomMasterId", Number(item.value));
              }}
              initialValue={createDropdownInitialValue(formData.UomMasterId, dropdownLabels.uom)}
              error={errors.UomMasterId}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
