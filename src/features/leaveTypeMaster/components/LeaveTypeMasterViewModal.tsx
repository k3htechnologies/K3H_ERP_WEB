import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button } from '@/ui/components/forms';
import { Edit, Trash2 } from 'lucide-react';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import type { LeaveTypeMasterData } from '@/features/leaveTypeMaster/models/LeaveTypeMasterModel';

interface LeaveTypeMasterViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: LeaveTypeMasterData | null;
  canAction: boolean;
  onEdit: (data: LeaveTypeMasterData) => void;
  onDelete: (data: LeaveTypeMasterData) => void;
}

export const LeaveTypeMasterViewModal: React.FC<LeaveTypeMasterViewModalProps> = ({
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
      title="Leave Type Details"
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
          <FieldItem label="Leave Type" value={data.LeaveType} isRow withBorder={true} className='font-medium text-blue-900 ' />
          <FieldItem label="Leave Type Code" value={data.LeaveTypeCode} isRow withBorder={true} />
          <FieldItem label="Carry Forward" value={data.IsCarryForward ? "Yes" : "No"} isRow withBorder={true} />
          <FieldItem label="Max Carry Forward" value={data.MaxCarryForward} isRow withBorder={true} />
          <FieldItem label="Encashable" value={data.IsEncashable ? "Yes" : "No"} isRow withBorder={true} />
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
      </div>
    </Modal>
  );
};
