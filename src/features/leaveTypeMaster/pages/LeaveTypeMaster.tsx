import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  LeaveTypeMasterData,
  FilterWithPaginationLeaveTypeMasterRequest
} from '@/features/leaveTypeMaster/models/LeaveTypeMasterModel';

import { LeaveTypeMasterService } from '@/features/leaveTypeMaster/services/LeaveTypeMasterService'
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


export const LeaveTypeMaster: React.FC = () => {

  const [leaveTypeMasterList, setLeaveTypeMasterList] = useState<LeaveTypeMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { toasts, removeToast, addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchLeaveTypes(value)
  }, 350)
  const [viewLeaveTypeMasterDetailsData, setViewLeaveTypeMasterDetailsData] = useState<LeaveTypeMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});
  const [isShowCustomizeLeaveTypeMasterColumnsModal, setIsShowCustomizeLeaveTypeMasterColumnsModal] = useState(false);
  const { canExport } = useMenuPermissions();
  const hasFetchedInitialLeaveTypes = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialLeaveTypes.current) return
    hasFetchedInitialLeaveTypes.current = true;
    fetchLeaveTypeList()
  }, [])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  const fetchLeaveTypeList = async (page: number = pagination.currentPage) => {
    return await loadLeaveTypes(page, filters);
  }

  const loadLeaveTypes = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;
        if (sortInfo) {
          const column = leaveTypeMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationLeaveTypeMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          LeaveTypeMasterId: filterParams.LeaveTypeMasterId ? Number(filterParams.LeaveTypeMasterId) : undefined,
          LeaveType: filterParams.LeaveType?.trim() || undefined,
          SortBy: sortByParam
        }
        const response = await getLeaveTypes(params);
        if (E.isRight(response)) {
          setLeaveTypeMasterList(response.right.Data);
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
      'Loading Leave Type Data...'
    )
  }

  const searchLeaveTypes = async (searchValue: string) => {
    setSearchTerm(searchValue);
    if (searchValue.trim() === '') {
      fetchLeaveTypeList();
      return
    }
    const filterParams: FilterInfo = {
      LeaveType: searchValue.trim(),
    };
    await loadLeaveTypes(1, filterParams)
  }

  const clearsearchLeaveTypes = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchLeaveTypeList();
  }

  const handleExportLeaveTypes = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined
        if (sortInfo) {
          const column = leaveTypeMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationLeaveTypeMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          LeaveType: filters.LeaveType?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }
        const response = await getLeaveTypes(params);
        handleExportFile(response, exportType, 'Leave Type Master', addToast)
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

  const handleExportLeaveTypeExcel = () => handleExportLeaveTypes('Excel')
  const handleExportLeaveTypePdf = () => handleExportLeaveTypes('PDF')

  const getLeaveTypes = async (filterParams: FilterWithPaginationLeaveTypeMasterRequest) => {
    return await LeaveTypeMasterService.apiCallPullLeaveTypeMaster(filterParams);
  }

  const handlePageChange = (page: number) => {
    fetchLeaveTypeList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {
    setSortInfo(sortInfo);
    fetchLeaveTypeList(1);
  }

  const leaveTypeMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const leaveTypeListForTable = useMemo(() => leaveTypeMasterList, [leaveTypeMasterList]);

  const handleViewLeaveTypeDetails = useCallback((row: LeaveTypeMasterData) => {
    setViewLeaveTypeMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  const leaveTypeMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'LeaveType',
        label: 'Leave Type',
        width: '25',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className="flex items-center justify-start">
            <TooltipText
              text={value || 'N/A'}
              maxWidth="250px"
              tooltipThreshold={25}
              onClick={() => handleViewLeaveTypeDetails(row)}
            />
          </div>
        )
      },
      {
        key: 'LeaveTypeCode',
        label: 'Leave Type Code',
        width: '18',
        sortable: false,
        align: 'center',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="180px"
            tooltipThreshold={18}
            tooltipClassName='inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap'
          />
        )
      },
      {
        key: 'IsCarryForward',
        label: 'Carry Forward',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {value ? 'Yes' : 'No'}
          </span>
        )
      },
      {
        key: 'MaxCarryForward',
        label: 'Max Carry Forward',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {value || 0}
          </span>
        )
      },
      {
        key: 'IsEncashable',
        label: 'Encashable',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {value ? 'Yes' : 'No'}
          </span>
        )
      },
      {
        key: 'CreatedBy',
        label: 'Last Modified By',
        width: '15',
        sortable: true,
        align: 'center',
        render: (value) => value || 'N/A'
      },
      {
        key: 'CreatedDate',
        label: 'Last Modified Date',
        width: '15',
        sortable: true,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      }
    ],
    [handleViewLeaveTypeDetails]
  )

  const requiredLeaveTypeMasterColumnKeys: string[] = ['LeaveType'];
  const allLeaveTypeMasterColumnKeys: string[] = leaveTypeMasterColumns.map(c => c.key)
  const [selectedLeaveTypeMasterColumnKeys, setSelectedLeaveTypeMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getLeaveTypeMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredLeaveTypeMasterColumnKeys]));
        return withRequired.filter(k => allLeaveTypeMasterColumnKeys.includes(k));
      }
    } catch { }
    return allLeaveTypeMasterColumnKeys
  })

  useEffect(() => {
    setSelectedLeaveTypeMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredLeaveTypeMasterColumnKeys])).filter(k => allLeaveTypeMasterColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaveTypeMasterColumns.length])

  const visibleLeaveTypeMasterColumns = useMemo(
    () => leaveTypeMasterColumns.filter(col => selectedLeaveTypeMasterColumnKeys.includes(col.key)),
    [leaveTypeMasterColumns, selectedLeaveTypeMasterColumnKeys]
  )

  interface ViewLeaveTypeDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: LeaveTypeMasterData | null
  }

  const ViewLeaveTypeDetailsModal: React.FC<ViewLeaveTypeDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings - Company setup (Leave Type Details)"
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
              <span className="text-sm font-medium text-gray-700">Leave Type</span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.LeaveType || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Leave Type Code</span>
              <span className="text-sm text-blue-600 font-medium">{data.LeaveTypeCode || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Carry Forward</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${data.IsCarryForward ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {data.IsCarryForward ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Max Carry Forward</span>
              <span className="text-sm text-blue-600 font-medium">{data.MaxCarryForward || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Encashable</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${data.IsEncashable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {data.IsEncashable ? 'Yes' : 'No'}
              </span>
            </div>
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
    loadLeaveTypes(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadLeaveTypes(1, {})
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
          searchPlaceholder="Search by leave type..."
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchLeaveTypes}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeLeaveTypeMasterColumnsModal(true)}
          isShowAddButton={false}
          isShowImportButton={false}
          isShowExportButton={canExport}
          onExportExcel={handleExportLeaveTypeExcel}
          onExportPdf={handleExportLeaveTypePdf}
          exportLoading={isLoading}
        />
        <DataTable
          data={leaveTypeListForTable}
          columns={visibleLeaveTypeMasterColumns}
          pagination={leaveTypeMasterPaginationInfo}
          emptyMessage="No leave types found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />
        <ViewLeaveTypeDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewLeaveTypeMasterDetailsData(null)
          }}
          data={viewLeaveTypeMasterDetailsData}
        />
        <CustomizeColumnsModal
          isOpen={isShowCustomizeLeaveTypeMasterColumnsModal}
          onClose={() => setIsShowCustomizeLeaveTypeMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(new Set([...keys, ...requiredLeaveTypeMasterColumnKeys]))
            setSelectedLeaveTypeMasterColumnKeys(withRequired)
            try {
              LocalStorageHelper.storeLeaveTypeMasterTableColumns(JSON.stringify(withRequired))
            } catch { }
          }}
          columns={leaveTypeMasterColumns}
          selectedKeys={selectedLeaveTypeMasterColumnKeys}
          requiredKeys={requiredLeaveTypeMasterColumnKeys}
          title="Customize Leave Type Master Table Columns"
        />
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Leave Type Master"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <Input
                  type="text"
                  value={tempFilters.LeaveType || ''}
                  onChange={(e) => handleFilterChange('LeaveType', e.target.value)}
                  placeholder="Enter leave type"
                />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </>
  )
}

export default LeaveTypeMaster


