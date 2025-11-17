import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  BranchAssociationsMasterData,
  FilterWithPaginationBranchAssociationsMasterRequest
} from '@/features/branchAssociationsMaster/models/BranchAssociationsMasterModel';

import { branchAssociationsService } from '@/features/branchAssociationsMaster/services/BranchAssociationsMasterService'
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


export const BranchAssociationsMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [branchAssociationsMasterList, setBranchAssociationsMasterList] = useState<BranchAssociationsMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const { toasts, removeToast, addToast } = useToast()

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchBranchAssociations(value)
  }, 350)

  //VIEW BRANCH ASSOCIATIONS MASTER MODAL STATES
  const [viewBranchAssociationsMasterDetailsData, setViewBranchAssociationsMasterDetailsData] = useState<BranchAssociationsMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeBranchAssociationsMasterColumnsModal, setIsShowCustomizeBranchAssociationsMasterColumnsModal] = useState(false);


  //#endregion

  //#region MENU PERMISSIONS
  const { canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  const hasFetchedInitialBranchAssociations = useRef(false)

  useEffect(() => {

    if (hasFetchedInitialBranchAssociations.current) return

    hasFetchedInitialBranchAssociations.current = true;

    fetchBranchAssociationsList()
  }, [])


  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion


  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchBranchAssociationsList = async (page: number = pagination.currentPage) => {
    return await loadBranchAssociations(page, filters);
  }

  const loadBranchAssociations = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        let sortByParam = undefined;

        if (sortInfo) {

          const column = branchAssociationsMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }

        }

        const params: FilterWithPaginationBranchAssociationsMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          BranchAssociationsId: filterParams.BranchAssociationsId ? Number(filterParams.BranchAssociationsId) : undefined,
          EmployeeName: filterParams.EmployeeName?.trim() || undefined,
          BranchMasterId: filterParams.BranchMasterId?.trim() || undefined,
          SortBy: sortByParam
        }

        const response = await getBranchAssociations(params);

        if (E.isRight(response)) {

          setBranchAssociationsMasterList(response.right.Data);

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
      'Loading Branch Associations Data...'
    )
  }

  // SEARCH BRANCH ASSOCIATIONS 
  const searchBranchAssociations = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchBranchAssociationsList();

      return
    }

    const filterParams: FilterInfo = {
      EmployeeName: searchValue.trim(),
    };

    await loadBranchAssociations(1, filterParams)

  }

  const clearsearchBranchAssociations = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchBranchAssociationsList();
  }
  // END SEARCH BRANCH ASSOCIATIONS 

  // EXPORT EXCEL | PDF
  const handleExportBranchAssociations = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined
        if (sortInfo) {
          const column = branchAssociationsMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationBranchAssociationsMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          EmployeeName: filters.EmployeeName?.trim() || undefined,
          BranchMasterId: filters.BranchMasterId?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }

        const response = await getBranchAssociations(params);

        handleExportFile(response, exportType, 'Branch Associations Master', addToast)

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

  const handleExportBranchAssociationsExcel = () => handleExportBranchAssociations('Excel')
  const handleExportBranchAssociationsPdf = () => handleExportBranchAssociations('PDF')

  //END EXPORT EXCEL | PDF

  //API | SERVICES CALL TO GET BRANCH ASSOCIATIONS 

  const getBranchAssociations = async (filterParams: FilterWithPaginationBranchAssociationsMasterRequest) => {

    return await branchAssociationsService.apiCallPullBranchAssociations(filterParams);
  }

  //END API | SERVICES CALL TO GET BRANCH ASSOCIATIONS

  //#endregion

  //#region TABLE CONFIGURATION

  const handlePageChange = (page: number) => {
    fetchBranchAssociationsList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchBranchAssociationsList(1);

  }

  const branchAssociationsMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const branchAssociationsListForTable = useMemo(() => branchAssociationsMasterList, [branchAssociationsMasterList]);


  // STABLE HANDLER VIEW
  const handleViewBranchAssociationsDetails = useCallback((row: BranchAssociationsMasterData) => {
    setViewBranchAssociationsMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  const branchAssociationsMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'EmployeeName',
        label: 'Employee Name',
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
              onClick={() => handleViewBranchAssociationsDetails(row)}
            />
          </div>
        )
      },
      {
        key: 'BranchName',
        label: 'Branch Name',
        width: '25',
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
    // dependencies: include everything used inside that might change
    [handleViewBranchAssociationsDetails]
  )

  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS

  const requiredBranchAssociationsMasterColumnKeys: string[] = ['EmployeeName'];

  const allBranchAssociationsMasterColumnKeys: string[] = branchAssociationsMasterColumns.map(c => c.key)

  const [selectedBranchAssociationsMasterColumnKeys, setSelectedBranchAssociationsMasterColumnKeys] = useState<string[]>(() => {

    try {

      const saved = LocalStorageHelper.getBranchAssociationsMasterTableColumns();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(new Set([...parsed, ...requiredBranchAssociationsMasterColumnKeys]));

        // Filter out any keys that no longer exist
        return withRequired.filter(k => allBranchAssociationsMasterColumnKeys.includes(k));

      }
    } catch { }
    return allBranchAssociationsMasterColumnKeys
  })

  useEffect(() => {
    // Guarantee required columns remain selected if state changes elsewhere

    setSelectedBranchAssociationsMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredBranchAssociationsMasterColumnKeys])).filter(k => allBranchAssociationsMasterColumnKeys.includes(k)));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchAssociationsMasterColumns.length])

  const visibleBranchAssociationsMasterColumns = useMemo(
    () => branchAssociationsMasterColumns.filter(col => selectedBranchAssociationsMasterColumnKeys.includes(col.key)),
    [branchAssociationsMasterColumns, selectedBranchAssociationsMasterColumnKeys]
  )

  //#endregion

  //#region VIEW BRANCH ASSOCIATIONS DETAILS MODAL COMPONENT

  interface ViewBranchAssociationsDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: BranchAssociationsMasterData | null
  }

  const ViewBranchAssociationsDetailsModal: React.FC<ViewBranchAssociationsDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings - Company setup (Branch Associations Details)"
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
        }}
        cancelText="Close"
        loading={false}
      >
        <div className="space-y-6">
          {/* Branch Associations Information */}
          <div className="space-y-4">

            {/* Employee Name */}
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Employee Name
              </span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.EmployeeName || 'N/A'}
              </span>
            </div>

            {/* Branch Name */}
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Branch Name
              </span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.BranchName || 'N/A'}
              </span>
            </div>


          </div>
          {/* Action Details Header */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Action Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Created By</span>
                  <span className="text-sm text-blue-600 font-medium">
                    {data.CreatedBy || 'N/A'}
                  </span>
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
                    <span className="text-sm text-blue-600 font-medium">
                      {data.ModifiedBy}
                    </span>
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


  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadBranchAssociations(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadBranchAssociations(1, {})
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
  //#endregion

  //#endregion
  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <div className="h-full flex flex-col">
        {/* ============================================================================
          COMMAN LOADER FOR PAGE
           ============================================================================ */}

        <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

        {/* ============================================================================
          COMBINED SEARCH BAR, FILTER IMPORT , EXPORT ROW
           ============================================================================ */}

        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder="Search by employee name..."
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchBranchAssociations}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeBranchAssociationsMasterColumnsModal(true)}
          isShowAddButton={false}
          isShowImportButton={false}
          isShowExportButton={canExport}
          onExportExcel={handleExportBranchAssociationsExcel}
          onExportPdf={handleExportBranchAssociationsPdf}
          exportLoading={isLoading}
        />


        {/* DATA TABLE BRANCH ASSOCIATIONS */}
        <DataTable
          data={branchAssociationsListForTable}
          columns={visibleBranchAssociationsMasterColumns}
          pagination={branchAssociationsMasterPaginationInfo}
          emptyMessage="No branch associations found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />

        {/* VIEW BRANCH ASSOCIATIONS MODAL */}
        <ViewBranchAssociationsDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewBranchAssociationsMasterDetailsData(null)
          }}
          data={viewBranchAssociationsMasterDetailsData}
        />

        {/* CUSTOMIZE COLUMNS MODAL */}


        <CustomizeColumnsModal
          isOpen={isShowCustomizeBranchAssociationsMasterColumnsModal}
          onClose={() => setIsShowCustomizeBranchAssociationsMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(
              new Set([...keys, ...requiredBranchAssociationsMasterColumnKeys]),
            )

            setSelectedBranchAssociationsMasterColumnKeys(withRequired)

            try {
              LocalStorageHelper.storeBranchAssociationsMasterTableColumns(
                JSON.stringify(withRequired),
              )
            } catch { }
          }}
          columns={branchAssociationsMasterColumns}
          selectedKeys={selectedBranchAssociationsMasterColumnKeys}
          requiredKeys={requiredBranchAssociationsMasterColumnKeys}
          title="Customize Branch Associations Master Table Columns"
        />

        {/* FILTER BRANCH ASSOCIATIONS MODAL */}
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Branch Associations Master"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Name
                </label>
                <Input
                  type="text"
                  value={tempFilters.EmployeeName || ''}
                  onChange={(e) => handleFilterChange('EmployeeName', e.target.value)}
                  placeholder="Enter employee name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Master ID
                </label>
                <Input
                  type="text"
                  value={tempFilters.BranchMasterId || ''}
                  onChange={(e) => handleFilterChange('BranchMasterId', e.target.value)}
                  placeholder="Enter branch master ID"
                />
              </div>
            </div>
          </div>
        </Modal>

      </div>
    </>

  )
}

export default BranchAssociationsMaster


