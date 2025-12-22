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

import { ShiftMasterService } from '@/features/shiftMaster/services/ShiftMasterService'
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
import { useLocation, useNavigate } from 'react-router-dom';
import { updateFilter } from '@/core/utils/filterHelper';
import { Trash2 } from 'lucide-react';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';

export const ShiftMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [ShiftMasterList, setShiftMasterList] = useState<ShiftMasterData[]>([]);
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
    searchShifts(value)
  }, 350);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //DELETE SHIFT MASTER
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deleteShiftMasterDetailsData, setDeleteShiftMasterDetailsData] = useState<ShiftMasterData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeShiftColumnsModal, setIsShowCustomizeShiftColumnsModal] = useState(false);

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  const location = useLocation() as any;

  //#endregion

  //#region INIT
  useEffect(() => {
    const incoming = location.state?.listState;
    const listState = incoming ?? {
      page: 1,
      filters: {} as FilterInfo,
      sortInfo: undefined,
      searchTerm: ''
    };

    setPagination({ currentPage: listState.page ?? pagination.currentPage });

    setSortInfo(listState.sortInfo);

    setFilters(listState.filters ?? {});

    setTempFilters(listState.filters ?? {});

    setSearchTerm(listState.searchTerm ?? '');

    if (listState.searchTerm && String(listState.searchTerm).trim()) {
      loadShifts(listState.page ?? 1, { ShiftName: String(listState.searchTerm).trim() });
      return;
    }

    loadShifts(listState.page ?? 1, listState.filters ?? {});
  }, [location.state]);

  //#region CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchShiftMasterList = async (page: number = pagination.currentPage) => {
    return await loadShifts(page, filters);
  }

  const loadShifts = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;

        if (sortInfo) {

          const column = ShiftMasterColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }
        const params: FilterWithPaginationShiftMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          ShiftManagementMasterId: filterParams.ShiftManagementMasterId ? Number(filterParams.ShiftManagementMasterId) : undefined,
          ShiftName: filterParams.ShiftName?.trim() || undefined,
          SortBy: sortByParam
        };

        const response = await ShiftMasterService.apiCallPullShiftMaster(params);
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

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchShiftMasterList();

      return
    }

    const filterParams: FilterInfo = {
      ShiftName: searchValue.trim(),
    };

    await loadShifts(1, filterParams);
  };

  //#endregion

  //#region CLEAR SHIFT MASTER 
  const clearSearchShifts = () => {
    setSearchTerm('');

    debouncedSearch.cancel?.();

    setFilters({});
    setTempFilters({});
    setPagination({ currentPage: 1 });
    loadShifts(1, {});
    try {
      navigate(location.pathname, {
        replace: true,
        state: {}
      });
    } catch {
    }
  };
  //#endregion

  //#region EXPORT / IMPORT EXCEL AND PDF
  const handleExportShifts = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined
        if (sortInfo) {
          const column = ShiftMasterColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }
        const params: FilterWithPaginationShiftMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          ShiftName: filters.ShiftName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        };

        const response = await getShifts(params);

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


  //#region API | SERVICES CALL TO GET SHIFT
  const getShifts = async (filterParams: FilterWithPaginationShiftMasterRequest) => {

    return await ShiftMasterService.apiCallPullShiftMaster(filterParams);
  }
  //#endregion


  //#region HANDLE PAGE CHNAGE EVENT
  const handlePageChange = useCallback((page: number) => {

    fetchShiftMasterList(page);
  }, []);

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchShiftMasterList(1);

  }, []);
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
    navigate('/shiftMaster/view', {
      state: {
        ShiftData: row,
        listState: {
          page: pagination.currentPage,
          filters,
          sortInfo,
          searchTerm
        }
      }
    });
  };

  //#region NAVIGATE TO ADD SHIFT
  const handleAddShiftModal = useCallback(() => {
    navigate('/shiftMaster/add', {
      state: {
        fromList: true,
        listState: { page: pagination.currentPage, filters, sortInfo, searchTerm }
      }
    });
  }, [navigate, pagination.currentPage, filters, sortInfo, searchTerm]);
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
          text={value || 'N/A'}
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
      render: (value) => (
        <TooltipText
          text={value || 'N/A'}
          maxWidth="150px"
          tooltipThreshold={15}
        />
      )
    },

    {
      key: 'ShiftBeginTime',
      label: 'Shift Begin Time',
      width: '15',
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
      key: 'ShiftEndTime',
      label: 'Shift End Time',
      width: '15',
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
      key: 'ShiftDurationTime',
      label: 'Shift Duration Time',
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
      key: 'ShiftWorkDurationTime',
      label: 'Shift Work Duration Time',
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
    setFilters(tempFilters);
    loadShifts(1, tempFilters);
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
    loadShifts(1, {});

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

  //#region DELETE SHIFT MASTER
  const handleDeleteShiftMaster = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteShiftMasterDetailsData) return;

    await runApiWithLoader(

      setIsLoading,

      setIsLoadingMessage,
      async () => {
        const params: DeleteShiftMasterRequest = {

          ShiftManagementMasterId: deleteShiftMasterDetailsData.ShiftManagementMasterId || 0,

          UniqueKey: deleteShiftMasterDetailsData.Uniquekey || ""
        };

        const response = await ShiftMasterService.apiCallDeleteShiftMaster(params);

        if (E.isRight(response)) {

          setShiftMasterList(prevData => prevData.filter(item => item.ShiftManagementMasterId !== deleteShiftMasterDetailsData.ShiftManagementMasterId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });
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
          setSearchTerm(v);
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
        isShowExportButton={canExport}
        onExportExcel={handleExportShiftExcel}
        onExportPdf={handleExportShiftPdf}
        exportLoading={isLoading}
      />

      {/* DATA TABLE SHIFT*/}

      <DataTable
        data={ShiftsForTable}
        columns={visibleShiftColumns}
        pagination={ShiftPaginationInfo}
        emptyMessage="No Shift Found"
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
        saveText="Apply Filter"
        cancelText="Clear Filter"
        onCancel={() => clearFilters()}
        resetText=''
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
      <ConfirmationDialogBox
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => setIsConfirmationDialogBoxOpen(false)}
        onConfirm={handleDeleteShiftMaster}
        title="You are about to delete this Shift?"
        message="Deleting this Shift will permanently remove its data."
        confirmText="Delete"
        cancelText="Cancel"
        loading={isLoading}
        variant="danger"
      />

    </div>
  );
};

export default ShiftMaster;
