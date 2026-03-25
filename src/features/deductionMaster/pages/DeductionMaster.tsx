import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  DeductionMasterData,
  DeleteDeductionMasterRequest,
  FilterWithPaginationDeductionMasterRequest
} from '@/features/deductionMaster/models/DeductionMasterModel';
import { deductionMasterService } from '@/features/deductionMaster/services/DeductionMasterService'
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
import { useDeductionMasterListState } from '@/features/deductionMaster/context/DeductionMasterListStateContext';
import { updateFilter } from '@/core/utils/filterHelper';
import { Trash2 } from 'lucide-react';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';


export const DeductionMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [DeductionMasterList, setDeductionMasterList] = useState<DeductionMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // USE NAVIGATE
  const navigate = useNavigate();
  const { listState, updateListState } = useDeductionMasterListState();
  const { searchTerm, filters, sortInfo } = listState;

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  // TOAST
  const { addToast } = useToast();

  // SINGLE SEARCH TEXT BOX
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchDeductions(value)
  }, 350);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //DELETE DEDUCTION MASTER
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deleteDeductionMasterData, setDeleteDeductionMasterData] = useState<DeductionMasterData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeDeductionColumnsModal, setIsShowCustomizeDeductionColumnsModal] = useState(false);

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#endregion

  //#region INIT
  useEffect(() => {
    // Sync pagination with context state
    setPagination({ currentPage: listState.page });

    // Load deductions with current context state
    if (listState.searchTerm && String(listState.searchTerm).trim()) {
      loadDeductions(listState.page, { Name: String(listState.searchTerm).trim() }, listState.sortInfo);
    } else {
      loadDeductions(listState.page, listState.filters, listState.sortInfo);
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

  const fetchDeductionMasterList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadDeductions(page, filters, sort);
  }

  const loadDeductions = async (page: number, filterParam: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationDeductionMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          DeductionMasterId: 0,
          Name: searchtext ?? filterParam.Name ?? undefined,
          SortBy: getSortByParam(sortInfo ?? null, DeductionMasterColumns)
        };

        const response = await deductionMasterService.apiCallPullDeductionMaster(params);
        if (E.isRight(response)) {

          setDeductionMasterList(response.right.Data);

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
      'Loading Deduction Data'
    );
  };
  //#endregion

  //#region SEARCH & CLEAR
  const searchDeductions = async (searchValue: string) => {
    updateListState({ searchTerm: searchValue });

    if (searchValue.trim() === '') {
      fetchDeductionMasterList();
      return
    }

    updateListState({ filters, page: 1, searchTerm: searchValue });
    await loadDeductions(1, filters, sortInfo, searchValue);
  };

  //#endregion

  //#region CLEAR DEDUCTION MASTER 
  const clearSearchDeductions = () => {
    updateListState({ searchTerm: '', filters: {}, page: 1 });

    debouncedSearch.cancel?.();

    setTempFilters({});
    setPagination({ currentPage: 1 });
    loadDeductions(1, { Name: '' }, sortInfo, undefined);
  };
  //#endregion

  //#region EXPORT / IMPORT EXCEL AND PDF
  const handleExportDeductions = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(

      setIsLoading,

      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationDeductionMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          Name: filters.Name?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, DeductionMasterColumns),
          ExportType: exportType
        };

        const response = await deductionMasterService.apiCallPullDeductionMaster(params);

        handleExportFile(response, exportType, 'Deduction Master', addToast);

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
      undefined,
      'Preparing Export'
    );
  };

  const handleExportDeductionExcel = () => handleExportDeductions('Excel')
  const handleExportDeductionPdf = () => handleExportDeductions('PDF')
  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT
  const handlePageChange = useCallback((page: number) => {
    updateListState({ page });
    fetchDeductionMasterList(page);
  }, [updateListState]);

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {
    updateListState({ sortInfo: sort, page: 1 });
    loadDeductions(1, filters, sort, searchTerm || undefined);
  }, [filters, updateListState, searchTerm]);
  //#endregion

  //#region TABLE PAGINATION INFO
  const DeductionPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination, handlePageChange]
  );

  const DeductionsForTable = useMemo(() => DeductionMasterList, [DeductionMasterList]);
  //#endregion

  //#region NAVIGATE TO  VIEW DEDUCTION
  const handleNavigateToView = (row: DeductionMasterData) => {
    updateListState({ deductionMasterId: row.DeductionMasterId, deductionName: row.Name });
    navigate('/deductionMaster/view');
  };

  //#region NAVIGATE TO ADD DEDUCTION
  const handleAddDeductionModal = useCallback(() => {
    navigate('/deductionMaster/add');
  }, [navigate]);

  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: DeductionMasterData) => {
    setDeleteDeductionMasterData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  //#endregion

  //#region TABLE COLUMNS
  const DeductionMasterColumns = useMemo<TableColumn[]>(() => [
    {
      key: 'Name',
      label: 'Deduction Name',
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
      key: 'Type',
      label: 'Deduction Type',
      width: '15',
      sortable: false,
      align: 'left',
      render: (value) => value || ''
    },
    {
      key: 'Applicable',
      label: 'Applicable',
      width: '15',
      sortable: false,
      align: 'left',
      render: (value) => value || ''
    },
    {
      key: 'Value',
      label: 'Deduction Value',
      width: '15',
      sortable: false,
      align: 'right',
      render: (value) => value || '0'
    },
    {
      key: 'MinSalary',
      label: 'Min Salary (₹)',
      width: '12',
      sortable: false,
      align: 'right',
      render: (value) => value ? `₹ ${value}` : '0'
    },

    {
      key: 'MaxSalary',
      label: 'Max Salary (₹)',
      width: '12',
      sortable: false,
      align: 'right',
      render: (value) => value ? `₹ ${value}` : '0'
    },

    {
      key: 'Gender',
      label: 'Gender',
      width: '10',
      sortable: false,
      align: 'left',
      render: (value) => value || ''
    },
    {
      key: 'BranchName',
      label: 'Branch Name',
      width: '12',
      sortable: false,
      align: 'left',
      render: (value) => value || ''
    },
    {
      key: 'StateName',
      label: 'State Name',
      width: '12',
      sortable: false,
      align: 'left',
      render: (value) => value || ''
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
              title="Delete Deduction"
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
  const requiredDeductionColumnKeys: string[] = ['Name','Actions'];

  const allDeductionColumnKeys: string[] = DeductionMasterColumns.map(c => c.key);

  const [selectedDeductionColumnKeys, setSelectedDeductionColumnKeys] = useState<string[]>(() => {
    try {

      const saved = LocalStorageHelper.getDeductionMasterTableColumns?.();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(new Set([...parsed, ...requiredDeductionColumnKeys]));

        // Filter out any keys that no longer exist
        return withRequired.filter(k => allDeductionColumnKeys.includes(k));
      }
    } catch { }
    return allDeductionColumnKeys;
  });

  useEffect(() => {
    setSelectedDeductionColumnKeys(prev => Array.from(new Set([...prev, ...requiredDeductionColumnKeys])).filter(k => allDeductionColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DeductionMasterColumns.length])

  const visibleDeductionColumns = useMemo(
    () => DeductionMasterColumns.filter(col => selectedDeductionColumnKeys.includes(col.key)),
    [DeductionMasterColumns, selectedDeductionColumnKeys]
  );
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setTempFilters(tempFilters);
    loadDeductions(1, tempFilters);
    setShowFilterPopup(false);
  };
  //#endregion

  //#region Clear
  const clearFilters = () => {
    setTempFilters({});

    // reset page
    setPagination({ currentPage: 1 });

    // load empty filters
    loadDeductions(1, {});

    navigate(location.pathname, { replace: true, state: {} });

  };
  //#endregion

  //#region HANDLE FILTER CHNAGE
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  }
  //#endregion

  //#region DELETE DEDUCTION MASTER
  const handleDeleteDeductionMaster = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteDeductionMasterData) return;

    await runApiWithLoader(

      setIsLoading,

      setLoadingMessage,
      async () => {
        const params: DeleteDeductionMasterRequest = {

          DeductionMasterId: deleteDeductionMasterData.DeductionMasterId || 0,

          UniqueKey: deleteDeductionMasterData.Uniquekey || ""
        };

        const response = await deductionMasterService.apiCallDeleteDeductionMaster(params);

        if (E.isRight(response)) {

          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          }

          else if (DeductionMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }
          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          await loadDeductions(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteDeductionMasterData(null);

        } else {

          addToast({ type: 'error', title: response.left.message });

          setIsConfirmationDialogBoxOpen(false);

        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Deleting Deduction"
    );
  };

  return (


    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

      {/* ============================================================================
          COMBINED SEARCH BAR, FILTER IMPORT , EXPORT ROW
           ============================================================================ */}

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Deduction Name"
        onSearchChange={v => {
          updateListState({ searchTerm: v });
          debouncedSearch(v);
        }}
        onClearSearch={clearSearchDeductions}
        isShowFilterButton={false}
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters);
          setShowFilterPopup(true);
        }}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeDeductionColumnsModal(true)}

        // ADD
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddDeductionModal}


        // EXPORT
        isShowExportButton={canExport && DeductionsForTable.length > 0}
        onExportExcel={handleExportDeductionExcel}
        onExportPdf={handleExportDeductionPdf}
        exportLoading={isLoading}
      />

      {/* DATA TABLE DEDUCTION*/}

      <DataTable
        data={DeductionsForTable}
        columns={visibleDeductionColumns}
        pagination={DeductionPaginationInfo}
        emptyMessage="No Deduction found"
        fixedHeight
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
      />

      {/* CUSTOMIZE COLUMNS MODAL */}

      <CustomizeColumnsModal
        isOpen={isShowCustomizeDeductionColumnsModal}
        onClose={() => setIsShowCustomizeDeductionColumnsModal(false)}
        onApply={keys => {
          const withRequired = Array.from(

            new Set([...keys, ...requiredDeductionColumnKeys])
          );
          setSelectedDeductionColumnKeys(withRequired);

          try {
            LocalStorageHelper.storeDeductionMasterTableColumns?.(

              JSON.stringify(withRequired)
            );
          } catch { }
        }}
        columns={DeductionMasterColumns}
        selectedKeys={selectedDeductionColumnKeys}
        requiredKeys={requiredDeductionColumnKeys}
        title="Customize Table Columns"
      />

      {/* FILTER  DEDUCTION MODAL  */}
      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Deduction Master"
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
              label='Deduction Name'
              value={tempFilters?.Name ?? ''}
              onChange={e => handleFilterChange('Name', e.target.value)}
              placeholder="Enter Deduction Name" />
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION  DEDUCTION MODAL */}

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => setIsConfirmationDialogBoxOpen(false)}
        onConfirm={handleDeleteDeductionMaster}
        loading={isLoading}
        pageName='Deduction'
      />

    </div>
  );
};

export default DeductionMaster;
