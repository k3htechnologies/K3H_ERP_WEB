import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  DeleteLeaveCreditDebitRequest,
  LeaveCreditDebitData,
  FilterWithPaginationLeaveCreditDebitRequest,
} from '@/features/leaveCreditDebit/models/leaveCreditDebit';

import { leaveCreditDebitService } from '@/features/leaveCreditDebit/services/LeaveCreditDebitService'
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { useLocation, type Location, useNavigate } from 'react-router-dom';
import { updateFilter } from '@/core/utils/filterHelper';

export const LeaveCreditDebit: React.FC = () => {

  //#region STATE
  const [leaveCreditDebitList, setLeaveCreditDebitList] = useState<LeaveCreditDebitData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const navigate = useNavigate();

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const { addToast } = useToast()

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('')

  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchLeaveCreditDebits(value)
  }, 350)


  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //DELETE LEAVE CREDIT DEBIT STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteLeaveCreditDebitDetailsData, setDeleteLeaveCreditDebitDetailsData] = useState<LeaveCreditDebitData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeLeaveCreditDebitColumnsModal, setIsShowCustomizeLeaveCreditDebitColumnsModal] = useState(false);

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region STATE CREATED PAGE AFTER NAVIGATE VIEW OR ADD UPDATE PAGE THEN CHECK

  const location = useLocation() as Location & {
    state?: {
      listState?: {
        page?: number;
        filters?: FilterInfo;
        sortInfo?: SortInfo;
        searchTerm?: string;
        leaveCreditDebitId?: number;
      };
    };
  };
  //#endregion

  //#region INIT

  useEffect(() => {

    const incoming = location.state?.listState as
      | { page?: number; filters?: FilterInfo; sortInfo?: SortInfo; searchTerm?: string; leaveCreditDebitId?: number }
      | undefined;

    const listState = incoming ?? { page: 1, filters: {} as FilterInfo, sortInfo: undefined, searchTerm: '', leaveCreditDebitId: 0 };


    setPagination({ currentPage: listState.page ?? pagination.currentPage });

    setSortInfo(listState.sortInfo);

    setFilters(listState.filters ?? {});

    setTempFilters(listState.filters ?? {});

    setSearchTerm(listState.searchTerm ?? '');

    if (listState.searchTerm && String(listState.searchTerm).trim()) {

      setSearchTerm(String(listState.searchTerm));

      loadLeaveCreditDebits(listState.page ?? 1, { DepartmentName: String(listState.searchTerm).trim() });

      return;
    }


    loadLeaveCreditDebits(listState.page ?? 1, listState.filters ?? {});

  }, [location.state]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion

  //#region DATA LOAD
  const fetchLeaveCreditDebitList = async (page: number = pagination.currentPage) => {
    return await loadLeaveCreditDebits(page, filters);
  }

  const loadLeaveCreditDebits = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        let sortByParam = undefined;
        if (sortInfo) {
          const column = leaveCreditDebitColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationLeaveCreditDebitRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          LeaveCreditDebitId: filterParams.LeaveCreditDebitId ? Number(filterParams.LeaveCreditDebitId) : 0,
          LeavePeriodMode: filterParams.LeavePeriodMode?.trim() || undefined,
          FYyear: filterParams.FYyear ? Number(filterParams.FYyear) : undefined,
          Month: filterParams.Month?.trim() || undefined,
          DepartmentName: filterParams.DepartmentName?.trim() || undefined,
          DesignationName: filterParams.DesignationName?.trim() || undefined,
          SortBy: sortByParam
        }

        const response = await getLeaveCreditDebits(params);

        if (E.isRight(response)) {

          setLeaveCreditDebitList(response.right.Data);

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
      'Loading Leave Credit Debit'
    )
  }

  //#endregion

  //#region SERACH LEAVE CREDIT DEBIT
  const searchLeaveCreditDebits = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchLeaveCreditDebitList();
      return;
    }

    const filterParams: FilterInfo = {
      DepartmentName: searchValue.trim()
    };

    await loadLeaveCreditDebits(1, filterParams);
  }
  //#endregion

  //#region CLAER SERACH LEAVE CREDIT DEBIT
  const clearsearchLeaveCreditDebits = () => {
    setSearchTerm('');

    debouncedSearch.cancel?.();

    setFilters({});
    setTempFilters({});
    setPagination({ currentPage: 1 });
    loadLeaveCreditDebits(1, {});
    try {
      navigate(location.pathname, { replace: true, state: {} });
    } catch {
    }
  };

  //#endregion

  //#region EXCEL EXPORT PDF | EXCEL
  const handleExportLeaveCreditDebits = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined
        if (sortInfo) {
          const column = leaveCreditDebitColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationLeaveCreditDebitRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          LeavePeriodMode: filters.LeavePeriodMode?.trim() || undefined,
          FYyear: filters.FYyear ? Number(filters.FYyear) : undefined,
          Month: filters.Month?.trim() || undefined,
          DepartmentName: filters.DepartmentName?.trim() || undefined,
          DesignationName: filters.DesignationName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }
        const response = await getLeaveCreditDebits(params);
        handleExportFile(response, exportType, 'Leave Credit Debit', addToast)
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

  const handleExportLeaveCreditDebitExcel = () => handleExportLeaveCreditDebits('Excel')
  const handleExportLeaveCreditDebitPdf = () => handleExportLeaveCreditDebits('PDF')
  //#endregion

  //#region GET LEAVE CREDIT DEBIT DATA FROM API
  const getLeaveCreditDebits = async (filterParams: FilterWithPaginationLeaveCreditDebitRequest) => {
    return await leaveCreditDebitService.apiCallPullLeaveCreditDebit(filterParams);
  }
  //#endregion

  //#region TABLE CONFIG

  const handlePageChange = useCallback((page: number) => {
    fetchLeaveCreditDebitList(page);
  }, []);

  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    fetchLeaveCreditDebitList(1);
  }, []);

  const leaveCreditDebitPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const leaveCreditDebitListForTable = useMemo(() => leaveCreditDebitList, [leaveCreditDebitList]);

  //#endregion

  //#region VIEW LEAVE CREDIT DEBIT DETAILS
  const handleViewLeaveCreditDebitDetails = useCallback((row: LeaveCreditDebitData) => {
    navigate('/leaveCreditDebit/view', {
      state: {
        editLeaveCreditDebitData: row,
        fromList: true,
        listState: {
          page: pagination.currentPage,
          filters,
          sortInfo,
          searchTerm,
          leaveCreditDebitId: row.LeaveCreditDebitId,
        },
      },
    });
  }, [navigate, pagination.currentPage, filters, sortInfo, searchTerm]);
  //#endregion

  //#region TABLE COLUMN

  const leaveCreditDebitColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'DepartmentName',
        label: 'Department',
        width: '20',
        sortable: false,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <TooltipText
            text={value || '-'}
            maxWidth="250px"
            tooltipThreshold={30}
            onClick={() => handleViewLeaveCreditDebitDetails(row)}
          />
        )
      },
      {
        key: 'DesignationName',
        label: 'Designation',
        width: '20',
        sortable: false,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || '-'}
            maxWidth="250px"
            tooltipThreshold={30}
          />
        )
      },
      {
        key: 'LeavePeriodMode',
        label: 'Period Mode',
        width: '10',
        sortable: true,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'FYyear',
        label: 'Financial Year',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'Month',
        label: 'Month',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      }
    ],
    [canAction, handleViewLeaveCreditDebitDetails]
  )

  //#endregion

  //#region CUSTOMIZE COLUMNS

  const requiredLeaveCreditDebitColumnKeys: string[] = ['DepartmentMasterId'];

  const [selectedLeaveCreditDebitColumnKeys, setSelectedLeaveCreditDebitColumnKeys] = useState<string[]>([]);

  useEffect(() => {

    if (leaveCreditDebitColumns.length === 0) return;

    try {
      const saved = localStorage.getItem('leaveCreditDebitTableColumns');
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        const filtered = parsed.filter(k =>
          leaveCreditDebitColumns.some(col => col.key === k)
        );
        const final = Array.from(
          new Set([
            ...filtered,
            ...requiredLeaveCreditDebitColumnKeys,
          ])
        );
        setSelectedLeaveCreditDebitColumnKeys(final);
        return;
      }
    } catch { }

    const allKeys = leaveCreditDebitColumns.map(c => c.key);
    const final = Array.from(
      new Set([...allKeys, ...requiredLeaveCreditDebitColumnKeys])
    );
    setSelectedLeaveCreditDebitColumnKeys(final);
  }, [leaveCreditDebitColumns]);

  const visibleLeaveCreditDebitColumns = useMemo(
    () => leaveCreditDebitColumns.filter(col =>
      selectedLeaveCreditDebitColumnKeys.includes(col.key)
    ),
    [leaveCreditDebitColumns, selectedLeaveCreditDebitColumnKeys]
  );

  //#endregion

  //#region FILTER HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadLeaveCreditDebits(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({});
    setFilters({});

    // reset page
    setPagination({ currentPage: 1 });

    // load empty filters
    loadLeaveCreditDebits(1, {});

    setShowFilterPopup(false);

    // clear router state (very important)
    navigate(location.pathname, { replace: true, state: {} });
  };


  //#endregion

  //#region  HANDLE CHANGE EVENT

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  //#endregion

  //#region ADD LEAVE CREDIT DEBIT THEN NAVIGATE
  const handleAddLeaveCreditDebitModal = () => {
    navigate('/leaveCreditDebit/add');
  };
  //#endregion

  //#region DELETE LEAVE CREDIT DEBIT
  const handleDeleteLeaveCreditDebit = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteLeaveCreditDebitDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteLeaveCreditDebitRequest = {
          LeaveCreditDebitId: deleteLeaveCreditDebitDetailsData.LeaveCreditDebitId,
          Uniquekey: deleteLeaveCreditDebitDetailsData.Uniquekey
        }

        const response = await leaveCreditDebitService.apiCallDeleteLeaveCreditDebit(params);

        if (E.isRight(response)) {

          setLeaveCreditDebitList(prevData => prevData.filter(item => item.LeaveCreditDebitId !== deleteLeaveCreditDebitDetailsData.LeaveCreditDebitId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteLeaveCreditDebitDetailsData(null);

        } else {
          addToast({ type: 'error', title: response.left.message });

          setIsConfirmationDialogBoxOpen(false);
        }

        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Delete Leave Credit Debit'
    )
  }

  //#endregion

  return (

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>
      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Department Name..."
        onSearchChange={(v) => {
          setSearchTerm(v)
          debouncedSearch(v)
        }}
        onClearSearch={clearsearchLeaveCreditDebits}
        isShowFilterButton
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters)
          setShowFilterPopup(true)
        }}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeLeaveCreditDebitColumnsModal(true)}
        isShowAddButton={canAction}
        addTitle=" Add"
        onAdd={handleAddLeaveCreditDebitModal}
        isShowExportButton={canExport}
        onExportExcel={handleExportLeaveCreditDebitExcel}
        onExportPdf={handleExportLeaveCreditDebitPdf}
        exportLoading={isLoading}
      />

      <DataTable
        data={leaveCreditDebitListForTable}
        columns={visibleLeaveCreditDebitColumns}
        pagination={leaveCreditDebitPaginationInfo}
        emptyMessage="No Leave Credit Debit Data Found"
        fixedHeight={true}
        maxHeight="calc(100vh - 255px)"
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        loading={isLoading}
      />


      <CustomizeColumnsModal
        isOpen={isShowCustomizeLeaveCreditDebitColumnsModal}
        onClose={() => setIsShowCustomizeLeaveCreditDebitColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(
            new Set([...keys, ...requiredLeaveCreditDebitColumnKeys]),
          )

          setSelectedLeaveCreditDebitColumnKeys(withRequired)

          try {
            localStorage.setItem('leaveCreditDebitTableColumns', JSON.stringify(withRequired))
          } catch { }
        }}
        columns={leaveCreditDebitColumns}
        selectedKeys={selectedLeaveCreditDebitColumnKeys}
        requiredKeys={requiredLeaveCreditDebitColumnKeys}
        title="Customize Table Columns"
      />

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Leave Credit Debit"
        onSubmit={(e) => {
          e.preventDefault()
          applyFilters()
        }}
        saveText="Apply Filter"
        onCancel={() => clearFilters()}
        size="small-half"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Input
                label='Leave Period Mode'
                type="text"
                value={tempFilters.LeavePeriodMode || ''}
                onChange={(e) => handleFilterChange('LeavePeriodMode', e.target.value)}
                placeholder="Enter period mode"
              />
            </div>
            <div>
              <Input
                label='Financial Year'
                type="number"
                value={tempFilters.FYyear || ''}
                onChange={(e) => handleFilterChange('FYyear', e.target.value)}
                placeholder="Enter financial year"
              />
            </div>
            <div>
              <Input
                label='Month'
                type="text"
                value={tempFilters.Month || ''}
                onChange={(e) => handleFilterChange('Month', e.target.value)}
                placeholder="Enter month"
              />
            </div>
            <div>
              <Input
                label='Department'
                type="text"
                value={tempFilters.DepartmentName || ''}
                onChange={(e) => handleFilterChange('DepartmentName', e.target.value)}
                placeholder="Enter department name"
              />
            </div>
            <div>
              <Input
                label='Designation'
                type="text"
                value={tempFilters.DesignationName || ''}
                onChange={(e) => handleFilterChange('DesignationName', e.target.value)}
                placeholder="Enter designation name"
              />
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default LeaveCreditDebit;

