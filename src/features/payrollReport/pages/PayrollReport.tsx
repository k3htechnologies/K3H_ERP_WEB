import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
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
import { formatDate_dd_MonthName_yy, convert_dd_mm_yyyy_To_Yyyy_mm_dd, parseTimeFromISO, formatTimeFromDateTime } from '@/core/utils/dateFormat';
import { DataTable, type FilterInfo, type TableColumn, type PaginationInfo, type SortInfo } from '@/ui/components/DataTable/DataTable';
import { DataTableExpandable, type DataTableExpandableRef } from '@/ui/components/DataTable/DataTableExpandable';
import { DataTableWithOutBorder, type TableColumn as TableColumnWithoutBorder } from '@/ui/components/DataTable/DataTableWithoutBorder';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import useDebouncedCallback from '@/core/hooks/useDebouncedCallback';
import type { CompOffData, FilterWithPaginationCompOff } from '@/features/compOff/models/compOff';
import type { FilterWithPaginationLeaveRequest, LeaveData } from '@/features/leave/models/LeaveModel';
import type { FilterWithPaginationOutDoor, OutDoorMasterData } from '@/features/outdoor/models/OutDoorModel';
import type { AttendanceRegularizationData, FilterWithPaginationAttendanceRegularizationRequest, AttendanceData, FilterWithPaginationAttendanceRequest } from '@/features/attendanceCalendar/models/AttendanceModel';
import { compOffService } from '@/features/compOff/services/CompOffServices';
import { LeaveService } from '@/features/leave/services/LeaveService';
import { outDoorService } from '@/features/outdoor/services/OutDoorDataService';
import { attendanceRegularizationService } from '@/features/attendanceCalendar/services/AttendanceRegularizationService';
import { attendanceService } from '@/features/attendanceCalendar/services/AttendanceService';
import { Modal } from '@/ui/components/Modal/Modal';
import { DatePickerInput } from '@/ui/components/forms/Datepicker';
import { updateFilter } from '@/core/utils/filterHelper';
import { handleExportFile } from '@/core/utils/exportFile';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { getStatusBadgeClasses } from '@/features/attendanceCalendar/utils/attendanceUtils';


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

  // Ref for expandable table
  const attendanceTableRef = useRef<DataTableExpandableRef>(null);

  // Helper function to get today's date
  const getTodayDate = useCallback(() => {
    const today = new Date();
    
    // Format as DD-MM-YYYY
    const formatDate = (date: Date): string => {
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    };
    
    return formatDate(today);
  }, []);

  // Helper function to get current week start (Monday) and end (Sunday) dates
  const getCurrentWeekDates = useCallback(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to get Monday
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Format as DD-MM-YYYY
    const formatDate = (date: Date): string => {
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    };
    
    return {
      startDate: formatDate(startOfWeek),
      endDate: formatDate(endOfWeek)
    };
  }, []);

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
    
    // Set default filters for all tabs (today's date)
    const todayDate = getTodayDate();
    const defaultFilters: FilterInfo = {
      StartDate: todayDate,
      EndDate: todayDate
    };
    
    // For Attendance tab, use current week instead of just today
    if (activeTab === "Attendance") {
      const weekDates = getCurrentWeekDates();
      const attendanceFilters: FilterInfo = {
        StartDate: weekDates.startDate,
        EndDate: weekDates.endDate
      };
      setFilters(attendanceFilters);
      setTempFilters(attendanceFilters);
    } else {
      setFilters(defaultFilters);
      setTempFilters(defaultFilters);
    }
  }, [activeTab, getCurrentWeekDates, getTodayDate]);

  // Load data when tab or filters change
  useEffect(() => {
    const todayDate = getTodayDate();
    const defaultTodayFilters: FilterInfo = {
      StartDate: todayDate,
      EndDate: todayDate
    };
    
    if (activeTab === "Attendance") {
      // Use filters if set, otherwise use default week filters
      const weekDates = getCurrentWeekDates();
      const filtersToUse = Object.keys(filters).length > 0 
        ? filters 
        : {
            StartDate: weekDates.startDate,
            EndDate: weekDates.endDate
          };
      loadAttendance(1, filtersToUse);
    } else if (activeTab === "Attendance Regularization") {
      const filtersToUse = Object.keys(filters).length > 0 ? filters : defaultTodayFilters;
      loadAttendanceRegularization(1, filtersToUse);
    } else if (activeTab === "Comp-Off") {
      const filtersToUse = Object.keys(filters).length > 0 ? filters : defaultTodayFilters;
      loadCompOff(1, filtersToUse);
    } else if (activeTab === 'Leave') {
      const filtersToUse = Object.keys(filters).length > 0 ? filters : defaultTodayFilters;
      loadLeave(1, filtersToUse);
    } else if (activeTab === 'Outdoor') {
      const filtersToUse = Object.keys(filters).length > 0 ? filters : defaultTodayFilters;
      loadOutdoor(1, filtersToUse);
    } else if (activeTab === 'Resignation') {
      // Resignation uses ResignationDateFrom and ResignationDateTo
      const resignationFilters: FilterInfo = Object.keys(filters).length > 0 
        ? filters 
        : {
            ResignationDateFrom: todayDate,
            ResignationDateTo: todayDate
          };
      loadResignations(1, resignationFilters);
    }
  }, [activeTab, filters, getCurrentWeekDates, getTodayDate]);

  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const loadResignations = async (page: number, filterParams?: FilterInfo) => {
    const activeFilters = filterParams || filters;
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationEmployeeResignationRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          EmployeeName: searchTerm?.trim() || activeFilters.EmployeeName?.trim() || undefined,
          ResignationDateFrom: activeFilters.ResignationDateFrom ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(activeFilters.ResignationDateFrom) || undefined : undefined,
          ResignationDateTo: activeFilters.ResignationDateTo ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(activeFilters.ResignationDateTo) || undefined : undefined,
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
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationAttendanceRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          StartDate: activeFilters.StartDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(activeFilters.StartDate) || undefined : undefined,
          EndDate: activeFilters.EndDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(activeFilters.EndDate) || undefined : undefined,
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

          // Auto-expand rows with today's attendance after data loads
          setTimeout(() => {
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
            
            // Get unique employee IDs that have today's data
            const employeesWithTodayData = new Set<number>();
            response.right.Data.forEach((item: AttendanceData) => {
              const itemDate = item.AttendanceDate ? item.AttendanceDate.split('T')[0] : '';
              if (itemDate === todayStr) {
                employeesWithTodayData.add(item.EmployeeId);
              }
            });
            
            // Expand all rows with today's data
            employeesWithTodayData.forEach((employeeId) => {
              const employeeData = response.right.Data.filter((d: AttendanceData) => d.EmployeeId === employeeId);
              const firstItem = employeeData[0];
              attendanceTableRef.current?.expandRow(String(employeeId), {
                EmployeeId: employeeId,
                FullName: firstItem.FullName,
                _groupedItems: employeeData
              });
            });
          }, 300);

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
          EmployeeName: searchTerm?.trim() || activeFilters.EmployeeName?.trim() || undefined,
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
          EmployeeName: searchTerm?.trim() || activeFilters.EmployeeName?.trim() || undefined,
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
          EmployeeName: searchTerm?.trim() || activeFilters.EmployeeName?.trim() || undefined,
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
          EmployeeName: searchTerm?.trim() || activeFilters.EmployeeName?.trim() || undefined,
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
            EmployeeName: searchTerm?.trim() || filters.EmployeeName?.trim() || undefined,
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
            EmployeeName: searchTerm?.trim() || filters.EmployeeName?.trim() || undefined,
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
            EmployeeName: searchTerm?.trim() || filters.EmployeeName?.trim() || undefined,
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
            EmployeeName: searchTerm?.trim() || filters.EmployeeName?.trim() || undefined,
            ResignationDateFrom: filters.ResignationDateFrom ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.ResignationDateFrom) || undefined : undefined,
            ResignationDateTo: filters.ResignationDateTo ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.ResignationDateTo) || undefined : undefined,
            SortBy: sortByParam,
            ExportType: 'PDF'
          };
          const response = await employeeResignationService.apiCallPullEmployeeResignation(params);
          handleExportFile(response, 'PDF', 'Resignation', addToast);
          return response;
        } else if (activeTab === 'Attendance') {
          const params: FilterWithPaginationAttendanceRequest = {
            PageNumber: 1,
            PageSize: pagination.totalRecords || 1000,
            StartDate: filters.StartDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.StartDate) || undefined : undefined,
            EndDate: filters.EndDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.EndDate) || undefined : undefined,
            EmployeeName: searchTerm?.trim() || filters.EmployeeName?.trim() || undefined,
            SortBy: sortByParam,
            ExportType: 'PDF'
          };
          const response = await attendanceService.apiCallPullAttendance(params);
          handleExportFile(response, 'PDF', 'Attendance', addToast);
          return response;
        } else if (activeTab === 'Attendance Regularization') {
          const params: FilterWithPaginationAttendanceRegularizationRequest = {
            PageNumber: 1,
            PageSize: pagination.totalRecords || 1000,
            StartDate: filters.StartDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.StartDate) || undefined : undefined,
            EndDate: filters.EndDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.EndDate) || undefined : undefined,
            EmployeeName: searchTerm?.trim() || filters.EmployeeName?.trim() || undefined,
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
  // Helper function to format time to 12-hour format (e.g., "9:20 Am", "6:20 Pm")
  const formatTime12Hour = useCallback((timeValue?: string | null): string => {
    if (!timeValue) return '-';
    const formatted = formatTimeFromDateTime(timeValue);
    return formatted && formatted.trim() !== '' ? formatted : (timeValue || '-');
  }, []);

  // Helper function to format working hours (e.g., "09h:00m:12s")
  const formatWorkingHours = useCallback((hours?: string | null): string => {
    if (!hours) return '-';
    // If already in the format, return as is, otherwise try to parse
    if (hours.includes('h:') && hours.includes('m:') && hours.includes('s')) {
      return hours;
    }
    // Try to parse TimeSpan format or other formats
    return hours;
  }, []);

  const attendanceRegularizationColumns = useMemo<TableColumn[]>(
    () => [
      {

        key: 'CreatedBy',
        label: 'Employee Name',
        width: '20',
        sortable: true,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || '-'}
            maxWidth="250px"
            tooltipThreshold={25}
          />
        )
      },
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
        key: 'CreatedBy',
        label: 'Employee Name',
        width: '20',
        sortable: true,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || '-'}
            maxWidth="250px"
            tooltipThreshold={25}
          />
        )
      },
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
        key: 'CreatedBy',
        label: 'Employee Name',
        width: '20',
        sortable: true,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || '-'}
            maxWidth="250px"
            tooltipThreshold={25}
          />
        )
      },
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
        key: 'CreatedBy',
        label: 'Employee Name',
        width: '20',
        sortable: true,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || '-'}
            maxWidth="250px"
            tooltipThreshold={25}
          />
        )
      },
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
        label: 'Employee Name',
        width: '20',
        sortable: true,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || '-'}
            maxWidth="250px"
            tooltipThreshold={25}
          />
        )
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

  // Group attendance data by employee
  const groupedAttendanceData = useMemo(() => {
    const grouped = new Map<number, AttendanceData[]>();
    attendanceList.forEach((item) => {
      const employeeId = item.EmployeeId;
      if (!grouped.has(employeeId)) {
        grouped.set(employeeId, []);
      }
      grouped.get(employeeId)!.push(item);
    });

    // Get today's date for sorting (today's records first)
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Convert to array of grouped items - show first item's data in main row
    return Array.from(grouped.entries())
      .map(([employeeId, items]) => {
        const firstItem = items[0];
        // Sort items by date (most recent first, but prioritize today)
        const sortedItems = [...items].sort((a, b) => {
          const dateA = a.AttendanceDate ? a.AttendanceDate.split('T')[0] : '';
          const dateB = b.AttendanceDate ? b.AttendanceDate.split('T')[0] : '';
          
          // If one is today, prioritize it
          if (dateA === todayStr && dateB !== todayStr) return -1;
          if (dateB === todayStr && dateA !== todayStr) return 1;
          
          // Otherwise sort by date descending
          return dateB.localeCompare(dateA);
        });
        const latestItem = sortedItems[0];

        return {
          EmployeeId: employeeId,
          FullName: firstItem.FullName,
          PunchIn: latestItem.PunchIn,
          PunchOut: latestItem.PunchOut,
          PunchInAddress: latestItem.PunchInAddress,
          PunchOutAddress: latestItem.PunchOutAddress,
          WorkingHours: latestItem.WorkingHours,
          AttendanceStatus: latestItem.AttendanceStatus,
          _groupedItems: sortedItems, // Store individual items for expansion
          _hasTodayData: sortedItems.some(item => item.AttendanceDate?.split('T')[0] === todayStr)
        };
      })
      .sort((a, b) => {
        // Sort rows: those with today's data first
        if (a._hasTodayData && !b._hasTodayData) return -1;
        if (!a._hasTodayData && b._hasTodayData) return 1;
        return 0;
      });
  }, [attendanceList]);

  const attendanceColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'FullName',
        label: 'Employee Name',
        width: '15',
        sortable: true,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || '-'}
            maxWidth="250px"
            tooltipThreshold={25}
          />
        )
      },
      {
        key: 'PunchIn',
        label: 'Punch In Time',
        width: '12',
        sortable: false,
        align: 'left',
        render: (value) => formatTime12Hour(value)
      },
      {
        key: 'PunchInAddress',
        label: 'Punch In Address',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || '-'}
            maxWidth="200px"
            tooltipThreshold={20}
          />
        )
      },
      {
        key: 'PunchOut',
        label: 'Punch Out Time',
        width: '12',
        sortable: false,
        align: 'left',
        render: (value) => formatTime12Hour(value)
      },
      {
        key: 'PunchOutAddress',
        label: 'Punch Out Address',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || '-'}
            maxWidth="200px"
            tooltipThreshold={20}
          />
        )
      },
      {
        key: 'WorkingHours',
        label: 'Working Hours',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => formatWorkingHours(value)
      },
      {
        key: 'AttendanceStatus',
        label: 'Status',
        width: '16',
        sortable: false,
        align: 'left',
        render: (value) => {
          const status = value || '-';
          if (status === '-') return '-';
          const badge = getStatusBadgeClasses(status);
          return (
            <div
              className="flex items-center"
              style={{
                height: '100%',
                width: '100%',
              }}
            >
              <div
                className="text-xs rounded border inline-flex items-center justify-center"
                style={{
                  backgroundColor: `${badge.backgroundColor}20`,
                  color: badge.color,
                  borderColor: `${badge.backgroundColor}40`,
                  height: '24px',
                  width: '90px',
                  fontSize: '12px',
                  fontWeight: '500',
                  lineHeight: '1',
                  padding: '0 8px',
                  boxSizing: 'border-box',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {status}
              </div>
            </div>
          );
        }
      },
    ],
    [formatTime12Hour, formatWorkingHours]
  );

  // Attendance Details Columns for expanded rows
  const attendanceDetailsColumns = useMemo<TableColumnWithoutBorder[]>(() => [
    {
      key: 'AttendanceDate',
      label: 'Date',
      width: '15',
      sortable: false,
      align: 'left',
      render: (value: any) => value ? formatDate_dd_MonthName_yy(value) : '-'
    },
    {
      key: 'PunchIn',
      label: 'Punch In Time',
      width: '12',
      sortable: false,
      align: 'left',
      render: (value: any) => formatTime12Hour(value)
    },
    {
      key: 'PunchInAddress',
      label: 'Punch In Address',
      width: '15',
      sortable: false,
      align: 'left',
      render: (value: any) => (
        <TooltipText
          text={value || '-'}
          maxWidth="200px"
          tooltipThreshold={20}
        />
      )
    },
    {
      key: 'PunchOut',
      label: 'Punch Out Time',
      width: '12',
      sortable: false,
      align: 'left',
      render: (value: any) => formatTime12Hour(value)
    },
    {
      key: 'PunchOutAddress',
      label: 'Punch Out Address',
      width: '15',
      sortable: false,
      align: 'left',
      render: (value: any) => (
        <TooltipText
          text={value || '-'}
          maxWidth="200px"
          tooltipThreshold={20}
        />
      )
    },
    {
      key: 'WorkingHours',
      label: 'Working Hours',
      width: '15',
      sortable: false,
      align: 'left',
      render: (value: any) => formatWorkingHours(value)
    },
    {
      key: 'AttendanceStatus',
      label: 'Status',
      width: '16',
      sortable: false,
      align: 'left',
      render: (value: any) => {
        if (!value || value === '-') return '-';
        const badge = getStatusBadgeClasses(value);
        return (
          <div
            className="flex items-center"
            style={{
              height: '100%',
              width: '100%',
            }}
          >
            <div
              className="text-xs rounded border inline-flex items-center justify-center"
              style={{
                backgroundColor: `${badge.backgroundColor}20`,
                color: badge.color,
                borderColor: `${badge.backgroundColor}40`,
                height: '24px',
                width: '90px',
                fontSize: '12px',
                fontWeight: '500',
                lineHeight: '1',
                padding: '0 8px',
                boxSizing: 'border-box',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {value}
            </div>
          </div>
        );
      }
    },
  ], [formatTime12Hour, formatWorkingHours]);
  //#endregion




  //#region GET SEARCH PLACEHOLDER
  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case "Comp-Off":
      case "Leave":
      case "Outdoor":
      case "Resignation":
      case "Attendance":
      case "Attendance Regularization":
        return "Search by Employee Name";
      default:
        return "Search by Employee Name";
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
        {activeTab === "Attendance" ? (
          <DataTableExpandable
            ref={attendanceTableRef}
            data={groupedAttendanceData}
            columns={attendanceColumns}
            pagination={paginationInfo}
            emptyMessage={getEmptyMessage()}
            fixedHeight
            recordsPerPage={20}
            className="flex-1"
            sortInfo={sortInfo}
            onSort={handleSortColumn}
            expandable={{
              keyField: 'EmployeeId',
              renderRow: (_data: any, row: any) => {
                const items = row._groupedItems || [];
                if (items.length === 0) {
                  return (
                    <div className="p-1 text-xs text-gray-600 text-center">
                      No Attendance Found.
                    </div>
                  );
                }

                return (
                  <DataTableWithOutBorder
                    data={items}
                    columns={attendanceDetailsColumns}
                    emptyMessage="No Attendance Data Found"
                    fixedHeight={true}
                    recordsPerPage={20}
                    className="flex-1"
                    sortInfo={sortInfo}
                    onSort={handleSortColumn}
                    loading={isLoading}
                  />
                );
              }
            }}
          />
        ) : (
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
        )}
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
              </>
            )}
            {activeTab === "Resignation" && (
              <>
                <div>
                  <DatePickerInput
                    label='Resignation Date From'
                    value={tempFilters.ResignationDateFrom || ''}
                    onChange={(value) => handleFilterChange('ResignationDateFrom', value || '')}
                  />
                </div>
                <div>
                  <DatePickerInput
                    label='Resignation Date To'
                    value={tempFilters.ResignationDateTo || ''}
                    onChange={(value) => handleFilterChange('ResignationDateTo', value || '')}
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
          </div>
        </div>
      </Modal>

    </div>

  )
}

export default PayrollReport

