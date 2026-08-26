import React, { useState } from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import type { AddUpdateGatePassRequest } from '@/features/gatePass/models/GatePassModel';
import { Input } from '@/ui/components/forms';
import { fetchEmployeeMasterDropdown } from '@/features/employeeMaster/employeeMasterDropDown';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { PURPOSE_OPTIONS } from '@/core/constants';
import { TextArea } from '@/ui/components/forms/Textarea';
import DatePickerInput from '@/ui/components/forms/Datepicker';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from '@/core/utils/dateFormat';
import { Clock, Phone } from 'lucide-react';
import { TimePickerCustomize } from "@/ui/components/TimePicker/TimePickerCustomize";
import { filterLetters, filterMobile, filterNumbers } from '@/core/utils/fileValidation';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
import type { EmployeeMasterData } from '@/features/employeeMaster/models/EmployeeMasterModel';
import { FieldItem } from '@/ui/components/forms/FieldItem';

interface GatePassFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCancel: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: AddUpdateGatePassRequest;
    onFieldChange: (field: keyof AddUpdateGatePassRequest, value: any) => void;
    errors: { [k: string]: string };
    editingData: any;
    loading: boolean;
    employeeDetails: EmployeeMasterData | null;
    setEmployeeDetails: (details: EmployeeMasterData | null) => void;
}

export const GatePassFormModal: React.FC<GatePassFormModalProps> = ({
    isOpen,
    onClose,
    onCancel,
    onSubmit,
    formData,
    onFieldChange,
    errors,
    editingData,
    loading,
    employeeDetails,
    setEmployeeDetails
}) => {

    const [timePickerField, setTimePickerField] = useState<{ field: keyof AddUpdateGatePassRequest; value: string; } | null>(null);
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

    const isDateSelected = Boolean(formData.PassDateTime && formData.PassDateTime.trim() !== "");

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onCancel={onCancel}
            title={editingData ? 'Update Gate Pass' : 'Add Gate Pass'}
            onSubmit={onSubmit}
            saveText={editingData ? 'Update' : 'Add'}
            loading={loading}
            size='lg'
        >
            <div className="space-y-10 p-6 bg-blue-100">
                <div className="space-y-4">
                    <div>
                        <Input
                            label='Visitor Name'
                            required
                            error={errors.FullName}
                            type="text"
                            value={formData.FullName}
                            maxLength={100}
                            onChange={(e) => onFieldChange('FullName', filterLetters(e.target.value))}
                            placeholder="Enter Visitor Name"
                        />
                    </div>

                    <div>
                        <TextArea
                            label="Address"
                            required
                            placeholder="Enter Address"
                            className='thin-scroll'
                            value={formData.Address ?? ''}
                            maxLength={250}
                            error={errors.Address}
                            onChange={(e) => onFieldChange("Address", e.target.value)}
                        />

                    </div>

                    <div>


                        <Input
                            type="text"
                            label="Mobile Number"
                            value={formData.MobileNumber ?? ''}
                            onChange={e => onFieldChange('MobileNumber', filterMobile(e.target.value))}
                            placeholder="Enter Mobile Number"
                            required
                            error={errors.MobileNumber}
                            maxLength={10}
                            leftIcon="+91"
                            rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
                        />
                    </div>

                    <div>
                        <SingleSelectDropdownWithPagination
                            label="Appointment With"
                            title="Select Appointment With"
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
                            initialValue={createDropdownInitialValue(formData.EmployeeId, editingData?.EmployeeName)}
                            error={errors.EmployeeId}
                        />

                        {employeeDetails && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FieldItem label="Department" value={employeeDetails.Department || "-"} />
                                    <FieldItem label="Designation" value={employeeDetails.Designation || "-"} />
                                    <FieldItem label="Personal Mobile Number" value={employeeDetails?.PersonalMobileNumber ? `+91 ${(employeeDetails?.PersonalMobileNumber)}` : '-'} />

                                </div>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div>
                            <SinglePageSelection
                                label="Purpose"
                                placeholder="Select Purpose"
                                value={formData.Purpose}
                                onChange={(val) => onFieldChange("Purpose", String(val))}
                                options={PURPOSE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                                required
                                error={errors.Purpose}
                            />
                        </div>
                        <div>
                            <Input
                                type="text"
                                label='Number of Participants'
                                value={formData.NoOfParticipants || ''}
                                onChange={(e) => onFieldChange('NoOfParticipants', filterNumbers(e.target.value))}
                                placeholder="Enter Number of Participants"
                                maxLength={3}
                                error={errors.NoOfParticipants}
                                required
                            />
                        </div>


                        <DatePickerInput
                            label="Appointment Date"
                            required
                            minDate={editingData ? undefined : new Date(new Date().setDate(new Date().getDate()))}
                            isDisplayCurrentDate={!editingData}
                            value={formatDate_dd_mm_yyyy(formData.PassDateTime ?? '')}
                            error={errors.PassDateTime}
                            onChange={(val) => {
                                const newDate = convert_dd_mm_yyyy_To_Yyyy_mm_dd(val);

                                const existingTime = formData.PassDateTime ? formData.PassDateTime.substring(11, 19) : '00:00:00';

                                onFieldChange('PassDateTime', `${newDate}T${existingTime}`);
                            }}
                        />

                        <Input
                            label="Appointment Time"
                            disabled={!isDateSelected}
                            readOnly
                            required
                            error={errors.PassTime}
                            value={
                                formData.PassDateTime && formData.PassDateTime.length >= 16 ? formData.PassDateTime.substring(11, 16) : "00:00"
                            }
                            onClick={() => {
                                if (!isDateSelected) return;

                                setTimePickerField({
                                    field: "PassDateTime",
                                    value: formData.PassDateTime || "",
                                });

                                setIsTimePickerOpen(true);
                            }}
                            leftIcon={<Clock className={`h-8 w-8 ${!isDateSelected ? 'opacity-50' : ''}`} />}
                        />

                        <TimePickerCustomize
                            isOpen={isTimePickerOpen}
                            title={"Select Appointment Time"}
                            value={
                                timePickerField?.value && timePickerField.value.length >= 16 ? timePickerField.value.substring(11, 16) : "00:00"
                            }
                            onClose={() => {
                                setIsTimePickerOpen(false);
                                setTimePickerField(null);
                            }}
                            onConfirm={(time) => {

                                if (timePickerField) {

                                    const existingDate = formData.PassDateTime ? formData.PassDateTime.substring(0, 10) : '';

                                    const updatedDateTime = `${existingDate}T${time}:00`;

                                    onFieldChange(timePickerField.field, updatedDateTime);
                                }

                                setIsTimePickerOpen(false);

                                setTimePickerField(null);
                            }}
                        />
                    </div>


                    <div>
                        <TextArea
                            label="Remark"
                            placeholder="Enter Remark"
                            className='thin-scroll'
                            value={formData.Remark}
                            onChange={(e) => onFieldChange("Remark", e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
};