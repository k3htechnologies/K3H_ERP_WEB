import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { LeaveCreditDebitData } from '@/features/leaveCreditDebit/models/LeaveCreditDebitModel';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { Button } from '@/ui/components/forms/Button';

export const ViewLeaveCreditDebit: React.FC = () => {
  const location = useLocation() as {
    state?: { data?: LeaveCreditDebitData | null };
  };
  const navigate = useNavigate();
  const data = location.state?.data ?? null;

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded p-6 shadow-sm text-center">
          <p className="text-gray-600 mb-4">No record to view.</p>
          <Button onClick={() => navigate(-1)} color="blue" size="sm">
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Leave Credit / Debit Details</h2>

        <div className="space-y-6">
          <div className="space-y-4">
            <FieldItem label="Period Mode" value={data.LeavePeriodMode || 'N/A'} isRow withBorder />
            <FieldItem label="Financial Year" value={data.FYyear?.toString() || 'N/A'} isRow withBorder />
            <FieldItem label="Month" value={data.Month || 'N/A'} isRow withBorder />
            <FieldItem label="Department" value={data.DepartmentMasterId || 'N/A'} isRow withBorder />
            <FieldItem label="Employee" value={data.EmployeeId || 'N/A'} isRow withBorder />
          </div>

          {data.LeaveBalanceType && data.LeaveBalanceType.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold pb-2">Leave Balance Types</h4>
              <div className="space-y-2">
                {data.LeaveBalanceType.map((item, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <FieldItem label="Leave Type ID" value={item.LeaveTypeId?.toString() || 'N/A'} isRow={false} />
                      <FieldItem label="Leave Credit" value={item.LeaveCredit?.toString() || '0'} isRow={false} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="text-lg font-semibold pb-2">Action Details</h4>
            <FieldItem
              label="Created By / Date"
              isRow
              value={`${data.CreatedBy} - ${formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')}`}
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

          <div className="flex justify-end">
            <Button color="blue" onClick={() => navigate(-1)} size="sm">
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLeaveCreditDebit;

