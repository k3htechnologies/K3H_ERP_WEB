import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  WeekOffMasterData,
  FilterWithPaginationWeekOffMasterRequest,
} from '@/features/weekOffMaster/models/WeekOffMasterModel'

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
import { WeekOffMasterService } from '../services/WeekOffMasterService';
import { updateFilter } from '@/core/utils/filterHelper';


export const WeekOffOffMasterMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [WeekOffOffMasterList, setWeekOffOffMasterList] = useState<WeekOffMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  // USE NAVIGATE
  const navigate = useNavigate();

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const { toasts, removeToast, addToast } = useToast();

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchWeekOff(value)
  }, 350);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeWeekOffColumnsModal, setIsShowCustomizeWeekOffOffColumnsModal] = useState(false);

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
      loadWeekOff(listState.page ?? 1, { WeekOffOffName: String(listState.searchTerm).trim() });
      return;
    }

    loadWeekOff(listState.page ?? 1, listState.filters ?? {});
  }, [location.state]);

  //#region CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchWeekOffMasterList = async (page: number = pagination.currentPage) => {
    return await loadWeekOff(page, filters);
  }

  const loadWeekOff = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;

        if (sortInfo) {

          const column = WeekOffMasterColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }
        const params: FilterWithPaginationWeekOffMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          WeekOffPolicyMasterId: filterParams.WeekOffPolicyMasterId ? Number(filterParams.WeekOffPolicyMasterId) : undefined,
          WeekOffPolicyName: filterParams.WeekOffPolicyName?.trim() || undefined,
          SortBy: sortByParam
        };

        const response = await WeekOffMasterService.apiCallPullWeekOffMaster(params);

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
      'Loading WeekOff Data'
    );
  };
  //#endregion

  //#region SEARCH & CLEAR
  const searchWeekOff = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchWeekOffMasterList();

      return
    }

    const filterParams: FilterInfo = {
      searchValueWeekOffPolicyName: searchValue.trim(),
    };

    await loadWeekOff(1, filterParams);
  };

  //#endregion

  //#region CLEAR WEEK OFF MASTER 
  const clearSearchWeekOff = () => {
    setSearchTerm('');

    debouncedSearch.cancel?.();

    setFilters({});
    setTempFilters({});
    setPagination({ currentPage: 1 });
    loadWeekOff(1, {});
    try {
      navigate(location.pathname, { replace: true, state: {} });
    } catch {
    }
  };
  //#endregion

  //#region EXPORT / IMPORT EXCEL AND PDF
  const handleExportWeekOffs = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined

        if (sortInfo) {

          const column = WeekOffMasterColumns.find(col => col.key === sortInfo.column);

          if (column) {

            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }
        const params: FilterWithPaginationWeekOffMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          WeekOffPolicyName: filters.WeekOffPolicyName?.trim() || undefined,
          SortBy: sortByParam,
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

    return await WeekOffMasterService.apiCallPullWeekOffMaster(filterParams);
  }
  //#endregion


  //#region HANDLE PAGE CHNAGE EVENT
  const handlePageChange = useCallback((page: number) => {
    fetchWeekOffMasterList(page);
  }, []);

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchWeekOffMasterList(1);

  }, []);
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

  //#region NAVIGATE TO  VIEW WEEK OFF
  const handleNavigateToView = (row: WeekOffMasterData) => {
    navigate('/WeekOffMaster/view', {
      state: {
        WeekOffData: row,
        listState: {
          page: pagination.currentPage,
          filters,
          sortInfo,
          searchTerm
        }
      }
    });
  };

  //#region NAVIGATE TO ADD WEEK OFF
  const handleAddWeekOffModal = useCallback(() => {
    navigate('/WeekOffMaster/add', {
      state: {
        fromList: true,
        listState: { page: pagination.currentPage, filters, sortInfo, searchTerm }
      }
    });
  }, [navigate, pagination.currentPage, filters, sortInfo, searchTerm]);

  //#endregion

  //#region TABLE COLUMNS
  const WeekOffMasterColumns = useMemo<TableColumn[]>(() => [
    {
      key: 'WeekOffPolicyName',
      label: 'WeekOff Name',
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
      key: 'WeekOffPolicyCode',
      label: 'WeekOff Code',
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
      key: 'WeekDays',
      label: 'Week Days',
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
      key: 'WeekDaysStartsOn',
      label: 'Week Days Starts On',
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
      key: 'WeeklyOff',
      label: 'Weekly Off',
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
      key: 'WeeklyOff2',
      label: 'Weekly Off2',
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
      key: 'WeeklyOff2Type',
      label: 'Weekly Off2 Type',
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
      key: 'NotApplicableForMonths',
      label: 'Not Applicable For Months',
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
  ], [handleNavigateToView]);

  //#endregion

  //#region COLUMN CUSTOMIZATION
  const requiredWeekOffColumnKeys: string[] = ['WeekOffName'];

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
    setFilters(tempFilters);
    loadWeekOff(1, tempFilters);
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
    loadWeekOff(1, {});

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
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>
        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder="Search By WeekOff Name"
          onSearchChange={v => {
            setSearchTerm(v);
            debouncedSearch(v);
          }}
          onClearSearch={clearSearchWeekOff}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters);
            setShowFilterPopup(true);
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeWeekOffOffColumnsModal(true)}

          // ADD
          isShowAddButton={canAction}
          addTitle="Add WeekOff"
          onAdd={handleAddWeekOffModal}


          // EXPORT
          isShowExportButton={canExport}
          onExportExcel={handleExportWeekOffExcel}
          onExportPdf={handleExportWeekOffPdf}
          exportLoading={isLoading}
        />

        {/* DATA TABLE WeekOff*/}

        <DataTable
          data={WeekOffsForTable}
          columns={visibleWeekOffColumns}
          pagination={WeekOffPaginationInfo}
          emptyMessage="No WeekOff found"
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

        {/* FILTER MODAL */}

        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - WeekOff Master"
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
                label='WeekOff Name'
                value={tempFilters?.WeekOffPolicyName ?? ''}
                onChange={e => handleFilterChange('WeekOffPolicyName', e.target.value)}
                placeholder="Enter WeekOff name" />
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default WeekOffOffMasterMaster;
