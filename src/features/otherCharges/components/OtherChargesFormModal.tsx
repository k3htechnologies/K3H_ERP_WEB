import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { UNIT_SQFT_LUMPSUM } from '@/core/constants/staticData';
import type { AddUpdateOtherChargesRequest } from '@/features/otherCharges/models/OtherChargesModel';
import { allowPercentage, filterNumbersWithDecimal } from '@/core/utils/fileValidation';

interface OtherChargesFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: AddUpdateOtherChargesRequest;
  onFieldChange: (field: keyof AddUpdateOtherChargesRequest, value: any) => void;
  errors: { [k: string]: string };
  editingData: any;
  loading: boolean;
}

export const OtherChargesFormModal: React.FC<OtherChargesFormModalProps> = ({
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
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onCancel={onCancel}
      title={editingData ? 'Update Other Charges' : 'Add Other Charges'}
      onSubmit={onSubmit}
      saveText={editingData ? 'Update ' : 'Add '}
      loading={loading}
      size="xl"
    >
      <div className="space-y-10 p-6 bg-blue-100">
        <div className="space-y-4">
          <div>
            <Input
              label="Charges"
              required
              type="text"
              value={formData.ChargeName ?? ''}
              onChange={e => onFieldChange('ChargeName', e.target.value)}
              error={errors.ChargeName}
              maxLength={50}
              placeholder="Enter Other Charge Name "
            />
          </div>

          <div>
            <Input
              label="Value (₹)"
              required
              type="text"
              value={formData.Value ?? ''}
              onChange={e => {
                const digits = e.target.value.replace(/\D/g, '');
                onFieldChange('Value', digits === '' ? 0 : Number(digits));
              }}
              error={errors.Value}
              rightIcon="₹"
              maxLength={10}
              placeholder="Enter Value "
            />  
          </div>

          <div>
            <SinglePageSelection
              label="Calculated On"
              placeholder="Select Calculated On"
              value={formData.CalculatedOn ?? ''}
              onChange={value => onFieldChange('CalculatedOn', value)}
              options={UNIT_SQFT_LUMPSUM.map(opt => ({ label: opt.name, value: opt.id }))}
              error={errors.CalculatedOn}
              required
            />
          </div>

          <div>

            <Input
              label="GST (%)"
              value={formData.GSTPercentage ?? ''}
              onChange={(e) => {
                const val = allowPercentage(e.target.value);
                if (val !== null) {
                  const gstValue = filterNumbersWithDecimal(e.target.value);
                  onFieldChange('GSTPercentage', gstValue);
                }
              }}
              placeholder="Enter GST (%)"
              rightIcon="%"
              required
            />

          </div>

          <div>
            <Input
              label="GST Value (₹)"
              value={formData.GSTValue ?? ''}
              error={errors.GSTValue}
              disabled
            />
          </div>
           <div>
            <Input
              label="Value + GST Value (₹)"
              value={Number(formData.Value) + Number(formData.GSTValue)}
              disabled
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};


