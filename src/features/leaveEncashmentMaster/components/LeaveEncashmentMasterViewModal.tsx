import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button } from '@/ui/components/forms';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import type { LeaveEncashmentMasterData } from '@/features/leaveEncashmentMaster/models/LeaveEncashmentMasterModel';

interface LeaveEncashmentMasterViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: LeaveEncashmentMasterData | null;
  canAction: boolean;
  onEdit: (data: LeaveEncashmentMasterData) => void;
  onDelete: (data: LeaveEncashmentMasterData) => void;
}

export const LeaveEncashmentMasterViewModal: React.FC<LeaveEncashmentMasterViewModalProps> = ({
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
      title="Leave Encashment Details"
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
          <FieldItem label="Earning Name" value={data.EarningMasterName} isRow withBorder={true} className='font-medium text-blue-900 ' />
          <FieldItem label="Encashment Rate (%)" value={data.EncashmentRate} isRow withBorder={true} />
          <FieldItem label="Min Salary (₹)" value={data.MinSalary} isRow withBorder={true} />
          <FieldItem label="Max Salary (₹)" value={data.MaxSalary} isRow withBorder={true} />
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
