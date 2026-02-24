import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import { MultiFilePicker } from '@/ui/components/ImagePicker/MultiFilePicker';
import type { AddUpdateHolidayMasterRequest } from '@/features/holidayMaster/models/HolidayMasterModel';

interface HolidayMasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: AddUpdateHolidayMasterRequest;
  onFieldChange: (field: keyof AddUpdateHolidayMasterRequest, value: any) => void;
  errors: { [k: string]: string };
  editingData: any;
  loading: boolean;
  holidayFiles: (File | string)[];
  setHolidayFiles: (files: (File | string)[]) => void;
  holidayURL?: string;
  removedHolidayUrls: string[];
  setRemovedHolidayUrls: (urls: string[]) => void;
}

export const HolidayMasterFormModal: React.FC<HolidayMasterFormModalProps> = ({
  isOpen,
  onClose,
  onCancel,
  onSubmit,
  formData,
  onFieldChange,
  errors,
  editingData,
  loading,
  holidayFiles,
  setHolidayFiles,
  removedHolidayUrls,
  setRemovedHolidayUrls
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onCancel={onCancel}
      title={editingData ? 'Update Holiday ' : 'Add Holiday'}
      onSubmit={onSubmit}
      saveText={editingData ? 'Update' : 'Add'}
      loading={loading}
      size="xl"
    >
      <div className="space-y-6 p-6 bg-blue-100">
        <div className='space-y-4'>
          <div>
            <Input
              type="text"
              label='Holiday Name'
              value={formData.HolidayName ?? ''}
              onChange={(e) => onFieldChange("HolidayName", e.target.value)}
              required
              maxLength={50}
              placeholder="Enter Holiday Name"
              error={errors.HolidayName}
            />
          </div>
          <div>
            <MultiFilePicker
              label="Holiday Photo"
              placeholder="Select Holiday Photo"
              required
              error={errors.HolidayURL}
              value={holidayFiles}
              onChange={setHolidayFiles}
              allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
              maxFiles={5}
              maxSizeMB={10}
              onRemoveExisting={(url) => {
                setRemovedHolidayUrls([...removedHolidayUrls, url])
              }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
