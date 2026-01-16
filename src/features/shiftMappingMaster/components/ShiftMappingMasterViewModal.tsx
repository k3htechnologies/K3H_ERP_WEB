import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button } from '@/ui/components/forms';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import type { ShiftMappingMasterData } from '@/features/shiftMappingMaster/models/ShiftMappingMasterModel';

interface ShiftMappingMasterViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShiftMappingMasterData | null;
  canAction: boolean;
  onEdit: (data: ShiftMappingMasterData) => void;
  onDelete: (data: ShiftMappingMasterData) => void;
}

export const ShiftMappingMasterViewModal: React.FC<ShiftMappingMasterViewModalProps> = ({
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
      title="Shift Mapping Details"
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
          {data.DepartmentName && (<FieldItem label="Department Name" value={data.DepartmentName} isRow withBorder={true} className='font-medium text-blue-900 ' />)}
          {data.EmployeeName && (<FieldItem label="Employee Name" value={data.EmployeeName} isRow withBorder={true} />)}
          <FieldItem label="Shift Name" value={data.ShiftName} isRow withBorder={true} />
          <FieldItem label="Shift Code" value={data.ShiftCode} isRow withBorder={true} />
          <FieldItem label="Shift Time" value={`${data.ShiftBeginTime} - ${data.ShiftEndTime}`} isRow withBorder={true} />
          <FieldItem label="Shift Duration Time" value={data.ShiftDurationTime} isRow withBorder={true} />
          <FieldItem label="Duration Time" value={data.ShiftWorkDurationTime} isRow />
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
