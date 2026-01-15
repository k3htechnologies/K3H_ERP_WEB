import React, { useMemo } from 'react';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { convertToISO, getStatusTextColor } from '../utils/attendanceUtils';
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
                {attendance.AttendanceStatus || '-'}
              </span>
            </div>
          </div>
        </div>
        <FieldItem label="Attendance Date" isRow value={formattedDate} />
        <FieldItem label="Punch In" isRow value={attendance.PunchIn || '-'} />
        <FieldItem label="Punch Out" isRow value={attendance.PunchOut || '-'} />
        <FieldItem label="Working Hours" isRow value={attendance.WorkingHours || '-'} />
        <FieldItem label="Punch In Address" isRow value={attendance.PunchInAddress || '-'} />
        <FieldItem label="Punch Out Address" isRow value={attendance.PunchOutAddress || '-'} />
      </div>
    </div>
  );
});

AttendanceDetailsCard.displayName = 'AttendanceDetailsCard';

