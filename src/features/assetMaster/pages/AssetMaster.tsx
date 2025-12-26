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
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Input } from '@/ui/components/forms';
import { updateFilter } from '@/core/utils/filterHelper';
import { assetMasterService } from '../services/AssetMasterService';
import { Trash2 } from 'lucide-react';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';

export const AssetMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [AssetMasterList, setAssetMasterList] = useState<AssetMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  // USE NAVIGATE
  const navigate = useNavigate();

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const { addToast } = useToast();

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchAssets(value)
  }, 350);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //DELETE ASSET MASTER
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteAssetMasterData, setDeleteAssetMasterData] = useState<AssetMasterData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeAssetColumnsModal, setIsShowCustomizeAssetColumnsModal] = useState(false);

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  const location = useLocation() as any;

  //#endregion

  //#region INIT
  useEffect(() => {
    const incoming = location.state?.listState;
    const listState = incoming ?? {
      page: 1, filters: {} as FilterInfo, sortInfo: undefined, searchTerm: ''
    };

    setPagination({ currentPage: listState.page ?? pagination.currentPage });

    setSortInfo(listState.sortInfo);

    setFilters(listState.filters ?? {});

    setTempFilters(listState.filters ?? {});

    setSearchTerm(listState.searchTerm ?? '');

    if (listState.searchTerm && String(listState.searchTerm).trim()) {
      loadAssets(listState.page ?? 1, { AssetName: String(listState.searchTerm).trim() });
      return;
    }

    loadAssets(listState.page ?? 1, listState.filters ?? {});
  }, [location.state]);

  //#region CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchAssetMasterList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadAssets(page, filters,sort);
  }

  const loadAssets = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;

        if (sortInfo) {

          const column = assetMasterColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }
        const params: FilterWithPaginationAssetMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          AssetMasterId: filterParams.AssetMasterId ? Number(filterParams.AssetMasterId) : undefined,
          AssetName: filterParams.AssetName?.trim() || undefined,
          Status: filterParams.Status?.trim() || undefined,
          SortBy: sortByParam
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

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchAssetMasterList();

      return
    }

    const filterParams: FilterInfo = {
      AssetName: searchValue.trim(),
    };

    await loadAssets(1, filterParams);
  };

  //#endregion

  //#region CLEAR ASSET MASTER 
  const clearSearchAssets = () => {
    setSearchTerm('');

    debouncedSearch.cancel?.();

    setFilters({});
    setTempFilters({});
    setPagination({ currentPage: 1 });
    loadAssets(1, {});
    try {
      navigate(location.pathname, { replace: true, state: {} });
    } catch {
    }
  };
  //#endregion

  //#region EXPORT / IMPORT EXCEL AND PDF
  const handleExportAssets = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined
        if (sortInfo) {
          const column = assetMasterColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }
        const params: FilterWithPaginationAssetMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          AssetName: filters.AssetName?.trim() || undefined,
          Status: filters.Status?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        };

        const response = await getAssets(params);

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


  //#region API | SERVICES CALL TO GET ASSET
  const getAssets = async (filterParams: FilterWithPaginationAssetMasterRequest) => {

    return await assetMasterService.apiCallPullAssetMaster(filterParams);
  }
  //#endregion


  //#region HANDLE PAGE CHNAGE EVENT
  const handlePageChange = useCallback((page: number) => {
    fetchAssetMasterList(page);
  }, []);

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {

    setSortInfo(sort);

    loadAssets(1,filters,sort);

  }, [filters]);
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
    navigate('/assetMaster/view', {
      state: {
        assetData: row,
        listState: {
          page: pagination.currentPage,
          filters,
          sortInfo,
          searchTerm
        }
      }
    });
  };

  //#region NAVIGATE TO ADD ASSET
  const handleAddAssetModal = useCallback(() => {
    navigate('/assetMaster/add', {
      state: {
        fromList: true,
        listState: { page: pagination.currentPage, filters, sortInfo, searchTerm }
      }
    });
  }, [navigate, pagination.currentPage, filters, sortInfo, searchTerm]);
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
      render: (value) => (
        <TooltipText
          text={value || 'N/A'}
          maxWidth="170px"
          tooltipThreshold={15}
        />
      )
    },
    {
      key: 'AssetType',
      label: 'Asset Type',
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
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value === 'Active'
            ? 'bg-green-100 text-green-800'
            : value === 'Inactive'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
            }`}
        >
          {value || '-'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '12',
      fixed: 'right',
      align: 'center',
      render: (_value, row) => (
        canAction ? (
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
    setFilters(tempFilters);

    loadAssets(1, tempFilters);

    setShowFilterPopup(false);
  };
  //#endregion

  //#region CLEAR FILTER
  const clearFilters = () => {
    setTempFilters({});
    setFilters({});

    // reset page
    setPagination({ currentPage: 1 });

    // load empty filters
    loadAssets(1, {});

    setShowFilterPopup(false);
    // clear router state (very important)

    navigate(location.pathname, { replace: true, state: {} });

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

          setAssetMasterList(prevData => prevData.filter(item => item.AssetMasterId !== deleteAssetMasterData.AssetMasterId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });
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
          setSearchTerm(v);
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
        isShowExportButton={canExport && AssetsForTable.length>0}
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
        saveText="Apply Filter"
        cancelText="Clear Filter"
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

            <Input type="text"
              label='Status'
              value={tempFilters.Status || ''}
              onChange={e => handleFilterChange('Status', e.target.value)}
              placeholder="Enter status (Active / Inactive)" />
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmationDialogBox
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false)
          setDeleteAssetMasterData(null)
        }}
        onConfirm={handleDeleteAssetMaster}
        title="You are about to delete a Asset?"
        message="Deleting this Asset will permanently remove its contents."
        confirmText="Delete"
        cancelText="Cancel"
        loading={isLoading}
        variant="danger"
      />

    </div>
  );
};

export default AssetMaster;
