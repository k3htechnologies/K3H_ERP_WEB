import { useState, useCallback, useEffect } from "react";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { useToast } from "@/core/hooks/useToast";
import { usePagination } from "@/core/hooks/usePagination";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd } from "@/core/utils/dateFormat";
import { updateFilter } from "@/core/utils/filterHelper";
import { handleExportFile } from "@/core/utils/exportFile";
import type { FilterInfo, TableColumn, SortInfo } from "@/ui/components/DataTable/DataTable";
import { employeeResignationService } from "@/features/resignation/services/EmployeeResignationService";
import { attendanceService } from "@/features/attendanceCalendar/services/AttendanceService";
import { attendanceRegularizationService } from "@/features/attendanceCalendar/services/AttendanceRegularizationService";
import { compOffService } from "@/features/compOff/services/CompOffServices";
import { LeaveService } from "@/features/leave/services/LeaveService";
import { outDoorService } from "@/features/outdoor/services/OutDoorDataService";
import type { EmployeeResignationData, FilterWithPaginationEmployeeResignationRequest } from "@/features/resignation/models/EmployeeResignationModel";
import type { AttendanceData, AttendanceRegularizationData, FilterWithPaginationAttendanceRequest, FilterWithPaginationAttendanceRegularizationRequest } from "@/features/attendanceCalendar/models/AttendanceModel";
import type { CompOffData, FilterWithPaginationCompOff } from "@/features/compOff/models/compOff";
import type { LeaveData, FilterWithPaginationLeaveRequest } from "@/features/leave/models/LeaveModel";
import type { OutDoorMasterData, FilterWithPaginationOutDoor } from "@/features/outdoor/models/OutDoorModel";
import { type SubTabId, type TabId, EXPORT_LABELS, getDefaultFilters } from "../constants/tabConfig";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { payrollApprovalService } from "../services/PayrollServices";

const SORT_COLUMNS: Record<TabId, TableColumn[]> = {
  Attendance: [
    { key: "FullName", label: "Employee Name", width: "15", sortable: true, align: "left" },
  ],
  "Attendance Regularization": [
    { key: "CreatedBy", label: "Employee Name", width: "20", sortable: true, align: "left" },
    { key: "AttendanceDate", label: "Attendance Date", width: "20", sortable: true, align: "left" },
  ],
  "Comp-Off": [
    { key: "CreatedBy", label: "Employee Name", width: "20", sortable: true, align: "left" },
    { key: "CompOffDate", label: "Comp Off Date", width: "25", sortable: true, align: "left" },
  ],
  Leave: [
    { key: "CreatedBy", label: "Employee Name", width: "20", sortable: true, align: "left" },
    { key: "LeaveType", label: "Leave Type", width: "20", sortable: true, align: "left" },
    { key: "StartDate", label: "Start Date", width: "18", sortable: true, align: "center" },
    { key: "EndDate", label: "End Date", width: "18", sortable: true, align: "center" },
  ],
  Outdoor: [
    { key: "CreatedBy", label: "Employee Name", width: "20", sortable: true, align: "left" },
    { key: "OutDoorDate", label: "Outdoor Date", width: "18", sortable: true, align: "left" },
  ],
  Resignation: [
    { key: "EmployeeName", label: "Employee Name", width: "20", sortable: true, align: "left" },
    { key: "ReasonOfLeaving", label: "Reason Of Leaving", width: "42", sortable: true, align: "left" },
  ],
};

export function useTabData(
  activeTab: TabId,
  attendanceTableRef: React.RefObject<any>,
  subActiveTab: SubTabId,
) {
  //#region STATE
  const { addToast } = useToast();
  const { pagination, setPagination } = usePagination(20);

  const [compOffList, setCompOffList] = useState<CompOffData[]>([]);
  const [leaveList, setLeaveList] = useState<LeaveData[]>([]);
  const [outDoorList, setOutDoorList] = useState<OutDoorMasterData[]>([]);
  const [employeeResignationList, setEmployeeResignationList] = useState<EmployeeResignationData[]>([]);
  const [attendanceList, setAttendanceList] = useState<AttendanceData[]>([]);
  const [attendanceRegularizationList, setAttendanceRegularizationList] = useState<AttendanceRegularizationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>(undefined);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  //#endregion

  //#region SHARED HELPERS
  const dateParams = useCallback(
    (f: FilterInfo) => ({
      StartDate: convert_dd_mm_yyyy_To_Yyyy_mm_dd(f.StartDate),
      EndDate: convert_dd_mm_yyyy_To_Yyyy_mm_dd(f.EndDate),
    }),
    [],
  );

  const empName = useCallback(
    (f: FilterInfo, search?: string) => search?.trim() || f.EmployeeName?.trim() || undefined,
    [],
  );
  //#endregion

  //#region LOADERS
  const loadResignations = async (page: number, filterParams: FilterInfo, sortParams?: SortInfo, canApprove: boolean = true, searchValue?: string) => {
    await runApiWithLoader(
      setIsLoading, setLoadingMessage,
      async () => {
        const params: FilterWithPaginationEmployeeResignationRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          EmployeeName: empName(filterParams, searchValue),
          ResignationDateFrom: convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ResignationDateFrom),
          ResignationDateTo: convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ResignationDateTo),
          SortBy: getSortByParam(sortParams ?? null, SORT_COLUMNS.Resignation),
          CanApprove: canApprove,
          IsReport: true
        };
        const response = await employeeResignationService.apiCallPullEmployeeResignation(params);
        if (E.isRight(response)) {
          setEmployeeResignationList(response.right.Data);
          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });
        } else {
          addToast({ type: "error", title: response.left.message });
        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Loading Employee Resignation",
    );
  };

  const loadAttendance = async (page: number, filterParams: FilterInfo, sortParams?: SortInfo, searchValue?: string) => {
    await runApiWithLoader(
      setIsLoading, setLoadingMessage,
      async () => {
        const params: FilterWithPaginationAttendanceRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsReport: true,
          EmployeeName: empName(filterParams, searchValue),
          ...dateParams(filterParams),
          IsCheckPermission: true,
          SortBy: getSortByParam(sortParams ?? null, SORT_COLUMNS.Attendance),
        };
        const response = await attendanceService.apiCallPullAttendance(params);
        if (E.isRight(response)) {
          setAttendanceList(response.right.Data);
          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });
          setTimeout(() => {
            const todayStr = new Date().toISOString().split("T")[0];
            const byEmp = new Map<number, AttendanceData[]>();
            response.right.Data.forEach((item: AttendanceData) => {
              if (!byEmp.has(item.EmployeeId)) byEmp.set(item.EmployeeId, []);
              byEmp.get(item.EmployeeId)!.push(item);
            });
            byEmp.forEach((items, employeeId) => {
              if (items.some((i) => i.AttendanceDate?.split("T")[0] === todayStr)) {
                attendanceTableRef.current?.expandRow(String(employeeId), {
                  EmployeeId: employeeId,
                  FullName: items[0].FullName,
                  _groupedItems: items,
                });
              }
            });
          }, 300);
        } else {
          addToast({ type: "error", title: response.left.message });
        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Loading Attendance",
    );
  };

  const loadAttendanceRegularization = async (page: number, filterParams: FilterInfo, sortParams?: SortInfo, canApprove: boolean = true, searchValue?: string) => {
    await runApiWithLoader(
      setIsLoading, setLoadingMessage,
      async () => {
        const params: FilterWithPaginationAttendanceRegularizationRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsReport: true,
          EmployeeName: empName(filterParams, searchValue),
          ...dateParams(filterParams),
          CanApprove: canApprove,
          SortBy: getSortByParam(sortParams ?? null, SORT_COLUMNS["Attendance Regularization"]),
        };
        const response = await attendanceRegularizationService.apiCallPullAttendanceRegularization(params);
        if (E.isRight(response)) {
          setAttendanceRegularizationList(response.right.Data);
          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });
        } else {
          addToast({ type: "error", title: response.left.message });
        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Loading Attendance Regularization",
    );
  };

  const loadCompOff = async (page: number, filterParams: FilterInfo, sortParams?: SortInfo, canApprove: boolean = true, searchValue?: string) => {
    await runApiWithLoader(
      setIsLoading, setLoadingMessage,
      async () => {
        const params: FilterWithPaginationCompOff = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          CompOffId: filterParams.CompOffId ? Number(filterParams.CompOffId) : 0,
          EmployeeName: empName(filterParams, searchValue),
          StartDate: convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.StartDate) || undefined,
          EndDate: convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.EndDate) || undefined,
          Reason: filterParams.Reason?.trim() || undefined,
          SortBy: getSortByParam(sortParams ?? null, SORT_COLUMNS["Comp-Off"]),
          IsReport: true,
          CanApprove: canApprove,

        };
        const response = await compOffService.apiCallPullCompOff(params);
        if (E.isRight(response)) {
          setCompOffList(response.right.Data);
          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });
        } else {
          addToast({ type: "error", title: response.left.message });
        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Loading Comp Off Data",
    );
  };

  const loadLeave = async (page: number, filterParams: FilterInfo, sortParams?: SortInfo, canApprove: boolean = true, searchValue?: string) => {
    await runApiWithLoader(
      setIsLoading, setLoadingMessage,
      async () => {
        const params: FilterWithPaginationLeaveRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          EmployeeName: empName(filterParams, searchValue),
          ...dateParams(filterParams),
          SortBy: getSortByParam(sortParams ?? null, SORT_COLUMNS.Leave),
          CanApprove: canApprove,
          IsCheckPermission: true,
          IsReport: true,
        };
        const response = await LeaveService.apiCallPullLeave(params);
        if (E.isRight(response)) {
          setLeaveList(response.right.Data);
          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });
        } else {
          addToast({ type: "error", title: response.left.message });
        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Loading Leave",
    );
  };

  const loadOutdoor = async (page: number, filterParams: FilterInfo, sortParams?: SortInfo, canApprove: boolean = true, searchValue?: string) => {
    await runApiWithLoader(
      setIsLoading, setLoadingMessage,
      async () => {
        const params: FilterWithPaginationOutDoor = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          EmployeeName: empName(filterParams, searchValue),
          ...dateParams(filterParams),
          SortBy: getSortByParam(sortParams ?? null, SORT_COLUMNS.Outdoor),
          IsReport: true,
          CanApprove: canApprove,
        };
        const response = await outDoorService.apiCallPullOutDoor(params);
        if (E.isRight(response)) {
          setOutDoorList(response.right.Data);
          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });
        } else {
          addToast({ type: "error", title: response.left.message });
        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Loading Outdoor",
    );
  };
  //#endregion

  //#region DISPATCHER
  const dispatchLoad = useCallback(
    (page: number, f: FilterInfo = filters, tab: TabId = activeTab, sort?: SortInfo, searchValue?: string) => {
      const LOADER_MAP: Record<TabId, (p: number, f: FilterInfo, s?: SortInfo, search?: string) => Promise<void>> = {
        Attendance: (p, f, s, search) => loadAttendance(p, f, s, search),
        "Attendance Regularization": (p, f, s, search) => loadAttendanceRegularization(p, f, s, subActiveTab === "Approval", search),
        "Comp-Off": (p, f, s, search) => loadCompOff(p, f, s, subActiveTab === "Approval", search),
        Leave: (p, f, s, search) => loadLeave(p, f, s, subActiveTab === "Approval", search),
        Outdoor: (p, f, s, search) => loadOutdoor(p, f, s, subActiveTab === "Approval", search),
        Resignation: (p, f, s, search) => loadResignations(p, f, s, subActiveTab === "Approval", search),
      };
      return LOADER_MAP[tab](page, f, sort, searchValue);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTab, filters, subActiveTab],
  );
  //#endregion

  //#region INITIALIZATION
  useEffect(() => {
    setSearchTerm("");
    setSortInfo(undefined);
    const def = getDefaultFilters(activeTab);
    setFilters(def);
    setTempFilters(def);
    dispatchLoad(1, def, activeTab, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);
  //#endregion

  //#region CURRENT DATA
  const getCurrentData = useCallback(() => {
    const DATA_MAP: Record<TabId, any[]> = {
      Attendance: attendanceList,
      "Attendance Regularization": attendanceRegularizationList,
      "Comp-Off": compOffList,
      Leave: leaveList,
      Outdoor: outDoorList,
      Resignation: employeeResignationList,
    };
    return DATA_MAP[activeTab] ?? [];
  }, [activeTab, attendanceList, attendanceRegularizationList, compOffList, leaveList, outDoorList, employeeResignationList]);
  //#endregion

  //#region APPROVAL DATA
  const getApprovalData = useCallback(() => {
    const DATA_MAP: Record<TabId, any[]> = {
      Attendance: attendanceList,
      "Attendance Regularization": attendanceRegularizationList,
      "Comp-Off": compOffList,
      Leave: leaveList,
      Outdoor: outDoorList,
      Resignation: employeeResignationList,
    };
    return (DATA_MAP[activeTab] ?? []).filter((item) => item.CanApprove);
  }, [activeTab, attendanceList, attendanceRegularizationList, compOffList, leaveList, outDoorList, employeeResignationList]);
  //#endregion

  //#region FILTER HELPERS
  const applyFilters = () => {
    setFilters(tempFilters);
    dispatchLoad(1, tempFilters, activeTab, sortInfo);
    setShowFilterPopup(false);
  };

  const clearFilters = () => {
    setTempFilters({});
    setFilters({});
    dispatchLoad(1, {}, activeTab, sortInfo);
    setShowFilterPopup(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters((prev) => updateFilter(prev, key, value));
  };
  //#endregion

  //#region SEARCH
  const clearSearch = () => {
    setSearchTerm("");
    dispatchLoad(1, filters, activeTab, sortInfo);
  };
  //#endregion

  //#region EXPORT PDF
  const handleExportPdf = useCallback(
    async (getCurrentColumns: () => TableColumn[], currentSortInfo?: SortInfo) => {
      await runApiWithLoader(
        setIsLoading, setLoadingMessage,
        async () => {
          const cols = getCurrentColumns();
          let sortByParam: string | undefined;
          if (currentSortInfo) {
            const col = cols.find((c) => c.key === currentSortInfo.column);
            if (col) sortByParam = `${col.label} ${currentSortInfo.direction.toUpperCase()}`;
          }

          const base = {
            PageNumber: 1,
            PageSize: pagination.totalRecords,
            EmployeeName: searchTerm?.trim() || filters.EmployeeName?.trim() || undefined,
            SortBy: sortByParam,
            ExportType: "PDF" as const,
          };

          const dates = {
            StartDate: convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.StartDate),
            EndDate: convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.EndDate),
          };

          const EXPORT_MAP: Record<TabId, () => Promise<any>> = {
            "Comp-Off": () => compOffService.apiCallPullCompOff({ ...base, ...dates, IsReport: true }),
            Leave: () => LeaveService.apiCallPullLeave({ ...base, ...dates }),
            Outdoor: () => outDoorService.apiCallPullOutDoor({ ...base, ...dates }),
            Resignation: () => employeeResignationService.apiCallPullEmployeeResignation({
              ...base,
              IsCheckPermission: true,
              ResignationDateFrom: convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.ResignationDateFrom),
              ResignationDateTo: convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.ResignationDateTo),
            }),
            Attendance: () => attendanceService.apiCallPullAttendance({ ...base, ...dates, IsReport: true }),
            "Attendance Regularization": () => attendanceRegularizationService.apiCallPullAttendanceRegularization({ ...base, ...dates, IsReport: true }),
          };

          const response = await EXPORT_MAP[activeTab]();
          handleExportFile(response, "PDF", EXPORT_LABELS[activeTab], addToast);
          return response;
        },
        undefined,
        (error: any) => addToast({ type: "error", title: error.message || "Export failed" }),
        undefined,
        "Preparing Export...",
      );
    },
    [activeTab, filters, pagination.totalRecords, searchTerm, addToast],
  );
  //#endregion

  //#region APPROVAL
  const handleApproval = async (
    status: "Approved" | "Rejected",
    selectedRows: any[],
    remarks: string,
    isSelectAll: boolean = false
  ) => {
    if (!isSelectAll && !selectedRows?.length) {
      addToast({ type: "warning", title: "Please select at least one record" });
      return;
    }

    await runApiWithLoader(
      setIsLoading, setLoadingMessage,
      async () => {

        let approveItems: any[] = [];

        if (isSelectAll) {
          const allData = getApprovalData();

          approveItems = allData.map((row: any) => ({
            ModuleName: activeTab,
            Id: row.Id ?? row.CompOffId ?? row.LeaveId ?? row.OutdoorId ?? row.AttendanceId ?? row.AttendanceRegularizationId ?? row.EmployeeResignationId,
            Status: status,
            Remarks: remarks || "",
          }));
        } else {
          approveItems = selectedRows.map((row) => ({
            ModuleName: activeTab,
            Id: row.Id ?? row.CompOffId ?? row.LeaveId ?? row.OutdoorId ?? row.AttendanceId ?? row.AttendanceRegularizationId ?? row.EmployeeResignationId,
            Status: status,
            Remarks: remarks || "",
          }));
        }

        const response = await payrollApprovalService.apiCallAddPayrollApproval({
          ApprovalJson: JSON.stringify(approveItems),
        });

        if (E.isLeft(response)) {
          addToast({ type: "error", title: response.left.message });
        } else {
          addToast({ type: "success", title: `${status} successful` });

          dispatchLoad(pagination.currentPage, filters, activeTab, sortInfo);
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      `${status} Approval`,
    );
  };
  //#endregion

  return {
    isLoading,
    loadingMessage,
    searchTerm,
    setSearchTerm,
    filters,
    tempFilters,
    showFilterPopup,
    setShowFilterPopup,
    sortInfo,
    setSortInfo,
    pagination,
    setPagination,
    attendanceList,
    getCurrentData,
    getApprovalData,
    handleApproval,
    dispatchLoad,
    applyFilters,
    clearFilters,
    handleFilterChange,
    clearSearch,
    handleExportPdf,
  };
}