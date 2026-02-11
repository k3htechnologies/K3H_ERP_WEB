import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { UNIT_SQFT_LUMPSUM } from '@/core/constants/staticData';
import type { AddUpdateOtherChargesRequest } from '@/features/otherCharges/models/OtherChargesModel';

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
              label="Charge Name"
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
              label="Value (in ₹)"
              required
              type="text"
              value={formData.Value ?? ''}
              onChange={e => {
                const digits = e.target.value.replace(/\D/g, '');
                onFieldChange('Value', digits === '' ? 0 : Number(digits));
              }}
              error={errors.Value}
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
              label="GST (in %)"
              type="text"
              value={formData.GSTPercentage ?? ''}
              onChange={e => {
                const digits = e.target.value.replace(/\D/g, '');
                onFieldChange('GSTPercentage', digits === '' ? 0 : Number(digits));
              }}
              error={errors.GSTPercentage}
              maxLength={5}
              placeholder="Enter GST Percentage "
            />
          </div>

          <div>
            <Input
              label="GST Value"
              required
              value={formData.GSTValue ?? ''}
              error={errors.GSTValue}
              readOnly
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};


