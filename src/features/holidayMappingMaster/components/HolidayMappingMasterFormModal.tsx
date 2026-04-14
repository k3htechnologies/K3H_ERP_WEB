import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { SingleSelectDropdownWithPagination } from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { DatePickerInput } from '@/ui/components/forms/Datepicker';
import { fetchHolidayMasterDropdown } from '../HolidayMasterDropDown';
import { fetchBranchMasterDropdown } from '@/features/branchMaster/branchMasterDropDown';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from '@/core/utils/dateFormat';
import type { AddUpdateHolidayMappingMasterRequest } from '@/features/holidayMappingMaster/models/HolidayMappingMasterModel';
import MultiSelectPagination from '@/ui/components/DropDown/Multiselectpagination';
import { fetchDepartmentMasterDropdown } from '@/features/departmentMaster/departmentMasterDropdown';

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
  dropdownLabels: { branchName?: string; holidayName?: string, departmentName?: string };
  dropdownResetKey: number;
  branchValueDropdown: {
    selectedValues: any[]; initialOptions: any[];
    handleChange: (values: any) => { idsString: string | null };
  }
  departmentValueDropdown: {
    selectedValues: any[]; initialOptions: any[];
    handleChange: (values: any) => { idsString: string | null };
  }
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
  branchValueDropdown,
  departmentValueDropdown,

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
      <div className="space-y-6 p-6 bg-blue-100">
        <div className='space-y-4'>
          <div>
            <SingleSelectDropdownWithPagination
              label="Holiday Name"
              key={dropdownResetKey}
              title="Select Holiday Name"
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
            <MultiSelectPagination
              key={dropdownResetKey}
              label="Branch Name"
              dataFetchCallBack={fetchBranchMasterDropdown}
              selectedValues={branchValueDropdown.selectedValues}
              options={branchValueDropdown.initialOptions}
              onChange={(values) => {
                const { idsString } = branchValueDropdown.handleChange(values);
                onFieldChange("BranchMasterId", idsString || null);
              }}
            />
          </div>

          <div>
            <MultiSelectPagination
              key={dropdownResetKey}
              label="Department Name"
              dataFetchCallBack={fetchDepartmentMasterDropdown}
              selectedValues={departmentValueDropdown.selectedValues}
              options={departmentValueDropdown.initialOptions}
              onChange={(values) => {
                const { idsString } = departmentValueDropdown.handleChange(values);
                onFieldChange("DepartmentMasterId", idsString || null);
              }}
            />
          </div>

        </div>
      </div>
    </Modal>
  );
};
