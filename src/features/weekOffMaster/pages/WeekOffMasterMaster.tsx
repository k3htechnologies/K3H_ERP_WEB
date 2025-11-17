import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  WeekOffMasterData,
  FilterWithPaginationWeekOffMasterRequest
} from '@/features/weekOffMaster/models/WeekOffMasterModel';

import { WeekOffMasterService } from '@/features/weekOffMaster/services/WeekOffMasterService'
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


export const WeekOffMasterMaster: React.FC = () => {

  const [weekOffMasterList, setWeekOffMasterList] = useState<WeekOffMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { toasts, removeToast, addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchWeekOffs(value)
  }, 350)
  const [viewWeekOffMasterDetailsData, setViewWeekOffMasterDetailsData] = useState<WeekOffMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});
  const [isShowCustomizeWeekOffMasterColumnsModal, setIsShowCustomizeWeekOffMasterColumnsModal] = useState(false);
  const { canExport } = useMenuPermissions();
  const hasFetchedInitialWeekOffs = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialWeekOffs.current) return
    hasFetchedInitialWeekOffs.current = true;
    fetchWeekOffList()
  }, [])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  const fetchWeekOffList = async (page: number = pagination.currentPage) => {
    return await loadWeekOffs(page, filters);
  }

  const loadWeekOffs = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;
        if (sortInfo) {
          const column = weekOffMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationWeekOffMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          WeekOffPolicyMasterId: filterParams.WeekOffPolicyMasterId ? Number(filterParams.WeekOffPolicyMasterId) : undefined,
          WeekOffPolicyName: filterParams.WeekOffPolicyName?.trim() || undefined,
          SortBy: sortByParam
        }
        const response = await getWeekOffs(params);
        if (E.isRight(response)) {
          setWeekOffMasterList(response.right.Data);
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
      'Loading Week Off Data...'
    )
  }

  const searchWeekOffs = async (searchValue: string) => {
    setSearchTerm(searchValue);
    if (searchValue.trim() === '') {
      fetchWeekOffList();
      return
    }
    const filterParams: FilterInfo = {
      WeekOffPolicyName: searchValue.trim(),
    };
    await loadWeekOffs(1, filterParams)
  }

  const clearsearchWeekOffs = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchWeekOffList();
  }

  const handleExportWeekOffs = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined
        if (sortInfo) {
          const column = weekOffMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationWeekOffMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          WeekOffPolicyName: filters.WeekOffPolicyName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }
        const response = await getWeekOffs(params);
        handleExportFile(response, exportType, 'Week Off Master', addToast)
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

  const handleExportWeekOffExcel = () => handleExportWeekOffs('Excel')
  const handleExportWeekOffPdf = () => handleExportWeekOffs('PDF')

  const getWeekOffs = async (filterParams: FilterWithPaginationWeekOffMasterRequest) => {
    return await WeekOffMasterService.apiCallPullWeekOffMaster(filterParams);
  }

  const handlePageChange = (page: number) => {
    fetchWeekOffList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {
    setSortInfo(sortInfo);
    fetchWeekOffList(1);
  }

  const weekOffMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const weekOffListForTable = useMemo(() => weekOffMasterList, [weekOffMasterList]);

  const handleViewWeekOffDetails = useCallback((row: WeekOffMasterData) => {
    setViewWeekOffMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  const weekOffMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'WeekOffPolicyName',
        label: 'Week Off Policy Name',
        width: '30',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className="flex items-center justify-start">
            <TooltipText
              text={value || 'N/A'}
              maxWidth="300px"
              tooltipThreshold={30}
              onClick={() => handleViewWeekOffDetails(row)}
            />
          </div>
        )
      },
      {
        key: 'WeekOffPolicyCode',
        label: 'Week Off Policy Code',
        width: '20',
        sortable: false,
        align: 'center',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="200px"
            tooltipThreshold={20}
            tooltipClassName='inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap'
          />
        )
      },
      {
        key: 'WeeklyOff',
        label: 'Weekly Off',
        width: '15',
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
        width: '15',
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
    [handleViewWeekOffDetails]
  )

  const requiredWeekOffMasterColumnKeys: string[] = ['WeekOffPolicyName'];
  const allWeekOffMasterColumnKeys: string[] = weekOffMasterColumns.map(c => c.key)
  const [selectedWeekOffMasterColumnKeys, setSelectedWeekOffMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getWeekOffMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredWeekOffMasterColumnKeys]));
        return withRequired.filter(k => allWeekOffMasterColumnKeys.includes(k));
      }
    } catch { }
    return allWeekOffMasterColumnKeys
  })

  useEffect(() => {
    setSelectedWeekOffMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredWeekOffMasterColumnKeys])).filter(k => allWeekOffMasterColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffMasterColumns.length])

  const visibleWeekOffMasterColumns = useMemo(
    () => weekOffMasterColumns.filter(col => selectedWeekOffMasterColumnKeys.includes(col.key)),
    [weekOffMasterColumns, selectedWeekOffMasterColumnKeys]
  )

  interface ViewWeekOffDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: WeekOffMasterData | null
  }

  const ViewWeekOffDetailsModal: React.FC<ViewWeekOffDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings - Company setup (Week Off Details)"
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
        }}
        cancelText="Close"
        loading={false}
      >
        <div className="space-y-6">
          <div className="space-y-4">
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
    loadWeekOffs(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadWeekOffs(1, {})
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
          onClearSearch={clearsearchWeekOffs}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeWeekOffMasterColumnsModal(true)}
          isShowAddButton={false}
          isShowImportButton={false}
          isShowExportButton={canExport}
          onExportExcel={handleExportWeekOffExcel}
          onExportPdf={handleExportWeekOffPdf}
          exportLoading={isLoading}
        />
        <DataTable
          data={weekOffListForTable}
          columns={visibleWeekOffMasterColumns}
          pagination={weekOffMasterPaginationInfo}
          emptyMessage="No week off policies found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />
        <ViewWeekOffDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewWeekOffMasterDetailsData(null)
          }}
          data={viewWeekOffMasterDetailsData}
        />
        <CustomizeColumnsModal
          isOpen={isShowCustomizeWeekOffMasterColumnsModal}
          onClose={() => setIsShowCustomizeWeekOffMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(new Set([...keys, ...requiredWeekOffMasterColumnKeys]))
            setSelectedWeekOffMasterColumnKeys(withRequired)
            try {
              LocalStorageHelper.storeWeekOffMasterTableColumns(JSON.stringify(withRequired))
            } catch { }
          }}
          columns={weekOffMasterColumns}
          selectedKeys={selectedWeekOffMasterColumnKeys}
          requiredKeys={requiredWeekOffMasterColumnKeys}
          title="Customize Week Off Master Table Columns"
        />
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Week Off Master"
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
            </div>
          </div>
        </Modal>
      </div>
    </>
  )
}

export default WeekOffMasterMaster


