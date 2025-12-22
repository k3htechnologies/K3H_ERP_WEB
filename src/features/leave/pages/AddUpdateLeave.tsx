import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Input } from '@/ui/components/forms';
import { TextArea } from '@/ui/components/forms/Textarea';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { fetchLeaveTypeMasterDropdown } from '@/features/leaveTypeMaster/leaveTypeMasterDropdown';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
import { MultiFilePicker } from '@/ui/components/ImagePicker/MultiFilePicker';
import type { AddUpdateLeaveRequest, LeaveData } from '@/features/leave/models/LeaveModel';
import { LeaveService } from '@/features/leave/services/LeaveService';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { formatDate_dd_mm_yyyy } from '@/core/utils/dateFormat';
import { DateRangePickerModal } from '@/ui/components/forms/DateRangePickerModal';
import { Calendar } from 'lucide-react';

const LEAVE_DURATION_OPTIONS = [
  { label: 'Full Day', value: 'Full' },
  { label: 'Half Day (First Half)', value: 'HalfFirst' },
  { label: 'Half Day (Second Half)', value: 'HalfSecond' },
];

const initialFormState = (): AddUpdateLeaveRequest => ({
  LeaveId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  LeaveTypeMasterId: 0,
  StartDate: null,
  EndDate: null,
  StartDateLeaveDuration: 'Full',
  EndDateLeaveDuration: 'Full',
  Reason: '',
  LeaveDocumentFiles: [],
});

export const AddUpdateLeave: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation() as { state?: { data?: LeaveData | null } };
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [formData, setFormData] = useState<AddUpdateLeaveRequest>(initialFormState());
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [dropdownLabels, setDropdownLabels] = useState<{ leaveTypeName?: string }>({});

  useEffect(() => {
    const incoming = location.state?.data;
    if (id && incoming) {
      setFormData({
        LeaveId: incoming.LeaveId,
        Uniquekey: incoming.Uniquekey || initialFormState().Uniquekey,
        LeaveTypeMasterId: incoming.LeaveTypeMasterId,
        StartDate: incoming.StartDate,
        EndDate: incoming.EndDate,
        StartDateLeaveDuration: incoming.StartDateLeaveDuration || 'Full',
        EndDateLeaveDuration: incoming.EndDateLeaveDuration || 'Full',
        Reason: incoming.Reason || '',
        LeaveDocumentFiles: [],
      });
      
      // Set label if provided, otherwise fetch it
      if (incoming.LeaveType) {
        setDropdownLabels({
          leaveTypeName: incoming.LeaveType,
        });
      } else if (incoming.LeaveTypeMasterId) {
        // Auto-fetch label if not provided
        const fetchLeaveTypeLabel = async () => {
          try {
            const result = await fetchLeaveTypeMasterDropdown(1, { value: '' });
            const found = result.itemList.find(
              item => Number(item.value) === incoming.LeaveTypeMasterId
            );
            if (found) {
              setDropdownLabels({
                leaveTypeName: found.label,
              });
            }
          } catch (error) {
            console.error('Failed to fetch leave type label:', error);
          }
        };
        void fetchLeaveTypeLabel();
      } else {
        setDropdownLabels({});
      }
    } else {
      setFormData(initialFormState());
      setDropdownLabels({});
    }
    setErrors({});
  }, [id, location.state]);

  const handleSave = async () => {
    const newErrors: { [k: string]: string } = {};
    if (!formData.LeaveTypeMasterId) newErrors.LeaveTypeMasterId = 'Leave Type is required';
    const finalStart = formData.StartDate;
    const finalEnd = formData.EndDate;
    if (!finalStart) newErrors.StartDate = 'Start Date is required';
    if (!finalEnd) newErrors.EndDate = 'End Date is required';
    if (!formData.StartDateLeaveDuration) newErrors.StartDateLeaveDuration = 'Start duration required';
    if (!formData.EndDateLeaveDuration) newErrors.EndDateLeaveDuration = 'End duration required';
    if (!formData.Reason || formData.Reason.trim() === '') newErrors.Reason = 'Reason is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSaving(true);
    const payload: AddUpdateLeaveRequest = {
      ...formData,
      StartDate: finalStart,
      EndDate: finalEnd,
      LeaveDocumentFiles: formData.LeaveDocumentFiles || [],
    };
    const respEither = await LeaveService.apiCallAddUpdateLeave(payload);
    if (E.isRight(respEither)) {
      addToast({ type: 'success', title: 'Saved', message: 'Leave saved successfully' });
      navigate(-1);
    } else {
      addToast({ type: 'error', title: 'Failed', message: respEither.left.message });
    }
    setIsSaving(false);
  };

  return (
    <div className="p-6 pb-24">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            {formData.LeaveId && formData.LeaveId !== 0 ? 'Update Leave' : 'Add Leave'}
          </h2>
        </div>

        <div className="space-y-4">
          <SingleSelectDropdownWithPagination
            label="Leave Type"
            title="Select Leave Type"
            size="lg"
            required
            dataFetchCallBack={async (pageNumber: number, params?: { value?: string }) =>
              fetchLeaveTypeMasterDropdown(pageNumber, params)
            }
            onSelected={(item) => {
              setFormData((prev) => ({ ...prev, LeaveTypeMasterId: Number(item.value) }));
              setDropdownLabels((prev) => ({ ...prev, leaveTypeName: item.label }));
            }}
            initialValue={createDropdownInitialValue(
              formData.LeaveTypeMasterId ? String(formData.LeaveTypeMasterId) : null,
              dropdownLabels.leaveTypeName,
            )}
            error={errors.LeaveTypeMasterId}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range <span className="text-red-500">*</span>
              </label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDateModalOpen(true)}
                className="w-full justify-start"
                leftIcon={<Calendar className="h-4 w-4" />}
              >
                {formData.StartDate && formData.EndDate
                  ? `${formatDate_dd_mm_yyyy(formData.StartDate)} - ${formatDate_dd_mm_yyyy(formData.EndDate)}`
                  : 'Select Date Range'}
              </Button>
              {(errors.StartDate || errors.EndDate) && (
                <p className="text-sm text-red-600 mt-1">{errors.StartDate || errors.EndDate}</p>
              )}
            </div>
          </div>


          <TextArea
            label="Reason"
            required
            value={formData.Reason || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setFormData((prev) => ({ ...prev, Reason: e.target.value }))
            }
            error={errors.Reason}
            placeholder="Enter reason"
            rows={3}
          />

          <MultiFilePicker
            label="Leave Documents"
            value={formData.LeaveDocumentFiles || []}
            onChange={(files) => setFormData((prev) => ({ ...prev, LeaveDocumentFiles: files }))}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 shadow-md">
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            size="sm"
          >
            Cancel
          </Button>
          <Button
            color="blue"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              void handleSave();
            }}
            disabled={isSaving}
          >
            Save
          </Button>
        </div>
      </div>

      <DateRangePickerModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onConfirm={(startDate, endDate) => {
          setFormData((prev) => ({
            ...prev,
            StartDate: startDate,
            EndDate: endDate,
          }));
          setIsDateModalOpen(false);
          if (errors.StartDate || errors.EndDate) {
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.StartDate;
              delete newErrors.EndDate;
              return newErrors;
            });
          }
        }}
        startDate={formData.StartDate || null}
        endDate={formData.EndDate || null}
        title="Select Leave Date Range"
        confirmText="Confirm Dates"
        cancelText="Cancel"
        showSummary={false}
        renderChildren={({ startDate, endDate, onSelectField, onClearField }) => (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={startDate ? formatDate_dd_mm_yyyy(startDate) : ''}
                  placeholder="Select start date"
                  onClick={() => onSelectField?.('start')}
                  className="cursor-pointer"
                />
                {startDate && (
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => onClearField?.('start')}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={endDate ? formatDate_dd_mm_yyyy(endDate) : ''}
                  placeholder="Select end date"
                  onClick={() => onSelectField?.('end')}
                  className="cursor-pointer"
                />
                {endDate && (
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => onClearField?.('end')}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <SingleSelectDropdownWithPagination
                label="Start Date Duration"
                title="Select Duration"
                size="lg"
                required
                dataFetchCallBack={async () => ({
                  totalNumberOfRecord: LEAVE_DURATION_OPTIONS.length,
                  itemList: LEAVE_DURATION_OPTIONS,
                })}
                onSelected={(item) => setFormData((prev) => ({ ...prev, StartDateLeaveDuration: String(item.value) }))}
                initialValue={
                  formData.StartDateLeaveDuration
                    ? {
                        label:
                          LEAVE_DURATION_OPTIONS.find((d) => d.value === formData.StartDateLeaveDuration)?.label ||
                          formData.StartDateLeaveDuration,
                        value: formData.StartDateLeaveDuration,
                      }
                    : null
                }
                error={errors.StartDateLeaveDuration}
              />

              <SingleSelectDropdownWithPagination
                label="End Date Duration"
                title="Select Duration"
                size="lg"
                required
                dataFetchCallBack={async () => ({
                  totalNumberOfRecord: LEAVE_DURATION_OPTIONS.length,
                  itemList: LEAVE_DURATION_OPTIONS,
                })}
                onSelected={(item) => setFormData((prev) => ({ ...prev, EndDateLeaveDuration: String(item.value) }))}
                initialValue={
                  formData.EndDateLeaveDuration
                    ? {
                        label:
                          LEAVE_DURATION_OPTIONS.find((d) => d.value === formData.EndDateLeaveDuration)?.label ||
                          formData.EndDateLeaveDuration,
                        value: formData.EndDateLeaveDuration,
                      }
                    : null
                }
                error={errors.EndDateLeaveDuration}
              />
            </div>

            <Input
              label="Total Days (auto)"
              value={
                formData.StartDate && formData.EndDate
                  ? (() => {
                      const start = new Date(formData.StartDate);
                      const end = new Date(formData.EndDate);
                      if (isNaN(start.getTime()) || isNaN(end.getTime())) return '0';
                      const diff = end.getTime() - start.getTime();
                      const days = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
                      const startHalf = formData.StartDateLeaveDuration?.startsWith('Half') ? 0.5 : 1;
                      const endHalf = formData.EndDateLeaveDuration?.startsWith('Half') ? 0.5 : 1;
                      if (days <= 1) {
                        return Math.max(startHalf, endHalf).toString();
                      }
                      return ((days - 2) + startHalf + endHalf).toString();
                    })()
                  : '0'
              }
              readOnly
            />
          </div>
        )}
      />
    </div>
  );
};

export default AddUpdateLeave;


