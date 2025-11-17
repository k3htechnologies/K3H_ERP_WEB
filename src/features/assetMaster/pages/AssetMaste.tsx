import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  AssetMasterData,
  FilterWithPaginationAssetMasterRequest
} from '@/features/assetMaster/models/AssetMasterModel';

import { assetMasterService } from '@/features/assetMaster/services/AssetMasterService'
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


export const AssetMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [assetMasterList, setAssetMasterList] = useState<AssetMasterData[]>([]);
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
    searchAssets(value)
  }, 350)

  //VIEW ASSET MASTER MODAL STATES
  const [viewAssetMasterDetailsData, setViewAssetMasterDetailsData] = useState<AssetMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeAssetMasterColumnsModal, setIsShowCustomizeAssetMasterColumnsModal] = useState(false);


  //#endregion

  //#region MENU PERMISSIONS
  const { canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  const hasFetchedInitialAssets = useRef(false)

  useEffect(() => {

    if (hasFetchedInitialAssets.current) return

    hasFetchedInitialAssets.current = true;

    fetchAssetList()
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

  const fetchAssetList = async (page: number = pagination.currentPage) => {
    return await loadAssets(page, filters);
  }

  const loadAssets = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        let sortByParam = undefined;

        if (sortInfo) {

          const column = assetMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }

        }

        const params: FilterWithPaginationAssetMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          AssetMasterId: filterParams.AssetMasterId ? Number(filterParams.AssetMasterId) : undefined,
          AssetName: filterParams.AssetName?.trim() || undefined,
          Status: filterParams.Status?.trim() || undefined,
          SortBy: sortByParam
        }

        const response = await getAssets(params);

        if (E.isRight(response)) {

          setAssetMasterList(response.right.Data);

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
      'Loading Asset Data...'
    )
  }

  // SEARCH ASSET 
  const searchAssets = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchAssetList();

      return
    }

    const filterParams: FilterInfo = {
      AssetName: searchValue.trim(),
    };

    await loadAssets(1, filterParams)

  }

  const clearsearchAssets = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchAssetList();
  }
  // END SEARCH ASSET 

  // EXPORT EXCEL | PDF
  const handleExportAssets = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined
        if (sortInfo) {
          const column = assetMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationAssetMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          AssetName: filters.AssetName?.trim() || undefined,
          Status: filters.Status?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }

        const response = await getAssets(params);

        handleExportFile(response, exportType, 'Asset Master', addToast)

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

  const handleExportAssetExcel = () => handleExportAssets('Excel')
  const handleExportAssetPdf = () => handleExportAssets('PDF')

  //END EXPORT EXCEL | PDF

  //API | SERVICES CALL TO GET ASSET 

  const getAssets = async (filterParams: FilterWithPaginationAssetMasterRequest) => {

    return await assetMasterService.apiCallPullAssetMaster(filterParams);
  }

  //END API | SERVICES CALL TO GET ASSET

  //#endregion

  //#region TABLE CONFIGURATION

  const handlePageChange = (page: number) => {
    fetchAssetList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchAssetList(1);

  }

  const assetMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const assetListForTable = useMemo(() => assetMasterList, [assetMasterList]);


  // STABLE HANDLER VIEW
  const handleViewAssetDetails = useCallback((row: AssetMasterData) => {
    setViewAssetMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  const assetMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'AssetName',
        label: 'Asset Name',
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
              onClick={() => handleViewAssetDetails(row)}
            />
          </div>
        )
      },
      {
        key: 'AssetCode',
        label: 'Asset Code',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="170px"
            tooltipThreshold={15}
            tooltipClassName='inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap'
          />
        )
      },
      {
        key: 'AssetType',
        label: 'Asset Type',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="150px"
            tooltipThreshold={15}
          />
        )
      },
      {
        key: 'AssetBrand',
        label: 'Brand',
        width: '12',
        sortable: false,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="120px"
            tooltipThreshold={12}
          />
        )
      },
      {
        key: 'AssetModel',
        label: 'Model',
        width: '12',
        sortable: false,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="120px"
            tooltipThreshold={12}
          />
        )
      },
      {
        key: 'SerialNumber',
        label: 'Serial Number',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="150px"
            tooltipThreshold={15}
          />
        )
      },
      {
        key: 'Status',
        label: 'Status',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value === 'Active' ? 'bg-green-100 text-green-800' : 
            value === 'Inactive' ? 'bg-red-100 text-red-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {value || 'N/A'}
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
    // dependencies: include everything used inside that might change
    [handleViewAssetDetails]
  )

  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS

  const requiredAssetMasterColumnKeys: string[] = ['AssetName'];

  const allAssetMasterColumnKeys: string[] = assetMasterColumns.map(c => c.key)

  const [selectedAssetMasterColumnKeys, setSelectedAssetMasterColumnKeys] = useState<string[]>(() => {

    try {

      const saved = LocalStorageHelper.getAssetMasterTableColumns();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(new Set([...parsed, ...requiredAssetMasterColumnKeys]));

        // Filter out any keys that no longer exist
        return withRequired.filter(k => allAssetMasterColumnKeys.includes(k));

      }
    } catch { }
    return allAssetMasterColumnKeys
  })

  useEffect(() => {
    // Guarantee required columns remain selected if state changes elsewhere

    setSelectedAssetMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredAssetMasterColumnKeys])).filter(k => allAssetMasterColumnKeys.includes(k)));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetMasterColumns.length])

  const visibleAssetMasterColumns = useMemo(
    () => assetMasterColumns.filter(col => selectedAssetMasterColumnKeys.includes(col.key)),
    [assetMasterColumns, selectedAssetMasterColumnKeys]
  )

  //#endregion

  //#region VIEW ASSET DETAILS MODAL COMPONENT

  interface ViewAssetDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: AssetMasterData | null
  }

  const ViewAssetDetailsModal: React.FC<ViewAssetDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings - Company setup (Asset Details)"
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
        }}
        cancelText="Close"
        loading={false}
      >
        <div className="space-y-6">
          {/* Asset Information */}
          <div className="space-y-4">

            {/* Asset Code */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Asset Code
              </span>
              <span className="text-sm text-blue-600 font-medium">
                <TooltipText
                  text={data.AssetCode || 'N/A'}
                  maxWidth="170px"
                  tooltipThreshold={15}
                  tooltipClassName='inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap'
                />
              </span>
            </div>

            {/* Asset Name */}
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Asset Name
              </span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.AssetName || 'N/A'}
              </span>
            </div>

            {/* Asset Type */}
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Asset Type
              </span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.AssetType || 'N/A'}
              </span>
            </div>

            {/* Asset Brand */}
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Brand
              </span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.AssetBrand || 'N/A'}
              </span>
            </div>

            {/* Asset Model */}
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Model
              </span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.AssetModel || 'N/A'}
              </span>
            </div>

            {/* Serial Number */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Serial Number
              </span>
              <span className="text-sm text-blue-600 font-medium">
                {data.SerialNumber || 'N/A'}
              </span>
            </div>

            {/* Purchase Date */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Purchase Date
              </span>
              <span className="text-sm text-blue-600 font-medium">
                {data.PurchaseDate ? formatDate_dd_MonthName_yy(data.PurchaseDate) : 'N/A'}
              </span>
            </div>

            {/* Warranty Expiry Date */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Warranty Expiry Date
              </span>
              <span className="text-sm text-blue-600 font-medium">
                {data.WarrantyExpiryDate ? formatDate_dd_MonthName_yy(data.WarrantyExpiryDate) : 'N/A'}
              </span>
            </div>

            {/* Asset Cost */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Asset Cost
              </span>
              <span className="text-sm text-blue-600 font-medium">
                {data.AssetCost ? `₹${data.AssetCost.toLocaleString('en-IN')}` : 'N/A'}
              </span>
            </div>

            {/* Supplier Name */}
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Supplier Name
              </span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.SupplierName || 'N/A'}
              </span>
            </div>

            {/* Status */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <span className="text-sm text-blue-600 font-medium">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  data.Status === 'Active' ? 'bg-green-100 text-green-800' : 
                  data.Status === 'Inactive' ? 'bg-red-100 text-red-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {data.Status || 'N/A'}
                </span>
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
    loadAssets(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadAssets(1, {})
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
          searchPlaceholder="Search by asset name..."
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchAssets}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeAssetMasterColumnsModal(true)}
          isShowAddButton={false}
          isShowImportButton={false}
          isShowExportButton={canExport}
          onExportExcel={handleExportAssetExcel}
          onExportPdf={handleExportAssetPdf}
          exportLoading={isLoading}
        />


        {/* DATA TABLE ASSET */}
        <DataTable
          data={assetListForTable}
          columns={visibleAssetMasterColumns}
          pagination={assetMasterPaginationInfo}
          emptyMessage="No assets found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />

        {/* VIEW ASSET MODAL */}
        <ViewAssetDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewAssetMasterDetailsData(null)
          }}
          data={viewAssetMasterDetailsData}
        />

        {/* CUSTOMIZE COLUMNS MODAL */}


        <CustomizeColumnsModal
          isOpen={isShowCustomizeAssetMasterColumnsModal}
          onClose={() => setIsShowCustomizeAssetMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(
              new Set([...keys, ...requiredAssetMasterColumnKeys]),
            )

            setSelectedAssetMasterColumnKeys(withRequired)

            try {
              LocalStorageHelper.storeAssetMasterTableColumns(
                JSON.stringify(withRequired),
              )
            } catch { }
          }}
          columns={assetMasterColumns}
          selectedKeys={selectedAssetMasterColumnKeys}
          requiredKeys={requiredAssetMasterColumnKeys}
          title="Customize Asset Master Table Columns"
        />

        {/* FILTER ASSET MODAL */}
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Asset Master"
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
                  Asset Name
                </label>
                <Input
                  type="text"
                  value={tempFilters.AssetName || ''}
                  onChange={(e) => handleFilterChange('AssetName', e.target.value)}
                  placeholder="Enter asset name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Input
                  type="text"
                  value={tempFilters.Status || ''}
                  onChange={(e) => handleFilterChange('Status', e.target.value)}
                  placeholder="Enter status (Active/Inactive)"
                />
              </div>
            </div>
          </div>
        </Modal>

      </div>
    </>

  )
}

export default AssetMaster


