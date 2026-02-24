import { useState, useCallback, useEffect } from 'react';
import * as E from 'fp-ts/Either';
import { runApiWithLoader } from '@/core/utils';
import { useToast } from '@/core/hooks/useToast';
import { usePagination } from '@/core/hooks/usePagination';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd } from '@/core/utils/dateFormat';  // ← existing util
import { updateFilter } from '@/core/utils/filterHelper';
import { handleExportFile } from '@/core/utils/exportFile';
import type { FilterInfo, TableColumn, SortInfo } from '@/ui/components/DataTable/DataTable';

import { employeeResignationService } from '@/features/resignation/services/EmployeeResignationService';
import { attendanceService } from '@/features/attendanceCalendar/services/AttendanceService';
import { attendanceRegularizationService } from '@/features/attendanceCalendar/services/AttendanceRegularizationService';
import { compOffService } from '@/features/compOff/services/CompOffServices';
import { LeaveService } from '@/features/leave/services/LeaveService';
import { outDoorService } from '@/features/outdoor/services/OutDoorDataService';

import type { EmployeeResignationData, FilterWithPaginationEmployeeResignationRequest } from '@/features/resignation/models/EmployeeResignationModel';
import type { AttendanceData, AttendanceRegularizationData, FilterWithPaginationAttendanceRequest, FilterWithPaginationAttendanceRegularizationRequest } from '@/features/attendanceCalendar/models/AttendanceModel';
import type { CompOffData, FilterWithPaginationCompOff } from '@/features/compOff/models/compOff';
import type { LeaveData, FilterWithPaginationLeaveRequest } from '@/features/leave/models/LeaveModel';
import type { OutDoorMasterData, FilterWithPaginationOutDoor } from '@/features/outdoor/models/OutDoorModel';

import { type TabId, EXPORT_LABELS, getDefaultFilters } from '../constants/tabConfig';

const toYMD = (v?: string): string | undefined =>
  convert_dd_mm_yyyy_To_Yyyy_mm_dd(v) ?? undefined;

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useTabData(activeTab: TabId, attendanceTableRef: React.RefObject<any>) {
  const { addToast } = useToast();
  const { pagination, setPagination } = usePagination(20);

  // ── Per-tab data ───────────────────────────────────────────────────────────
  const [compOffList, setCompOffList] = useState<CompOffData[]>([]);
  const [leaveList, setLeaveList] = useState<LeaveData[]>([]);
  const [outDoorList, setOutDoorList] = useState<OutDoorMasterData[]>([]);
  const [employeeResignationList, setEmployeeResignationList] = useState<EmployeeResignationData[]>([]);
  const [attendanceList, setAttendanceList] = useState<AttendanceData[]>([]);
  const [attendanceRegularizationList, setAttendanceRegularizationList] = useState<AttendanceRegularizationData[]>([]);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>(undefined);

  // ── Shared internals ───────────────────────────────────────────────────────

  const runLoader = useCallback(
    (label: string, fn: () => Promise<any>) =>
      runApiWithLoader(setIsLoading, setLoadingMessage, fn, undefined,
        (err: any) => addToast({ type: 'error', title: err.message }), undefined, label),
    [addToast]
  );

  const commitPagination = useCallback(
    (page: number, total: number) =>
      setPagination({ currentPage: page, totalRecords: total, totalPages: Math.ceil(total / pagination.pageSize) }),
    [pagination.pageSize, setPagination]
  );

  // Shared StartDate/EndDate params builder — uses existing convert_dd_mm_yyyy_To_Yyyy_mm_dd
  const dateParams = useCallback(
    (f: FilterInfo) => ({ StartDate: toYMD(f.StartDate), EndDate: toYMD(f.EndDate) }),
    []
  );

  const empName = useCallback(
    (f: FilterInfo) => searchTerm?.trim() || f.EmployeeName?.trim() || undefined,
    [searchTerm]
  );

  // ── Loaders ────────────────────────────────────────────────────────────────

  const loadResignations = useCallback(async (page: number, f: FilterInfo = filters) => {
    await runLoader('Loading Employee Resignation', async () => {
      const params: FilterWithPaginationEmployeeResignationRequest = {
        PageNumber: page, PageSize: pagination.pageSize, IsCheckPermission: true,
        EmployeeName: empName(f),
        ResignationDateFrom: toYMD(f.ResignationDateFrom),
        ResignationDateTo: toYMD(f.ResignationDateTo),
      };
      const res = await employeeResignationService.apiCallPullEmployeeResignation(params);
      if (E.isRight(res)) { setEmployeeResignationList(res.right.Data); commitPagination(page, res.right.TotalNumberOfRecord); }
      else addToast({ type: 'error', title: res.left.message });
      return res;
    });
  }, [filters, pagination.pageSize, empName, runLoader, commitPagination, addToast]);

  const loadAttendance = useCallback(async (page: number, f: FilterInfo = filters) => {
    await runLoader('Loading Attendance', async () => {
      const params: FilterWithPaginationAttendanceRequest = {
        PageNumber: page, PageSize: pagination.pageSize, IsReport: true,
        ...dateParams(f), EmployeeName: empName(f),
      };
      const res = await attendanceService.apiCallPullAttendance(params);
      if (E.isRight(res)) {
        setAttendanceList(res.right.Data);
        commitPagination(page, res.right.TotalNumberOfRecord);
        // Auto-expand rows with today's attendance data
        setTimeout(() => {
          const todayStr = new Date().toISOString().split('T')[0];
          const byEmp = new Map<number, AttendanceData[]>();
          res.right.Data.forEach((item: AttendanceData) => {
            if (!byEmp.has(item.EmployeeId)) byEmp.set(item.EmployeeId, []);
            byEmp.get(item.EmployeeId)!.push(item);
          });
          byEmp.forEach((items, employeeId) => {
            if (items.some(i => i.AttendanceDate?.split('T')[0] === todayStr)) {
              attendanceTableRef.current?.expandRow(String(employeeId), {
                EmployeeId: employeeId, FullName: items[0].FullName, _groupedItems: items,
              });
            }
          });
        }, 300);
      } else addToast({ type: 'error', title: res.left.message });
      return res;
    });
  }, [filters, pagination.pageSize, empName, dateParams, runLoader, commitPagination, addToast, attendanceTableRef]);

  const loadAttendanceRegularization = useCallback(async (page: number, f: FilterInfo = filters) => {
    await runLoader('Loading Attendance Regularization', async () => {
      const params: FilterWithPaginationAttendanceRegularizationRequest = {
        PageNumber: page, PageSize: pagination.pageSize, IsReport: true,
        ...dateParams(f), EmployeeName: empName(f),
      };
      const res = await attendanceRegularizationService.apiCallPullAttendanceRegularization(params);
      if (E.isRight(res)) { setAttendanceRegularizationList(res.right.Data); commitPagination(page, res.right.TotalNumberOfRecord); }
      else addToast({ type: 'error', title: res.left.message });
      return res;
    });
  }, [filters, pagination.pageSize, empName, dateParams, runLoader, commitPagination, addToast]);

  const loadCompOff = useCallback(async (page: number, f: FilterInfo = filters) => {
    await runLoader('Loading Comp Off', async () => {
      const params: FilterWithPaginationCompOff = {
        PageNumber: page, PageSize: pagination.pageSize, IsReport: true,
        ...dateParams(f), EmployeeName: empName(f),
      };
      const res = await compOffService.apiCallPullCompOff(params);
      if (E.isRight(res)) { setCompOffList(res.right.Data); commitPagination(page, res.right.TotalNumberOfRecord); }
      else addToast({ type: 'error', title: res.left.message });
      return res;
    });
  }, [filters, pagination.pageSize, empName, dateParams, runLoader, commitPagination, addToast]);

  const loadLeave = useCallback(async (page: number, f: FilterInfo = filters) => {
    await runLoader('Loading Leave', async () => {
      const params: FilterWithPaginationLeaveRequest = {
        PageNumber: page, PageSize: pagination.pageSize,
        ...dateParams(f), EmployeeName: empName(f),
      };
      const res = await LeaveService.apiCallPullLeave(params);
      if (E.isRight(res)) { setLeaveList(res.right.Data); commitPagination(page, res.right.TotalNumberOfRecord); }
      else addToast({ type: 'error', title: res.left.message });
      return res;
    });
  }, [filters, pagination.pageSize, empName, dateParams, runLoader, commitPagination, addToast]);

  const loadOutdoor = useCallback(async (page: number, f: FilterInfo = filters) => {
    await runLoader('Loading Outdoor', async () => {
      const params: FilterWithPaginationOutDoor = {
        PageNumber: page, PageSize: pagination.pageSize,
        ...dateParams(f), EmployeeName: empName(f),
      };
      const res = await outDoorService.apiCallPullOutDoor(params);
      if (E.isRight(res)) { setOutDoorList(res.right.Data); commitPagination(page, res.right.TotalNumberOfRecord); }
      else addToast({ type: 'error', title: res.left.message });
      return res;
    });
  }, [filters, pagination.pageSize, empName, dateParams, runLoader, commitPagination, addToast]);

  // ── Tab dispatcher — dictionary map, no if/else ────────────────────────────

  const dispatchLoad = useCallback(
    (page: number, f?: FilterInfo, tab: TabId = activeTab) => {
      const LOADER_MAP: Record<TabId, (p: number, f?: FilterInfo) => Promise<void>> = {
        'Attendance': loadAttendance,
        'Attendance Regularization': loadAttendanceRegularization,
        'Comp-Off': loadCompOff,
        'Leave': loadLeave,
        'Outdoor': loadOutdoor,
        'Resignation': loadResignations,
      };
      return LOADER_MAP[tab](page, f);
    },
    [activeTab, loadAttendance, loadAttendanceRegularization, loadCompOff, loadLeave, loadOutdoor, loadResignations]
  );

  // ── Initialization ─────────────────────────────────────────────────────────

  useEffect(() => {
    setSearchTerm('');
    setSortInfo(undefined);
    const def = getDefaultFilters(activeTab);
    setFilters(def);
    setTempFilters(def);
    dispatchLoad(1, def, activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ── Filter actions ─────────────────────────────────────────────────────────

  const applyFilters = useCallback(() => {
    setFilters(tempFilters);
    dispatchLoad(1, tempFilters);
    setShowFilterPopup(false);
  }, [tempFilters, dispatchLoad]);

  const clearFilters = useCallback(() => {
    const empty: FilterInfo = {};
    setTempFilters(empty);
    setFilters(empty);
    setPagination({ currentPage: 1 });
    dispatchLoad(1, empty);
    setShowFilterPopup(false);
  }, [dispatchLoad, setPagination]);

  const handleFilterChange = useCallback(
    (key: string, value: string) => setTempFilters(prev => updateFilter(prev, key, value)),
    []
  );

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    dispatchLoad(1);
  }, [dispatchLoad]);

  // ── Export — dictionary map, no if/else ───────────────────────────────────

  const handleExportPdf = useCallback(async (getCurrentColumns: () => TableColumn[], currentSortInfo?: SortInfo) => {
    await runLoader('Preparing Export...', async () => {
      const cols = getCurrentColumns();
      let sortByParam: string | undefined;
      if (currentSortInfo) {
        const col = cols.find(c => c.key === currentSortInfo.column);
        if (col) sortByParam = `${col.label} ${currentSortInfo.direction.toUpperCase()}`;
      }

      const base = {
        PageNumber: 1, PageSize: pagination.totalRecords || 1000,
        EmployeeName: searchTerm?.trim() || filters.EmployeeName?.trim() || undefined,
        SortBy: sortByParam, ExportType: 'PDF' as const,
      };
      // Uses existing convert_dd_mm_yyyy_To_Yyyy_mm_dd via toYMD
      const dates = { StartDate: toYMD(filters.StartDate), EndDate: toYMD(filters.EndDate) };

      const EXPORT_MAP: Record<TabId, () => Promise<any>> = {
        'Comp-Off': () => compOffService.apiCallPullCompOff({ ...base, ...dates, IsReport: true }),
        'Leave': () => LeaveService.apiCallPullLeave({ ...base, ...dates }),
        'Outdoor': () => outDoorService.apiCallPullOutDoor({ ...base, ...dates }),
        'Resignation': () => employeeResignationService.apiCallPullEmployeeResignation({
          ...base, IsCheckPermission: true,
          ResignationDateFrom: toYMD(filters.ResignationDateFrom),
          ResignationDateTo: toYMD(filters.ResignationDateTo),
        }),
        'Attendance': () => attendanceService.apiCallPullAttendance({ ...base, ...dates, IsReport: true }),
        'Attendance Regularization': () => attendanceRegularizationService.apiCallPullAttendanceRegularization({ ...base, ...dates, IsReport: true }),
      };

      const res = await EXPORT_MAP[activeTab]();
      handleExportFile(res, 'PDF', EXPORT_LABELS[activeTab], addToast);
      return res;
    });
  }, [activeTab, filters, pagination.totalRecords, searchTerm, runLoader, addToast]);

  // ── Current data — dictionary map ─────────────────────────────────────────

  const getCurrentData = useCallback(() => {
    const DATA_MAP: Record<TabId, any[]> = {
      'Attendance': attendanceList,
      'Attendance Regularization': attendanceRegularizationList,
      'Comp-Off': compOffList,
      'Leave': leaveList,
      'Outdoor': outDoorList,
      'Resignation': employeeResignationList,
    };
    return DATA_MAP[activeTab] ?? [];
  }, [activeTab, attendanceList, attendanceRegularizationList, compOffList, leaveList, outDoorList, employeeResignationList]);

  // ── Expose ─────────────────────────────────────────────────────────────────

  return {
    isLoading, loadingMessage,
    searchTerm, setSearchTerm,
    filters, tempFilters,
    showFilterPopup, setShowFilterPopup,
    sortInfo, setSortInfo,
    pagination, setPagination,
    attendanceList,
    getCurrentData,
    dispatchLoad,
    applyFilters, clearFilters,
    handleFilterChange, clearSearch,
    handleExportPdf,
  };
}