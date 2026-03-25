import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button } from '@/ui/components/forms';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import type { MaterialMasterData } from '@/features/materialMaster/models/MaterialMasterModel';

interface MaterialMasterViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MaterialMasterData | null;
  canAction: boolean;
  onEdit: (data: MaterialMasterData) => void;
  onDelete: (data: MaterialMasterData) => void;
}

export const MaterialMasterViewModal: React.FC<MaterialMasterViewModalProps> = ({
  isOpen,
  onClose,
  data,
  canAction,
  onEdit,
  onDelete
}) => {
  if (!data) return null;

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
    onEdit(data);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
    onDelete(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Material Master Details"
      onSubmit={(e) => {
        e.preventDefault()
        onClose()
      }}
      cancelText="Close"
      loading={false}
      size='xl'
    >
      <div className="space-y-6">
        <FieldItem label="Material Code" value={data.MaterialCode?.toString()} isRow withBorder={true} />
        <FieldItem label="Material Name" value={data.MaterialName} isRow withBorder={true} className='font-medium text-blue-900 ' />

        <h4 className="text-lg font-semibold">
          Action Details
        </h4>
        <FieldItem label="Created By / Date" isRow={true} value={data.CreatedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')} withBorder={data.ModifiedBy !== '' ? true : false} />
        {data.ModifiedBy !== '' ?
          <FieldItem label="Modified By / Date" isRow={true} value={data.ModifiedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')} withBorder={false} />
          :
          ''}

        <div className="flex justify-between items-center">
          {canAction && (
            <>
              <Button
                color='red'
                variant='solid'
                colorMode="light"
                size='md'
                onClick={handleDelete}
              >

                Delete
              </Button>
              <Button
                color='blue'
                size='md'
                onClick={handleEdit}
              >
                Edit
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
