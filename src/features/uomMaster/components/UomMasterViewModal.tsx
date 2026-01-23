import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import type { UomMasterData } from '@/features/uomMaster/models/UOMMasterModel';

interface UomMasterViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: UomMasterData | null;
}

export const UomMasterViewModal: React.FC<UomMasterViewModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  if (!data) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="UOM Master Details"
      onSubmit={(e) => {
        e.preventDefault()
        onClose()
      }}
      cancelText="Close"
      loading={false}
      size='xl'
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <FieldItem label="UOM Code" value={data.UomCode?.toString()} isRow withBorder={true} />
          <FieldItem label="UOM Name" value={data.Uom} isRow withBorder={true} className='font-medium text-blue-900 ' />
        </div>
      </div>
    </Modal>
  );
};
