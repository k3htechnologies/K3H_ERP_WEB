import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  HolidayMappingMasterData,
  FilterWithPaginationHolidayMappingMasterRequest
} from '@/features/holidayMappingMaster/models/HolidayMappingMasterModel';

import { HolidayMappingMasterService } from '@/features/holidayMappingMaster/services/HolidayMappingMasterService'
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


export const HolidayMappingMaster: React.FC = () => {

  const [holidayMappingMasterList, setHolidayMappingMasterList] = useState<HolidayMappingMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { toasts, removeToast, addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchHolidayMappings(value)
  }, 350)
  const [viewHolidayMappingMasterDetailsData, setViewHolidayMappingMasterDetailsData] = useState<HolidayMappingMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});
  const [isShowCustomizeHolidayMappingMasterColumnsModal, setIsShowCustomizeHolidayMappingMasterColumnsModal] = useState(false);
  const { canExport } = useMenuPermissions();
  const hasFetchedInitialHolidayMappings = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialHolidayMappings.current) return
    hasFetchedInitialHolidayMappings.current = true;
    fetchHolidayMappingList()
  }, [])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  const fetchHolidayMappingList = async (page: number = pagination.currentPage) => {
    return await loadHolidayMappings(page, filters);
  }

  const loadHolidayMappings = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;
        if (sortInfo) {
          const column = holidayMappingMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationHolidayMappingMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          HolidayMappingMasterId: filterParams.HolidayMappingMasterId ? Number(filterParams.HolidayMappingMasterId) : undefined,
          BranchName: filterParams.BranchName?.trim() || undefined,
          HolidayName: filterParams.HolidayName?.trim() || undefined,
          FromHolidayDate: filterParams.FromHolidayDate?.trim() || undefined,
          ToHolidayDate: filterParams.ToHolidayDate?.trim() || undefined,
          SortBy: sortByParam
        }
        const response = await getHolidayMappings(params);
        if (E.isRight(response)) {
          setHolidayMappingMasterList(response.right.Data);
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
      'Loading Holiday Mapping Data...'
    )
  }

  const searchHolidayMappings = async (searchValue: string) => {
    setSearchTerm(searchValue);
    if (searchValue.trim() === '') {
      fetchHolidayMappingList();
      return
    }
    const filterParams: FilterInfo = {
      HolidayName: searchValue.trim(),
    };
    await loadHolidayMappings(1, filterParams)
  }

  const clearsearchHolidayMappings = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchHolidayMappingList();
  }

  const handleExportHolidayMappings = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined
        if (sortInfo) {
          const column = holidayMappingMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationHolidayMappingMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          BranchName: filters.BranchName?.trim() || undefined,
          HolidayName: filters.HolidayName?.trim() || undefined,
          FromHolidayDate: filters.FromHolidayDate?.trim() || undefined,
          ToHolidayDate: filters.ToHolidayDate?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }
        const response = await getHolidayMappings(params);
        handleExportFile(response, exportType, 'Holiday Mapping Master', addToast)
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

  const handleExportHolidayMappingExcel = () => handleExportHolidayMappings('Excel')
  const handleExportHolidayMappingPdf = () => handleExportHolidayMappings('PDF')

  const getHolidayMappings = async (filterParams: FilterWithPaginationHolidayMappingMasterRequest) => {
    return await HolidayMappingMasterService.apiCallPullHolidayMappingMaster(filterParams);
  }

  const handlePageChange = (page: number) => {
    fetchHolidayMappingList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {
    setSortInfo(sortInfo);
    fetchHolidayMappingList(1);
  }

  const holidayMappingMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const holidayMappingListForTable = useMemo(() => holidayMappingMasterList, [holidayMappingMasterList]);

  const handleViewHolidayMappingDetails = useCallback((row: HolidayMappingMasterData) => {
    setViewHolidayMappingMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  const holidayMappingMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'HolidayName',
        label: 'Holiday Name',
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
              onClick={() => handleViewHolidayMappingDetails(row)}
            />
          </div>
        )
      },
      {
        key: 'BranchName',
        label: 'Branch Name',
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
        key: 'HolidayDate',
        label: 'Holiday Date',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : 'N/A'
      },
      {
        key: 'CreatedBy',
        label: 'Last Modified By',
        width: '20',
        sortable: true,
        align: 'center',
        render: (value) => value || 'N/A'
      },
      {
        key: 'CreatedDate',
        label: 'Last Modified Date',
        width: '20',
        sortable: true,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      }
    ],
    [handleViewHolidayMappingDetails]
  )

  const requiredHolidayMappingMasterColumnKeys: string[] = ['HolidayName'];
  const allHolidayMappingMasterColumnKeys: string[] = holidayMappingMasterColumns.map(c => c.key)
  const [selectedHolidayMappingMasterColumnKeys, setSelectedHolidayMappingMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getHolidayMappingMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredHolidayMappingMasterColumnKeys]));
        return withRequired.filter(k => allHolidayMappingMasterColumnKeys.includes(k));
      }
    } catch { }
    return allHolidayMappingMasterColumnKeys
  })

  useEffect(() => {
    setSelectedHolidayMappingMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredHolidayMappingMasterColumnKeys])).filter(k => allHolidayMappingMasterColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holidayMappingMasterColumns.length])

  const visibleHolidayMappingMasterColumns = useMemo(
    () => holidayMappingMasterColumns.filter(col => selectedHolidayMappingMasterColumnKeys.includes(col.key)),
    [holidayMappingMasterColumns, selectedHolidayMappingMasterColumnKeys]
  )

  interface ViewHolidayMappingDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: HolidayMappingMasterData | null
  }

  const ViewHolidayMappingDetailsModal: React.FC<ViewHolidayMappingDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings - Company setup (Holiday Mapping Details)"
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
              <span className="text-sm font-medium text-gray-700">Holiday Name</span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.HolidayName || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Branch Name</span>
              <span className="text-sm text-blue-600 font-medium">{data.BranchName || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Holiday Date</span>
              <span className="text-sm text-blue-600 font-medium">
                {data.HolidayDate ? formatDate_dd_MonthName_yy(data.HolidayDate) : 'N/A'}
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
    loadHolidayMappings(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadHolidayMappings(1, {})
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
          searchPlaceholder="Search by holiday name..."
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchHolidayMappings}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeHolidayMappingMasterColumnsModal(true)}
          isShowAddButton={false}
          isShowImportButton={false}
          isShowExportButton={canExport}
          onExportExcel={handleExportHolidayMappingExcel}
          onExportPdf={handleExportHolidayMappingPdf}
          exportLoading={isLoading}
        />
        <DataTable
          data={holidayMappingListForTable}
          columns={visibleHolidayMappingMasterColumns}
          pagination={holidayMappingMasterPaginationInfo}
          emptyMessage="No holiday mappings found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />
        <ViewHolidayMappingDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewHolidayMappingMasterDetailsData(null)
          }}
          data={viewHolidayMappingMasterDetailsData}
        />
        <CustomizeColumnsModal
          isOpen={isShowCustomizeHolidayMappingMasterColumnsModal}
          onClose={() => setIsShowCustomizeHolidayMappingMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(new Set([...keys, ...requiredHolidayMappingMasterColumnKeys]))
            setSelectedHolidayMappingMasterColumnKeys(withRequired)
            try {
              LocalStorageHelper.storeHolidayMappingMasterTableColumns(JSON.stringify(withRequired))
            } catch { }
          }}
          columns={holidayMappingMasterColumns}
          selectedKeys={selectedHolidayMappingMasterColumnKeys}
          requiredKeys={requiredHolidayMappingMasterColumnKeys}
          title="Customize Holiday Mapping Master Table Columns"
        />
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Holiday Mapping Master"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Name</label>
                <Input
                  type="text"
                  value={tempFilters.HolidayName || ''}
                  onChange={(e) => handleFilterChange('HolidayName', e.target.value)}
                  placeholder="Enter holiday name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                <Input
                  type="text"
                  value={tempFilters.BranchName || ''}
                  onChange={(e) => handleFilterChange('BranchName', e.target.value)}
                  placeholder="Enter branch name"
                />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </>
  )
}

export default HolidayMappingMaster


