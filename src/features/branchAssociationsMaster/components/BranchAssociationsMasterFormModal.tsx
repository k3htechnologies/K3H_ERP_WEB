import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { SingleSelectDropdownWithPagination } from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { fetchEmployeeMasterDropdown } from "@/features/employeeMaster/employeeMasterDropDown";
import { fetchBranchMasterDropdown } from "@/features/branchMaster/branchMasterDropDown";
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
import type { AddUpdateBranchAssociationsMasterRequest } from '@/features/branchAssociationsMaster/models/BranchAssociationsMasterModel';
import { FieldItem } from '@/ui/components/forms/FieldItem';

interface BranchAssociationsMasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  formData: AddUpdateBranchAssociationsMasterRequest;
  onFieldChange: (field: keyof AddUpdateBranchAssociationsMasterRequest, value: any) => void;
  errors: { [k: string]: string };
  editingData: any;
  loading: boolean;
  dropdownLabels: { branchName?: string; employeeName?: string };
  dropdownResetKey: number;
  departmentName: string;
  designationName: string;
  branchName: string;
  reportingPersonName: string;
  emailId: string;
  personalMobileNumber: string;

}

export const BranchAssociationsMasterFormModal: React.FC<BranchAssociationsMasterFormModalProps> = ({
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
  departmentName,
  designationName,
  branchName,
  reportingPersonName,
  emailId,
  personalMobileNumber,

}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onCancel={onCancel}
      title={editingData ? 'Update Branch Associations' : 'Add Branch Associations'}
      onSubmit={onSubmit}
      saveText={editingData ? 'Update' : 'Add'}
      onreset={onReset}
      loading={loading}
      size='xl'
    >
      <div className="space-y-10 p-6 bg-blue-100">
        <div className="space-y-4" >
          <div>
            <SingleSelectDropdownWithPagination
              label="Branch Name"
              key={dropdownResetKey}
              title="Select Branch"
              size="lg"
              required
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
          <SingleSelectDropdownWithPagination
            label="Employee"
            key={dropdownResetKey}
            title="Select Employee"
            size="lg"
            required
            dataFetchCallBack={fetchEmployeeMasterDropdown}
            onSelected={(item) => {
              if (!item) {
                onFieldChange("EmployeeId", null);
                return;
              }

              onFieldChange("EmployeeId", Number(item.value));
            }}
            initialValue={createDropdownInitialValue(formData.EmployeeId, dropdownLabels.employeeName)}
            error={errors.EmployeeId}
          />
          {!!formData.EmployeeId && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FieldItem label="Department" value={departmentName || "-"} />
                <FieldItem label="Designation" value={designationName || "-"} />
                <FieldItem label="Branch" value={branchName || "-"} />
                <FieldItem label="Reporting Person" value={reportingPersonName || "-"} />
                <FieldItem label="Email ID" value={emailId || "-"} />
                <FieldItem label="Personal Mobile Number" value={personalMobileNumber || "-"} />
              </div>
            </div>
          )}

        </div>
      </div>
    </Modal>
  );
};
