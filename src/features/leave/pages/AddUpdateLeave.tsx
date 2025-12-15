import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Input, DateRangePickerModal } from '@/ui/components/forms';
import { TextArea } from '@/ui/components/forms/Textarea';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { fetchLeaveTypeMasterDropdown } from '@/features/leaveCreditDebit/leaveTypeMasterDropdown';
import { MultiFilePicker } from '@/ui/components/ImagePicker/MultiFilePicker';
import type { AddUpdateLeaveRequest, LeaveData } from '@/features/leave/models/LeaveModel';
import { LeaveService } from '@/features/leave/services/LeaveService';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from '@/core/utils/dateFormat';

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
  const { addToast, toasts, removeToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(true);
  const [formData, setFormData] = useState<AddUpdateLeaveRequest>(initialFormState());
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [modalKey, setModalKey] = useState(0);

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
    } else {
      setFormData(initialFormState());
    }
    setErrors({});
  }, [id, location.state]);

  const handleSave = async (startDate: string | null, endDate: string | null) => {
    const newErrors: { [k: string]: string } = {};
    if (!formData.LeaveTypeMasterId) newErrors.LeaveTypeMasterId = 'Leave Type is required';
    const finalStart = startDate ?? formData.StartDate;
    const finalEnd = endDate ?? formData.EndDate;
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
      setIsModalOpen(false);
      navigate(-1);
    } else {
      addToast({ type: 'error', title: 'Failed', message: respEither.left.message });
    }
    setIsSaving(false);
  };

  return (
    <DateRangePickerModal
      key={modalKey}
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        navigate(-1);
      }}
      onConfirm={handleSave}
      onReset={() => {
        setFormData(initialFormState());
        setErrors({});
        setModalKey((k) => k + 1);
      }}
      title={formData.LeaveId ? 'Update Leave' : 'Add Leave'}
      startDate={formData.StartDate}
      endDate={formData.EndDate}
      showTimePicker={false}
      confirmText="Save"
      cancelText="Close"
      resetText="Reset"
      loading={isSaving}
      showSummary={false}
      renderChildren={({ startDate, endDate, onSelectField, onClearField, editingField }) => (
        <div className="space-y-4">
          <SingleSelectDropdownWithPagination
            label="Leave Type"
            title="Select Leave Type"
            size="lg"
            required
            dataFetchCallBack={async (pageNumber: number, params?: { value?: string }) =>
              fetchLeaveTypeMasterDropdown(pageNumber, params)
            }
            onSelected={(item) => setFormData((prev) => ({ ...prev, LeaveTypeMasterId: Number(item.value) }))}
            initialValue={
              formData.LeaveTypeMasterId
                ? { label: String(formData.LeaveTypeMasterId), value: String(formData.LeaveTypeMasterId) }
                : null
            }
            error={errors.LeaveTypeMasterId}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateInput
              label="Start Date"
              required
              value={formatDate_dd_mm_yyyy(startDate) || null}
              onChange={(value) => {
                const converted = convert_dd_mm_yyyy_To_Yyyy_mm_dd(value);
                setFormData((prev) => ({ ...prev, StartDate: converted }));
                onSelectField?.('start');
              }}
              onClear={() => {
                setFormData((prev) => ({ ...prev, StartDate: null }));
                onClearField?.('start');
              }}
              isActive={editingField === 'start'}
              error={errors.StartDate}
              showClearButton
            />

            <DateInput
              label="End Date"
              required
              value={formatDate_dd_mm_yyyy(endDate) || null}
              onChange={(value) => {
                const converted = convert_dd_mm_yyyy_To_Yyyy_mm_dd(value);
                setFormData((prev) => ({ ...prev, EndDate: converted }));
                onSelectField?.('end');
              }}
              onClear={() => {
                setFormData((prev) => ({ ...prev, EndDate: null }));
                onClearField?.('end');
              }}
              isActive={editingField === 'end'}
              error={errors.EndDate}
              showClearButton
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      )}
    />
  );
};

export default AddUpdateLeave;


