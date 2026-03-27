import React, { useMemo } from 'react';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy, formatTimeFromDateTime, convertUtcToLocal } from '@/core/utils/dateFormat';
import { convertToISO, getStatusTextColor, getStatusLabel } from '../utils/attendanceUtils';
import type { AttendanceData } from '../models/AttendanceModel';

interface AttendanceDetailsCardProps {
  attendance: AttendanceData;
}

export const AttendanceDetailsCard = React.memo<AttendanceDetailsCardProps>(({
  attendance,
}) => {
  const formattedDate = useMemo(() => {
    if (!attendance.AttendanceDate) return '-';
    const isoDate = convertToISO(attendance.AttendanceDate);
    return formatDate_dd_MonthName_yy(isoDate || attendance.AttendanceDate);
  }, [attendance.AttendanceDate]);

  const statusTextColor = useMemo(
    () => getStatusTextColor(attendance.AttendanceStatus),
    [attendance.AttendanceStatus]
  );

  const statusLabel = useMemo(() => {
    return attendance.AttendanceStatus ? getStatusLabel(attendance.AttendanceStatus) : '-';
  }, [attendance.AttendanceStatus]);

  const formattedPunchIn = useMemo(() => {
    if (!attendance.PunchIn) return '-';
    try {
      const localDate = convertUtcToLocal(attendance.PunchIn);
      if (localDate) {
        const dateStr = formatDate_dd_MonthName_yy(localDate);
        const timeStr = formatTimeFromDateTime(attendance.PunchIn);
        return timeStr ? `${dateStr} ${timeStr}` : dateStr;
      }
      // Fallback: try to format as is
      const timeStr = formatTimeFromDateTime(attendance.PunchIn);
      return timeStr || attendance.PunchIn;
    } catch {
      return attendance.PunchIn;
    }
  }, [attendance.PunchIn]);

  const formattedPunchOut = useMemo(() => {
    if (!attendance.PunchOut) return '-';
    try {
      const localDate = convertUtcToLocal(attendance.PunchOut);
      if (localDate) {
        const dateStr = formatDate_dd_MonthName_yy(localDate);
        const timeStr = formatTimeFromDateTime(attendance.PunchOut);
        return timeStr ? `${dateStr} ${timeStr}` : dateStr;
      }
      // Fallback: try to format as is
      const timeStr = formatTimeFromDateTime(attendance.PunchOut);
      return timeStr || attendance.PunchOut;
    } catch {
      return attendance.PunchOut;
    }
  }, [attendance.PunchOut]);

  return (

    <div className="rounded-lg border border-gray-200 p-3 sm:p-4 bg-white hover:shadow-md transition-shadow w-full">

      <div className="space-y-1.5 sm:space-y-2">
        
        <div className="py-2">
          <div style={{ display: 'grid', gridTemplateColumns: '180px 16px 1fr', gap: 8, alignItems: 'center', width: '100%' }}>
            <div className="text-sm font-medium text-[#1D1D1D80] truncate">
              Attendance Status
            </div>

            <div className="text-sm text-[#1D1D1D80] text-center select-none">:</div>
            <div className="text-sm text-[#1D1D1D] font-medium break-words min-w-0">
              <span style={{ color: statusTextColor }}>
                {statusLabel}
              </span>
            </div>

          </div>
        </div>

        <FieldItem label="Attendance Date" isRow value={formattedDate} />
        <FieldItem label="Punch In" isRow value={formattedPunchIn} />
        <FieldItem label="Punch Out" isRow value={formattedPunchOut} />
        <FieldItem label="Working Hours" isRow value={attendance.WorkingHours || '-'} />
        <FieldItem label="Punch In Address" isRow value={attendance.PunchInAddress || '-'} />
        <FieldItem label="Punch Out Address" isRow value={attendance.PunchOutAddress || '-'} />
      </div>
    </div>
  );
});

AttendanceDetailsCard.displayName = 'AttendanceDetailsCard';

