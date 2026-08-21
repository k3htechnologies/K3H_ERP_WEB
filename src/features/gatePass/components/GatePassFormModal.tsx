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
import { Clock } from 'lucide-react';
import { CustomTimePicker } from '@/ui/components/TimePicker/CustomTimePicker';
import { filterLetters, filterNumbers } from '@/core/utils/fileValidation';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';

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
    loading
}) => {

    const [timePickerField, setTimePickerField] = useState<{
        field: keyof AddUpdateGatePassRequest;
        value: string;
    } | null>(null);
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
                            label='Full Name'
                            required
                            error={errors.FullName}
                            type="text"
                            value={formData.FullName}
                            maxLength={100}
                            onChange={(e) => onFieldChange('FullName', filterLetters(e.target.value))}
                            placeholder="Enter Full Name"
                        />
                    </div>

                    <div>
                        <Input
                            label="Address"
                            value={formData.Address ?? ''}
                            required
                            onChange={e => onFieldChange("Address", e.target.value)}
                            error={errors.Address}
                            maxLength={100}
                            placeholder="Enter Full Address"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Mobile Number"
                            value={formData.MobileNumber ?? ''}
                            onChange={e => onFieldChange('MobileNumber', e.target.value)}
                            placeholder="Enter Mobile Number"
                            required
                            error={errors.MobileNumber}
                            maxLength={10}
                        />
                    </div>

                    <div>
                        <SingleSelectDropdownWithPagination
                            label="Employee Name"
                            title="Select Employee Name"
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
                            initialValue={createDropdownInitialValue(formData.EmployeeId, editingData?.EmployeeName)}
                            error={errors.EmployeeId}
                        />
                    </div>

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


                    <DatePickerInput
                        label="Appointment Date"
                        minDate={editingData ? undefined : new Date(new Date().setDate(new Date().getDate()))}
                        maxDate={editingData ? undefined : new Date(new Date().setDate(new Date().getDate() + 3))}
                        isDisplayCurrentDate={!editingData}
                        value={formatDate_dd_mm_yyyy(formData.PassDateTime ?? '')}
                        onChange={(val) => {
                            const newDate = convert_dd_mm_yyyy_To_Yyyy_mm_dd(val);

                            const existingTime = formData.PassDateTime
                                ? formData.PassDateTime.substring(11, 19)
                                : '00:00:00';

                            onFieldChange(
                                'PassDateTime',
                                `${newDate}T${existingTime}`
                            );
                        }}
                    />

                    <Input
                        label="Appointment Time"
                        disabled={!isDateSelected}
                        readOnly
                        required
                        error={errors.PassTime}
                        value={
                            formData.PassDateTime && formData.PassDateTime.length >= 16
                                ? formData.PassDateTime.substring(11, 16)
                                : "00:00"
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

                    <CustomTimePicker
                        isOpen={isTimePickerOpen}
                        title={"Select Appointment Time"}
                        value={
                            timePickerField?.value && timePickerField.value.length >= 16
                                ? timePickerField.value.substring(11, 16)
                                : "00:00"
                        }
                        onClose={() => {
                            setIsTimePickerOpen(false);
                            setTimePickerField(null);
                        }}
                        onConfirm={(time) => {
                            if (timePickerField) {
                                const existingDate = formData.PassDateTime
                                    ? formData.PassDateTime.substring(0, 10)
                                    : '';

                                const updatedDateTime = `${existingDate}T${time}:00`;

                                onFieldChange(
                                    timePickerField.field,
                                    updatedDateTime
                                );
                            }

                            setIsTimePickerOpen(false);
                            setTimePickerField(null);
                        }}
                    />

                    <div>
                        <Input
                            type="text"
                            label='Number of Participants'
                            value={formData.NoOfParticipants || ''}
                            onChange={(e) => onFieldChange('NoOfParticipants', filterNumbers(e.target.value) ? Number(filterNumbers(e.target.value)) : 0)}
                            placeholder="Enter Number of Participants"
                            maxLength={2}
                            error={errors.NoOfParticipants}
                            required
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