import React from "react";
import { Modal } from "@/ui/components/Modal/Modal";
import { SingleSelectDropdownWithPagination } from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import RadioPill from "@/ui/components/forms/RadioPill";
import { fetchWeekOffMasterDropdown } from "../../weekOffMaster/weekOffMasterDropDown";
import { fetchDepartmentMasterDropdown } from "@/features/departmentMaster/departmentMasterDropdown";
import { fetchEmployeeMasterDropdown } from "@/features/employeeMaster/employeeMasterDropDown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import type { AddUpdateWeekOffMappingMasterRequest } from "@/features/weekOffMappingMaster/models/WeekOffMappingMasterModel";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import type { EmployeeMasterData } from "@/features/employeeMaster/models/EmployeeMasterModel";

interface WeekOffMappingMasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: AddUpdateWeekOffMappingMasterRequest;
  onFieldChange: (field: keyof AddUpdateWeekOffMappingMasterRequest, value: any) => void;
  errors: { [k: string]: string };
  editingData: any;
  loading: boolean;
  dropdownLabels: { departmentName?: string; employeeName?: string; weekOffPolicyName?: string };
  dropdownResetKey: number;
  mappingWeekoff: string;
  onApplicableTypeChange: (value: string) => void;
  employeeDetails: EmployeeMasterData | null;
  setEmployeeDetails: (details: EmployeeMasterData | null) => void;
}

export const WeekOffMappingMasterFormModal: React.FC<WeekOffMappingMasterFormModalProps> = ({ isOpen, onClose, onCancel, onSubmit, formData, onFieldChange, errors, editingData, loading, dropdownLabels, dropdownResetKey, mappingWeekoff, onApplicableTypeChange, employeeDetails, setEmployeeDetails }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} onCancel={onCancel} title={editingData ? "Update Week Off Mapping " : "Add Week Off Mapping"} onSubmit={onSubmit} saveText={editingData ? "Update" : "Add"} loading={loading} size="xl">
      <div className="space-y-6 p-6 bg-blue-100">
        <div className="space-y-4">
          <div>
            <SingleSelectDropdownWithPagination
              key={dropdownResetKey}
              label="Week Off Policy Name"
              title="Select Week Off Policy Name "
              size="lg"
              required
              dataFetchCallBack={fetchWeekOffMasterDropdown}
              onSelected={(item) => {
                if (!item) {
                  onFieldChange("WeekOffPolicyMasterId", null);
                  return;
                }

                onFieldChange("WeekOffPolicyMasterId", Number(item.value));
              }}
              initialValue={createDropdownInitialValue(formData.WeekOffPolicyMasterId, dropdownLabels.weekOffPolicyName)}
              error={errors.WeekOffPolicyMasterId}
            />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Mapping</p>
            <div className="flex gap-3">
              <RadioPill name="Mapping" label="Department" checked={mappingWeekoff === "Department"}
                onChange={() => {
                  onApplicableTypeChange("Department");
                  setEmployeeDetails(null);
                  onFieldChange("EmployeeId", null);
                }} />
              <RadioPill name="Mapping" label="Employee" checked={mappingWeekoff === "Employee"}
                onChange={() => {
                  onApplicableTypeChange("Employee");
                  onFieldChange("DepartmentMasterId", null);
                }} />
            </div>
          </div>
          {mappingWeekoff === "Employee" && (
            <div>
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
                  onFieldChange("EmployeeId", item.value);
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
                    <FieldItem label="E-Mail ID" value={employeeDetails.EmailId || "-"} />
                    <FieldItem label="Personal Mobile Number" value={employeeDetails.PersonalMobileNumber || "-"} />
                  </div>
                </div>
              )}
            </div>
          )}
          {mappingWeekoff === "Department" && (
            <div>
              <SingleSelectDropdownWithPagination
                label="Department"
                key={dropdownResetKey}
                title="Select Department"
                size="lg"
                required
                dataFetchCallBack={fetchDepartmentMasterDropdown}
                onSelected={(item) => {
                  if (!item) {
                    onFieldChange("DepartmentMasterId", null);
                    return;
                  }

                  onFieldChange("DepartmentMasterId", item.value);
                }}
                initialValue={createDropdownInitialValue(formData.DepartmentMasterId, dropdownLabels.departmentName)}
                error={errors.DepartmentMasterId}
              />
              {!!formData.DepartmentMasterId && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">
                    This week-off policy will be applied to
                    <span className="font-semibold text-gray-900"> all employees in this department.</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
