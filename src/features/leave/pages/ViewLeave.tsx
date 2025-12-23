import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText } from 'lucide-react';
import type { LeaveData } from '@/features/leave/models/LeaveModel';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { Button } from '@/ui/components/forms/Button';
import { formatDateDisplay, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { LeaveService } from '@/features/leave/services/LeaveService';
import useToast from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';

const ViewLeave: React.FC = () => {
  const location = useLocation() as { state?: { data?: LeaveData | null } };
  const navigate = useNavigate();
  const data = location.state?.data ?? null;
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);

  const handleEditLeave = () => {
    if (!data?.LeaveId) return;
    navigate(`/leave/add/${data.LeaveId}`, {
      state: {
        data,
      },
    });
  };

  const handleDeleteLeave = async () => {
    if (!data?.LeaveId || !data?.Uniquekey) return;

    const payload = {
      LeaveId: data.LeaveId,
      Uniquekey: data.Uniquekey,
    };

    setIsDeleting(true);
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const response = await LeaveService.apiCallDeleteLeave(payload);
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
      'Deleting Leave'
    );
    setIsDeleting(false);
  };

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
            <h2 className="text-2xl font-semibold text-gray-900">Leave Details</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              color="blue"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEditLeave();
              }}
            >
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              color="red"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="mt-6 rounded border border-gray-200">
                <div className="px-4 py-2">
                  <h4 className="font-semibold text-sm text-gray-800">Details</h4>
                </div>
                <div className="p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                    <FieldItem label="Leave Type" value={data.LeaveType || '-'} isRow={false} />
                    <FieldItem label="Leave Type Code" value={data.LeaveTypeCode || '-'} isRow={false} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                    <FieldItem label="Start Date" value={formatDateDisplay(data.StartDate)} isRow={false} />
                    <FieldItem label="End Date" value={formatDateDisplay(data.EndDate)} isRow={false} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                    <FieldItem label="Start Duration" value={data.StartDateLeaveDuration || '-'} isRow={false} />
                    <FieldItem label="End Duration" value={data.EndDateLeaveDuration || '-'} isRow={false} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                    <FieldItem label="No Of Days" value={data.NoOfDays?.toString() || '0'} isRow={false} />
                    <FieldItem label="Document URL" value={data.LeaveDocumentURL || '-'} isRow={false} />
                  </div>
                  <div className="pb-3 border-b border-gray-200 last:border-b-0">
                    <FieldItem label="Reason" value={data.Reason || '-'} isRow={false} />
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded border border-gray-200">
                <div className="px-4 py-2">
                  <h4 className="font-semibold text-sm text-gray-800">Action Details</h4>
                </div>
                <div className="p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                    <FieldItem label="Created By" value={data.CreatedBy || '-'} isRow={false} />
                    <FieldItem
                      label="Created Date"
                      value={formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')}
                      isRow={false}
                    />
                  </div>
                  {data.ModifiedBy ? (
                    <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                      <FieldItem label="Modified By" value={data.ModifiedBy ?? '-'} isRow={false} />
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

            <div className="space-y-4">
              {data.LeaveDocumentURL ? (
                <div className="mt-6 rounded border border-gray-200">
                  <div className="px-4 py-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-700" />
                    <h4 className="font-semibold text-sm text-gray-800">Leave Document</h4>
                  </div>
                  <div className="p-4">
                    <a
                      href={data.LeaveDocumentURL}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-all"
                    >
                      {data.LeaveDocumentURL}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded border border-gray-200">
                  <div className="px-4 py-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-700" />
                    <h4 className="font-semibold text-sm text-gray-800">Leave Document</h4>
                  </div>
                  <div className="p-4 text-gray-500 text-sm">No document uploaded.</div>
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
          void handleDeleteLeave();
        }}
        title="You are about to delete this leave?"
        message="Are you sure you want to proceed."
        confirmText="Delete"
        cancelText="Cancel"
        loading={isDeleting}
        variant="danger"
      />
    </div>
  );
};

export default ViewLeave;


