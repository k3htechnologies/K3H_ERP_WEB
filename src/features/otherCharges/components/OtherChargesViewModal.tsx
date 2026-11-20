import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button } from '@/ui/components/forms';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import type { OtherChargesData } from '@/features/otherCharges/models/OtherChargesModel';
import { formatCurrency } from '@/core/utils/comman';

interface OtherChargesViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: OtherChargesData | null;
  canActionSale: boolean;
  canActionTenant: boolean;
  onEdit: (data: OtherChargesData) => void;
  onDelete: (data: OtherChargesData) => void;
}

export const OtherChargesViewModal: React.FC<OtherChargesViewModalProps> = ({
  isOpen,
  onClose,
  data,
  canActionSale,
  canActionTenant,
  onEdit,
  onDelete
}) => {
  if (!data) return null;

  const canAction =
    data.ApplicableFor?.trim().toUpperCase() === 'SALE' ? canActionSale
      : data.ApplicableFor?.trim().toUpperCase() === 'TENANT' ? canActionTenant
        : false;

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
      title="Other Charges Details"
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
            label="Applicable For"
            value={
              <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                {data.ApplicableFor}
              </span>
            }
            isRow
            withBorder={true}
          />

          <FieldItem
            label="Charges"
            value={data.ChargeName}
            isRow
            withBorder={true}
            className="font-medium text-blue-900 "
          />
          <FieldItem
            label="Value"
            value={formatCurrency(data.Value ?? '0')}
            isRow
            withBorder={true}
          />
          <FieldItem
            label="Calculated On"
            value={data.CalculatedOn}
            isRow
            withBorder={true}
          />
          <FieldItem
            label="GST Percentage"
            value={data.GSTPercentage ? `${data.GSTPercentage} %` : '-'}
            isRow
            withBorder={true}
          />
          <FieldItem
            label="GST Value"
            value={formatCurrency(data.GSTValue ?? '0')}
            isRow
            withBorder={true}
          />
          <FieldItem
            label="Value + GST Value"
            value={formatCurrency(data.Value + data.GSTValue) ?? '0'}
            isRow
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

        <div className="flex justify-between items-center">
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


