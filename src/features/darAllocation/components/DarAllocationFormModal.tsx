import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import type { AddUpdateDarAllocationRequest, DarEmployeeDetails } from '@/features/darAllocation/models/DarAllocationModel';
import type { DropdownItem } from '@/core/types/DropdownItem';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import MultiSelectPagination from '@/ui/components/DropDown/Multiselectpagination';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
import { fetchVillageDropdown } from '@/features/technical/villageDropDown';


interface DarAllocationFormModalProps {

    isOpen: boolean;
    onClose: () => void;
    onCancel: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: AddUpdateDarAllocationRequest;
    onFieldChange: (field: keyof AddUpdateDarAllocationRequest, value: any) => void;
    fetchEmployeeDropdown: (pageNumber: number, params?: { value?: string }) => Promise<any>;
    errors: { [k: string]: string };
    editingData: any;
    loading: boolean;
    villageDropdown: {
        selectedValues: any[];
        initialOptions: any[];
        handleChange: (values: any) => { idsString: string | null };
    }
    dropdownResetKey?: number;
    employeeDetails?: DarEmployeeDetails | null;
    onEmployeeSelected: (item: DropdownItem | null) => void;
}

export const DarAllocationFormModal: React.FC<DarAllocationFormModalProps> = ({
    isOpen,
    onClose,
    onCancel,
    onSubmit,
    formData,
    onFieldChange,
    errors,
    editingData,
    loading,
    villageDropdown,
    dropdownResetKey,
    fetchEmployeeDropdown,
    employeeDetails,
    onEmployeeSelected,

}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onCancel={onCancel}
            title={editingData ? 'Update DAR Allocation' : 'Add DAR Allocation'}
            onSubmit={onSubmit}
            saveText={editingData ? 'Update ' : 'Add '}
            loading={loading}
            size="xl"
        >
            <div className="space-y-10 p-6 bg-blue-100">
                <div className="space-y-8">
                    <div>
                        <SingleSelectDropdownWithPagination
                            label="Employee Name"
                            title="Select Employee Name"
                            required
                            value={formData.EmployeeId ?? ''}
                            size="lg"
                            dataFetchCallBack={fetchEmployeeDropdown}
                            onSelected={onEmployeeSelected}
                            initialValue={createDropdownInitialValue(formData.EmployeeId, editingData?.EmployeeName ?? "")}
                            error={errors.EmployeeId}
                        />
                    </div>

                    {employeeDetails && (
                        <section className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FieldItem label="Department" value={employeeDetails.Department} />
                                <FieldItem label="Designation" value={employeeDetails.Designation} />
                                <FieldItem label="Branch" value={employeeDetails.Branch} />
                                <FieldItem label="Reporting Person" value={employeeDetails.ReportPersonName} />
                                <FieldItem label="Email" value={employeeDetails.EmailId} />
                                <FieldItem label="Mobile Number" value={employeeDetails.PersonalMobileNumber} />
                            </div>
                        </section>
                    )}

                    <div>
                        <MultiSelectPagination
                            label="Location"
                            key={dropdownResetKey}
                            dataFetchCallBack={fetchVillageDropdown}
                            style={{ height: 80 }}
                            required
                            selectedValues={villageDropdown.selectedValues}
                            options={villageDropdown.initialOptions}
                            onChange={(values) => {
                                const { idsString } = villageDropdown.handleChange(values);
                                onFieldChange("VillageMasterId", idsString || null);
                            }}
                            error={errors.VillageMasterId}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
}
