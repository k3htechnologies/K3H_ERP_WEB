import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { LeaveCreditDebitData, DeleteLeaveCreditDebitRequest } from '@/features/leaveCreditDebit/models/LeaveCreditDebitModel';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { Button } from '@/ui/components/forms/Button';
import { ChevronLeft } from 'lucide-react';
import { leaveCreditDebitService } from '@/features/leaveCreditDebit/services/LeaveCreditDebitService';
import useToast from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';


export const ViewLeaveCreditDebit: React.FC = () => {
  const location = useLocation() as {
    state?: { data?: LeaveCreditDebitData | null };
  };
  const navigate = useNavigate();
  const data = location.state?.data ?? null;
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);

  const handleEditLeaveCreditDebit = () => {
    if (!data?.LeaveCreditDebitId) return;
    navigate(`/leaveCreditDebit/add/${data.LeaveCreditDebitId}`, {
      state: {
        data: data,
      },
    });
  };

  const handleDeleteLeaveCreditDebit = async () => {
    if (!data?.LeaveCreditDebitId || !data?.Uniquekey) return;

    const payload: DeleteLeaveCreditDebitRequest = {
      LeaveCreditDebitId: data.LeaveCreditDebitId,
      Uniquekey: data.Uniquekey,
    };

    setIsDeleting(true);
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const response = await leaveCreditDebitService.apiCallDeleteLeaveCreditDebit(payload);
        if (E.isRight(response)) {
          addToast({ type: 'success', title: response.right.SuccessMessage?.[0] || 'Deleted successfully' });
          navigate(-1);
        } else {
          addToast({ type: 'error', title: response.left.message || 'Delete failed' });
        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error?.message || 'Delete failed' }),
      undefined,
      'Deleting Leave Credit/Debit'
    );
    setIsDeleting(false);
  };


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
        <Loader loading={isLoading} title={loadingMessage}>
          <div />
        </Loader>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ChevronLeft 
              className="w-6 h-6 text-blue-600 cursor-pointer hover:text-blue-800 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(-1);
              }}
            />
            <h2 className="text-2xl font-semibold text-gray-900">Leave Credit / Debit Details</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              color="blue"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEditLeaveCreditDebit();
              }}
            >
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              color='red'
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsConfirmationDialogBoxOpen(true);
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column - Details and Action Details */}
            <div className="space-y-4">
              <div className="mt-6 rounded border border-gray-200">
                <div className="px-4 py-2">
                  <h4 className="font-semibold text-sm text-gray-800">
                    Details
                  </h4>
                </div>
                <div className="p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                    <FieldItem label="Period Mode" value={data.LeavePeriodMode || '-'} isRow={false} />
                    <FieldItem label="Month" value={data.Month || '-'} isRow={false} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                    <FieldItem label="Financial Year" value={data.FYyear?.toString() || '-'} isRow={false} />
                    <FieldItem label="Department" value={data.DepartmentName || '-'} isRow={false} />
                  </div>
                  <div className="pb-3 border-b border-gray-200 last:border-b-0">
                    <FieldItem 
                      label="Designation" 
                      value={data.DesignationName ? (data.DesignationName.includes(',') ? data.DesignationName.split(',').map(d => d.trim()).join(', ') : data.DesignationName) : '-'} 
                      isRow={false} 
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded border border-gray-200">
                <div className="px-4 py-2">
                  <h4 className="font-semibold text-sm text-gray-800">
                    Action Details
                  </h4>
                </div>
                <div className="p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                    <FieldItem
                      label="Created By"
                      value={data.CreatedBy || '-'}
                      isRow={false}
                    />
                    <FieldItem
                      label="Created Date"
                      value={formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')}
                      isRow={false}
                    />
                  </div>
                  {data.ModifiedBy ? (
                    <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                      <FieldItem
                        label="Modified By"
                        value={data.ModifiedBy ?? '-'}
                        isRow={false}
                      />
                      <FieldItem
                        label="Modified Date"
                        value={formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')}
                        isRow={false}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Right column - Leave Balance Types */}
            <div className="space-y-4">
              {data.LeaveBalanceType && data.LeaveBalanceType.length > 0 && (
                <div className="mt-6 rounded border border-gray-200">
                  <div className="px-4 py-2">
                    <h4 className="font-semibold text-sm text-gray-800">
                      Leave Balance Types
                    </h4>
                  </div>
                  <div className="p-4 space-y-2">
                    {data.LeaveBalanceType.map((item, index) => (
                      <div key={index} className="pb-3 border-b border-gray-200 last:border-b-0">
                        <div className="grid grid-cols-2 gap-4">
                          <FieldItem label="Leave Type Name" value={item.LeaveTypeName || '-'} isRow={false} />
                          <FieldItem label="Leave Credit" value={item.LeaveCredit?.toString() || '0'} isRow={false} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmationDialogBox
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => setIsConfirmationDialogBoxOpen(false)}
        onConfirm={() => {
          setIsConfirmationDialogBoxOpen(false);
          void handleDeleteLeaveCreditDebit();
        }}
        title="You are about to delete this Leave Credit / Debit?"
        message="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        loading={isDeleting}
        variant="danger"
      />
    </div>
  );
};

export default ViewLeaveCreditDebit;

