import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AssetMappingMasterData,
  FilterWithPaginationAssetMappingMasterRequest
} from '@/features/assetMappingMaster/models/AssetMappingMasterModel';

import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { assetMappingMasterService } from '../services/AssetMappingMasterService';
import { updateFilter } from '@/core/utils/filterHelper';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';


export const AssetMappingMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [AssetMappingMasterList, setAssetMappingMasterList] = useState<AssetMappingMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  // USE NAVIGATE
  const navigate = useNavigate();

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const {addToast } = useToast();

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchAssetMappings(value)
  }, 350);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeAssetMappingColumnsModal, setIsShowCustomizeAssetMappingColumnsModal] = useState(false);

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
      loadAssetMappings(listState.page ?? 1, { AssetName: String(listState.searchTerm).trim() });
      return;
    }

    loadAssetMappings(listState.page ?? 1, listState.filters ?? {});
  }, [location.state]);

  //#region CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchAssetMappingMasterList = async (page: number = pagination.currentPage) => {
    return await loadAssetMappings(page, filters);
  }

  const loadAssetMappings = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;

        if (sortInfo) {

          const column = AssetMappingMasterColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }
        const params: FilterWithPaginationAssetMappingMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          AssetMasterMappingId: filterParams.AssetMappingMasterId ? Number(filterParams.AssetMappingMasterId) : undefined,
          AssetName: filterParams.AssetName?.trim() || undefined,
          SortBy: sortByParam
        };

        const response = await assetMappingMasterService.apiCallPullAssetMappingMaster(params);
        if (E.isRight(response)) {

          setAssetMappingMasterList(response.right.Data);

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
      'Loading Asset Mapping Data'
    );
  };
  //#endregion

  //#region SEARCH & CLEAR
  const searchAssetMappings = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchAssetMappingMasterList();

      return
    }

    const filterParams: FilterInfo = {
      AssetName: searchValue.trim(),
    };

    await loadAssetMappings(1, filterParams);
  };

  //#endregion

  //#region CLEAR ASSET MAPPING MASTER 
  const clearSearchAssetMappings = () => {
    setSearchTerm('');

    debouncedSearch.cancel?.();

    setFilters({});
    setTempFilters({});
    setPagination({ currentPage: 1 });
    loadAssetMappings(1, {});
    try {
      navigate(location.pathname, { replace: true, state: {} });
    } catch {
    }
  };
  //#endregion

  //#region EXPORT / IMPORT EXCEL AND PDF
  const handleExportAssetMappings = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined
        if (sortInfo) {
          const column = AssetMappingMasterColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }
        const params: FilterWithPaginationAssetMappingMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          AssetName: filters.AssetName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        };

        const response = await getAssetMappings(params);

        handleExportFile(response, exportType, 'AssetMapping Master', addToast);

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
      undefined,
      'Preparing Export'
    );
  };

  const handleExportAssetMappingExcel = () => handleExportAssetMappings('Excel')
  const handleExportAssetMappingPdf = () => handleExportAssetMappings('PDF')
  //#endregion


  //#region API | SERVICES CALL TO GET ASSET MAPPING
  const getAssetMappings = async (filterParams: FilterWithPaginationAssetMappingMasterRequest) => {

    return await assetMappingMasterService.apiCallPullAssetMappingMaster(filterParams);
  }
  //#endregion


  //#region HANDLE PAGE CHNAGE EVENT
  const handlePageChange = useCallback((page: number) => {
    fetchAssetMappingMasterList(page);
  }, []);

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchAssetMappingMasterList(1);

  }, []);
  //#endregion

  //#region TABLE PAGINATION INFO
  const AssetMappingPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination, handlePageChange]
  );

  const AssetMappingsForTable = useMemo(() => AssetMappingMasterList, [AssetMappingMasterList]);
  //#endregion

  //#region NAVIGATE TO  VIEW ASSET MAPPING
  const handleNavigateToView = (row: AssetMappingMasterData) => {
    navigate('/assetMappingMaster/view', {
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

  //#region NAVIGATE TO ADD ASSET MAPPING
  const handleAddAssetMappingModal = useCallback(() => {
    navigate('/assetMappingMaster/add', {
      state: {
        fromList: true,
        listState: { page: pagination.currentPage, filters, sortInfo, searchTerm }
      }
    });
  }, [navigate, pagination.currentPage, filters, sortInfo, searchTerm]);

  //#endregion

  //#region TABLE COLUMNS
  const AssetMappingMasterColumns = useMemo<TableColumn[]>(() => [
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
      key: 'EmployeeName',
      label: 'Employee Name',
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
      key: 'AssignedDate',
      label: 'Assigned Date',
      width: '15',
      sortable: false,
      align: 'center',
      render: (value) => 
        value ? formatDate_dd_MonthName_yy(value) : '-'
    },
    {
      key: 'ReturnDate',
      label: 'Return Date',
      width: '12',
      sortable: false,
      align: 'center',
      render: (value) =>
        value ? formatDate_dd_MonthName_yy(value) : '-'
    },
    {
      key: 'ConditionOnIssue',
      label: 'Condition On Issue',
      width: '12',
      sortable: false,
      align: 'center',
      render: (value) => (
        <TooltipText
          text={value || 'N/A'}
          maxWidth="120px"
          tooltipThreshold={12}
        />
      )
    },
    {
      key: 'ConditionOnReturn',
      label: 'Condition On Return',
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

  ], [handleNavigateToView]);
  //#endregion

  //#region COLUMN CUSTOMIZATION
  const requiredAssetMappingColumnKeys: string[] = ['AssetName'];

  const allAssetMappingColumnKeys: string[] = AssetMappingMasterColumns.map(c => c.key);

  const [selectedAssetMappingColumnKeys, setSelectedAssetMappingColumnKeys] = useState<string[]>(() => {
    try {

      const saved = LocalStorageHelper.getAssetMappingMasterTableColumns?.();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(new Set([...parsed, ...requiredAssetMappingColumnKeys]));

        // Filter out any keys that no longer exist
        return withRequired.filter(k => allAssetMappingColumnKeys.includes(k));
      }
    } catch { }
    return allAssetMappingColumnKeys;
  });

  useEffect(() => {
    setSelectedAssetMappingColumnKeys(prev => Array.from(new Set([...prev, ...requiredAssetMappingColumnKeys])).filter(k => allAssetMappingColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [AssetMappingMasterColumns.length])

  const visibleAssetMappingColumns = useMemo(
    () => AssetMappingMasterColumns.filter(col => selectedAssetMappingColumnKeys.includes(col.key)),
    [AssetMappingMasterColumns, selectedAssetMappingColumnKeys]
  );
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters);
    loadAssetMappings(1, tempFilters);
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
    loadAssetMappings(1, {});

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

  return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        
        <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder="Search By Asset Name"
          onSearchChange={v => {
            setSearchTerm(v);
            debouncedSearch(v);
          }}
          onClearSearch={clearSearchAssetMappings}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters);
            setShowFilterPopup(true);
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeAssetMappingColumnsModal(true)}

          // ADD
          isShowAddButton={canAction}
          addTitle="Add"
          onAdd={handleAddAssetMappingModal}


          // EXPORT
          isShowExportButton={canExport}
          onExportExcel={handleExportAssetMappingExcel}
          onExportPdf={handleExportAssetMappingPdf}
          exportLoading={isLoading}
        />

        {/* DATA TABLE ASSET MAPPING*/}

        <DataTable
          data={AssetMappingsForTable}
          columns={visibleAssetMappingColumns}
          pagination={AssetMappingPaginationInfo}
          emptyMessage="No Asset found"
          fixedHeight
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />

        {/* CUSTOMIZE COLUMNS MODAL */}

        <CustomizeColumnsModal
          isOpen={isShowCustomizeAssetMappingColumnsModal}
          onClose={() => setIsShowCustomizeAssetMappingColumnsModal(false)}
          onApply={keys => {
            const withRequired = Array.from(

              new Set([...keys, ...requiredAssetMappingColumnKeys])
            );
            setSelectedAssetMappingColumnKeys(withRequired);

            try {
              LocalStorageHelper.storeAssetMappingMasterTableColumns?.(

                JSON.stringify(withRequired)
              );
            } catch { }
          }}
          columns={AssetMappingMasterColumns}
          selectedKeys={selectedAssetMappingColumnKeys}
          requiredKeys={requiredAssetMappingColumnKeys}
          title="Customize Table Columns"
        />

        {/* FILTER MODAL */}

        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Asset Mapping Master"
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
            </div>
          </div>
        </Modal>
      </div>
   
  );
};

export default AssetMappingMaster;
