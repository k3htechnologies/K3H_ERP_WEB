import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  HolidayMasterData,
  FilterWithPaginationHolidayMasterRequest
} from '@/features/holidayMaster/models/HolidayMasterModel';

import { HolidayMasterService } from '@/features/holidayMaster/services/HolidayMasterService'
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


export const HolidayMaster: React.FC = () => {

  const [holidayMasterList, setHolidayMasterList] = useState<HolidayMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { toasts, removeToast, addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchHolidays(value)
  }, 350)
  const [viewHolidayMasterDetailsData, setViewHolidayMasterDetailsData] = useState<HolidayMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});
  const [isShowCustomizeHolidayMasterColumnsModal, setIsShowCustomizeHolidayMasterColumnsModal] = useState(false);
  const { canExport } = useMenuPermissions();
  const hasFetchedInitialHolidays = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialHolidays.current) return
    hasFetchedInitialHolidays.current = true;
    fetchHolidayList()
  }, [])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  const fetchHolidayList = async (page: number = pagination.currentPage) => {
    return await loadHolidays(page, filters);
  }

  const loadHolidays = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;
        if (sortInfo) {
          const column = holidayMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationHolidayMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          HolidayMasterId: filterParams.HolidayMasterId ? Number(filterParams.HolidayMasterId) : undefined,
          HolidayName: filterParams.HolidayName?.trim() || undefined,
          SortBy: sortByParam
        }
        const response = await getHolidays(params);
        if (E.isRight(response)) {
          setHolidayMasterList(response.right.Data);
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
      'Loading Holiday Data...'
    )
  }

  const searchHolidays = async (searchValue: string) => {
    setSearchTerm(searchValue);
    if (searchValue.trim() === '') {
      fetchHolidayList();
      return
    }
    const filterParams: FilterInfo = {
      HolidayName: searchValue.trim(),
    };
    await loadHolidays(1, filterParams)
  }

  const clearsearchHolidays = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchHolidayList();
  }

  const handleExportHolidays = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined
        if (sortInfo) {
          const column = holidayMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationHolidayMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          HolidayName: filters.HolidayName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }
        const response = await getHolidays(params);
        handleExportFile(response, exportType, 'Holiday Master', addToast)
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

  const handleExportHolidayExcel = () => handleExportHolidays('Excel')
  const handleExportHolidayPdf = () => handleExportHolidays('PDF')

  const getHolidays = async (filterParams: FilterWithPaginationHolidayMasterRequest) => {
    return await HolidayMasterService.apiCallPullHolidayMaster(filterParams);
  }

  const handlePageChange = (page: number) => {
    fetchHolidayList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {
    setSortInfo(sortInfo);
    fetchHolidayList(1);
  }

  const holidayMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const holidayListForTable = useMemo(() => holidayMasterList, [holidayMasterList]);

  const handleViewHolidayDetails = useCallback((row: HolidayMasterData) => {
    setViewHolidayMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  const holidayMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'HolidayName',
        label: 'Holiday Name',
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
              onClick={() => handleViewHolidayDetails(row)}
            />
          </div>
        )
      },
      {
        key: 'CreatedBy',
        label: 'Last Modified By',
        width: '25',
        sortable: true,
        align: 'center',
        render: (value) => value || 'N/A'
      },
      {
        key: 'CreatedDate',
        label: 'Last Modified Date',
        width: '25',
        sortable: true,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      }
    ],
    [handleViewHolidayDetails]
  )

  const requiredHolidayMasterColumnKeys: string[] = ['HolidayName'];
  const allHolidayMasterColumnKeys: string[] = holidayMasterColumns.map(c => c.key)
  const [selectedHolidayMasterColumnKeys, setSelectedHolidayMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getHolidayMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredHolidayMasterColumnKeys]));
        return withRequired.filter(k => allHolidayMasterColumnKeys.includes(k));
      }
    } catch { }
    return allHolidayMasterColumnKeys
  })

  useEffect(() => {
    setSelectedHolidayMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredHolidayMasterColumnKeys])).filter(k => allHolidayMasterColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holidayMasterColumns.length])

  const visibleHolidayMasterColumns = useMemo(
    () => holidayMasterColumns.filter(col => selectedHolidayMasterColumnKeys.includes(col.key)),
    [holidayMasterColumns, selectedHolidayMasterColumnKeys]
  )

  interface ViewHolidayDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: HolidayMasterData | null
  }

  const ViewHolidayDetailsModal: React.FC<ViewHolidayDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings - Company setup (Holiday Details)"
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
            {data.HolidayURL && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Holiday Document</span>
                <a href={data.HolidayURL} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 font-medium hover:underline">
                  View Document
                </a>
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
    loadHolidays(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadHolidays(1, {})
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
          onClearSearch={clearsearchHolidays}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeHolidayMasterColumnsModal(true)}
          isShowAddButton={false}
          isShowImportButton={false}
          isShowExportButton={canExport}
          onExportExcel={handleExportHolidayExcel}
          onExportPdf={handleExportHolidayPdf}
          exportLoading={isLoading}
        />
        <DataTable
          data={holidayListForTable}
          columns={visibleHolidayMasterColumns}
          pagination={holidayMasterPaginationInfo}
          emptyMessage="No holidays found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />
        <ViewHolidayDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewHolidayMasterDetailsData(null)
          }}
          data={viewHolidayMasterDetailsData}
        />
        <CustomizeColumnsModal
          isOpen={isShowCustomizeHolidayMasterColumnsModal}
          onClose={() => setIsShowCustomizeHolidayMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(new Set([...keys, ...requiredHolidayMasterColumnKeys]))
            setSelectedHolidayMasterColumnKeys(withRequired)
            try {
              LocalStorageHelper.storeHolidayMasterTableColumns(JSON.stringify(withRequired))
            } catch { }
          }}
          columns={holidayMasterColumns}
          selectedKeys={selectedHolidayMasterColumnKeys}
          requiredKeys={requiredHolidayMasterColumnKeys}
          title="Customize Holiday Master Table Columns"
        />
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Holiday Master"
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
            </div>
          </div>
        </Modal>
      </div>
    </>
  )
}

export default HolidayMaster


