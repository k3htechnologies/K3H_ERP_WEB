import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  ShiftMasterData,
  FilterWithPaginationShiftMasterRequest
} from '@/features/shiftMaster/models/ShiftMasterModel';

import { ShiftMasterService } from '@/features/shiftMaster/services/ShiftMasterService'
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


export const ShiftMaster: React.FC = () => {

  const [shiftMasterList, setShiftMasterList] = useState<ShiftMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { toasts, removeToast, addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchShifts(value)
  }, 350)
  const [viewShiftMasterDetailsData, setViewShiftMasterDetailsData] = useState<ShiftMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});
  const [isShowCustomizeShiftMasterColumnsModal, setIsShowCustomizeShiftMasterColumnsModal] = useState(false);
  const { canExport } = useMenuPermissions();
  const hasFetchedInitialShifts = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialShifts.current) return
    hasFetchedInitialShifts.current = true;
    fetchShiftList()
  }, [])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  const fetchShiftList = async (page: number = pagination.currentPage) => {
    return await loadShifts(page, filters);
  }

  const loadShifts = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;
        if (sortInfo) {
          const column = shiftMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationShiftMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          ShiftManagementMasterId: filterParams.ShiftManagementMasterId ? Number(filterParams.ShiftManagementMasterId) : undefined,
          ShiftName: filterParams.ShiftName?.trim() || undefined,
          SortBy: sortByParam
        }
        const response = await getShifts(params);
        if (E.isRight(response)) {
          setShiftMasterList(response.right.Data);
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
      'Loading Shift Data...'
    )
  }

  const searchShifts = async (searchValue: string) => {
    setSearchTerm(searchValue);
    if (searchValue.trim() === '') {
      fetchShiftList();
      return
    }
    const filterParams: FilterInfo = {
      ShiftName: searchValue.trim(),
    };
    await loadShifts(1, filterParams)
  }

  const clearsearchShifts = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchShiftList();
  }

  const handleExportShifts = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined
        if (sortInfo) {
          const column = shiftMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationShiftMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          ShiftName: filters.ShiftName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }
        const response = await getShifts(params);
        handleExportFile(response, exportType, 'Shift Master', addToast)
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

  const handleExportShiftExcel = () => handleExportShifts('Excel')
  const handleExportShiftPdf = () => handleExportShifts('PDF')

  const getShifts = async (filterParams: FilterWithPaginationShiftMasterRequest) => {
    return await ShiftMasterService.apiCallPullShiftMaster(filterParams);
  }

  const handlePageChange = (page: number) => {
    fetchShiftList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {
    setSortInfo(sortInfo);
    fetchShiftList(1);
  }

  const shiftMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const shiftListForTable = useMemo(() => shiftMasterList, [shiftMasterList]);

  const handleViewShiftDetails = useCallback((row: ShiftMasterData) => {
    setViewShiftMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  const shiftMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'ShiftName',
        label: 'Shift Name',
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
              onClick={() => handleViewShiftDetails(row)}
            />
          </div>
        )
      },
      {
        key: 'ShiftCode',
        label: 'Shift Code',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="150px"
            tooltipThreshold={15}
            tooltipClassName='inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap'
          />
        )
      },
      {
        key: 'ShiftBeginTime',
        label: 'Start Time',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => value || 'N/A'
      },
      {
        key: 'ShiftEndTime',
        label: 'End Time',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => value || 'N/A'
      },
      {
        key: 'ShiftDurationTime',
        label: 'Duration',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => value || 'N/A'
      },
      {
        key: 'CreatedBy',
        label: 'Last Modified By',
        width: '12',
        sortable: true,
        align: 'center',
        render: (value) => value || 'N/A'
      },
      {
        key: 'CreatedDate',
        label: 'Last Modified Date',
        width: '12',
        sortable: true,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      }
    ],
    [handleViewShiftDetails]
  )

  const requiredShiftMasterColumnKeys: string[] = ['ShiftName'];
  const allShiftMasterColumnKeys: string[] = shiftMasterColumns.map(c => c.key)
  const [selectedShiftMasterColumnKeys, setSelectedShiftMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getShiftMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredShiftMasterColumnKeys]));
        return withRequired.filter(k => allShiftMasterColumnKeys.includes(k));
      }
    } catch { }
    return allShiftMasterColumnKeys
  })

  useEffect(() => {
    setSelectedShiftMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredShiftMasterColumnKeys])).filter(k => allShiftMasterColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shiftMasterColumns.length])

  const visibleShiftMasterColumns = useMemo(
    () => shiftMasterColumns.filter(col => selectedShiftMasterColumnKeys.includes(col.key)),
    [shiftMasterColumns, selectedShiftMasterColumnKeys]
  )

  interface ViewShiftDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: ShiftMasterData | null
  }

  const ViewShiftDetailsModal: React.FC<ViewShiftDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings - Company setup (Shift Details)"
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
              <span className="text-sm font-medium text-gray-700">Shift Code</span>
              <span className="text-sm text-blue-600 font-medium">{data.ShiftCode || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Shift Name</span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.ShiftName || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Start Time</span>
              <span className="text-sm text-blue-600 font-medium">{data.ShiftBeginTime || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">End Time</span>
              <span className="text-sm text-blue-600 font-medium">{data.ShiftEndTime || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Duration</span>
              <span className="text-sm text-blue-600 font-medium">{data.ShiftDurationTime || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Work Duration</span>
              <span className="text-sm text-blue-600 font-medium">{data.ShiftWorkDurationTime || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Break Duration</span>
              <span className="text-sm text-blue-600 font-medium">{data.BreakDurationTime || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Grace Time</span>
              <span className="text-sm text-blue-600 font-medium">{data.GraceTime || 'N/A'}</span>
            </div>
            {data.Remarks && (
              <div className="flex justify-between items-start py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Remarks</span>
                <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                  {data.Remarks}
                </span>
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
    loadShifts(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadShifts(1, {})
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
          searchPlaceholder="Search by shift name..."
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchShifts}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeShiftMasterColumnsModal(true)}
          isShowAddButton={false}
          isShowImportButton={false}
          isShowExportButton={canExport}
          onExportExcel={handleExportShiftExcel}
          onExportPdf={handleExportShiftPdf}
          exportLoading={isLoading}
        />
        <DataTable
          data={shiftListForTable}
          columns={visibleShiftMasterColumns}
          pagination={shiftMasterPaginationInfo}
          emptyMessage="No shifts found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />
        <ViewShiftDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewShiftMasterDetailsData(null)
          }}
          data={viewShiftMasterDetailsData}
        />
        <CustomizeColumnsModal
          isOpen={isShowCustomizeShiftMasterColumnsModal}
          onClose={() => setIsShowCustomizeShiftMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(new Set([...keys, ...requiredShiftMasterColumnKeys]))
            setSelectedShiftMasterColumnKeys(withRequired)
            try {
              LocalStorageHelper.storeShiftMasterTableColumns(JSON.stringify(withRequired))
            } catch { }
          }}
          columns={shiftMasterColumns}
          selectedKeys={selectedShiftMasterColumnKeys}
          requiredKeys={requiredShiftMasterColumnKeys}
          title="Customize Shift Master Table Columns"
        />
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Shift Master"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift Name</label>
                <Input
                  type="text"
                  value={tempFilters.ShiftName || ''}
                  onChange={(e) => handleFilterChange('ShiftName', e.target.value)}
                  placeholder="Enter shift name"
                />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </>
  )
}

export default ShiftMaster

