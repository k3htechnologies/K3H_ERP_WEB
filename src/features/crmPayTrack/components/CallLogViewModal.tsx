import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import type { CallLogData } from '@/features/crmPayTrack/models/CallLogModel';

interface CallLogViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CallLogData | null;
  canAction: boolean;
}

export const CallLogViewModal: React.FC<CallLogViewModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!data) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Call Log Details"
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
            label="Call Date / Time"
            value={formatDate_dd_MonthName_yy_hh_mm(data.CallDate || '-')}
            isRow
            withBorder={true}
            className="font-medium text-blue-900 "
          />
          <FieldItem
            label="Duration"
            value={data.Duration}
            isRow
            withBorder={true}
          />
          <FieldItem
            label="Purpose"
            value={data.CallPurpose}
            isRow
            withBorder={true}
          />
           <FieldItem
            label="Status"
            value={data.CallStatus}
            isRow
            withBorder={true}
          />
          <FieldItem
            label="Promise Amount"
            value={data.PromiseAmount}
            isRow
            withBorder={true}
          />
           <FieldItem
            label="Remark"
            value={data.Remark}
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

      </div>
    </Modal>
  );
};


