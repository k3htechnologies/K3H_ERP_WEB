import { useMemo } from 'react';
import type { AttendanceData } from '@/features/attendanceCalendar/models/AttendanceModel';

export function useGroupedAttendance(attendanceList: AttendanceData[]) {
    return useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const grouped = new Map<number, AttendanceData[]>();

        attendanceList.forEach((item) => {
            if (!grouped.has(item.EmployeeId)) grouped.set(item.EmployeeId, []);
            grouped.get(item.EmployeeId)!.push(item);
        });

        return Array.from(grouped.entries())
            .map(([employeeId, items]) => {
                const sortedItems = [...items].sort((a, b) => {
                    const dA = a.AttendanceDate?.split('T')[0] ?? '';
                    const dB = b.AttendanceDate?.split('T')[0] ?? '';
                    if (dA === todayStr && dB !== todayStr) return -1;
                    if (dB === todayStr && dA !== todayStr) return 1;
                    return dB.localeCompare(dA);
                });
                const latest = sortedItems[0];
                const hasTodayData = sortedItems.some(i => i.AttendanceDate?.split('T')[0] === todayStr);

                return {
                    EmployeeId: employeeId,
                    FullName: items[0].FullName,
                    PunchIn: latest.PunchIn,
                    PunchOut: latest.PunchOut,
                    PunchInAddress: latest.PunchInAddress,
                    PunchOutAddress: latest.PunchOutAddress,
                    WorkingHours: latest.WorkingHours,
                    AttendanceStatus: latest.AttendanceStatus,
                    _groupedItems: sortedItems,
                    _hasTodayData: hasTodayData,
                };
            })
            .sort((a, b) => {
                if (a._hasTodayData && !b._hasTodayData) return -1;
                if (!a._hasTodayData && b._hasTodayData) return 1;
                return 0;
            });
    }, [attendanceList]);
}