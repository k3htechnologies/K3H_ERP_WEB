import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button } from '@/ui/components/forms';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import type { DesignationMasterData } from '@/features/designationMaster/models/DesignationMasterModel';

interface DesignationMasterViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DesignationMasterData | null;
  canAction: boolean;
  onEdit: (data: DesignationMasterData) => void;
  onDelete: (data: DesignationMasterData) => void;
}

export const DesignationMasterViewModal: React.FC<DesignationMasterViewModalProps> = ({
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
      title="Designation Master Details"
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
          <FieldItem label="Designation Name" value={data.DesignationName} isRow withBorder={true} />
          <FieldItem label="Notice Period" value={data.NoticePeriod} isRow withBorder={true} />
          <FieldItem label="Number of Employees" value={data.NumberOfEmployee} isRow withBorder={true} />
        </div>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold pb-2">
            Action Details
          </h4>
          <FieldItem label="Created By / Date" isRow={true} value={data.CreatedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')} withBorder={data.ModifiedBy !== '' ? true : false} />
          {data.ModifiedBy !== '' ?
            <FieldItem label="Modified By / Date" isRow={true} value={data.ModifiedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')} withBorder={false} />
            :
            ''}
        </div>
        <div className="flex justify-between items-center pt-4">
          {canAction && (
            <>
              {(data.NumberOfEmployee || 0) === 0 ? (
                <Button
                  color='red'
                  variant='solid'
                  colorMode="light"
                  size='md'
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              ) : <div style={{ width: "120px", height: "44px" }}></div>}

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
