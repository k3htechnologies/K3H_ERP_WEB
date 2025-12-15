import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { LeaveData } from '@/features/leave/models/LeaveModel';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { Button } from '@/ui/components/forms/Button';
import { formatDateDisplay, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';

const ViewLeave: React.FC = () => {
  const location = useLocation() as { state?: { data?: LeaveData | null } };
  const navigate = useNavigate();
  const data = location.state?.data ?? null;

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded p-6 shadow-sm text-center">
          <p className="text-gray-600 mb-4">No leave record to view.</p>
          <Button onClick={() => navigate(-1)} color="blue" size="sm">
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Leave Details</h2>
          <Button onClick={() => navigate(-1)} size="sm" variant="outline">
            Back
          </Button>
        </div>

        <div className="space-y-4">
          <FieldItem label="Leave Type" value={data.LeaveType || 'N/A'} isRow withBorder />
          <FieldItem label="Leave Type Code" value={data.LeaveTypeCode || 'N/A'} isRow withBorder />
          <FieldItem label="Start Date" value={formatDateDisplay(data.StartDate)} isRow withBorder />
          <FieldItem label="End Date" value={formatDateDisplay(data.EndDate)} isRow withBorder />
          <FieldItem label="Start Duration" value={data.StartDateLeaveDuration || 'N/A'} isRow withBorder />
          <FieldItem label="End Duration" value={data.EndDateLeaveDuration || 'N/A'} isRow withBorder />
          <FieldItem label="No Of Days" value={data.NoOfDays?.toString() || '0'} isRow withBorder />
          <FieldItem label="Reason" value={data.Reason || '-'} isRow withBorder />
          <FieldItem label="Document URL" value={data.LeaveDocumentURL || '-'} isRow withBorder />
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold pb-2">Action Details</h4>
          <FieldItem
            label="Created By / Date"
            isRow
            value={`${data.CreatedBy ?? '-'} - ${formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')}`}
            withBorder={!!data.ModifiedBy}
          />
          {data.ModifiedBy ? (
            <FieldItem
              label="Modified By / Date"
              isRow
              value={`${data.ModifiedBy ?? '-'} - ${formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')}`}
              withBorder={false}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ViewLeave;


