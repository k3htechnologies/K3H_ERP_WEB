import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';

export const EmployeeMaster: React.FC = () => {
  //#region STATE
  const [employeeList, setEmployeeList] = useState<EmployeeMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  const { toasts, removeToast, addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchEmployees(value);
  }, 350);

  const [viewEmployeeData, setViewEmployeeData] = useState<EmployeeMasterData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  const [isShowCustomizeEmployeeColumnsModal, setIsShowCustomizeEmployeeColumnsModal] = useState(false);

  const { canExport } = useMenuPermissions();
  const hasFetchedInitialEmployees = useRef(false);
  //#endregion

  //#region INIT
  useEffect(() => {
    if (hasFetchedInitialEmployees.current) return;
    hasFetchedInitialEmployees.current = true;
    fetchEmployeeList();
  }, []);

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
      'Loading Employee Data...'
    );
  };

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

  const clearSearchEmployees = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchEmployeeList();
  };

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

  const getEmployees = async (filterParams: FilterWithPaginationEmployeeMasterRequest) => {
    return await employeeMasterService.apiCallPullEmployeeMaster(filterParams);
  };
  //#endregion

  //#region TABLE CONFIG
  const handlePageChange = (page: number) => {
    fetchEmployeeList(page);
  };

  const handleSortColumn = (sort: SortInfo) => {
    setSortInfo(sort);
    fetchEmployeeList(1);
  };

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

  const handleViewEmployeeDetails = useCallback((row: EmployeeMasterData) => {
    setViewEmployeeData(row);
    setIsViewModalOpen(true);
  }, []);

  const employeeColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'FullName',
        label: 'Full Name',
        width: '22',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className="flex items-center justify-start">
            <TooltipText
              text={value || row.FirstName || 'N/A'}
              maxWidth="260px"
              tooltipThreshold={26}
              onClick={() => handleViewEmployeeDetails(row)}
            />
          </div>
        )
      },
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
        align: 'center',
        render: value => value || 'N/A'
      },
      {
        key: 'EmailId',
        label: 'Email Id',
        width: '14',
        sortable: false,
        align: 'center',
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
      },
      {
        key: 'CreatedBy',
        label: 'Last Modified By',
        width: '16',
        sortable: true,
        align: 'center',
        render: value => value || 'N/A'
      },
      {
        key: 'CreatedDate',
        label: 'Last Modified Date',
        width: '16',
        sortable: true,
        align: 'center',
        render: value => (value ? formatDate_dd_MonthName_yy(value) : '-')
      }
    ],
    [handleViewEmployeeDetails]
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeColumns.length]);

  const visibleEmployeeColumns = useMemo(
    () => employeeColumns.filter(col => selectedEmployeeColumnKeys.includes(col.key)),
    [employeeColumns, selectedEmployeeColumnKeys]
  );
  //#endregion

  //#region VIEW MODAL
  interface ViewEmployeeDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: EmployeeMasterData | null;
  }

  const ViewEmployeeDetailsModal: React.FC<ViewEmployeeDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null;

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings - Company setup (Employee Details)"
        onSubmit={e => {
          e.preventDefault();
          onClose();
        }}
        cancelText="Close"
        loading={false}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Basic Details</h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">First Name</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.FirstName || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Middle Name</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.MiddleName || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Last Name</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.LastName || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Gender</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.Gender || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Marital Status</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.MaritalStatus || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Blood Group</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.BloodGroup || '-'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">DOB</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.DateOfBirth ? formatDate_dd_MonthName_yy(data.DateOfBirth) : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Office Email ID</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.OfficeEmailId || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Email ID</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.EmailId || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Personal Mobile Number</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.PersonalMobileNumber || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Office Mobile Number</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.OfficeMobileNumber || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Employment Type</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.EmployeeType || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Employee Info Sheet Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Employee Info Sheet</h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Company Name</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.CompanyName || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Branch</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.Branch || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Department</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.Department || '-'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Designation</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.Designation || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Joining Date</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.JoiningDate ? formatDate_dd_MonthName_yy(data.JoiningDate) : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Reporting Person</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.ReportPersonName || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Address</h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Communication Address</span>
              </div>
              <div className="flex justify-between  items-center py-1 border-b border-gray-200">
                <span className="text-sm text-blue-600 font-medium">
                  {data.CommunicationAddress || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Permanent Address</span>
              </div>
              <div className="flex justify-between  items-center py-1 border-b border-gray-200">
                <span className="text-sm text-blue-600 font-medium">
                  {data.PermanentAddress || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Country</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.CountryName || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">State</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.StateName || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">District</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.DistrictName || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">City</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.CityName || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Details Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Bank Details</h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Bank Name</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.BankName || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Account Number</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.AccountNo || '-'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Bank Branch Name</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.BankBranchName || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">IFSC Code</span>
                <span className="text-sm text-blue-600 font-medium">
                  {data.IFSCCode || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Details Header - At Bottom */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Action Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Created By</span>
                  <span className="text-sm text-blue-600 font-medium">
                    {data.CreatedBy || '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Created Date</span>
                  <span className="text-sm text-blue-600 font-medium">
                    {formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate|| '-')}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {data.ModifiedBy && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Modified By</span>
                    <span className="text-sm text-blue-600 font-medium">
                      {data.ModifiedBy}
                    </span>
                  </div>
                )}
                {data.ModifiedDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Modified Date</span>
                    <span className="text-sm text-blue-600 font-medium">
                      {formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  };
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
    loadEmployees(1, {});
    setShowFilterPopup(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters: FilterInfo = { ...tempFilters };
    if (value.trim()) {
      newFilters[key] = value.trim();
    } else {
      delete newFilters[key];
    }
    setTempFilters(newFilters);
  };
  //#endregion

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <div className="h-full flex flex-col">
        <Loader loading={isLoading} title={loadingMessage}>
          <div></div>
        </Loader>
        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder="Search by employee name..."
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
          isShowAddButton={false}
          isShowImportButton={false}
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
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />
        <ViewEmployeeDetailsModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setViewEmployeeData(null);
          }}
          data={viewEmployeeData}
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
          title="Customize Employee Master Table Columns"
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
          size="half-screen"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </Modal>
      </div>
    </>
  );
};

export default EmployeeMaster;
