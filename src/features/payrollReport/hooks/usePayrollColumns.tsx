import { useMemo, useCallback } from 'react';
import {
    formatDate_dd_MonthName_yy,  // ← existing util
    parseTimeFromISO,             // ← existing util
    formatTimeFromDateTime,       // ← existing util (replaces custom formatTime12Hour)
} from '@/core/utils/dateFormat';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';
import type { TableColumn as TableColumnWithoutBorder } from '@/ui/components/DataTable/DataTableWithoutBorder';
import { EmployeeTooltip, AddressTooltip, StatusBadge } from '../components/columnComponents';
import type { TabId } from '../constants/tabConfig';

export function usePayrollColumns() {

    7
    const fmt12h = useCallback(
        (v: any): string => formatTimeFromDateTime(v) || '-',
        []
    );

    const fmtHours = useCallback((v: any): string => v || '-', []);

    const sharedCols = useMemo(() => ({
        punchIn: (w: string) => ({ key: 'PunchIn', label: 'Punch In Time', width: w, sortable: false, align: 'left' as const, render: (v: any) => fmt12h(v) }),
        punchInAddr: (w: string) => ({ key: 'PunchInAddress', label: 'Punch In Address', width: w, sortable: false, align: 'left' as const, render: (v: any) => <AddressTooltip value={v} /> }),
        punchOut: (w: string) => ({ key: 'PunchOut', label: 'Punch Out Time', width: w, sortable: false, align: 'left' as const, render: (v: any) => fmt12h(v) }),
        punchOutAddr: (w: string) => ({ key: 'PunchOutAddress', label: 'Punch Out Address', width: w, sortable: false, align: 'left' as const, render: (v: any) => <AddressTooltip value={v} /> }),
        workingHours: (w: string) => ({ key: 'WorkingHours', label: 'Working Hours', width: w, sortable: false, align: 'left' as const, render: (v: any) => fmtHours(v) }),
        status: (w: string) => ({ key: 'AttendanceStatus', label: 'Status', width: w, sortable: false, align: 'left' as const, render: (v: any) => <StatusBadge value={v} /> }),
    }), [fmt12h, fmtHours]);

    // ── Per-tab column definitions ─────────────────────────────────────────────

    const attendanceRegularizationColumns = useMemo<TableColumn[]>(() => [
        { key: 'CreatedBy', label: 'Employee Name', width: '20', sortable: true, align: 'left', render: (v) => <EmployeeTooltip value={v} /> },
        { key: 'AttendanceDate', label: 'Attendance Date', width: '20', sortable: true, align: 'left', render: (v) => v ? formatDate_dd_MonthName_yy(v) : '-' },
        { key: 'PunchIn', label: 'Punch In', width: '15', sortable: false, align: 'left', render: (v) => parseTimeFromISO(v) },
        { key: 'PunchOut', label: 'Punch Out', width: '15', sortable: false, align: 'left', render: (v) => parseTimeFromISO(v) },
        { key: 'Reason', label: 'Reason', width: '35', sortable: false, align: 'left', render: (v) => v || '-' },
        { key: 'Status', label: 'Status', width: '15', sortable: false, align: 'left', render: (v) => v || '-' },
    ], []);

    const compOffColumns = useMemo<TableColumn[]>(() => [
        { key: 'CreatedBy', label: 'Employee Name', width: '20', sortable: true, align: 'left', render: (v) => <EmployeeTooltip value={v} /> },
        { key: 'CompOffDate', label: 'Comp Off Date', width: '25', sortable: true, align: 'left', render: (v) => v ? formatDate_dd_MonthName_yy(v) : '-' },
        { key: 'WorkingDate', label: 'Request Date', width: '25', sortable: false, align: 'left', render: (v) => v ? formatDate_dd_MonthName_yy(v) : '-' },
        { key: 'Reason', label: 'Reason', width: '50', sortable: false, align: 'left', render: (v) => v || '-' },
    ], []);

    const leaveColumns = useMemo<TableColumn[]>(() => [
        { key: 'CreatedBy', label: 'Employee Name', width: '20', sortable: true, align: 'left', render: (v) => <EmployeeTooltip value={v} /> },
        { key: 'LeaveType', label: 'Leave Type', width: '20', sortable: true, align: 'left', render: (v) => v || '-' },
        { key: 'StartDate', label: 'Start Date', width: '18', sortable: true, align: 'center', render: (v) => v ? formatDate_dd_MonthName_yy(v) : '-' },
        { key: 'EndDate', label: 'End Date', width: '18', sortable: true, align: 'center', render: (v) => v ? formatDate_dd_MonthName_yy(v) : '-' },
        { key: 'NoOfDays', label: 'No Of Days', width: '15', sortable: false, align: 'center', render: (v) => v || '-' },
        { key: 'Reason', label: 'Reason', width: '29', sortable: false, align: 'left', render: (v) => v || '-' },
    ], []);

    const outdoorColumns = useMemo<TableColumn[]>(() => [
        { key: 'CreatedBy', label: 'Employee Name', width: '20', sortable: true, align: 'left', render: (v) => <EmployeeTooltip value={v} /> },
        { key: 'OutDoorDate', label: 'Outdoor Date', width: '18', sortable: true, align: 'left', render: (v) => v ? formatDate_dd_MonthName_yy(v) : '-' },
        { key: 'OutDoorTime', label: 'Time', width: '12', sortable: false, align: 'center', render: (v) => v || '-' },
        { key: 'CompanyName', label: 'Company Name', width: '20', sortable: false, align: 'left', render: (v) => v || '-' },
        { key: 'Purpose', label: 'Purpose', width: '25', sortable: false, align: 'left', render: (v) => v || '-' },
        { key: 'DepartmentName', label: 'Department', width: '15', sortable: false, align: 'left', render: (v) => v || '-' },
        { key: 'AccompaniedByName', label: 'Accompanied By', width: '10', sortable: false, align: 'left', render: (v) => v || '-' },
    ], []);

    const resignationColumns = useMemo<TableColumn[]>(() => [
        { key: 'EmployeeName', label: 'Employee Name', width: '20', sortable: true, align: 'left', render: (v) => <EmployeeTooltip value={v} /> },
        { key: 'ResignationDate', label: 'Resignation Date', width: '18', sortable: false, align: 'left', render: (v) => v ? formatDate_dd_MonthName_yy(v) : '-' },
        { key: 'ExpectedRelievingDate', label: 'Expected Relieving Date', width: '20', sortable: false, align: 'left', render: (v) => v ? formatDate_dd_MonthName_yy(v) : '-' },
        { key: 'ReasonOfLeaving', label: 'Reason Of Leaving', width: '42', sortable: true, align: 'left', render: (v) => v || '-' },
    ], []);

    const attendanceColumns = useMemo<TableColumn[]>(() => [
        { key: 'FullName', label: 'Employee Name', width: '15', sortable: true, align: 'left', render: (v) => <EmployeeTooltip value={v} /> },
        sharedCols.punchIn('12') as TableColumn,
        sharedCols.punchInAddr('15') as TableColumn,
        sharedCols.punchOut('12') as TableColumn,
        sharedCols.punchOutAddr('15') as TableColumn,
        sharedCols.workingHours('15') as TableColumn,
        sharedCols.status('16') as TableColumn,
    ], [sharedCols]);

    const attendanceDetailsColumns = useMemo<TableColumnWithoutBorder[]>(() => [
        { key: 'AttendanceDate', label: 'Date', width: '15', sortable: false, align: 'left', render: (v: any) => v ? formatDate_dd_MonthName_yy(v) : '-' },
        sharedCols.punchIn('12') as TableColumnWithoutBorder,
        sharedCols.punchInAddr('15') as TableColumnWithoutBorder,
        sharedCols.punchOut('12') as TableColumnWithoutBorder,
        sharedCols.punchOutAddr('15') as TableColumnWithoutBorder,
        sharedCols.workingHours('15') as TableColumnWithoutBorder,
        sharedCols.status('16') as TableColumnWithoutBorder,
    ], [sharedCols]);

    // ── Column map — dictionary lookup replaces getCurrentColumns switch ────────

    const COLUMNS_MAP: Record<TabId, TableColumn[]> = useMemo(() => ({
        'Attendance': attendanceColumns,
        'Attendance Regularization': attendanceRegularizationColumns,
        'Comp-Off': compOffColumns,
        'Leave': leaveColumns,
        'Outdoor': outdoorColumns,
        'Resignation': resignationColumns,
    }), [attendanceColumns, attendanceRegularizationColumns, compOffColumns, leaveColumns, outdoorColumns, resignationColumns]);

    const getCurrentColumns = useCallback(
        (tab: TabId): TableColumn[] => COLUMNS_MAP[tab] ?? [],
        [COLUMNS_MAP]
    );

    return { attendanceColumns, attendanceDetailsColumns, getCurrentColumns };
}