import React, { useCallback, useMemo } from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { TimePicker } from '@/ui/components/TimePicker/TimePicker';
import { TextArea } from '@/ui/components/forms/Textarea';
import { getStatusTextColor, extractTimeFromDateTime, getStatusLabel } from '../utils/attendanceUtils';
import { formatTimeFromDateTime } from '@/core/utils/dateFormat';
import type { AttendanceData } from '../models/AttendanceModel';

export interface RegularizeFormData {
  AttendanceRegularizationId: number | null;
  Uniquekey: string | null;
  AttendanceDate: string | null;
  PunchInTime: string | null;
  PunchOutTime: string | null;
  Reason: string | null;
}

interface RegularizeModalProps {
  isOpen: boolean;
  isLoading: boolean;
  selectedAttendance: AttendanceData | null;
  formData: RegularizeFormData;
  errors: { [key: string]: string };
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFieldChange: (field: keyof RegularizeFormData, value: string | null) => void;
  onReset?: () => void;
}

export const RegularizeModal = React.memo<RegularizeModalProps>(({
  isOpen,
  isLoading,
  selectedAttendance,
  formData,
  errors,
  onClose,
  onSubmit,
  onFieldChange,
  onReset,
}) => {
  const statusTextColor = useMemo(
    () => selectedAttendance ? getStatusTextColor(selectedAttendance.AttendanceStatus) : '',
    [selectedAttendance]
  );
  const statusLabel = useMemo(() => {
    return selectedAttendance?.AttendanceStatus ? getStatusLabel(selectedAttendance.AttendanceStatus) : '-';
  }, [selectedAttendance]);

  const reasonCharCount = useMemo(
    () => formData.Reason ? 255 - formData.Reason.length : 0,
    [formData.Reason]
  );

  const isCheckoutMissing = useMemo(() => {
    if (!selectedAttendance) return false;
    const status = selectedAttendance.AttendanceStatus || '';
    const normalized = status.toUpperCase().replace(/[\s-]+/g, '_');
    return normalized === 'CHECKOUT_MISSING' ||
      normalized.includes('CHECKOUT') ||
      normalized.includes('MISSING');
  }, [selectedAttendance]);

  // Extract time from Punch In datetime for display
  const punchInTimeDisplay = useMemo(() => {
    if (!selectedAttendance?.PunchIn) return '-';

    // Try extracting time using the utility function
    let extractedTime = extractTimeFromDateTime(selectedAttendance.PunchIn);

    // If extraction failed, try manual parsing with more formats
    if (!extractedTime) {
      const punchInStr = String(selectedAttendance.PunchIn).trim();

      // Try to extract time from various formats
      // Format: "2025-01-01T10:30:00" or "2025-01-01T10:30:00.000Z"
      if (punchInStr.includes('T')) {
        const timePart = punchInStr.split('T')[1];
        if (timePart) {
          const [hours, minutes] = timePart.split(':');
          if (hours && minutes) {
            extractedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
          }
        }
      }
      // Format: "01/01/2025 10:30:00" or "01/01/2025 10:30 AM"
      else if (punchInStr.includes(' ')) {
        const parts = punchInStr.split(' ');
        for (const part of parts) {
          if (/^\d{1,2}:\d{2}/.test(part)) {
            const timeOnly = part.replace(/\s*(AM|PM)/i, '').split(':');
            if (timeOnly.length >= 2) {
              extractedTime = `${timeOnly[0].padStart(2, '0')}:${timeOnly[1].padStart(2, '0')}`;
              break;
            }
          }
        }
      }
      // Format: "10:30:00" or "10:30"
      else if (/^\d{1,2}:\d{2}/.test(punchInStr)) {
        const [hours, minutes] = punchInStr.split(':');
        if (hours && minutes) {
          extractedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        }
      }
    }

    // Prefer centralized formatter to include AM/PM and proper UTC -> local conversion
    const formattedWithAmPm = formatTimeFromDateTime(String(selectedAttendance.PunchIn));
    if (formattedWithAmPm && formattedWithAmPm.trim() !== '') return formattedWithAmPm;

    return extractedTime || selectedAttendance.PunchIn || '-';
  }, [selectedAttendance]);

  const handlePunchInChange = useCallback(
    (val: string | null) => onFieldChange('PunchInTime', val),
    [onFieldChange]
  );

  const handlePunchOutChange = useCallback(
    (val: string | null) => onFieldChange('PunchOutTime', val),
    [onFieldChange]
  );

  const handleReasonChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => onFieldChange('Reason', e.target.value),
    [onFieldChange]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Regularize Attendance"
      onSubmit={onSubmit}
      saveText="Regularize"
      cancelText="Cancel"
      resetText={onReset ? "Reset" : undefined}
      onreset={onReset}
      size="lg"
      loading={isLoading}
      className="max-w-2xl w-full mx-4"
    >
      <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-blue-50">
        {selectedAttendance && (
          <div className="space-y-3 sm:space-y-4">
            {/* Employee Info */}
            <div className="bg-white rounded-lg p-2 sm:p-3 border border-gray-200">
              <div className="space-y-2">
                <FieldItem
                  label="Employee Name"
                  value={selectedAttendance.FullName || '-'}
                  isRow
                  withBorder={false}
                />
                <div className="space-y-2">
                  <div style={{ display: 'grid', gridTemplateColumns: '180px 16px 1fr', gap: 8, alignItems: 'center', width: '100%' }}>
                    <div className="text-sm font-medium text-[#1D1D1D80] truncate">
                      Current Status
                    </div>
                    <div className="text-sm text-[#1D1D1D80] text-center select-none">:</div>
                    <div className="text-sm text-[#1D1D1D] font-medium break-words min-w-0">
                      <span style={{ color: statusTextColor }}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                </div>
                <FieldItem
                  label="Attendance Date"
                  value={formData.AttendanceDate || '-'}
                  isRow
                  withBorder={false}
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 sm:space-y-4">
              {/* For Checkout Missing: Show Punch In time (read-only) and Punch Out time picker */}
              {isCheckoutMissing ? (
                <>
                  {/* Punch In Time - Read-only display (extracted from datetime) */}
                  <div className="bg-white rounded-lg p-2 sm:p-3 border border-gray-200">
                    <FieldItem
                      label="Punch In Time"
                      value={punchInTimeDisplay}
                      isRow
                      withBorder={false}
                    />
                  </div>

                  {/* Punch Out Time - Editable for checkout missing */}
                  <div className="w-full">
                    <TimePicker
                      label="Punch Out Time"
                      format={24}
                      value={formData.PunchOutTime || '00:00'}
                      onChange={handlePunchOutChange}
                      error={errors.PunchOutTime}
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Punch In Time - Full Width (for other statuses like Absent) */}
                  <div className="w-full">
                    <TimePicker
                      label="Punch In Time"
                      format={24}
                      value={formData.PunchInTime || '00:00'}
                      onChange={handlePunchInChange}
                      error={errors.PunchInTime}
                    />
                  </div>
                  <div className="w-full">
                    <TimePicker
                      label="Punch Out Time"
                      format={24}
                      value={formData.PunchOutTime || '00:00'}
                      onChange={handlePunchOutChange}
                      error={errors.PunchOutTime}
                    />
                  </div>
                </>
              )}

              {/* Reason */}
              <div className="w-full">
                <TextArea
                  label="Reason"
                  value={formData.Reason || ''}
                  onChange={handleReasonChange}
                  required
                  error={errors.Reason}
                  maxLength={255}
                  placeholder="Enter reason for regularization (required)"
                  rows={4}
                />
                {!errors.Reason && formData.Reason && (
                  <p className="mt-1 text-sm text-gray-500">
                    {reasonCharCount} characters remaining
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
});

RegularizeModal.displayName = 'RegularizeModal';

