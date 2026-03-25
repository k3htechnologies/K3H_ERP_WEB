import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button } from '@/ui/components/forms';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import type { EarningMasterData } from '@/features/earningMaster/models/EarningMasterModel';

interface EarningMasterViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: EarningMasterData | null;
  canAction: boolean;
  onEdit: (data: EarningMasterData) => void;
  onDelete: (data: EarningMasterData) => void;
}

export const EarningMasterViewModal: React.FC<EarningMasterViewModalProps> = ({
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
      title="Earning Details"
      onSubmit={(e) => {
        e.preventDefault()
        onClose()
      }}
      cancelText="Close"
      loading={false}
      size='xl'
    >
      <div className="space-y-6">
          <FieldItem label="Earning Name" value={data.Name} isRow withBorder={true} className='font-medium text-blue-900 ' />
          <FieldItem label="Type" value={data.Type} isRow withBorder={true} />
          <FieldItem label="Applicable" value={data.Applicable} isRow withBorder={true} />
          <FieldItem label="Value" value={data.Value} isRow withBorder={true} />
          <FieldItem label="Min Salary (₹)" value={data.MinSalary} isRow withBorder={true} />
          <FieldItem label="Max Salary (₹)" value={data.MaxSalary} isRow withBorder={true} />
          <FieldItem label="BranchName" value={data.BranchName} isRow withBorder={true} />
          
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
