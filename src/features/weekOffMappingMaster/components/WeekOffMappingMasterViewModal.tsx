import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button } from '@/ui/components/forms';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import type { WeekOffMappingMasterData } from '@/features/weekOffMappingMaster/models/WeekOffMappingMasterModel';

interface WeekOffMappingMasterViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WeekOffMappingMasterData | null;
  canAction: boolean;
  onEdit: (data: WeekOffMappingMasterData) => void;
  onDelete: (data: WeekOffMappingMasterData) => void;
}

export const WeekOffMappingMasterViewModal: React.FC<WeekOffMappingMasterViewModalProps> = ({
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
      title="Week Off Mapping Details"
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
          <FieldItem label="Week Off Policy Name" value={data.WeekOffPolicyName} isRow withBorder={true} className='font-medium text-blue-900 ' />
          <FieldItem label="Week Off Policy Code" value={data.WeekOffPolicyCode} isRow withBorder={true} />
          {data.DepartmentName && (<FieldItem label="Department Name" value={data.DepartmentName} isRow withBorder={true} />)}
          {data.EmployeeName && (<FieldItem label="Employee Name" value={data.EmployeeName} isRow withBorder={true} />)}
          <FieldItem label="Week Days" value={data.WeekDays} isRow withBorder={true} />
          <FieldItem label="Week Days Starts On" value={data.WeekDaysStartsOn} isRow withBorder={true} />
          <FieldItem label="Weekly Off" value={data.WeeklyOff} isRow withBorder={true} />
          <FieldItem label="Weekly Off2" value={data.WeeklyOff2} isRow withBorder={true} />
          <FieldItem label="Weekly Off2 Type" value={data.WeeklyOff2Type} isRow withBorder={true} />
          <FieldItem label="Not Applicable For Months" value={data.NotApplicableForMonths} isRow withBorder={true} />
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
