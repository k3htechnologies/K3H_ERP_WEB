import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AssetMasterData,
  DeleteAssetMasterRequest,
  FilterWithPaginationAssetMasterRequest
} from '@/features/assetMaster/models/AssetMasterModel';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { useNavigate } from 'react-router-dom';
import { useAssetMasterListState } from '@/features/assetMaster/context/AssetMasterListStateContext';
import { Button, Input } from '@/ui/components/forms';
import { updateFilter } from '@/core/utils/filterHelper';
import { assetMasterService } from '../services/AssetMasterService';
import { Trash2 } from 'lucide-react';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';

export const AssetMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [AssetMasterList, setAssetMasterList] = useState<AssetMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  // USE NAVIGATE
  const navigate = useNavigate();
  const { listState, updateListState } = useAssetMasterListState();
  const { searchTerm, filters, sortInfo } = listState;

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  // TOAST
  const { addToast } = useToast();

  // SINGLE SEARCH TEXT BOX
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchAssets(value)
  }, 350);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //DELETE ASSET MASTER
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteAssetMasterData, setDeleteAssetMasterData] = useState<AssetMasterData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeAssetColumnsModal, setIsShowCustomizeAssetColumnsModal] = useState(false);

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#endregion

  //#region INIT
  useEffect(() => {
    // Sync pagination with context state
    setPagination({ currentPage: listState.page });

    // Load assets with current context state
    if (listState.searchTerm && String(listState.searchTerm).trim()) {
      loadAssets(listState.page, { AssetName: String(listState.searchTerm).trim() }, listState.sortInfo);
    } else {
      loadAssets(listState.page, listState.filters, listState.sortInfo);
    }
  }, [listState.page, listState.filters, listState.sortInfo, listState.searchTerm]);

  //#region CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchAssetMasterList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadAssets(page, filters, sort);
  }

  const loadAssets = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const params: FilterWithPaginationAssetMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          AssetMasterId: filterParams.AssetMasterId ? Number(filterParams.AssetMasterId) : undefined,
          AssetName: searchtext ?? filterParams.AssetName?.trim() ?? undefined,
          Status: filterParams.AssetStatus?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, assetMasterColumns)
        };

        const response = await assetMasterService.apiCallPullAssetMaster(params);
        if (E.isRight(response)) {

          setAssetMasterList(response.right.Data);

          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });

        } else {
          addToast({ type: 'error', title: response.left.message });
          return response;
        }
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Asset'
    );
  };
  //#endregion

  //#region SEARCH & CLEAR
  const searchAssets = async (searchValue: string) => {
    updateListState({ searchTerm: searchValue });

    if (searchValue.trim() === '') {
      fetchAssetMasterList();
      return
    }

    updateListState({ filters, page: 1, searchTerm: searchValue });

    await loadAssets(1, filters, sortInfo, searchValue)
  };

  //#endregion

  //#region CLEAR ASSET MASTER 
  const clearSearchAssets = () => {
    updateListState({ searchTerm: '', filters: {}, page: 1 });

    debouncedSearch.cancel?.();

    setTempFilters({});
    setPagination({ currentPage: 1 });
    loadAssets(1, { AssetName: '' }, sortInfo, undefined);
  };
  //#endregion

  //#region EXPORT / IMPORT EXCEL AND PDF
  const handleExportAssets = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const params: FilterWithPaginationAssetMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          AssetName: filters.AssetName?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, assetMasterColumns),
          ExportType: exportType
        };

        const response = await assetMasterService.apiCallPullAssetMaster(params);

        handleExportFile(response, exportType, 'Asset Master', addToast);

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
      undefined,
      'Preparing Export'
    );
  };

  const handleExportAssetExcel = () => handleExportAssets('Excel')
  const handleExportAssetPdf = () => handleExportAssets('PDF')
  //#endregion


  //#region HANDLE PAGE CHNAGE EVENT
  const handlePageChange = useCallback((page: number) => {
    updateListState({ page });
    fetchAssetMasterList(page);
  }, [updateListState]);

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {

    updateListState({ sortInfo: sort, page: 1 });
    loadAssets(1, filters, sort, searchTerm || undefined);

  }, [filters, updateListState, searchTerm]);
  //#endregion

  //#region TABLE PAGINATION INFO
  const AssetPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination, handlePageChange]
  );

  const AssetsForTable = useMemo(() => AssetMasterList, [AssetMasterList]);
  //#endregion

  //#region NAVIGATE TO  VIEW ASSET
  const handleNavigateToView = (row: AssetMasterData) => {
    updateListState({ assetMasterId: row.AssetMasterId || 0, assetName: row.AssetName || '' });
    navigate('/assetMaster/view');
  };

  //#region NAVIGATE TO ADD ASSET
  const handleAddAssetModal = useCallback(() => {
    navigate('/assetMaster/add');
  }, [navigate]);
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: AssetMasterData) => {
    setDeleteAssetMasterData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  //#endregion

  //#region TABLE COLUMNS
  const assetMasterColumns = useMemo<TableColumn[]>(() => [
    {
      key: 'AssetName',
      label: 'Asset Name',
      width: '20',
      sortable: true,
      fixed: 'left',
      align: 'left',
      render: (value, row) => (
        <TooltipText
          text={value || 'N/A'}
          maxWidth="250px"
          tooltipThreshold={25}
          onClick={() => handleNavigateToView(row)}
        />
      )
    },
    {
      key: 'AssetCode',
      label: 'Asset Code',
      width: '15',
      sortable: false,
      align: 'center',
      render: (value) => value || ''
    },
    {
      key: 'AssetType',
      label: 'Asset Type',
      width: '15',
      sortable: false,
      align: 'center',
      render: (value) => value || ''
    },
    {
      key: 'AssetBrand',
      label: 'Brand',
      width: '12',
      sortable: false,
      align: 'left',
      render: (value) => value || ''
    },
    {
      key: 'AssetModel',
      label: 'Model',
      width: '12',
      sortable: false,
      align: 'left',
      render: (value) => value || ''
    },
    {
      key: 'SerialNumber',
      label: 'Serial Number',
      width: '15',
      sortable: false,
      align: 'center',
      render: (value) => value || ''
    },
    {
      key: 'Status',
      label: 'Status',
      width: '20',
      sortable: false,
      align: 'center',
      render: (value) => value || ''
    },
    {
      key: 'EmployeeName',
      label: 'Employee Name',
      width: '20',
      sortable: false,
      align: 'center',
      render: (value) => value || ''
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '12',
      fixed: 'right',
      align: 'center',
      render: (_value, row) => (
        canAction && row.Status !== "Booked" ? (
          <div className="flex items-center justify-center gap-2">

            <Button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleConfirmationDialogBoxOpen(row)
              }}
              color='transparent'
              isborderRadius
              size='sm'
              style={{
                color: 'red',
                padding: '4px 8px'
              }}
              title="Delete Asset"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : null
      )
    }

  ], [handleNavigateToView, handleConfirmationDialogBoxOpen]);

  //#endregion

  //#region COLUMN CUSTOMIZATION
  const requiredAssetColumnKeys: string[] = ['AssetName'];

  const allAssetColumnKeys: string[] = assetMasterColumns.map(c => c.key);

  const [selectedAssetColumnKeys, setSelectedAssetColumnKeys] = useState<string[]>(() => {
    try {

      const saved = LocalStorageHelper.getAssetMasterTableColumns?.();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(new Set([...parsed, ...requiredAssetColumnKeys]));

        // Filter out any keys that no longer exist
        return withRequired.filter(k => allAssetColumnKeys.includes(k));
      }
    } catch { }
    return allAssetColumnKeys;
  });

  useEffect(() => {
    setSelectedAssetColumnKeys(prev => Array.from(new Set([...prev, ...requiredAssetColumnKeys])).filter(k => allAssetColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetMasterColumns.length])

  const visibleAssetColumns = useMemo(
    () => assetMasterColumns.filter(col => selectedAssetColumnKeys.includes(col.key)),
    [assetMasterColumns, selectedAssetColumnKeys]
  );
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    updateListState({ filters: tempFilters, page: 1 });
    loadAssets(1, tempFilters);
    setShowFilterPopup(false);
  };
  //#endregion

  //#region CLEAR FILTER
  const clearFilters = () => {
    setTempFilters({});
    updateListState({ filters: {}, page: 1 });
    loadAssets(1, {});
    setShowFilterPopup(false);
  };
  //#endregion

  //#region HANDLE FILTER CHNAGE
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  }
  //#endregion

  //#region  DELETE ASSET MASTER  EVENT

  const handleDeleteAssetMaster = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteAssetMasterData) return;

    await runApiWithLoader(

      setIsLoading,

      setIsLoadingMessage,
      async () => {
        const params: DeleteAssetMasterRequest = {

          AssetMasterId: deleteAssetMasterData.AssetMasterId || 0,

          UniqueKey: deleteAssetMasterData.Uniquekey || ""
        };

        const response = await assetMasterService.apiCallDeleteAssetMaster(params);

        if (E.isRight(response)) {

          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          }

          else if (AssetMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }
          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          await loadAssets(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteAssetMasterData(null);

        } else {

          addToast({ type: 'error', title: response.left.message });

          setIsConfirmationDialogBoxOpen(false);

        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Deleting Asset Master"
    );
  };

  //#endregion

  return (

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      {/* // LOADER */}

      <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

      {/* ACTION TOOLBAR */}

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Asset Name"
        onSearchChange={v => {
          updateListState({ searchTerm: v });
          debouncedSearch(v);
        }}
        onClearSearch={clearSearchAssets}
        isShowFilterButton
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters);
          setShowFilterPopup(true);
        }}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeAssetColumnsModal(true)}

        // ADD
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddAssetModal}


        // EXPORT
        isShowExportButton={canExport && AssetsForTable.length > 0}
        onExportExcel={handleExportAssetExcel}
        onExportPdf={handleExportAssetPdf}
        exportLoading={isLoading}
      />

      {/* DATA TABLE ASSET*/}

      <DataTable
        data={AssetsForTable}
        columns={visibleAssetColumns}
        pagination={AssetPaginationInfo}
        emptyMessage="No Assets Found"
        fixedHeight
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
      />

      {/* CUSTOMIZE COLUMNS MODAL */}

      <CustomizeColumnsModal
        isOpen={isShowCustomizeAssetColumnsModal}
        onClose={() => setIsShowCustomizeAssetColumnsModal(false)}
        onApply={keys => {
          const withRequired = Array.from(

            new Set([...keys, ...requiredAssetColumnKeys])
          );
          setSelectedAssetColumnKeys(withRequired);

          try {
            LocalStorageHelper.storeAssetMasterTableColumns?.(

              JSON.stringify(withRequired)
            );
          } catch { }
        }}
        columns={assetMasterColumns}
        selectedKeys={selectedAssetColumnKeys}
        requiredKeys={requiredAssetColumnKeys}
        title="Customize Table Columns"
      />

      {/* FILTER MODAL */}

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Asset Master"
        onSubmit={e => {
          e.preventDefault();
          applyFilters();
        }}
        saveText="Apply"
        cancelText="Clear"
        onCancel={() => clearFilters()}
        resetText=''
        size="small-half"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <Input type="text"
              label='Asset Name'
              value={tempFilters?.AssetName ?? ''}
              onChange={e => handleFilterChange('AssetName', e.target.value)}
              placeholder="Enter Asset Name" />
          </div>
          <div className="space-y-4">
            <Input type="text"
              label='Asset Status'
              value={tempFilters?.AssetStatus ?? ''}
              onChange={e => handleFilterChange('AssetStatus', e.target.value)}
              placeholder="Enter Asset Status" />
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false)
          setDeleteAssetMasterData(null)
        }}
        onConfirm={handleDeleteAssetMaster}
        loading={isLoading}
        pageName='asset'
      />

    </div>
  );
};

export default AssetMaster;
