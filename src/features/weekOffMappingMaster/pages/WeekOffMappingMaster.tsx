import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  WeekOffMappingMasterData,
  FilterWithPaginationWeekOffMappingMasterRequest
} from '@/features/weekOffMappingMaster/models/WeekOffMappingMasterModel';

import { WeekOffMappingMasterService } from '@/features/weekOffMappingMaster/services/WeekOffMappingMasterService'
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


export const WeekOffMappingMaster: React.FC = () => {

  const [weekOffMappingMasterList, setWeekOffMappingMasterList] = useState<WeekOffMappingMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { toasts, removeToast, addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchWeekOffMappings(value)
  }, 350)
  const [viewWeekOffMappingMasterDetailsData, setViewWeekOffMappingMasterDetailsData] = useState<WeekOffMappingMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});
  const [isShowCustomizeWeekOffMappingMasterColumnsModal, setIsShowCustomizeWeekOffMappingMasterColumnsModal] = useState(false);
  const { canExport } = useMenuPermissions();
  const hasFetchedInitialWeekOffMappings = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialWeekOffMappings.current) return
    hasFetchedInitialWeekOffMappings.current = true;
    fetchWeekOffMappingList()
  }, [])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  const fetchWeekOffMappingList = async (page: number = pagination.currentPage) => {
    return await loadWeekOffMappings(page, filters);
  }

  const loadWeekOffMappings = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;
        if (sortInfo) {
          const column = weekOffMappingMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationWeekOffMappingMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          WeekOffPolicyMasterMappingId: filterParams.WeekOffPolicyMasterMappingId ? Number(filterParams.WeekOffPolicyMasterMappingId) : undefined,
          WeekOffPolicyName: filterParams.WeekOffPolicyName?.trim() || undefined,
          DepartmentName: filterParams.DepartmentName?.trim() || undefined,
          EmployeeName: filterParams.EmployeeName?.trim() || undefined,
          SortBy: sortByParam
        }
        const response = await getWeekOffMappings(params);
        if (E.isRight(response)) {
          setWeekOffMappingMasterList(response.right.Data);
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
      'Loading Week Off Mapping Data...'
    )
  }

  const searchWeekOffMappings = async (searchValue: string) => {
    setSearchTerm(searchValue);
    if (searchValue.trim() === '') {
      fetchWeekOffMappingList();
      return
    }
    const filterParams: FilterInfo = {
      WeekOffPolicyName: searchValue.trim(),
    };
    await loadWeekOffMappings(1, filterParams)
  }

  const clearsearchWeekOffMappings = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchWeekOffMappingList();
  }

  const handleExportWeekOffMappings = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined
        if (sortInfo) {
          const column = weekOffMappingMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationWeekOffMappingMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          WeekOffPolicyName: filters.WeekOffPolicyName?.trim() || undefined,
          DepartmentName: filters.DepartmentName?.trim() || undefined,
          EmployeeName: filters.EmployeeName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }
        const response = await getWeekOffMappings(params);
        handleExportFile(response, exportType, 'Week Off Mapping Master', addToast)
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' })
      },
      undefined,
      'Preparing Export...'
    )
  }

  const handleExportWeekOffMappingExcel = () => handleExportWeekOffMappings('Excel')
  const handleExportWeekOffMappingPdf = () => handleExportWeekOffMappings('PDF')

  const getWeekOffMappings = async (filterParams: FilterWithPaginationWeekOffMappingMasterRequest) => {
    return await WeekOffMappingMasterService.apiCallPullWeekOffMappingMaster(filterParams);
  }

  const handlePageChange = (page: number) => {
    fetchWeekOffMappingList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {
    setSortInfo(sortInfo);
    fetchWeekOffMappingList(1);
  }

  const weekOffMappingMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const weekOffMappingListForTable = useMemo(() => weekOffMappingMasterList, [weekOffMappingMasterList]);

  const handleViewWeekOffMappingDetails = useCallback((row: WeekOffMappingMasterData) => {
    setViewWeekOffMappingMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  const weekOffMappingMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'WeekOffPolicyName',
        label: 'Week Off Policy Name',
        width: '20',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className="flex items-center justify-start">
            <TooltipText
              text={value || 'N/A'}
              maxWidth="250px"
              tooltipThreshold={25}
              onClick={() => handleViewWeekOffMappingDetails(row)}
            />
          </div>
        )
      },
      {
        key: 'DepartmentName',
        label: 'Department Name',
        width: '18',
        sortable: true,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="200px"
            tooltipThreshold={20}
          />
        )
      },
      {
        key: 'EmployeeName',
        label: 'Employee Name',
        width: '18',
        sortable: true,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="200px"
            tooltipThreshold={20}
          />
        )
      },
      {
        key: 'WeeklyOff',
        label: 'Weekly Off',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {value || 'N/A'}
          </span>
        )
      },
      {
        key: 'WeeklyOff2',
        label: 'Weekly Off 2',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {value || 'N/A'}
          </span>
        )
      },
      {
        key: 'CreatedBy',
        label: 'Last Modified By',
        width: '10',
        sortable: true,
        align: 'center',
        render: (value) => value || 'N/A'
      },
      {
        key: 'CreatedDate',
        label: 'Last Modified Date',
        width: '10',
        sortable: true,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      }
    ],
    [handleViewWeekOffMappingDetails]
  )

  const requiredWeekOffMappingMasterColumnKeys: string[] = ['WeekOffPolicyName'];
  const allWeekOffMappingMasterColumnKeys: string[] = weekOffMappingMasterColumns.map(c => c.key)
  const [selectedWeekOffMappingMasterColumnKeys, setSelectedWeekOffMappingMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getWeekOffMappingMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredWeekOffMappingMasterColumnKeys]));
        return withRequired.filter(k => allWeekOffMappingMasterColumnKeys.includes(k));
      }
    } catch { }
    return allWeekOffMappingMasterColumnKeys
  })

  useEffect(() => {
    setSelectedWeekOffMappingMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredWeekOffMappingMasterColumnKeys])).filter(k => allWeekOffMappingMasterColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffMappingMasterColumns.length])

  const visibleWeekOffMappingMasterColumns = useMemo(
    () => weekOffMappingMasterColumns.filter(col => selectedWeekOffMappingMasterColumnKeys.includes(col.key)),
    [weekOffMappingMasterColumns, selectedWeekOffMappingMasterColumnKeys]
  )

  interface ViewWeekOffMappingDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: WeekOffMappingMasterData | null
  }

  const ViewWeekOffMappingDetailsModal: React.FC<ViewWeekOffMappingDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings - Company setup (Week Off Mapping Details)"
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
        }}
        cancelText="Close"
        loading={false}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Department Name</span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.DepartmentName || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Employee Name</span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.EmployeeName || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Week Off Policy Code</span>
              <span className="text-sm text-blue-600 font-medium">{data.WeekOffPolicyCode || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Week Off Policy Name</span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.WeekOffPolicyName || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Week Days</span>
              <span className="text-sm text-blue-600 font-medium">{data.WeekDays || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Week Days Starts On</span>
              <span className="text-sm text-blue-600 font-medium">{data.WeekDaysStartsOn || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Weekly Off</span>
              <span className="text-sm text-blue-600 font-medium">{data.WeeklyOff || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Weekly Off 2</span>
              <span className="text-sm text-blue-600 font-medium">{data.WeeklyOff2 || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Weekly Off 2 Type</span>
              <span className="text-sm text-blue-600 font-medium">{data.WeeklyOff2Type || 'N/A'}</span>
            </div>
            {data.NotApplicableForMonths && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Not Applicable For Months</span>
                <span className="text-sm text-blue-600 font-medium">{data.NotApplicableForMonths}</span>
              </div>
            )}
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Action Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Created By</span>
                  <span className="text-sm text-blue-600 font-medium">{data.CreatedBy || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Created Date</span>
                  <span className="text-sm text-blue-600 font-medium">
                    {formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {data.ModifiedBy && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Modified By</span>
                    <span className="text-sm text-blue-600 font-medium">{data.ModifiedBy}</span>
                  </div>
                )}
                {data.ModifiedDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Modified Date</span>
                    <span className="text-sm text-blue-600 font-medium">
                      {formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    )
  }

  const applyFilters = () => {
    setFilters(tempFilters)
    loadWeekOffMappings(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadWeekOffMappings(1, {})
    setShowFilterPopup(false)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...tempFilters }
    if (value.trim()) {
      newFilters[key] = value.trim()
    } else {
      delete newFilters[key]
    }
    setTempFilters(newFilters)
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <div className="h-full flex flex-col">
        <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>
        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder="Search by week off policy name..."
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchWeekOffMappings}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeWeekOffMappingMasterColumnsModal(true)}
          isShowAddButton={false}
          isShowImportButton={false}
          isShowExportButton={canExport}
          onExportExcel={handleExportWeekOffMappingExcel}
          onExportPdf={handleExportWeekOffMappingPdf}
          exportLoading={isLoading}
        />
        <DataTable
          data={weekOffMappingListForTable}
          columns={visibleWeekOffMappingMasterColumns}
          pagination={weekOffMappingMasterPaginationInfo}
          emptyMessage="No week off mappings found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />
        <ViewWeekOffMappingDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewWeekOffMappingMasterDetailsData(null)
          }}
          data={viewWeekOffMappingMasterDetailsData}
        />
        <CustomizeColumnsModal
          isOpen={isShowCustomizeWeekOffMappingMasterColumnsModal}
          onClose={() => setIsShowCustomizeWeekOffMappingMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(new Set([...keys, ...requiredWeekOffMappingMasterColumnKeys]))
            setSelectedWeekOffMappingMasterColumnKeys(withRequired)
            try {
              LocalStorageHelper.storeWeekOffMappingMasterTableColumns(JSON.stringify(withRequired))
            } catch { }
          }}
          columns={weekOffMappingMasterColumns}
          selectedKeys={selectedWeekOffMappingMasterColumnKeys}
          requiredKeys={requiredWeekOffMappingMasterColumnKeys}
          title="Customize Week Off Mapping Master Table Columns"
        />
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Week Off Mapping Master"
          onSubmit={(e) => {
            e.preventDefault()
            applyFilters()
          }}
          saveText="Apply Filter"
          cancelText="Clear Filter"
          onCancel={() => clearFilters()}
          size="half-screen"
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Week Off Policy Name</label>
                <Input
                  type="text"
                  value={tempFilters.WeekOffPolicyName || ''}
                  onChange={(e) => handleFilterChange('WeekOffPolicyName', e.target.value)}
                  placeholder="Enter week off policy name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <Input
                  type="text"
                  value={tempFilters.DepartmentName || ''}
                  onChange={(e) => handleFilterChange('DepartmentName', e.target.value)}
                  placeholder="Enter department name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                <Input
                  type="text"
                  value={tempFilters.EmployeeName || ''}
                  onChange={(e) => handleFilterChange('EmployeeName', e.target.value)}
                  placeholder="Enter employee name"
                />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </>
  )
}

export default WeekOffMappingMaster

