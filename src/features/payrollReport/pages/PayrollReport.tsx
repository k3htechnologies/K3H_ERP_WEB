import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  EmployeeResignationData,
  FilterWithPaginationEmployeeResignationRequest
} from '@/features/resignation/models/EmployeeResignationModel';

import { employeeResignationService } from '@/features/resignation/services/EmployeeResignationService';
import { Loader } from '@/core/utils/loader';
import Tabs from '@/ui/components/Tab/Tab';
import { formatDate_dd_MonthName_yy, convert_dd_mm_yyyy_To_Yyyy_mm_dd, parseTimeFromISO, getTodayDate_dd_mm_yyyy } from '@/core/utils/dateFormat';
import { DataTable, type FilterInfo, type TableColumn, type PaginationInfo, type SortInfo } from '@/ui/components/DataTable/DataTable';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import useDebouncedCallback from '@/core/hooks/useDebouncedCallback';
import type { CompOffData, FilterWithPaginationCompOff } from '@/features/compOff/models/compOff';
import type { FilterWithPaginationLeaveRequest, LeaveData } from '@/features/leave/models/LeaveModel';
import type { FilterWithPaginationOutDoor, OutDoorMasterData } from '@/features/outdoor/models/OutDoorModel';
import { compOffService } from '@/features/compOff/services/CompOffServices';
import { LeaveService } from '@/features/leave/services/LeaveService';
import { outDoorService } from '@/features/outdoor/services/OutDoorDataService';
import type { FilterWithPaginationAttendanceRequest, AttendanceData, FilterWithPaginationAttendanceRegularizationRequest, AttendanceRegularizationData } from '@/features/attendanceCalendar/models/AttendanceModel';
import { attendanceService } from '@/features/attendanceCalendar/services/AttendanceService';
import { attendanceRegularizationService } from '@/features/attendanceCalendar/services/AttendanceRegularizationService';
import { Modal } from '@/ui/components/Modal/Modal';
import { DatePickerInput } from '@/ui/components/forms/Datepicker';
import { Input } from '@/ui/components/forms/Input';
import { updateFilter } from '@/core/utils/filterHelper';
import { handleExportFile } from '@/core/utils/exportFile';


export const PayrollReport: React.FC = () => {

  //#region STATE MANAGEMENT

  const [compOffList, setCompOffList] = useState<CompOffData[]>([]);
  const [leaveList, setLeaveList] = useState<LeaveData[]>([]);
  const [outDoorList, setOutDoorList] = useState<OutDoorMasterData[]>([]);
  const [employeeResignationList, setEmployeeResignationList] = useState<EmployeeResignationData[]>([]);
  const [attendanceList, setAttendanceList] = useState<AttendanceData[]>([]);
  const [attendanceRegularizationList, setAttendanceRegularizationList] = useState<AttendanceRegularizationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  // TOAST
  const { addToast } = useToast()

  // Tab-wise search state
  const [searchTerm, setSearchTerm] = useState('');

  // Tab-wise filter state
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  // Sort state
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>(undefined);

  //#endregion

  //#regionTAB ACTIVITY
  const tncTabList = [
    { id: "Attendance", label: "Attendance" },
    { id: "Attendance Regularization", label: "Attendance Regularization" },
    { id: "Comp-Off", label: "Comp-Off" },
    { id: "Leave", label: "Leave" },
    { id: "Outdoor", label: "Outdoor" },
    { id: "Resignation", label: "Resignation" },
  ];

  const [activeTab, setActiveTab] = useState<string>(tncTabList[0].id);

  //#endregion

  //#region DEBOUNCED SEARCH
  const debouncedSearch = useDebouncedCallback((_value: string) => {
    if (activeTab === "Comp-Off") loadCompOff(1);
    else if (activeTab === 'Leave') loadLeave(1);
    else if (activeTab === 'Outdoor') loadOutdoor(1);
    else if (activeTab === 'Resignation') loadResignations(1);
    else if (activeTab === "Attendance") loadAttendance(1);
    else if (activeTab === "Attendance Regularization") loadAttendanceRegularization(1);
  }, 350);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch])

  //#endregion

  //#region INITIALIZATION

  // Reset search and filters when tab changes
  useEffect(() => {
    setSearchTerm('');
    setSortInfo(undefined);

    // Set default dates for Attendance tab
    if (activeTab === "Attendance") {
      const todayStr = getTodayDate_dd_mm_yyyy();
      setFilters({ StartDate: todayStr, EndDate: todayStr });
      setTempFilters({ StartDate: todayStr, EndDate: todayStr });
    } else {
      setFilters({});
      setTempFilters({});
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "Attendance") loadAttendance(1);
    else if (activeTab === "Attendance Regularization") loadAttendanceRegularization(1);
    else if (activeTab === "Comp-Off") loadCompOff(1);
    else if (activeTab === 'Leave') loadLeave(1);
    else if (activeTab === 'Outdoor') loadOutdoor(1);
    else if (activeTab === 'Resignation') loadResignations(1);
  }, [activeTab]);

  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const loadResignations = async (page: number, filterParams?: FilterInfo) => {
    const activeFilters = filterParams || filters;
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        // Map StartDate/EndDate to ResignationDateFrom/ResignationDateTo for API
        const params: FilterWithPaginationEmployeeResignationRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          EmployeeId: searchTerm?.trim() && !isNaN(parseInt(searchTerm.trim())) ? parseInt(searchTerm.trim()) : (activeFilters.EmployeeId && !isNaN(parseInt(activeFilters.EmployeeId.toString())) ? parseInt(activeFilters.EmployeeId.toString()) : undefined),
          EmployeeName: activeFilters.EmployeeName?.trim() || undefined,
          ResignationDateFrom: activeFilters.StartDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(activeFilters.StartDate) || undefined : undefined,
          ResignationDateTo: activeFilters.EndDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(activeFilters.EndDate) || undefined : undefined,
          Status: activeFilters.Status?.trim() || undefined,
          ApprovalStatus: activeFilters.ApprovalStatus?.trim() || undefined,
          IsReport: true
        }

        const response = await employeeResignationService.apiCallPullEmployeeResignation(params);

        if (E.isRight(response)) {

          setEmployeeResignationList(response.right.Data);

          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });

        } else {

          addToast({ type: 'error', title: response.left.message });

        }

        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Loading Employee Resignation'
    )

  }

  const loadAttendance = async (page: number, filterParams?: FilterInfo) => {
    const activeFilters = filterParams || filters;

    // Use today's date as default if no filters are set
    const startDate = activeFilters.StartDate || getTodayDate_dd_mm_yyyy();
    const endDate = activeFilters.EndDate || getTodayDate_dd_mm_yyyy();

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationAttendanceRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          StartDate: startDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(startDate) || undefined : undefined,
          EndDate: endDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(endDate) || undefined : undefined,
          EmployeeName: searchTerm?.trim() || activeFilters.EmployeeName?.trim() || undefined,
          IsReport: true
        }

        const response = await attendanceService.apiCallPullAttendance(params);

        if (E.isRight(response)) {

          setAttendanceList(response.right.Data);

          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });

        } else {

          addToast({ type: 'error', title: response.left.message });

        }

        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Loading Attendance'
    )

  }
  const loadAttendanceRegularization = async (page: number, filterParams?: FilterInfo) => {
    const activeFilters = filterParams || filters;
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationAttendanceRegularizationRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          StartDate: activeFilters.StartDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(activeFilters.StartDate) || undefined : undefined,
          EndDate: activeFilters.EndDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(activeFilters.EndDate) || undefined : undefined,
          IsReport: true
        }

        const response = await attendanceRegularizationService.apiCallPullAttendanceRegularization(params);

        if (E.isRight(response)) {

          setAttendanceRegularizationList(response.right.Data);

          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });

        } else {

          addToast({ type: 'error', title: response.left.message });

        }

        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Loading Attendance Regularization'
    )

  }

  const loadCompOff = async (page: number, filterParams?: FilterInfo) => {
    const activeFilters = filterParams || filters;
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationCompOff = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          StartDate: activeFilters.StartDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(activeFilters.StartDate) || undefined : undefined,
          EndDate: activeFilters.EndDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(activeFilters.EndDate) || undefined : undefined,
          Reason: searchTerm?.trim() || activeFilters.Reason?.trim() || undefined,
          Status: activeFilters.Status?.trim() || undefined,
          EmployeeId: activeFilters.EmployeeId && !isNaN(parseInt(activeFilters.EmployeeId.toString())) ? parseInt(activeFilters.EmployeeId.toString()) : undefined,
          EmployeeName: activeFilters.EmployeeName?.trim() || undefined,
          IsReport: true
        }

        const response = await compOffService.apiCallPullCompOff(params);

        if (E.isRight(response)) {

          setCompOffList(response.right.Data);

          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });

        } else {

          addToast({ type: 'error', title: response.left.message });

        }

        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Loading Comp Off'
    )

  }
  const loadLeave = async (page: number, filterParams?: FilterInfo) => {
    const activeFilters = filterParams || filters;
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationLeaveRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          StartDate: activeFilters.StartDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(activeFilters.StartDate) || undefined : undefined,
          EndDate: activeFilters.EndDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(activeFilters.EndDate) || undefined : undefined,
          LeaveType: searchTerm?.trim() || activeFilters.LeaveType?.trim() || undefined,
          Status: activeFilters.Status?.trim() || undefined,
          EmployeeId: activeFilters.EmployeeId && !isNaN(parseInt(activeFilters.EmployeeId.toString())) ? parseInt(activeFilters.EmployeeId.toString()) : undefined,
          EmployeeName: activeFilters.EmployeeName?.trim() || undefined,
          IsReport: true
        }

        const response = await LeaveService.apiCallPullLeave(params);

        if (E.isRight(response)) {

          setLeaveList(response.right.Data);

          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });

        } else {

          addToast({ type: 'error', title: response.left.message });

        }

        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Loading Leave'
    )

  }
  const loadOutdoor = async (page: number, filterParams?: FilterInfo) => {
    const activeFilters = filterParams || filters;
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationOutDoor = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          StartDate: activeFilters.StartDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(activeFilters.StartDate) || undefined : undefined,
          EndDate: activeFilters.EndDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(activeFilters.EndDate) || undefined : undefined,
          CompanyName: searchTerm?.trim() || activeFilters.CompanyName?.trim() || undefined,
          Status: activeFilters.Status?.trim() || undefined,
          EmployeeId: activeFilters.EmployeeId && !isNaN(parseInt(activeFilters.EmployeeId.toString())) ? parseInt(activeFilters.EmployeeId.toString()) : undefined,
          EmployeeName: activeFilters.EmployeeName?.trim() || undefined,
          IsReport: true
        }

        const response = await outDoorService.apiCallPullOutDoor(params);

        if (E.isRight(response)) {

          setOutDoorList(response.right.Data);

          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });

        } else {

          addToast({ type: 'error', title: response.left.message });

        }

        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Loading Outdoor'
    )

  }
  //#endregion

  //#region FILTER HELPERS
  const applyFilters = () => {
    setFilters(tempFilters);
    if (activeTab === "Comp-Off") loadCompOff(1, tempFilters);
    else if (activeTab === 'Leave') loadLeave(1, tempFilters);
    else if (activeTab === 'Outdoor') loadOutdoor(1, tempFilters);
    else if (activeTab === 'Resignation') loadResignations(1, tempFilters);
    else if (activeTab === "Attendance") loadAttendance(1, tempFilters);
    else if (activeTab === "Attendance Regularization") loadAttendanceRegularization(1, tempFilters);
    setShowFilterPopup(false);
  }

  const clearFilters = () => {
    setTempFilters({});
    setFilters({});
    setPagination({ currentPage: 1 });

    if (activeTab === "Comp-Off") loadCompOff(1, {});
    else if (activeTab === 'Leave') loadLeave(1, {});
    else if (activeTab === 'Outdoor') loadOutdoor(1, {});
    else if (activeTab === 'Resignation') loadResignations(1, {});
    else if (activeTab === "Attendance") loadAttendance(1, {});
    else if (activeTab === "Attendance Regularization") loadAttendanceRegularization(1, {});

    setShowFilterPopup(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (activeTab === "Comp-Off") loadCompOff(1);
    else if (activeTab === 'Leave') loadLeave(1);
    else if (activeTab === 'Outdoor') loadOutdoor(1);
    else if (activeTab === 'Resignation') loadResignations(1);
    else if (activeTab === "Attendance") loadAttendance(1);
    else if (activeTab === "Attendance Regularization") loadAttendanceRegularization(1);
  };
  //#endregion

  //#region EXPORT FUNCTIONALITY
  const handleExportPdf = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        let sortByParam = undefined;
        if (sortInfo && getCurrentColumns().length > 0) {
          const column = getCurrentColumns().find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        if (activeTab === "Comp-Off") {
          const params: FilterWithPaginationCompOff = {
            PageNumber: 1,
            PageSize: pagination.totalRecords || 1000,
            StartDate: filters.StartDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.StartDate) || undefined : undefined,
            EndDate: filters.EndDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.EndDate) || undefined : undefined,
            Reason: searchTerm?.trim() || filters.Reason?.trim() || undefined,
            Status: filters.Status?.trim() || undefined,
            EmployeeId: filters.EmployeeId && !isNaN(parseInt(filters.EmployeeId.toString())) ? parseInt(filters.EmployeeId.toString()) : undefined,
            EmployeeName: filters.EmployeeName?.trim() || undefined,
            IsReport: true,
            SortBy: sortByParam,
            ExportType: 'PDF'
          };
          const response = await compOffService.apiCallPullCompOff(params);
          handleExportFile(response, 'PDF', 'Comp Off', addToast);
          return response;
        } else if (activeTab === 'Leave') {
          const params: FilterWithPaginationLeaveRequest = {
            PageNumber: 1,
            PageSize: pagination.totalRecords || 1000,
            StartDate: filters.StartDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.StartDate) || undefined : undefined,
            EndDate: filters.EndDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.EndDate) || undefined : undefined,
            LeaveType: searchTerm?.trim() || filters.LeaveType?.trim() || undefined,
            Status: filters.Status?.trim() || undefined,
            EmployeeId: filters.EmployeeId && !isNaN(parseInt(filters.EmployeeId.toString())) ? parseInt(filters.EmployeeId.toString()) : undefined,
            EmployeeName: filters.EmployeeName?.trim() || undefined,
            IsReport: true,
            SortBy: sortByParam,
            ExportType: 'PDF'
          };
          const response = await LeaveService.apiCallPullLeave(params);
          handleExportFile(response, 'PDF', 'Leave', addToast);
          return response;
        } else if (activeTab === 'Outdoor') {
          const params: FilterWithPaginationOutDoor = {
            PageNumber: 1,
            PageSize: pagination.totalRecords || 1000,
            StartDate: filters.StartDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.StartDate) || undefined : undefined,
            EndDate: filters.EndDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.EndDate) || undefined : undefined,
            CompanyName: searchTerm?.trim() || filters.CompanyName?.trim() || undefined,
            Status: filters.Status?.trim() || undefined,
            EmployeeId: filters.EmployeeId && !isNaN(parseInt(filters.EmployeeId.toString())) ? parseInt(filters.EmployeeId.toString()) : undefined,
            EmployeeName: filters.EmployeeName?.trim() || undefined,
            IsReport: true,
            SortBy: sortByParam,
            ExportType: 'PDF'
          };
          const response = await outDoorService.apiCallPullOutDoor(params);
          handleExportFile(response, 'PDF', 'Outdoor', addToast);
          return response;
        } else if (activeTab === 'Resignation') {
          const params: FilterWithPaginationEmployeeResignationRequest = {
            PageNumber: 1,
            PageSize: pagination.totalRecords || 1000,
            IsCheckPermission: true,
            EmployeeId: searchTerm?.trim() && !isNaN(parseInt(searchTerm.trim())) ? parseInt(searchTerm.trim()) : (filters.EmployeeId && !isNaN(parseInt(filters.EmployeeId.toString())) ? parseInt(filters.EmployeeId.toString()) : undefined),
            EmployeeName: filters.EmployeeName?.trim() || undefined,
            ResignationDateFrom: filters.StartDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.StartDate) || undefined : undefined,
            ResignationDateTo: filters.EndDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.EndDate) || undefined : undefined,
            Status: filters.Status?.trim() || undefined,
            ApprovalStatus: filters.ApprovalStatus?.trim() || undefined,
            IsReport: true,
            SortBy: sortByParam,
            ExportType: 'PDF'
          };
          const response = await employeeResignationService.apiCallPullEmployeeResignation(params);
          handleExportFile(response, 'PDF', 'Resignation', addToast);
          return response;
        } else if (activeTab === 'Attendance Regularization') {
          const params: FilterWithPaginationAttendanceRegularizationRequest = {
            PageNumber: 1,
            PageSize: pagination.totalRecords || 1000,
            StartDate: filters.StartDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.StartDate) || undefined : undefined,
            EndDate: filters.EndDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.EndDate) || undefined : undefined,
            IsReport: true,
            SortBy: sortByParam,
            ExportType: 'PDF'
          };
          const response = await attendanceRegularizationService.apiCallPullAttendanceRegularization(params);
          handleExportFile(response, 'PDF', 'Attendance Regularization', addToast);
          return response;
        }
        return E.right({ Data: [], TotalNumberOfRecord: 0 });
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' });
      },
      undefined,
      'Preparing Export...'
    );
  };
  //#endregion

  //#region PAGINATION HANDLERS
  const handlePageChange = useCallback((page: number) => {
    if (activeTab === "Comp-Off") loadCompOff(page);
    else if (activeTab === 'Leave') loadLeave(page);
    else if (activeTab === 'Outdoor') loadOutdoor(page);
    else if (activeTab === 'Resignation') loadResignations(page);
    else if (activeTab === "Attendance") loadAttendance(page);
    else if (activeTab === "Attendance Regularization") loadAttendanceRegularization(page);
  }, [activeTab, filters, searchTerm]);

  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    handlePageChange(1);
  }, [handlePageChange]);

  const paginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination, handlePageChange]
  );
  //#endregion

  //#region TABLE COLUMNS
  const attendanceRegularizationColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'AttendanceDate',
        label: 'Attendance Date',
        width: '20',
        sortable: true,
        align: 'left',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      },
      {
        key: 'PunchIn',
        label: 'Punch In',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => parseTimeFromISO(value)
      },
      {
        key: 'PunchOut',
        label: 'Punch Out',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => parseTimeFromISO(value)
      },
      {
        key: 'Reason',
        label: 'Reason',
        width: '35',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'Status',
        label: 'Status',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
    ],
    []
  );

  const getCurrentColumns = (): TableColumn[] => {
    switch (activeTab) {
      case "Comp-Off":
        return compOffColumns;
      case "Leave":
        return leaveColumns;
      case "Outdoor":
        return outdoorColumns;
      case "Resignation":
        return resignationColumns;
      case "Attendance":
        return attendanceColumns;
      case "Attendance Regularization":
        return attendanceRegularizationColumns;
      default:
        return [];
    }
  };

  const compOffColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'CompOffDate',
        label: 'Comp Off Date',
        width: '25',
        sortable: true,
        align: 'left',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      },
      {
        key: 'WorkingDate',
        label: 'Request Date',
        width: '25',
        sortable: false,
        align: 'left',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      },
      {
        key: 'Reason',
        label: 'Reason',
        width: '50',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
    ],
    []
  );

  const leaveColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'LeaveType',
        label: 'Leave Type',
        width: '20',
        sortable: true,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'StartDate',
        label: 'Start Date',
        width: '18',
        sortable: true,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      },
      {
        key: 'EndDate',
        label: 'End Date',
        width: '18',
        sortable: true,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      },
      {
        key: 'NoOfDays',
        label: 'No Of Days',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'Reason',
        label: 'Reason',
        width: '29',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
    ],
    []
  );

  const outdoorColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'OutDoorDate',
        label: 'Outdoor Date',
        width: '18',
        sortable: true,
        align: 'left',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      },
      {
        key: 'OutDoorTime',
        label: 'Time',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'CompanyName',
        label: 'Company Name',
        width: '20',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'Purpose',
        label: 'Purpose',
        width: '25',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'DepartmentName',
        label: 'Department',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'AccompaniedByName',
        label: 'Accompanied By',
        width: '10',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
    ],
    []
  );

  const resignationColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'EmployeeName',
        label: 'Full Name',
        width: '20',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'ResignationDate',
        label: 'Resignation Date',
        width: '18',
        sortable: false,
        align: 'left',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      },
      {
        key: 'ExpectedRelievingDate',
        label: 'Expected Relieving Date',
        width: '20',
        sortable: false,
        align: 'left',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      },
      {
        key: 'ReasonOfLeaving',
        label: 'Reason Of Leaving',
        width: '42',
        sortable: true,
        align: 'left',
        render: (value) => value || '-'
      },
    ],
    []
  );



  const attendanceColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'AttendanceDate',
        label: 'Attendance Date',
        width: '20',
        sortable: true,
        align: 'left',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      },
      {
        key: 'FullName',
        label: 'Employee Name',
        width: '20',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'PunchIn',
        label: 'Punch In',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => parseTimeFromISO(value)
      },
      {
        key: 'PunchOut',
        label: 'Punch Out',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => parseTimeFromISO(value)
      },
      {
        key: 'WorkingHours',
        label: 'Working Hours',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'AttendanceStatus',
        label: 'Status',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
    ],
    []
  );
  //#endregion




  //#region GET SEARCH PLACEHOLDER
  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case "Comp-Off":
        return "Search by Reason";
      case "Leave":
        return "Search by Leave Type";
      case "Outdoor":
        return "Search by Company Name";
      case "Resignation":
        return "Search by Employee Name";
      case "Attendance":
      case "Attendance Regularization":
        return "Search by Employee Name";
      default:
        return "Search...";
    }
  };
  //#endregion

  //#region GET CURRENT DATA
  const getCurrentData = () => {
    switch (activeTab) {
      case "Comp-Off":
        return compOffList;
      case "Leave":
        return leaveList;
      case "Outdoor":
        return outDoorList;
      case "Resignation":
        return employeeResignationList;
      case "Attendance":
        return attendanceList;
      case "Attendance Regularization":
        return attendanceRegularizationList;
      default:
        return [];
    }
  };
  //#endregion

  //#region GET EMPTY MESSAGE
  const getEmptyMessage = () => {
    switch (activeTab) {
      case "Comp-Off":
        return "No Comp Off found";
      case "Leave":
        return "No Leave found";
      case "Outdoor":
        return "No Outdoor found";
      case "Resignation":
        return "No Resignation found";
      case "Attendance":
        return "No Attendance found";
      case "Attendance Regularization":
        return "No Attendance Regularization found";
      default:
        return "No data found";
    }
  };
  //#endregion

  return (

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* ============================================================================
          COMMON LOADER FOR PAGE
           ============================================================================ */}

      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

      <Tabs
        tabs={tncTabList}
        defaultActive={activeTab}
        islarge={true}
        onTabChange={(t) => {
          setActiveTab(t.id);
        }}
      />

      <div className="mt-4">
        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder={getSearchPlaceholder()}
          onSearchChange={v => {
            setSearchTerm(v);
            debouncedSearch(v);
          }}
          onClearSearch={clearSearch}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters);
            setShowFilterPopup(true);
          }}
          isShowExportButton
          onExportPdf={handleExportPdf}
          exportLoading={isLoading}
          isShowAddButton={false}
          isShowCustomizeButton={false}
        />
      </div>

      <div className="space-y-4 p-4">
        <DataTable
          data={getCurrentData()}
          columns={getCurrentColumns()}
          pagination={paginationInfo}
          emptyMessage={getEmptyMessage()}
          fixedHeight
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />
      </div>

      {/* FILTER MODAL */}
      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title={`Filter - ${activeTab}`}
        onSubmit={(e) => {
          e.preventDefault();
          applyFilters();
        }}
        saveText="Apply "
        cancelText="Clear"
        onCancel={() => clearFilters()}

        size="small-half"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            {activeTab === "Comp-Off" && (
              <>
                <div>
                  <DatePickerInput
                    label='Start Date'
                    value={tempFilters.StartDate || ''}
                    onChange={(value) => handleFilterChange('StartDate', value || '')}
                  />
                </div>
                <div>
                  <DatePickerInput
                    label='End Date'
                    value={tempFilters.EndDate || ''}
                    onChange={(value) => handleFilterChange('EndDate', value || '')}
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    label='Status'
                    value={tempFilters.Status || ''}
                    onChange={(e) => handleFilterChange('Status', e.target.value)}
                    placeholder="Enter Status"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    label='Employee Name'
                    value={tempFilters.EmployeeName || ''}
                    onChange={(e) => handleFilterChange('EmployeeName', e.target.value)}
                    placeholder="Enter Employee Name"
                  />
                </div>
              </>
            )}
            {activeTab === "Leave" && (
              <>
                <div>
                  <DatePickerInput
                    label='Start Date'
                    value={tempFilters.StartDate || ''}
                    onChange={(value) => handleFilterChange('StartDate', value || '')}
                  />
                </div>
                <div>
                  <DatePickerInput
                    label='End Date'
                    value={tempFilters.EndDate || ''}
                    onChange={(value) => handleFilterChange('EndDate', value || '')}
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    label='Status'
                    value={tempFilters.Status || ''}
                    onChange={(e) => handleFilterChange('Status', e.target.value)}
                    placeholder="Enter Status"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    label='Employee Name'
                    value={tempFilters.EmployeeName || ''}
                    onChange={(e) => handleFilterChange('EmployeeName', e.target.value)}
                    placeholder="Enter Employee Name"
                  />
                </div>
              </>
            )}
            {activeTab === "Outdoor" && (
              <>
                <div>
                  <DatePickerInput
                    label='Start Date'
                    value={tempFilters.StartDate || ''}
                    onChange={(value) => handleFilterChange('StartDate', value || '')}
                  />
                </div>
                <div>
                  <DatePickerInput
                    label='End Date'
                    value={tempFilters.EndDate || ''}
                    onChange={(value) => handleFilterChange('EndDate', value || '')}
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    label='Status'
                    value={tempFilters.Status || ''}
                    onChange={(e) => handleFilterChange('Status', e.target.value)}
                    placeholder="Enter Status"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    label='Employee Name'
                    value={tempFilters.EmployeeName || ''}
                    onChange={(e) => handleFilterChange('EmployeeName', e.target.value)}
                    placeholder="Enter Employee Name"
                  />
                </div>
              </>
            )}
            {activeTab === "Resignation" && (
              <>
                <div>
                  <DatePickerInput
                    label='Start Date'
                    value={tempFilters.StartDate || ''}
                    onChange={(value) => handleFilterChange('StartDate', value || '')}
                  />
                </div>
                <div>
                  <DatePickerInput
                    label='End Date'
                    value={tempFilters.EndDate || ''}
                    onChange={(value) => handleFilterChange('EndDate', value || '')}
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    label='Status'
                    value={tempFilters.Status || ''}
                    onChange={(e) => handleFilterChange('Status', e.target.value)}
                    placeholder="Enter Status"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    label='Employee Name'
                    value={tempFilters.EmployeeName || ''}
                    onChange={(e) => handleFilterChange('EmployeeName', e.target.value)}
                    placeholder="Enter Employee Name"
                  />
                </div>
              </>
            )}
            {activeTab === "Attendance" && (
              <>
                <div>
                  <DatePickerInput
                    label='Start Date'
                    value={tempFilters.StartDate || ''}
                    onChange={(value) => handleFilterChange('StartDate', value || '')}
                  />
                </div>
                <div>
                  <DatePickerInput
                    label='End Date'
                    value={tempFilters.EndDate || ''}
                    onChange={(value) => handleFilterChange('EndDate', value || '')}
                  />
                </div>
              </>
            )}
            {activeTab === "Attendance Regularization" && (
              <>
                <div>
                  <DatePickerInput
                    label='Start Date'
                    value={tempFilters.StartDate || ''}
                    onChange={(value) => handleFilterChange('StartDate', value || '')}
                  />
                </div>
                <div>
                  <DatePickerInput
                    label='End Date'
                    value={tempFilters.EndDate || ''}
                    onChange={(value) => handleFilterChange('EndDate', value || '')}
                  />
                </div>
              </>
            )}
            {activeTab === "Attendance Regularization" && (
              <>
                <div>
                  <DatePickerInput
                    label='Start Date'
                    value={tempFilters.StartDate || ''}
                    onChange={(value) => handleFilterChange('StartDate', value || '')}
                  />
                </div>
                <div>
                  <DatePickerInput
                    label='End Date'
                    value={tempFilters.EndDate || ''}
                    onChange={(value) => handleFilterChange('EndDate', value || '')}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </Modal>

    </div>

  )
}

export default PayrollReport

