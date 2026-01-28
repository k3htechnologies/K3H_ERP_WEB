import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import { SingleSelectDropdownWithPagination } from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import RadioPill from '@/ui/components/forms/RadioPill';
import { fetchBranchMasterDropdown } from '@/features/branchMaster/branchMasterDropDown';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
import { CTC_EARNINGS } from '@/core/constants';
import { allowPercentage, filterNumbersWithDecimal } from '@/core/utils/fileValidation';
import type { AddUpdateEarningMasterRequest } from '@/features/earningMaster/models/EarningMasterModel';

interface EarningMasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  formData: AddUpdateEarningMasterRequest;
  onFieldChange: (field: keyof AddUpdateEarningMasterRequest, value: any) => void;
  errors: { [k: string]: string };
  editingData: any;
  loading: boolean;
  dropdownLabels: { branchName?: string };
  dropdownResetKey: number;
  applicable: string;
  setApplicable: (value: string) => void;
}

export const EarningMasterFormModal: React.FC<EarningMasterFormModalProps> = ({
  isOpen,
  onClose,
  onCancel,
  onSubmit,
  onReset,
  formData,
  onFieldChange,
  errors,
  editingData,
  loading,
  dropdownLabels,
  dropdownResetKey,
  applicable,
  setApplicable
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onCancel={onCancel}
      title={editingData ? 'Update Earning' : 'Add Earning'}
      onSubmit={onSubmit}
      saveText={editingData ? 'Update' : 'Add'}
      onreset={onReset}
      loading={loading}
      size='xl'
    >
      <div className="space-y-10 p-6 bg-blue-100">
        <div className="space-y-4" >
          <div>
            <SinglePageSelection
              label="Name"
              placeholder="Select Name"
              required
              value={formData.Name}
              onChange={(e) => onFieldChange('Name', String(e))}
              options={CTC_EARNINGS.map((opt) => ({ label: opt.name, value: opt.id }))}
              error={errors.Name}
            />
          </div>

          <div>
            <SinglePageSelection
              label="Type"
              placeholder="Select Type"
              value={formData.Type}
              onChange={(e) => onFieldChange('Type', String(e))}
              options={CTC_EARNINGS.map((opt) => ({ label: opt.name, value: opt.id }))}
              error={errors.Type}
            />
          </div>

          <div >
            <p className="text-sm text-gray-600 mb-2">
              Applicable *
            </p>
            <div className="flex gap-3">
              <RadioPill
                name="Applicable"
                label="Percenatge"
                value={formData.Applicable ?? ''}
                checked={applicable === "Percenatge"}
                onChange={() => {
                  onFieldChange("Value", 0);
                  setApplicable("Percenatge");
                  onFieldChange("Applicable", "Percenatge");
                }}
              />

              <RadioPill
                name="Applicable"
                label="Lumsum"
                value={formData.Applicable ?? ''}
                checked={applicable === "Lumsum"}
                onChange={() => {

                  onFieldChange("Value", 0);
                  setApplicable("Lumsum");
                  onFieldChange("Applicable", "Lumsum");
                }}
              />
            </div>
          </div>
          <div>
            <Input
              label={formData.Applicable === "Lumsum" ? 'Value (Lumsum)' : 'Value (%)'}
              required
              error={errors.Value}
              type="text"
              value={formData.Value ?? ''}
              maxLength={10}
              onChange={(e) => {
                if (formData.Applicable === "Lumsum") {
                  onFieldChange("Value", filterNumbersWithDecimal(e.target.value))
                }
                else {
                  const val = allowPercentage(e.target.value);
                  if (val !== null) {
                    onFieldChange("Value", filterNumbersWithDecimal(e.target.value))
                  }
                }
              }}
              placeholder="Enter Value"
            />
          </div>

          <div>
            <Input
              label='Min Salary (₹)'
              required
              error={errors.MinSalary}
              type="text"
              value={formData.MinSalary ?? ''}
              maxLength={9}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '');
                onFieldChange('MinSalary', digits === '' ? 0 : Number(digits));
              }}
              placeholder="Enter Min Salary"
            />
          </div>

          <div>
            <Input
              label='Max Salary (₹)'
              required
              error={errors.MaxSalary}
              type="text"
              value={formData.MaxSalary ?? ''}
              maxLength={9}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '');
                onFieldChange('MaxSalary', digits === '' ? 0 : Number(digits));
              }}
              placeholder="Enter Max Salary"
            />
          </div>
          <div>
            <SingleSelectDropdownWithPagination
              label="Branch"
              key={dropdownResetKey}
              title="Select Branch"
              dataFetchCallBack={fetchBranchMasterDropdown}
              onSelected={(item) => {
                if (!item) {
                  onFieldChange("BranchMasterId", null);
                  return;
                }

                onFieldChange("BranchMasterId", Number(item.value));
              }}
              initialValue={createDropdownInitialValue(formData.BranchMasterId, dropdownLabels.branchName)}
              error={errors.BranchMasterId}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
