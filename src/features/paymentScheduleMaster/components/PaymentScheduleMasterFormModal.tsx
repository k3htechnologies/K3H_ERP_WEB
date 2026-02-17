import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import type { AddUpdatePaymentScheduleMasterRequest } from '@/features//paymentScheduleMaster/models/PaymentScheduleMasterModel';
import RadioPill from '@/ui/components/forms/RadioPill';
import DatePickerInput from '@/ui/components/forms/Datepicker';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from '@/core/utils/dateFormat';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';

interface PaymentScheduleMasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: AddUpdatePaymentScheduleMasterRequest;
  onFieldChange: (field: keyof AddUpdatePaymentScheduleMasterRequest, value: any) => void;
  errors: { [k: string]: string };
  editingData: any;
  loading: boolean;
}

export const PaymentScheduleMasterFormModal: React.FC<PaymentScheduleMasterFormModalProps> = ({
  isOpen,
  onClose,
  onCancel,
  onSubmit,
  formData,
  onFieldChange,
  errors,
  editingData,
  loading,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onCancel={onCancel}
      title={editingData ? 'Update Payment Schedule Master' : 'Add Payment Schedule Master'}
      onSubmit={onSubmit}
      saveText={editingData ? 'Update Payment Schedule Master' : 'Add Payment Schedule Master'}
      loading={loading}
      size="xl"
    >
      <div className="space-y-10 p-6 bg-blue-100">
        <div className="space-y-4">

          <p className="text-sm text-gray-600 mb-2">
            Payment Schedule Type
          </p>

          <div className="flex gap-3">
            <RadioPill
              label="Date"
              checked={formData.Type === 'Date'}
              onChange={() => {
                onFieldChange('Type', 'Date');
              }}
              name="Type"
            />

            <RadioPill
              label="Stage"
              checked={formData.Type === 'Stage'}
              onChange={() => {
                onFieldChange('Type', 'Stage');
                onFieldChange('Date', null);
              }}
              name="paymentScheduleType"
            />

          </div>

        </div>

        <div>
          {formData.Type === 'Date' && (
            <DatePickerInput
              label="Date"
              value={formatDate_dd_mm_yyyy(formData.Date)}
              onChange={(val) =>
                onFieldChange('Date', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))
              }
              required
              error={errors.Date}
            />
          )}

          {formData.Type === 'Stage' && (
            <SinglePageSelection
              label="Stage"
              placeholder="Select Stage"
              value={formData.StageId}
              onChange={(val) => onFieldChange('StageId', val)}
              options={stageOptions}
              required
              error={errors.StageId}
            />
          )}

          <div>
            <Input
              label="Percentage"
              type="text"
              value={formData.Percentage ?? ''}
              onChange={e => {
                const digits = e.target.value.replace(/\D/g, '');
                onFieldChange('Percentage', digits === '' ? 0 : Number(digits));
              }}
              error={errors.Percentage}
              maxLength={5}
              placeholder="Enter Percentage "
            />
          </div>

        </div>

      </div>
    </Modal>
  );
};


