import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { SingleSelectDropdownWithPagination } from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { DatePickerInput } from '@/ui/components/forms/Datepicker';
import { fetchHolidayMasterDropdown } from '../HolidayMasterDropDown';
import { fetchBranchMasterDropdown } from '@/features/branchMaster/branchMasterDropDown';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from '@/core/utils/dateFormat';
import type { AddUpdateHolidayMappingMasterRequest } from '@/features/holidayMappingMaster/models/HolidayMappingMasterModel';

interface HolidayMappingMasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: AddUpdateHolidayMappingMasterRequest;
  onFieldChange: (field: keyof AddUpdateHolidayMappingMasterRequest, value: any) => void;
  errors: { [k: string]: string };
  editingData: any;
  loading: boolean;
  dropdownLabels: { branchName?: string; holidayName?: string };
  dropdownResetKey: number;
  branchValueDropdown:string
}

export const HolidayMappingMasterFormModal: React.FC<HolidayMappingMasterFormModalProps> = ({
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
  dropdownResetKey,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onCancel={onCancel}
      title={editingData ? 'Update Holiday Mapping ' : 'Add Holiday Mapping'}
      onSubmit={onSubmit}
      saveText={editingData ? 'Update' : 'Add'}

      loading={loading}
      size="xl"
    >
      <div className="space-y-6">
        <div className='space-y-4'>
          <div>
            <SingleSelectDropdownWithPagination
              label="Holiday"
              key={dropdownResetKey}
              title="Select Holiday"
              size="lg"
              required
              dataFetchCallBack={fetchHolidayMasterDropdown}
              onSelected={(item) => {
                if (!item) {
                  onFieldChange("HolidayMasterId", null);
                  return;
                }

                onFieldChange("HolidayMasterId", Number(item.value));
              }}
              initialValue={createDropdownInitialValue(formData.HolidayMasterId, dropdownLabels.holidayName)}
              error={errors.HolidayMasterId}
            />
          </div>
          <div>
            <DatePickerInput
              label="Holiday Date"
              value={formatDate_dd_mm_yyyy(formData.HolidayDate || '')}
              onChange={(val) => onFieldChange('HolidayDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
              required
              error={errors.HolidayDate}
            />
          </div>
          
          <div>
            <SingleSelectDropdownWithPagination
              label="Branch"
              key={dropdownResetKey}
              title="Select Branch "
              size="lg"
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
