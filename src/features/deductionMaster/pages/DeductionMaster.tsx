import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  DeductionMasterData,
  FilterWithPaginationDeductionMasterRequest
} from '@/features/deductionMaster/models/DeductionMasterModel';
import { DeductionMasterService } from '@/features/deductionMaster/services/DeductionMasterService'
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
import { updateFilter } from '@/core/utils/filterHelper';


export const DeductionMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [DeductionMasterList, setDeductionMasterList] = useState<DeductionMasterData[]>([]);
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
    searchDeductions(value)
  }, 350);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeDeductionColumnsModal, setIsShowCustomizeDeductionColumnsModal] = useState(false);

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
      loadDeductions(listState.page ?? 1, { Name: String(listState.searchTerm).trim() });
      return;
    }

    loadDeductions(listState.page ?? 1, listState.filters ?? {});
  }, [location.state]);

  //#region CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchDeductionMasterList = async (page: number = pagination.currentPage) => {
    return await loadDeductions(page, filters);
  }

  const loadDeductions = async (page: number, filterParam: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;

        if (sortInfo) {

          const column = DeductionMasterColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const params: FilterWithPaginationDeductionMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          DeductionMasterId: 0,
          Name: '',
          SortBy: sortByParam
        };

        const response = await DeductionMasterService.apiCallPullDeductionMaster(params);
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

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchDeductionMasterList();

      return
    }

    const filterParams: FilterInfo = {
      Name: searchValue.trim(),
    };

    await loadDeductions(1, filterParams);
  };

  //#endregion

  //#region CLEAR DEDUCTION MASTER 
  const clearSearchDeductions = () => {
    setSearchTerm('');

    debouncedSearch.cancel?.();

    setFilters({});
    setTempFilters({});
    setPagination({ currentPage: 1 });
    loadDeductions(1, {});
    try {
      navigate(location.pathname, { replace: true, state: {} });
    } catch {
    }
  };
  //#endregion

  //#region EXPORT / IMPORT EXCEL AND PDF
  const handleExportDeductions = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined
        if (sortInfo) {
          const column = DeductionMasterColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }
        const params: FilterWithPaginationDeductionMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          Name: filters.Name?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        };

        const response = await getDeductions(params);

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


  //#region API | SERVICES CALL TO GET DEDUCTION
  const getDeductions = async (filterParams: FilterWithPaginationDeductionMasterRequest) => {

    return await DeductionMasterService.apiCallPullDeductionMaster(filterParams);
  }
  //#endregion


  //#region HANDLE PAGE CHNAGE EVENT
  const handlePageChange = useCallback((page: number) => {

    fetchDeductionMasterList(page);
  }, []);

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchDeductionMasterList(1);

  }, []);
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
    navigate('/deductionMaster/view', {
      state: {
        deductionData: row,
        listState: {
          page: pagination.currentPage,
          filters,
          sortInfo,
          searchTerm
        }
      }
    });
  };

  //#region NAVIGATE TO ADD DEDUCTION
  const handleAddDeductionModal = useCallback(() => {
    navigate('/deductionMaster/add', {
      state: {
        fromList: true,
        listState: { page: pagination.currentPage, filters, sortInfo, searchTerm }
      }
    });
  }, [navigate, pagination.currentPage, filters, sortInfo, searchTerm]);

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
          text={value || 'N/A'}
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
      key: 'Value',
      label: 'Deduction Value',
      width: '15',
      sortable: false,
      align: 'center',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value || 0}
        </span>
      )
    },
    {
      key: 'BranchName',
      label: 'Branch Name',
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
      key: 'MinSalary',
      label: 'Min Salary',
      width: '12',
      sortable: false,
      align: 'left',
      render: (value) =>
        value ? `₹${value.toLocaleString('en-IN')}` : 'N/A'
    },

    {
      key: 'MaxSalary',
      label: 'Max Salary',
      width: '12',
      sortable: false,
      align: 'left',
      render: (value) =>
        value ? `₹${value.toLocaleString('en-IN')}` : 'N/A'
    },

    {
      key: 'Gender',
      label: 'Gender',
      width: '10',
      sortable: false,
      align: 'center',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'StateName',
      label: 'State Name',
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
  ], [handleNavigateToView]);
  //#endregion

  //#region COLUMN CUSTOMIZATION
  const requiredDeductionColumnKeys: string[] = ['Name'];

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
    setFilters(tempFilters);
    loadDeductions(1, tempFilters);
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
    loadDeductions(1, {});

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

        {/* ============================================================================
          COMBINED SEARCH BAR, FILTER IMPORT , EXPORT ROW
           ============================================================================ */}

        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder="Search By Deduction Name"
          onSearchChange={v => {
            setSearchTerm(v);
            debouncedSearch(v);
          }}
          onClearSearch={clearSearchDeductions}
          isShowFilterButton
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
          isShowExportButton={canExport}
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
          saveText="Apply Filter"
          cancelText="Clear Filter"
          onCancel={() => clearFilters()}
          resetText=''
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
      </div>
  );
};

export default DeductionMaster;
