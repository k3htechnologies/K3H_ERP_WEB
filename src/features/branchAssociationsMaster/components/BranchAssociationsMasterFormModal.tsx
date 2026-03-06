import React from "react";
import { Modal } from "@/ui/components/Modal/Modal";
import { SingleSelectDropdownWithPagination } from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchEmployeeMasterDropdown } from "@/features/employeeMaster/employeeMasterDropDown";
import { fetchBranchMasterDropdown } from "@/features/branchMaster/branchMasterDropDown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import type { AddUpdateBranchAssociationsMasterRequest } from "@/features/branchAssociationsMaster/models/BranchAssociationsMasterModel";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import type { EmployeeMasterData } from "@/features/employeeMaster/models/EmployeeMasterModel";

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
  employeeDetails: EmployeeMasterData | null;
  setEmployeeDetails: (details: EmployeeMasterData | null) => void;
}

export const BranchAssociationsMasterFormModal: React.FC<BranchAssociationsMasterFormModalProps> = ({ isOpen, onClose, onCancel, onSubmit, onReset, formData, onFieldChange, errors, editingData, loading, dropdownLabels, dropdownResetKey, employeeDetails, setEmployeeDetails }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} onCancel={onCancel} title={editingData ? "Update Branch Associations" : "Add Branch Associations"} onSubmit={onSubmit} saveText={editingData ? "Update" : "Add"} onreset={onReset} loading={loading} size="xl">
      <div className="space-y-10 p-6 bg-blue-100">
        <div className="space-y-4">
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
                setEmployeeDetails(null);
                return;
              }
              setEmployeeDetails(item as unknown as EmployeeMasterData);
              onFieldChange("EmployeeId", Number(item.value));
            }}
            initialValue={createDropdownInitialValue(formData.EmployeeId, dropdownLabels.employeeName)}
            error={errors.EmployeeId}
          />
          
          {employeeDetails && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FieldItem label="Department" value={employeeDetails.Department || "-"} />
                <FieldItem label="Designation" value={employeeDetails.Designation || "-"} />
                <FieldItem label="Branch" value={employeeDetails.Branch || "-"} />
                <FieldItem label="Reporting Person" value={employeeDetails.ReportPersonName || "-"} />
                <FieldItem label="Email ID" value={employeeDetails.EmailId || "-"} />
                <FieldItem label="Personal Mobile Number" value={employeeDetails.PersonalMobileNumber || "-"} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
