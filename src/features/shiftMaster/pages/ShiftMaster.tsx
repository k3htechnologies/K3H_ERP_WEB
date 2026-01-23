import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  ShiftMasterData,
  FilterWithPaginationShiftMasterRequest,
  DeleteShiftMasterRequest
} from '@/features/shiftMaster/models/ShiftMasterModel';

import { shiftMasterService } from '@/features/shiftMaster/services/ShiftMasterService'
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
import { useShiftMasterListState } from '@/features/shiftMaster/context/ShiftMasterListStateContext';
import { updateFilter } from '@/core/utils/filterHelper';
import { Trash2 } from 'lucide-react';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

export const ShiftMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [ShiftMasterList, setShiftMasterList] = useState<ShiftMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // USE NAVIGATE
  const navigate = useNavigate();
  const { listState, updateListState } = useShiftMasterListState();
  const { searchTerm, filters, sortInfo } = listState;

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  // TOAST
  const { addToast } = useToast();

  // SINGLE SEARCH TEXT BOX
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchShifts(value)
  }, 350);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //DELETE SHIFT MASTER
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deleteShiftMasterDetailsData, setDeleteShiftMasterDetailsData] = useState<ShiftMasterData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeShiftColumnsModal, setIsShowCustomizeShiftColumnsModal] = useState(false);

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#endregion

  //#region INIT
  useEffect(() => {
    // Sync pagination with context state
    setPagination({ currentPage: listState.page });

    // Load shifts with current context state
    if (listState.searchTerm && String(listState.searchTerm).trim()) {
      loadShifts(listState.page, { ShiftName: String(listState.searchTerm).trim() }, listState.sortInfo);
    } else {
      loadShifts(listState.page, listState.filters, listState.sortInfo);
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

  const fetchShiftMasterList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadShifts(page, filters, sort);
  }

  const loadShifts = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationShiftMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          ShiftManagementMasterId: filterParams.ShiftManagementMasterId ? Number(filterParams.ShiftManagementMasterId) : undefined,
          ShiftName: searchtext ?? filterParams.ShiftName?.trim() ?? undefined,
          SortBy: getSortByParam(sortInfo ?? null, ShiftMasterColumns)
        };

        const response = await shiftMasterService.apiCallPullShiftMaster(params);
        if (E.isRight(response)) {

          setShiftMasterList(response.right.Data);

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
      'Loading Shift'
    );
  };
  //#endregion

  //#region SEARCH  SHIFT MASTER
  const searchShifts = async (searchValue: string) => {
    updateListState({ searchTerm: searchValue });

    if (searchValue.trim() === '') {
      fetchShiftMasterList();
      return
    }

    updateListState({ searchTerm: searchValue, page: 1 });
    await loadShifts(1, filters, sortInfo, searchValue);
  };

  //#endregion

  //#region CLEAR SHIFT MASTER 
  const clearSearchShifts = () => {
    updateListState({ searchTerm: '', filters: {}, page: 1 });

    debouncedSearch.cancel?.();

    setTempFilters({});
    setPagination({ currentPage: 1 });
    loadShifts(1, { ShiftName: '' }, sortInfo, undefined);
  };
  //#endregion

  //#region EXPORT / IMPORT EXCEL AND PDF
  const handleExportShifts = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationShiftMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          ShiftName: filters.ShiftName?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, ShiftMasterColumns),
          ExportType: exportType
        };

        const response = await shiftMasterService.apiCallPullShiftMaster(params);

        handleExportFile(response, exportType, 'Shift Master', addToast);

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
      undefined,
      'Preparing Export'
    );
  };

  const handleExportShiftExcel = () => handleExportShifts('Excel')
  const handleExportShiftPdf = () => handleExportShifts('PDF')
  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT
  const handlePageChange = useCallback((page: number) => {
    updateListState({ page });
    fetchShiftMasterList(page);
  }, [updateListState]);

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {
    updateListState({ sortInfo: sort, page: 1 });
    loadShifts(1, filters, sort, searchTerm || undefined);
  }, [filters, updateListState, searchTerm]);
  //#endregion

  //#region TABLE PAGINATION INFO
  const ShiftPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination, handlePageChange]
  );

  const ShiftsForTable = useMemo(() => ShiftMasterList, [ShiftMasterList]);
  //#endregion

  //#region NAVIGATE TO  VIEW SHIFT
  const handleNavigateToView = (row: ShiftMasterData) => {
    updateListState({ shiftMasterId: row.ShiftManagementMasterId, shiftName: row.ShiftName });
    navigate('/shiftMaster/view');
  };

  //#region NAVIGATE TO ADD SHIFT
  const handleAddShiftModal = useCallback(() => {
    navigate('/shiftMaster/add');
  }, [navigate]);
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: ShiftMasterData) => {
    setDeleteShiftMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  //#endregion

  //#region TABLE COLUMNS
  const ShiftMasterColumns = useMemo<TableColumn[]>(() => [
    {
      key: 'ShiftName',
      label: 'Shift Name',
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
      key: 'ShiftCode',
      label: 'Shift Code',
      width: '15',
      sortable: false,
      align: 'center',
      render: (value) => value || '-'
    },

    {
      key: 'ShiftBeginTime',
      label: 'Shift Begin Time',
      width: '15',
      sortable: false,
      align: 'center',
      render: (value) => value || '-'
    },

    {
      key: 'ShiftEndTime',
      label: 'Shift End Time',
      width: '15',
      sortable: false,
      align: 'center',
      render: (value) => value || '-'
    },

    {
      key: 'ShiftDurationTime',
      label: 'Shift Duration Time',
      width: '12',
      sortable: false,
      align: 'center',
      render: (value) => value || '-'
    },

    {
      key: 'ShiftWorkDurationTime',
      label: 'Shift Work Duration Time',
      width: '12',
      sortable: false,
      align: 'center',
      render: (value) => value || '-'
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
              title="Delete Shift"
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
  const requiredShiftColumnKeys: string[] = ['ShiftName'];

  const allShiftColumnKeys: string[] = ShiftMasterColumns.map(c => c.key);

  const [selectedShiftColumnKeys, setSelectedShiftColumnKeys] = useState<string[]>(() => {
    try {

      const saved = LocalStorageHelper.getShiftMasterTableColumns?.();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(new Set([...parsed, ...requiredShiftColumnKeys]));

        // Filter out any keys that no longer exist
        return withRequired.filter(k => allShiftColumnKeys.includes(k));
      }
    } catch { }
    return allShiftColumnKeys;
  });

  useEffect(() => {
    setSelectedShiftColumnKeys(prev => Array.from(new Set([...prev, ...requiredShiftColumnKeys])).filter(k => allShiftColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ShiftMasterColumns.length])

  const visibleShiftColumns = useMemo(
    () => ShiftMasterColumns.filter(col => selectedShiftColumnKeys.includes(col.key)),
    [ShiftMasterColumns, selectedShiftColumnKeys]
  );
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    updateListState({ filters: tempFilters, page: 1 });
    loadShifts(1, tempFilters);
    setShowFilterPopup(false);
  };
  //#endregion

  //#region Clear
  const clearFilters = () => {
    setTempFilters({});
    updateListState({ filters: {}, page: 1 });
    loadShifts(1, {});
    setShowFilterPopup(false);
  };
  //#endregion

  //#region HANDLE FILTER CHNAGE
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  }
  //#endregion

  //#region DELETE SHIFT MASTER
  const handleDeleteShiftMaster = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteShiftMasterDetailsData) return;

    await runApiWithLoader(

      setIsLoading,

      setLoadingMessage,
      async () => {
        const params: DeleteShiftMasterRequest = {

          ShiftManagementMasterId: deleteShiftMasterDetailsData.ShiftManagementMasterId || 0,

          UniqueKey: deleteShiftMasterDetailsData.Uniquekey || ""
        };

        const response = await shiftMasterService.apiCallDeleteShiftMaster(params);

        if (E.isRight(response)) {

          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          }

          else if (ShiftMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }
          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          await loadShifts(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteShiftMasterDetailsData(null);

        } else {

          addToast({ type: 'error', title: response.left.message });

          setIsConfirmationDialogBoxOpen(false);

        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Deleting Shift"
    );
  };
  return (


    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* LOADER */}

      <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

      {/* ============================================================================
          COMBINED SEARCH BAR, FILTER IMPORT , EXPORT ROW
           ============================================================================ */}

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Shift Name"
        onSearchChange={v => {
          updateListState({ searchTerm: v });
          debouncedSearch(v);
        }}
        onClearSearch={clearSearchShifts}
        isShowFilterButton
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters);
          setShowFilterPopup(true);
        }}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeShiftColumnsModal(true)}

        // ADD
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddShiftModal}


        // EXPORT
        isShowExportButton={canExport && ShiftsForTable.length > 0}
        onExportExcel={handleExportShiftExcel}
        onExportPdf={handleExportShiftPdf}
        exportLoading={isLoading}
      />

      {/* DATA TABLE SHIFT*/}

      <DataTable
        data={ShiftsForTable}
        columns={visibleShiftColumns}
        pagination={ShiftPaginationInfo}
        emptyMessage="No Shift Data Found"
        fixedHeight
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
      />

      {/* CUSTOMIZE COLUMNS MODAL */}

      <CustomizeColumnsModal
        isOpen={isShowCustomizeShiftColumnsModal}
        onClose={() => setIsShowCustomizeShiftColumnsModal(false)}
        onApply={keys => {
          const withRequired = Array.from(

            new Set([...keys, ...requiredShiftColumnKeys])
          );
          setSelectedShiftColumnKeys(withRequired);

          try {
            LocalStorageHelper.storeShiftMasterTableColumns?.(

              JSON.stringify(withRequired)
            );
          } catch { }
        }}
        columns={ShiftMasterColumns}
        selectedKeys={selectedShiftColumnKeys}
        requiredKeys={requiredShiftColumnKeys}
        title="Customize Table Columns"
      />

      {/* FILTER SHIFT MODAL */}
      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Shift Master"
        onSubmit={e => {
          e.preventDefault();
          applyFilters();
        }}
        saveText="Apply"
        cancelText="Clear"
        onCancel={() => clearFilters()}
       
        size="small-half"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <Input type="text"
              label='Shift Name'
              value={tempFilters?.ShiftName ?? ''}
              onChange={e => handleFilterChange('ShiftName', e.target.value)}
              placeholder="Enter Shift Name" />
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION  SHIFT MODAL */}
      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => setIsConfirmationDialogBoxOpen(false)}
        onConfirm={handleDeleteShiftMaster}
        loading={isLoading}
        pageName='shift'
      />

    </div>
  );
};

export default ShiftMaster;
