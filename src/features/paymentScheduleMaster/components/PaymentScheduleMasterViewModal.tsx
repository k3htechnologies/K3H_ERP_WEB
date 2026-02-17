import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button } from '@/ui/components/forms';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import type { PaymentScheduleMasterData } from '@/features/paymentScheduleMaster/models/PaymentScheduleMasterModel';

interface PaymentScheduleMasterViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PaymentScheduleMasterData | null;
  canAction: boolean;
  onEdit: (data: PaymentScheduleMasterData) => void;
  onDelete: (data: PaymentScheduleMasterData) => void;
}

export const PaymentScheduleMasterViewModal: React.FC<PaymentScheduleMasterViewModalProps> = ({
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
      title="Payment Schedule Master Details"
      onSubmit={e => {
        e.preventDefault();
        onClose();
      }}
      cancelText="Close"
      loading={false}
      size="xl"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          
          <FieldItem
            label="Type"
            value={data.Type || '-'}
            isRow
            withBorder={true}
            className="font-medium text-blue-900 "
          />
          <FieldItem
            label="Date / Stage"
            value={data.Date ? `₹ ${data.Date}` : '-'}
            isRow
            withBorder={true}
          />
          <FieldItem
            label="Percentage"
            value={data.Percentage ? `${data.Percentage} %` : '-'}
            isRow
            withBorder={true}
          />
          <FieldItem
            label="Cumulative"
            value={data.Cumulative ? `${data.Cumulative} %` : '-'}
            isRow
            withBorder={true}
          />
          <FieldItem
            label="Amount"
            value={data.Amount ? `₹ ${data.Amount}` : '-'}
            isRow
            withBorder={true}
          />
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold pb-2">Action Details</h4>
          <FieldItem
            label="Created By / Date"
            isRow={true}
            value={
              data.CreatedBy +
              ' - ' +
              formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')
            }
            withBorder={data.ModifiedBy !== '' ? true : false}
          />
          {data.ModifiedBy !== '' ? (
            <FieldItem
              label="Modified By / Date"
              isRow={true}
              value={
                data.ModifiedBy +
                ' - ' +
                formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')
              }
              withBorder={false}
            />
          ) : (
            ''
          )}
        </div>

        <div className="flex justify-between items-center pt-4">
          {canAction && (
            <>
              <Button
                color="red"
                variant="solid"
                colorMode="light"
                size="md"
                onClick={handleDelete}
              >
                Delete
              </Button>

              <Button color="blue" size="md" onClick={handleEdit}>
                Edit
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};


