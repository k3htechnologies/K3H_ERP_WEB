import React, { useEffect, useMemo, useState } from 'react';
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
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { DataTable, type FilterInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import useDebouncedCallback from '@/core/hooks/useDebouncedCallback';
import type { CompOffData, FilterWithPaginationCompOff } from '@/features/compOff/models/compOff';
import type { FilterWithPaginationLeaveRequest, LeaveData } from '@/features/leave/models/LeaveModel';
import type { OutDoorMasterData } from '@/features/outdoor/models/OutDoorModel';
import { CompOffService } from '@/features/compOff/services/CompOffServices';
import { LeaveService } from '@/features/leave/services/LeaveService';
import { OutDoorService } from '@/features/outdoor/services/OutDoorDataService';


export const PayrollReport: React.FC = () => {

  //#region STATE MANAGEMENT

  const [compOffList, setCompOffList] = useState<CompOffData[]>([]);
  const [leaveList, setLeaveList] = useState<LeaveData[]>([]);
  const [outDoorList, setOutDoorList] = useState<OutDoorMasterData[]>([]);
  const [employeeResignationList, setEmployeeResignationList] = useState<EmployeeResignationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  // TOAST
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = useDebouncedCallback((value: string) => {
    loadResignations(1);
  }, 350);

  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});



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

  //#region INITIALIZATION

  useEffect(() => {

    loadResignations(1);

  }, [])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch])

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

  const loadResignations = async (page: number) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const params: FilterWithPaginationEmployeeResignationRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
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

  const loadAttendance = async (page: number) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {


      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Loading Attendance'
    )

  }
  const loadAttendanceRegularization = async (page: number) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {


      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Loading Attendance Regularization'
    )

  }

  const loadCompOff = async (page: number) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const params: FilterWithPaginationCompOff = {
          PageNumber: page,
          PageSize: pagination.pageSize,
        }

        const response = await CompOffService.apiCallPullCompOff(params);

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
  const loadLeave = async (page: number) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const params: FilterWithPaginationLeaveRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
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
      'Loading Comp Off'
    )

  }
  const loadOutdoor = async (page: number) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const params: FilterWithPaginationCompOff = {
          PageNumber: page,
          PageSize: pagination.pageSize,
        }

        const response = await OutDoorService.apiCallPullOutDoorData(params);

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
      'Loading Comp Off'
    )

  }
  //#endregion

  //#region TABLE COLUMN
  const visibleEmployeeResignationColumns = useMemo<TableColumn[]>(
    () => [

      {
        key: 'EmployeeName',
        label: 'Full Name',
        width: '14',
        sortable: false,
        align: 'center',
        render: value => value || 'N/A'
      },
      {
        key: 'ResignationDate',
        label: 'Resignation Date',
        width: '14',
        sortable: false,
        align: 'left',
        render: value => value ? formatDate_dd_MonthName_yy(value) : '-'

      },
      {
        key: 'ExpectedRelievingDate',
        label: 'Expected Relieving Date',
        width: '14',
        sortable: false,
        align: 'left',
        render: value => value ? formatDate_dd_MonthName_yy(value) : '-'
      },
      {
        key: 'ReasonOfLeaving',
        label: 'Reason  OfLeaving',
        width: '14',
        sortable: true,
        align: 'left',
        render: value => value || 'N/A'
      },
    ],
    []

  );
  //#endregion




  return (

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* ============================================================================
          COMMON LOADER FOR PAGEl̥
           ============================================================================ */}

      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

      {/* <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Employee Name"
        onSearchChange={v => {
          setSearchTerm(v);
          debouncedSearch(v);
        }}
        onClearSearch={clearSearchEmployees}
        isShowFilterButton
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters);
          setShowFilterPopup(true);
        }}

        // EXPORT
        isShowExportButton={canExport}
        onExportExcel={handleExportEmployeeExcel}
        onExportPdf={handleExportEmployeePdf}
        exportLoading={isLoading}
      /> */}

      <Tabs
        tabs={tncTabList}
        defaultActive={activeTab}
        islarge={true}
        onTabChange={(t) => {
          setActiveTab(t.id);

          if (t.id === "Attendance") loadResignations(1);

          else if (t.id === "Attendance Regularization") loadResignations(1);

          else if (t.id === "Comp-Off") loadResignations(1);

          else if (t.id === 'Leave') loadResignations(1);

          else if (t.id === 'Outdoor') loadResignations(1);

          else if (t.id === 'Resignation') loadResignations(1);

        }}
      />

      {activeTab === 'Resignation' && employeeResignationList && (
        <div className="space-y-4 p-4">
          <DataTable
            data={employeeResignationList}
            columns={visibleEmployeeResignationColumns}
            emptyMessage="No Employees found"
            fixedHeight
            recordsPerPage={20}
            className="flex-1"
          />

        </div>
      )}
    </div>

  )
}

export default PayrollReport

