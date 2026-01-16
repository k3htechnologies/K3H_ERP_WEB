import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { CTC_EARNINGS } from '@/core/constants';
import { allowPercentage, filterNumbersWithDecimal } from '@/core/utils/fileValidation';
import type { AddUpdateLeaveEncashmentMasterRequest } from '@/features/leaveEncashmentMaster/models/LeaveEncashmentMasterModel';

interface LeaveEncashmentMasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  formData: AddUpdateLeaveEncashmentMasterRequest;
  onFieldChange: (field: keyof AddUpdateLeaveEncashmentMasterRequest, value: any) => void;
  errors: { [k: string]: string };
  editingData: any;
  loading: boolean;
}

export const LeaveEncashmentMasterFormModal: React.FC<LeaveEncashmentMasterFormModalProps> = ({
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
      title={editingData ? 'Update LeaveEncashment Master' : 'Add LeaveEncashment Master'}
      onSubmit={onSubmit}
      saveText={editingData ? 'Update' : 'Add'}
      onreset={onReset}
      loading={loading}
      size="xl"
    >
      <div className="space-y-6 p-6 bg-blue-100">
        <div className='space-y-4'>
          <div>
            <SinglePageSelection
              label="Name"
              placeholder="Select Name"
              required
              value={formData.EarningMasterName || ''}
              onChange={(e) => onFieldChange('EarningMasterName', String(e))}
              options={CTC_EARNINGS.map((opt) => ({ label: opt.name, value: opt.id }))}
              error={errors.EarningMasterName}
            />
          </div>
          <div>
            <Input
              label='Encashment Rate (%)'
              required
              error={errors.EncashmentRate}
              type="text"
              value={formData.EncashmentRate ?? ''}
              rightIcon="%"
              maxLength={10}
              onChange={(e) => {
                const val = allowPercentage(e.target.value);
                if (val !== null) {
                  onFieldChange("EncashmentRate", filterNumbersWithDecimal(e.target.value))
                }
              }}
              placeholder="Enter Encashment Rate"
            />
          </div>
          <div>
            <Input
              label='Min Salary (₹)'
              required
              error={errors.MinSalary}
              type="text"
              value={formData.MinSalary ?? ''}
              rightIcon="₹"
              maxLength={15}
              onChange={(e) => {
                const val = filterNumbersWithDecimal(e.target.value);
                if (val !== null) {
                  onFieldChange("MinSalary", val)
                }
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
              rightIcon="₹"
              maxLength={15}
              onChange={(e) => {
                const val = filterNumbersWithDecimal(e.target.value);
                if (val !== null) {
                  onFieldChange("MaxSalary", val)
                }
              }}
              placeholder="Enter Max Salary"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
