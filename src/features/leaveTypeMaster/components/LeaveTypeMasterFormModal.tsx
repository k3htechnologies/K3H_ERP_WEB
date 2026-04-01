import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import Checkbox from '@/ui/components/forms/Checkbox';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { LEAVE_TYPE_MASTER } from '@/core/constants';
import type { AddUpdateLeaveTypeMasterRequest } from '@/features/leaveTypeMaster/models/LeaveTypeMasterModel';
import { filterNumbersWithDecimal } from '@/core/utils/fileValidation';

interface LeaveTypeMasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  formData: AddUpdateLeaveTypeMasterRequest;
  onFieldChange: (field: keyof AddUpdateLeaveTypeMasterRequest, value: any) => void;
  errors: { [k: string]: string };
  editingData: any;
  loading: boolean;
}

export const LeaveTypeMasterFormModal: React.FC<LeaveTypeMasterFormModalProps> = ({
  isOpen,
  onClose,
  onCancel,
  onSubmit,
  onReset,
  formData,
  onFieldChange,
  errors,
  editingData,
  loading
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onCancel={onCancel}
      title={editingData ? 'Update Leave Type' : 'Add Leave Type'}
      onSubmit={onSubmit}
      saveText={editingData ? 'Update' : 'Add'}
      onreset={onReset}
      loading={loading}
      size="xl"
    >
      <div className="space-y-10 p-6 bg-blue-100">
        <div className="space-y-4" >
          <div>
            <SinglePageSelection
              label="Leave Type"
              placeholder="Select Leave Type"
              required
              value={formData.LeaveType}
              onChange={(e) => onFieldChange('LeaveType', String(e))}
              options={LEAVE_TYPE_MASTER.map((opt) => ({ label: opt.name, value: opt.id }))}
              error={errors.LeaveType}
            />
          </div>
          <div>
            <Input
              type="text"
              label='Leave Type Code'
              value={formData.LeaveTypeCode.toUpperCase() ?? ""}
              onChange={(e) => onFieldChange("LeaveTypeCode", e.target.value)}
              required
              maxLength={4}
              placeholder="Enter Leave Type Code"
              error={errors.LeaveTypeCode}
            />
          </div>
          <div>
            <Checkbox
              label="Carry Forward"
              checked={formData.IsCarryForward ?? false}
              onChange={(e) => onFieldChange("IsCarryForward", e.target.checked)}
            />
          </div>
          {formData.IsCarryForward && (
            <div>
              <Input
                type="text"
                label='Max Carry Forward'
                value={formData.MaxCarryForward ?? ""}
                onChange={e => onFieldChange('MaxCarryForward', filterNumbersWithDecimal(e.target.value) || 0)}
                required
                placeholder="Enter Max Carry Forward"
                error={errors.MaxCarryForward}
              />
            </div>
          )}
          <div>
            <Checkbox
              label="Encashable"
              checked={formData.IsEncashable ?? false}
              onChange={(e) => onFieldChange("IsEncashable", e.target.checked)}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
