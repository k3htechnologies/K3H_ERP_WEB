import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  WeekOffMasterData,
  FilterWithPaginationWeekOffMasterRequest,
  DeleteWeekOffMasterRequest,
} from '@/features/weekOffMaster/models/WeekOffMasterModel'

import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { useNavigate } from 'react-router-dom';
import { useWeekOffMasterListState } from '@/features/weekOffMaster/context/WeekOffMasterListStateContext';
import { weekOffMasterService } from '@/features/weekOffMaster/services/WeekOffMasterService';
import { updateFilter } from '@/core/utils/filterHelper';
import { Trash2 } from 'lucide-react';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';


export const WeekOffOffMasterMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [WeekOffOffMasterList, setWeekOffOffMasterList] = useState<WeekOffMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // USE NAVIGATE
  const navigate = useNavigate();
  const { listState, updateListState } = useWeekOffMasterListState();
  const { searchTerm, filters, sortInfo } = listState;

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  // TOAST
  const { addToast } = useToast();

  // SINGLE SEARCH TEXT BOX
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchWeekOff(value)
  }, 350);


  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //DELETE WEEK OFF MASTER
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deleteWeekOffMasterData, setDeleteWeekOffMasterData] = useState<WeekOffMasterData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeWeekOffColumnsModal, setIsShowCustomizeWeekOffOffColumnsModal] = useState(false);

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#endregion

  //#region INIT
  useEffect(() => {
    // Sync pagination with context state
    setPagination({ currentPage: listState.page });

    // Load week offs with current context state
    if (listState.searchTerm && String(listState.searchTerm).trim()) {
      loadWeekOff(listState.page, { WeekOffPolicyName: String(listState.searchTerm).trim() }, listState.sortInfo);
    } else {
      loadWeekOff(listState.page, listState.filters, listState.sortInfo);
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

  const fetchWeekOffMasterList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadWeekOff(page, filters, sort ?? sortInfo);
  }

  const loadWeekOff = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationWeekOffMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          WeekOffPolicyMasterId: filterParams.WeekOffPolicyMasterId ? Number(filterParams.WeekOffPolicyMasterId) : undefined,
          WeekOffPolicyName: searchtext ?? filterParams.WeekOffPolicyName?.trim() ?? undefined,
          SortBy: getSortByParam(sortInfo ?? null, WeekOffMasterColumns)
        };

        const response = await weekOffMasterService.apiCallPullWeekOffMaster(params);

        if (E.isRight(response)) {

          setWeekOffOffMasterList(response.right.Data);

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
      'Loading Week Off'
    );
  };
  //#endregion

  //#region SEARCH & CLEAR WEEK OFF MASTER

  const searchWeekOff = async (searchValue: string) => {

    updateListState({ searchTerm: searchValue });

    if (searchValue.trim() === '') {

      updateListState({ searchTerm: '', page: 1 });
      fetchWeekOffMasterList();
      return;

    }

    updateListState({ searchTerm: searchValue, page: 1 });

    await loadWeekOff(1, filters, sortInfo, searchValue);
  };

  //#endregion

  //#region CLEAR WEEK OFF MASTER 

  const clearSearchWeekOff = () => {
    debouncedSearch.cancel?.();
    updateListState({ searchTerm: '', filters: {}, page: 1 });
    setTempFilters({});
    loadWeekOff(1, { EmployeeName: '' }, sortInfo, undefined);
  };
  //#endregion

  //#region EXPORT / IMPORT EXCEL AND PDF
  const handleExportWeekOffs = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationWeekOffMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          WeekOffPolicyName: filters.WeekOffPolicyName?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, WeekOffMasterColumns),
          ExportType: exportType
        };

        const response = await getWeekOff(params);

        handleExportFile(response, exportType, 'WeekOff Master', addToast);

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
      undefined,
      'Preparing Export'
    );
  };

  const handleExportWeekOffExcel = () => handleExportWeekOffs('Excel')
  const handleExportWeekOffPdf = () => handleExportWeekOffs('PDF')
  //#endregion


  //#region API | SERVICES CALL TO GET WEEK OFF
  const getWeekOff = async (filterParams: FilterWithPaginationWeekOffMasterRequest) => {

    return await weekOffMasterService.apiCallPullWeekOffMaster(filterParams);
  }
  //#endregion


  //#region HANDLE PAGE CHNAGE EVENT
  const handlePageChange = useCallback((page: number) => {
    fetchWeekOffMasterList(page);
  }, []);

  //#region TABLE SORT COLUMN

  const handleSortColumn = useCallback((sort: SortInfo) => {
    updateListState({ sortInfo: sort, page: 1 });
    loadWeekOff(1, filters, sort, searchTerm || undefined);
  }, [filters, updateListState, searchTerm]);
  //#endregion

  //#region TABLE PAGINATION INFO
  const WeekOffPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination, handlePageChange]
  );

  const WeekOffsForTable = useMemo(() => WeekOffOffMasterList, [WeekOffOffMasterList]);
  //#endregion

  //#region NAVIGATE TO  VIEW WEEK OFF VIEW PAGE
  const handleNavigateToView = (row: WeekOffMasterData) => {
    updateListState({ weekOffMasterId: row.WeekOffPolicyMasterId, weekOffName: row.WeekOffPolicyName });
    navigate('/weekOffMaster/view');
  };

  //#region NAVIGATE TO ADD WEEK OFF
  const handleAddWeekOffModal = useCallback(() => {
    navigate('/weekOffMaster/add');
  }, [navigate]);

  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: WeekOffMasterData) => {

    setDeleteWeekOffMasterData(row)

    setIsConfirmationDialogBoxOpen(true)
  }, [])
  //#endregion

  //#region TABLE COLUMNS
  const WeekOffMasterColumns = useMemo<TableColumn[]>(() => [
    {
      key: 'WeekOffPolicyName',
      label: 'Week Off Name',
      width: '20',
      sortable: true,
      fixed: 'left',
      align: 'left',
      render: (value, row) => (
        <TooltipText
          text={value || '-'}
          maxWidth="250px"
          tooltipThreshold={25}
          onClick={() => handleNavigateToView(row)}
        />
      )
    },
    {
      key: 'WeekOffPolicyCode',
      label: 'Week Off Code',
      width: '15',
      sortable: false,
      align: 'left',
      render: (value) => value || '-'
    },
    {
      key: 'WeekDays',
      label: 'Week Days',
      width: '15',
      sortable: false,
      align: 'left',
      render: (value) => value || '-'
    },
    {
      key: 'WeekDaysStartsOn',
      label: 'Week Days Starts On',
      width: '15',
      sortable: false,
      align: 'left',
      render: (value) => value || '-'
    },
    {
      key: 'WeeklyOff',
      label: 'Weekly Off',
      width: '15',
      sortable: false,
      align: 'left',
      render: (value) => value || '-'
    },
    {
      key: 'WeeklyOff2',
      label: 'Weekly Off 2',
      width: '15',
      sortable: false,
      align: 'left',
      render: (value) => value || '-'
    },
    {
      key: 'WeeklyOff2Type',
      label: 'Weekly Off 2 Type',
      width: '15',
      sortable: false,
      align: 'left',
      render: (value) => value || '-'
    },
    {
      key: 'NotApplicableForMonths',
      label: 'Not Applicable For Months',
      width: '15',
      sortable: false,
      align: 'left',
      render: (value) => value || '-'
    },
    {
      key: 'Actions',
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
              title="Delete WeekOff"
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
  const requiredWeekOffColumnKeys: string[] = ['WeekOffPolicyName','Actions'];

  const allWeekOffColumnKeys: string[] = WeekOffMasterColumns.map(c => c.key);

  const [selectedWeekOffColumnKeys, setSelectedWeekOffColumnKeys] = useState<string[]>(() => {
    try {

      const saved = LocalStorageHelper.getWeekOffMasterTableColumns?.();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(new Set([...parsed, ...requiredWeekOffColumnKeys]));

        // Filter out any keys that no longer exist
        return withRequired.filter(k => allWeekOffColumnKeys.includes(k));
      }
    } catch { }
    return allWeekOffColumnKeys;
  });

  useEffect(() => {
    setSelectedWeekOffColumnKeys(prev => Array.from(new Set([...prev, ...requiredWeekOffColumnKeys])).filter(k => allWeekOffColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [WeekOffMasterColumns.length])

  const visibleWeekOffColumns = useMemo(

    () => WeekOffMasterColumns.filter(col => selectedWeekOffColumnKeys.includes(col.key)),

    [WeekOffMasterColumns, selectedWeekOffColumnKeys]
  );
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    updateListState({ filters: tempFilters, page: 1 });
    loadWeekOff(1, tempFilters);
    setShowFilterPopup(false);
  };
  //#endregion

  //#region Clear
  const clearFilters = () => {
    setTempFilters({});
    updateListState({ filters: {}, page: 1 });
    loadWeekOff(1, {});
  };
  //#endregion

  //#region HANDLE FILTER CHNAGE
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  }
  //#endregion

  //#region DELETE WEEK OFF MASTER
  const handleDeleteWeekOffMaster = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteWeekOffMasterData) return;

    await runApiWithLoader(

      setIsLoading,

      setLoadingMessage,
      async () => {
        const params: DeleteWeekOffMasterRequest = {

          WeekOffPolicyMasterId: deleteWeekOffMasterData.WeekOffPolicyMasterId || 0,

          UniqueKey: deleteWeekOffMasterData.Uniquekey || ""
        };

        const response = await weekOffMasterService.apiCallDeleteWeekOffMaster(params);

        if (E.isRight(response)) {

          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          }

          else if (WeekOffOffMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }
          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          await loadWeekOff(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteWeekOffMasterData(null);

        } else {

          addToast({ type: 'error', title: response.left.message });

          setIsConfirmationDialogBoxOpen(false);

        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Deleting Week Off"
    );
  };
  return (


    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

      {/* LOADER */}

      <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

      {/* ============================================================================
          COMBINED SEARCH BAR, FILTER IMPORT , EXPORT ROW
           ============================================================================ */}

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Week Off Name"
        onSearchChange={v => {
          updateListState({ searchTerm: v });
          debouncedSearch(v);
        }}
        onClearSearch={clearSearchWeekOff}
        isShowFilterButton={false}
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters);
          setShowFilterPopup(true);
        }}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeWeekOffOffColumnsModal(true)}

        // ADD
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddWeekOffModal}


        // EXPORT
        isShowExportButton={canExport && WeekOffsForTable.length > 0}
        onExportExcel={handleExportWeekOffExcel}
        onExportPdf={handleExportWeekOffPdf}
        exportLoading={isLoading}
      />

      {/* DATA TABLE WEEK OFF */}

      <DataTable
        data={WeekOffsForTable}
        columns={visibleWeekOffColumns}
        pagination={WeekOffPaginationInfo}
        emptyMessage="No Week Off Found"
        fixedHeight
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
      />

      {/* CUSTOMIZE COLUMNS MODAL */}

      <CustomizeColumnsModal
        isOpen={isShowCustomizeWeekOffColumnsModal}
        onClose={() => setIsShowCustomizeWeekOffOffColumnsModal(false)}
        onApply={keys => {
          const withRequired = Array.from(

            new Set([...keys, ...requiredWeekOffColumnKeys])
          );
          setSelectedWeekOffColumnKeys(withRequired);

          try {
            LocalStorageHelper.storeWeekOffMasterTableColumns?.(

              JSON.stringify(withRequired)
            );
          } catch { }
        }}
        columns={WeekOffMasterColumns}
        selectedKeys={selectedWeekOffColumnKeys}
        requiredKeys={requiredWeekOffColumnKeys}
        title="Customize Table Columns"
      />

      {/* FILTER WEEK OFF MODAL */}

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - WeekOff Master"
        onSubmit={e => {
          e.preventDefault();
          applyFilters();
        }}
        saveText="Apply "
        cancelText="Clear"
        onCancel={() => clearFilters()}

        size="small-half"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <Input type="text"
              label='Week Off Name'
              value={tempFilters?.WeekOffPolicyName ?? ''}
              onChange={e => handleFilterChange('WeekOffPolicyName', e.target.value)}
              placeholder="Enter WeekOff Name" />
          </div>
        </div>
      </Modal>
      {/* DELETE CONFIRMATION  WEEK OFF MODAL */}
      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => setIsConfirmationDialogBoxOpen(false)}
        onConfirm={handleDeleteWeekOffMaster}
        loading={isLoading}
        pageName='weekOff'
      />

    </div>
  );
};

export default WeekOffOffMasterMaster;
