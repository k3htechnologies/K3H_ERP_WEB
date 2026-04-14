import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button } from '@/ui/components/forms';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import type { BranchMasterData } from '@/features/branchMaster/models/BranchMasterModel';

interface BranchMasterViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: BranchMasterData | null;
  canAction: boolean;
  onEdit: (data: BranchMasterData) => void;
  onDelete: (data: BranchMasterData) => void;
}

export const BranchMasterViewModal: React.FC<BranchMasterViewModalProps> = ({
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
      title="Branch Details"
      onSubmit={(e) => {
        e.preventDefault()
        onClose()
      }}
      cancelText="Close"
      loading={false}
      size='xl'
    >
      <div className="space-y-6">
          <FieldItem label="Branch Name" value={data.BranchName} isRow withBorder={true} className='font-medium text-blue-900 ' />
          <FieldItem label="Branch Code" value={data.BranchCode} isRow withBorder={true} />
          <FieldItem label="Head Office" value={data.IsHeadOffice ? "Yes" : "No"} isRow withBorder={true} />
          <FieldItem label="Location" value={data.Location} isRow withBorder={true} />
       
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
