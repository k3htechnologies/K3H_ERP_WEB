import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  ShiftMappingMasterData,
  FilterWithPaginationShiftMappingMasterRequest
} from '@/features/shiftMappingMaster/models/ShiftMappingMasterModel';

import { ShiftMappingMasterService } from '@/features/shiftMappingMaster/services/ShiftMappingMasterService'
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


export const ShiftMappingMaster: React.FC = () => {

  const [shiftMappingMasterList, setShiftMappingMasterList] = useState<ShiftMappingMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { toasts, removeToast, addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchShiftMappings(value)
  }, 350)
  const [viewShiftMappingMasterDetailsData, setViewShiftMappingMasterDetailsData] = useState<ShiftMappingMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});
  const [isShowCustomizeShiftMappingMasterColumnsModal, setIsShowCustomizeShiftMappingMasterColumnsModal] = useState(false);
  const { canExport } = useMenuPermissions();
  const hasFetchedInitialShiftMappings = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialShiftMappings.current) return
    hasFetchedInitialShiftMappings.current = true;
    fetchShiftMappingList()
  }, [])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  const fetchShiftMappingList = async (page: number = pagination.currentPage) => {
    return await loadShiftMappings(page, filters);
  }

  const loadShiftMappings = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;
        if (sortInfo) {
          const column = shiftMappingMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationShiftMappingMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          ShiftManagementMasterMappingId: filterParams.ShiftManagementMasterMappingId ? Number(filterParams.ShiftManagementMasterMappingId) : undefined,
          ShiftName: filterParams.ShiftName?.trim() || undefined,
          DepartmentName: filterParams.DepartmentName?.trim() || undefined,
          EmployeeName: filterParams.EmployeeName?.trim() || undefined,
          SortBy: sortByParam
        }
        const response = await getShiftMappings(params);
        if (E.isRight(response)) {
          setShiftMappingMasterList(response.right.Data);
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
      'Loading Shift Mapping Data...'
    )
  }

  const searchShiftMappings = async (searchValue: string) => {
    setSearchTerm(searchValue);
    if (searchValue.trim() === '') {
      fetchShiftMappingList();
      return
    }
    const filterParams: FilterInfo = {
      ShiftName: searchValue.trim(),
    };
    await loadShiftMappings(1, filterParams)
  }

  const clearsearchShiftMappings = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchShiftMappingList();
  }

  const handleExportShiftMappings = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined
        if (sortInfo) {
          const column = shiftMappingMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationShiftMappingMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          ShiftName: filters.ShiftName?.trim() || undefined,
          DepartmentName: filters.DepartmentName?.trim() || undefined,
          EmployeeName: filters.EmployeeName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }
        const response = await getShiftMappings(params);
        handleExportFile(response, exportType, 'Shift Mapping Master', addToast)
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

  const handleExportShiftMappingExcel = () => handleExportShiftMappings('Excel')
  const handleExportShiftMappingPdf = () => handleExportShiftMappings('PDF')

  const getShiftMappings = async (filterParams: FilterWithPaginationShiftMappingMasterRequest) => {
    return await ShiftMappingMasterService.apiCallPullShiftMappingMaster(filterParams);
  }

  const handlePageChange = (page: number) => {
    fetchShiftMappingList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {
    setSortInfo(sortInfo);
    fetchShiftMappingList(1);
  }

  const shiftMappingMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const shiftMappingListForTable = useMemo(() => shiftMappingMasterList, [shiftMappingMasterList]);

  const handleViewShiftMappingDetails = useCallback((row: ShiftMappingMasterData) => {
    setViewShiftMappingMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  const shiftMappingMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'ShiftName',
        label: 'Shift Name',
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
              onClick={() => handleViewShiftMappingDetails(row)}
            />
          </div>
        )
      },
      {
        key: 'DepartmentName',
        label: 'Department Name',
        width: '20',
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
        width: '20',
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
        key: 'ShiftCode',
        label: 'Shift Code',
        width: '12',
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
    [handleViewShiftMappingDetails]
  )

  const requiredShiftMappingMasterColumnKeys: string[] = ['ShiftName'];
  const allShiftMappingMasterColumnKeys: string[] = shiftMappingMasterColumns.map(c => c.key)
  const [selectedShiftMappingMasterColumnKeys, setSelectedShiftMappingMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getShiftMappingMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredShiftMappingMasterColumnKeys]));
        return withRequired.filter(k => allShiftMappingMasterColumnKeys.includes(k));
      }
    } catch { }
    return allShiftMappingMasterColumnKeys
  })

  useEffect(() => {
    setSelectedShiftMappingMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredShiftMappingMasterColumnKeys])).filter(k => allShiftMappingMasterColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shiftMappingMasterColumns.length])

  const visibleShiftMappingMasterColumns = useMemo(
    () => shiftMappingMasterColumns.filter(col => selectedShiftMappingMasterColumnKeys.includes(col.key)),
    [shiftMappingMasterColumns, selectedShiftMappingMasterColumnKeys]
  )

  interface ViewShiftMappingDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: ShiftMappingMasterData | null
  }

  const ViewShiftMappingDetailsModal: React.FC<ViewShiftMappingDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings - Company setup (Shift Mapping Details)"
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
    loadShiftMappings(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadShiftMappings(1, {})
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
          onClearSearch={clearsearchShiftMappings}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeShiftMappingMasterColumnsModal(true)}
          isShowAddButton={false}
          isShowImportButton={false}
          isShowExportButton={canExport}
          onExportExcel={handleExportShiftMappingExcel}
          onExportPdf={handleExportShiftMappingPdf}
          exportLoading={isLoading}
        />
        <DataTable
          data={shiftMappingListForTable}
          columns={visibleShiftMappingMasterColumns}
          pagination={shiftMappingMasterPaginationInfo}
          emptyMessage="No shift mappings found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />
        <ViewShiftMappingDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewShiftMappingMasterDetailsData(null)
          }}
          data={viewShiftMappingMasterDetailsData}
        />
        <CustomizeColumnsModal
          isOpen={isShowCustomizeShiftMappingMasterColumnsModal}
          onClose={() => setIsShowCustomizeShiftMappingMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(new Set([...keys, ...requiredShiftMappingMasterColumnKeys]))
            setSelectedShiftMappingMasterColumnKeys(withRequired)
            try {
              LocalStorageHelper.storeShiftMappingMasterTableColumns(JSON.stringify(withRequired))
            } catch { }
          }}
          columns={shiftMappingMasterColumns}
          selectedKeys={selectedShiftMappingMasterColumnKeys}
          requiredKeys={requiredShiftMappingMasterColumnKeys}
          title="Customize Shift Mapping Master Table Columns"
        />
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Shift Mapping Master"
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

export default ShiftMappingMaster


