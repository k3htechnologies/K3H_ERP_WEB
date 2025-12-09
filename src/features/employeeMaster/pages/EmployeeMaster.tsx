import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  EmployeeMasterData,
  FilterWithPaginationEmployeeMasterRequest
} from '@/features/employeeMaster/models/EmployeeMasterModel';

import { employeeMasterService } from '@/features/employeeMaster/services/EmployeeMasterService';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { useLocation, type Location, useNavigate } from 'react-router-dom';
import type { FilterPullExcelSample } from '@/features/technical/models/TechnicalModel';
import { technicalService } from '@/features/technical/services/TechnicalService';
import { Input } from '@/ui/components/forms';
import { updateFilter } from '@/core/utils/filterHelper';

export const EmployeeMaster: React.FC = () => {
  //#region STATE
  const [employeeList, setEmployeeList] = useState<EmployeeMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const navigate = useNavigate();

  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  const { toasts, removeToast, addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchEmployees(value);
  }, 350);

  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  const [isShowCustomizeEmployeeColumnsModal, setIsShowCustomizeEmployeeColumnsModal] = useState(false);

  const { canAction, canExport } = useMenuPermissions();

  const location = useLocation() as Location & {
    state?: {
      listState?: {
        page?: number;
        filters?: FilterInfo;
        sortInfo?: SortInfo;
        searchTerm?: string;
      };
    };
  };


  //#endregion

  //#region INIT
  useEffect(() => {

    const incoming = location.state?.listState as
      | { page?: number; filters?: FilterInfo; sortInfo?: SortInfo; searchTerm?: string }
      | undefined;

    const listState = incoming ?? { page: 1, filters: {} as FilterInfo, sortInfo: undefined, searchTerm: '' };


    setPagination({ currentPage: listState.page ?? pagination.currentPage });

    setSortInfo(listState.sortInfo);

    setFilters(listState.filters ?? {});

    setTempFilters(listState.filters ?? {});

    setSearchTerm(listState.searchTerm ?? '');

    if (listState.searchTerm && String(listState.searchTerm).trim()) {

      setSearchTerm(String(listState.searchTerm));

      loadEmployees(listState.page ?? 1, { EmployeeName: String(listState.searchTerm).trim() });

      return;
    }


    loadEmployees(listState.page ?? 1, listState.filters ?? {});

  }, [location.state]);



  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);
  //#endregion

  //#region DATA LOAD
  const fetchEmployeeList = async (page: number = pagination.currentPage) => {
    return await loadEmployees(page, filters);
  };

  const loadEmployees = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam: string | undefined;

        if (sortInfo) {
          const column = employeeColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const params: FilterWithPaginationEmployeeMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          EmployeeId: filterParams.EmployeeId ? Number(filterParams.EmployeeId) : undefined,
          EmployeeName: filterParams.EmployeeName?.trim() || undefined,
          BranchName: filterParams.BranchName?.trim() || undefined,
          DepartmentName: filterParams.DepartmentName?.trim() || undefined,
          DesignationName: filterParams.DesignationName?.trim() || undefined,
          EmailId: filterParams.EmailId?.trim() || undefined,
          MobileNumber: filterParams.MobileNumber?.trim() || undefined,
          ReportPersonName: filterParams.ReportPersonName?.trim() || undefined,
          BankBranchName: filterParams.BankBranchName?.trim() || undefined,
          SortBy: sortByParam
        };

        const response = await getEmployees(params);

        if (E.isRight(response)) {
          setEmployeeList(response.right.Data);
          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize)
          });
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      'Loading Employee Data'
    );
  };

  //#endregion

  //#region SEARCH EMPLOYEE FILTER
  const searchEmployees = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchEmployeeList();
      return;
    }

    const filterParams: FilterInfo = {
      EmployeeName: searchValue.trim()
    };

    await loadEmployees(1, filterParams);
  };


  //#endregion

  //#region CLAER SERACH EMPLOYEE
  const clearSearchEmployees = () => {
    setSearchTerm('');

    debouncedSearch.cancel?.();

    setFilters({});
    setTempFilters({});
    setPagination({ currentPage: 1 });
    loadEmployees(1, {});
    try {
      navigate(location.pathname, { replace: true, state: {} });
    } catch {
    }
  };

  //#endregion

  //#region  EXCEL EXPORT TO EXCEL | PDF
  const handleExportEmployees = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam: string | undefined;
        if (sortInfo) {
          const column = employeeColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const params: FilterWithPaginationEmployeeMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          EmployeeName: filters.EmployeeName?.trim() || undefined,
          BranchName: filters.BranchName?.trim() || undefined,
          DepartmentName: filters.DepartmentName?.trim() || undefined,
          DesignationName: filters.DesignationName?.trim() || undefined,
          EmailId: filters.EmailId?.trim() || undefined,
          MobileNumber: filters.MobileNumber?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        };

        const response = await getEmployees(params);

        handleExportFile(response, exportType, 'Employee Master', addToast);

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' });
      },
      undefined,
      'Preparing Export...'
    );
  };

  const handleExportEmployeeExcel = () => handleExportEmployees('Excel');
  const handleExportEmployeePdf = () => handleExportEmployees('PDF');

  //#endregion

  //#region PULL EMPLOYEE MASTER
  const getEmployees = async (filterParams: FilterWithPaginationEmployeeMasterRequest) => {
    return await employeeMasterService.apiCallPullEmployeeMaster(filterParams);
  };
  //#endregion

  //#region TABLE CONFIG
  const handlePageChange = useCallback((page: number) => {
    fetchEmployeeList(page);
  }, []);

  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    fetchEmployeeList(1);
  }, []);

  const employeePaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize]
  );

  const employeesForTable = useMemo(() => employeeList, [employeeList]);
  //#endregion

  //#region VIEW EMPLOYEE MASTER

  const handleViewEmployeeDetails = useCallback((row: EmployeeMasterData) => {
    navigate('/employeeMaster/view', {
      state: {
        editEmployeeMasterData: row,
        fromList: true,
        listState: {
          page: pagination.currentPage,
          filters,
          sortInfo,
          searchTerm,
        },
      },
    });
  }, [navigate, pagination.currentPage, filters, sortInfo, searchTerm]);
  //#endregion

  //#region TABLE COLUMN
  const employeeColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'EmployeeCode',
        label: 'Employee Code',
        width: '14',
        sortable: false,
        align: 'center',
        render: value => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="140px"
            tooltipThreshold={14}
            tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
          />
        )
      },
      {
        key: 'FullName',
        label: 'Full Name',
        width: '22',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => {
          const fullName = (row?.FullName ?? '').trim();
          const initials = fullName
            ? fullName
              .split(/\s+/)
              .map((w: string) => (w && w.length ? w[0] : ''))
              .join('')
              .toUpperCase()
              .slice(0, 2)
            : 'NA';

          return (
            <div className={`flex items-center justify-between gap-3`}>
              {/* left: avatar + name */}
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-full
                       bg-blue-200 
                       flex items-center justify-center
                       text-gray-800 font-medium text-xs
                       border border-gray-300"
                  title={fullName || 'N/A'}
                >
                  {initials}
                </div>

                <div className="min-w-0">
                  <TooltipText
                    text={value || row.FirstName || 'N/A'}
                    maxWidth="260px"
                    tooltipThreshold={26}
                    onClick={() => handleViewEmployeeDetails(row)}
                  />
                </div>
              </div>

              {/* right: optional action area (kept if canAction true) */}
              {canAction && (
                <div className="flex items-center gap-2">
                  {/* put any action buttons/icons here, e.g. edit/view */}
                </div>
              )}
            </div>
          );
        }
      },


      {
        key: 'Gender',
        label: 'Gender',
        width: '14',
        sortable: false,
        align: 'center',
        render: value => value || 'N/A'
      },
      {
        key: 'PersonalMobileNumber',
        label: 'Personal Mobile Number',
        width: '14',
        sortable: false,
        align: 'left',
        render: value => value ? `+91 ${value}` : '-'

      },
      {
        key: 'EmailId',
        label: 'Email Id',
        width: '14',
        sortable: false,
        align: 'left',
        render: value => value || 'N/A'
      },
      {
        key: 'Department',
        label: 'Department',
        width: '14',
        sortable: true,
        align: 'left',
        render: value => (
          <TooltipText text={value || 'N/A'} maxWidth="160px" tooltipThreshold={16} />
        )
      },
      {
        key: 'Designation',
        label: 'Designation',
        width: '14',
        sortable: true,
        align: 'left',
        render: value => (
          <TooltipText text={value || 'N/A'} maxWidth="160px" tooltipThreshold={16} />
        )
      },
      {
        key: 'Branch',
        label: 'Branch',
        width: '14',
        sortable: true,
        align: 'left',
        render: value => (
          <TooltipText text={value || 'N/A'} maxWidth="160px" tooltipThreshold={16} />
        )
      },
      {
        key: 'ReportPersonName',
        label: 'Report Person Name',
        width: '14',
        sortable: true,
        align: 'left',
        render: value => (
          <TooltipText text={value || 'N/A'} maxWidth="160px" tooltipThreshold={16} />
        )
      },

      {
        key: 'DateOfBirth',
        label: 'DOB',
        width: '14',
        sortable: true,
        align: 'center',
        render: value => (value ? formatDate_dd_MonthName_yy(value) : 'N/A')
      },
      {
        key: 'JoiningDate',
        label: 'Joining Date',
        width: '14',
        sortable: true,
        align: 'center',
        render: value => (value ? formatDate_dd_MonthName_yy(value) : 'N/A')
      },
      {
        key: 'ProbationDate',
        label: 'Probation Date',
        width: '14',
        sortable: true,
        align: 'center',
        render: value => (value ? formatDate_dd_MonthName_yy(value) : 'N/A')
      },
      {
        key: 'MaritalStatus',
        label: 'Marital Status',
        width: '14',
        sortable: false,
        align: 'center',
        render: value => value || 'N/A'
      },
      {
        key: 'BloodGroup',
        label: 'Blood Group',
        width: '14',
        sortable: false,
        align: 'center',
        render: value => value || 'N/A'
      },
      {
        key: 'BankName',
        label: 'Bank Name',
        width: '18',
        sortable: false,
        align: 'left',
        render: value => (
          <TooltipText text={value || 'N/A'} maxWidth="220px" tooltipThreshold={22} />
        )
      },
      {
        key: 'BankBranchName',
        label: 'Bank Branch Name',
        width: '18',
        sortable: false,
        align: 'left',
        render: value => (
          <TooltipText text={value || 'N/A'} maxWidth="220px" tooltipThreshold={22} />
        )
      },
      {
        key: 'IFSCCode',
        label: 'IFSC Code',
        width: '18',
        sortable: false,
        align: 'left',
        render: value => value || 'N/A'
      },
      {
        key: 'AccountNo',
        label: 'Account No',
        width: '14',
        sortable: false,
        align: 'center',
        render: value => value || 'N/A'
      },
      {
        key: 'OfficeEmailId',
        label: 'Office Email',
        width: '18',
        sortable: false,
        align: 'left',
        render: value => (
          <TooltipText text={value || 'N/A'} maxWidth="220px" tooltipThreshold={22} />
        )
      },
      {
        key: 'OfficeMobileNumber',
        label: 'Office Mobile',
        width: '14',
        sortable: false,
        align: 'center',
        render: value => value || 'N/A'
      },
      {
        key: 'LastLogin',
        label: 'Last Login',
        width: '16',
        sortable: true,
        align: 'center',
        render: value => (value ? formatDate_dd_MonthName_yy(value) : '-')
      }
    ],
    [canAction, handleViewEmployeeDetails]

  );
  //#endregion

  //#region CUSTOMIZE COLUMNS
  const requiredEmployeeColumnKeys: string[] = ['FullName'];

  const allEmployeeColumnKeys: string[] = employeeColumns.map(c => c.key);

  const [selectedEmployeeColumnKeys, setSelectedEmployeeColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getEmployeeMasterTableColumns?.();
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        const withRequired = Array.from(new Set([...parsed, ...requiredEmployeeColumnKeys]));
        return withRequired.filter(k => allEmployeeColumnKeys.includes(k));
      }
    } catch {
      // ignore
    }
    return allEmployeeColumnKeys;
  });

  useEffect(() => {
    setSelectedEmployeeColumnKeys(prev =>
      Array.from(new Set([...prev, ...requiredEmployeeColumnKeys])).filter(k =>
        allEmployeeColumnKeys.includes(k)
      )
    );

  }, [employeeColumns.length]);

  const visibleEmployeeColumns = useMemo(
    () => employeeColumns.filter(col => selectedEmployeeColumnKeys.includes(col.key)),
    [employeeColumns, selectedEmployeeColumnKeys]
  );
  //#endregion

  //#region FILTER HELPERS
  const applyFilters = () => {
    setFilters(tempFilters);
    loadEmployees(1, tempFilters);
    setShowFilterPopup(false);
  };

  const clearFilters = () => {
    setTempFilters({});
    setFilters({});

    // reset page
    setPagination({ currentPage: 1 });

    // load empty filters
    loadEmployees(1, {});

    setShowFilterPopup(false);

    // clear router state (very important)
    navigate(location.pathname, { replace: true, state: {} });
  };
  //#endregion

  //#region ADD NEW EMPLOYEE
  const handleAddEmployeeModal = () => {
    navigate('/employeeMaster/add');
  };
  //#endregion

  //#region  HANDLE CHANGE EVENT

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  //#endregion

  //#region IMPORT EXCEL | DOWNLOAD

  const excelImportEmployeeMaster = async () => {

    await runApiWithLoader(

      setIsLoading,

      setIsLoadingMessage,

      async () => {
        return null;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Import failed' })
      },
      undefined,
      'Preparing Import'
    )
  }


  const downloadExcelSampleEmployeeMaster = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting

        const params: FilterPullExcelSample = {
          TableName: 'EMPLOYEE MASTER'
        }

        const response = await technicalService.apiCallPullExcelSample(params);

        handleExportFile(response, 'Excel', 'Employee Master', addToast, 'Sample file download successfully')

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' })
      },
      undefined,
      'Preparing Downloading'
    )
  }

  const handleExcelImportEmployeeMaster = () => excelImportEmployeeMaster()
  const handleDownloadExcelSampleEmployeeMaster = () => downloadExcelSampleEmployeeMaster()

  //#endregion

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Loader loading={isLoading} title={loadingMessage}>
          <div></div>
        </Loader>

        <TableActionToolbar
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
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeEmployeeColumnsModal(true)}
          // ADD
          isShowAddButton={canAction}
          addTitle="Add Employee"
          onAdd={handleAddEmployeeModal}

          // IMPORT
          isShowImportButton={canAction}
          onUploadExcel={handleExcelImportEmployeeMaster}
          onDownloadSampleExcel={handleDownloadExcelSampleEmployeeMaster}

          // EXPORT
          isShowExportButton={canExport}
          onExportExcel={handleExportEmployeeExcel}
          onExportPdf={handleExportEmployeePdf}
          exportLoading={isLoading}
        />

        <DataTable
          data={employeesForTable}
          columns={visibleEmployeeColumns}
          pagination={employeePaginationInfo}
          emptyMessage="No employees found"
          fixedHeight
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />

        <CustomizeColumnsModal
          isOpen={isShowCustomizeEmployeeColumnsModal}
          onClose={() => setIsShowCustomizeEmployeeColumnsModal(false)}
          onApply={keys => {
            const withRequired = Array.from(new Set([...keys, ...requiredEmployeeColumnKeys]));
            setSelectedEmployeeColumnKeys(withRequired);
            try {
              LocalStorageHelper.storeEmployeeMasterTableColumns?.(JSON.stringify(withRequired));
            } catch {
              // ignore
            }
          }}
          columns={employeeColumns}
          selectedKeys={selectedEmployeeColumnKeys}
          requiredKeys={requiredEmployeeColumnKeys}
          title="Customize Table Columns"
        />

        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Employee Master"
          onSubmit={e => {
            e.preventDefault();
            applyFilters();
          }}
          saveText="Apply Filter"
          cancelText="Clear Filter"
          onCancel={() => clearFilters()}
          resetText=''
          size="small-half"
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                <Input
                  type="text"
                  value={tempFilters.EmployeeName || ''}
                  onChange={e => handleFilterChange('EmployeeName', e.target.value)}
                  placeholder="Enter employee name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <Input
                  type="text"
                  value={tempFilters.BranchName || ''}
                  onChange={e => handleFilterChange('BranchName', e.target.value)}
                  placeholder="Enter branch name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <Input
                  type="text"
                  value={tempFilters.DepartmentName || ''}
                  onChange={e => handleFilterChange('DepartmentName', e.target.value)}
                  placeholder="Enter department name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                <Input
                  type="text"
                  value={tempFilters.DesignationName || ''}
                  onChange={e => handleFilterChange('DesignationName', e.target.value)}
                  placeholder="Enter designation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <Input
                  type="text"
                  value={tempFilters.MobileNumber || ''}
                  onChange={e => handleFilterChange('MobileNumber', e.target.value)}
                  placeholder="Enter mobile number"
                />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default EmployeeMaster;
