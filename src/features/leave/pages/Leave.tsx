import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
    FilterWithPaginationLeaveRequest,
    LeaveData,
} from '@/features/leave/models/LeaveModel';
import { LeaveService } from '@/features/leave/services/LeaveService';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input, Button } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { Trash2 } from 'lucide-react';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import type { DeleteLeaveRequest } from '@/features/leave/models/LeaveModel';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { useLocation, type Location, useNavigate } from 'react-router-dom';
import { updateFilter } from '@/core/utils/filterHelper';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';

export const Leave: React.FC = () => {

  //#region STATE
  const [leaveList, setLeaveList] = useState<LeaveData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
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
    searchLeaves(value)
  }, 350)


  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeLeaveColumnsModal, setIsShowCustomizeLeaveColumnsModal] = useState(false);

  //DELETE CONFIRMATION DIALOG
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [selectedLeaveToDelete, setSelectedLeaveToDelete] = useState<LeaveData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        leaveId?: number;
      };
    };
  };
  //#endregion

  //#region INIT

  useEffect(() => {

    const incoming = location.state?.listState as
      | { page?: number; filters?: FilterInfo; sortInfo?: SortInfo; searchTerm?: string; leaveId?: number }
      | undefined;

    const listState = incoming ?? { page: 1, filters: {} as FilterInfo, sortInfo: undefined, searchTerm: '', leaveId: 0 };


    setPagination({ currentPage: listState.page ?? pagination.currentPage });

    setSortInfo(listState.sortInfo);

    setFilters(listState.filters ?? {});

    setTempFilters(listState.filters ?? {});

    setSearchTerm(listState.searchTerm ?? '');

    if (listState.searchTerm && String(listState.searchTerm).trim()) {

      setSearchTerm(String(listState.searchTerm));

      loadLeaves(listState.page ?? 1, { LeaveType: String(listState.searchTerm).trim() });

      return;
    }


    loadLeaves(listState.page ?? 1, listState.filters ?? {});

  }, [location.state]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion

  //#region DATA LOAD
  const fetchLeaveList = async (page: number = pagination.currentPage) => {
    return await loadLeaves(page, filters);
  }

  const loadLeaves = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        let sortByParam = undefined;
        if (sortInfo) {
          const column = leaveColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationLeaveRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          LeaveType: filterParams.LeaveType?.trim() || undefined,
          LeaveTypeMasterId: filterParams.LeaveTypeMasterId ? Number(filterParams.LeaveTypeMasterId) : undefined,
          StartDate: filterParams.StartDate?.trim() || undefined,
          EndDate: filterParams.EndDate?.trim() || undefined,
          SortBy: sortByParam
        }

        const response = await getLeaves(params);

        if (E.isRight(response)) {

          setLeaveList(response.right.Data);

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
      'Loading Leave Data'
    )
  }

  //#endregion

  //#region SEARCH LEAVE
  const searchLeaves = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchLeaveList();
      return;
    }

    const filterParams: FilterInfo = {
      LeaveType: searchValue.trim()
    };

    await loadLeaves(1, filterParams);
  }
  //#endregion

  //#region CLEAR SEARCH LEAVE
  const clearSearchLeaves = () => {
    setSearchTerm('');

    debouncedSearch.cancel?.();

    setFilters({});
    setTempFilters({});
    setPagination({ currentPage: 1 });
    loadLeaves(1, {});
    try {
      navigate(location.pathname, { replace: true, state: {} });
    } catch {
    }
  };

  //#endregion

  //#region EXCEL EXPORT PDF | EXCEL
  const handleExportLeaves = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        let sortByParam = undefined
        if (sortInfo) {
          const column = leaveColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationLeaveRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          LeaveType: filters.LeaveType?.trim() || undefined,
          LeaveTypeMasterId: filters.LeaveTypeMasterId ? Number(filters.LeaveTypeMasterId) : undefined,
          StartDate: filters.StartDate?.trim() || undefined,
          EndDate: filters.EndDate?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }
        const response = await getLeaves(params);
        handleExportFile(response, exportType, 'Leave', addToast)
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Preparing Export...'
    )
  }

  const handleExportLeaveExcel = () => handleExportLeaves('Excel')
  const handleExportLeavePdf = () => handleExportLeaves('PDF')
  //#endregion

  //#region GET LEAVE DATA FROM API
  const getLeaves = async (filterParams: FilterWithPaginationLeaveRequest) => {
    return await LeaveService.apiCallPullLeave(filterParams);
  }
  //#endregion

  //#region TABLE CONFIG

  const handlePageChange = useCallback((page: number) => {
    fetchLeaveList(page);
  }, []);

  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    fetchLeaveList(1);
  }, []);

  const leavePaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const leaveListForTable = useMemo(() => leaveList, [leaveList]);

  //#endregion

  //#region VIEW LEAVE DETAILS
  const handleViewLeaveDetails = useCallback((row: LeaveData) => {
    navigate('/leave/view', {
      state: {
        editLeaveData: row,
        fromList: true,
        listState: {
          page: pagination.currentPage,
          filters,
          sortInfo,
          searchTerm,
          leaveId: row.LeaveId,
        },
      },
    });
  }, [navigate, pagination.currentPage, filters, sortInfo, searchTerm]);

  //#endregion

  //#region DELETE LEAVE
  const handleConfirmationDialogBoxOpen = useCallback((row: LeaveData) => {
    setSelectedLeaveToDelete(row);
    setIsConfirmationDialogBoxOpen(true);
  }, []);

  const handleDeleteLeave = useCallback(async () => {
    if (!selectedLeaveToDelete?.LeaveId || !selectedLeaveToDelete?.Uniquekey) return;

    setIsDeleting(true);

    const payload: DeleteLeaveRequest = {
      LeaveId: selectedLeaveToDelete.LeaveId,
      Uniquekey: selectedLeaveToDelete.Uniquekey,
    };

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await LeaveService.apiCallDeleteLeave(payload);
        if (E.isRight(response)) {
          // Check backend ErrorMessage first
          if (response.right.ErrorMessage && response.right.ErrorMessage.length > 0) {
            addToast({ type: 'error', title: response.right.ErrorMessage[0] });
          } else if (response.right.WarningMessage && response.right.WarningMessage.length > 0) {
            addToast({ type: 'warning', title: response.right.WarningMessage[0] });
            setIsConfirmationDialogBoxOpen(false);
            setSelectedLeaveToDelete(null);
            fetchLeaveList();
          } else {
            // Success - use backend SuccessMessage
            addToast({ type: 'success', title: response.right.SuccessMessage?.[0] });
            setIsConfirmationDialogBoxOpen(false);
            setSelectedLeaveToDelete(null);
            fetchLeaveList();
          }
        } else {
          addToast({ type: 'error', title: response.left.message });
        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error?.message }),
      undefined,
      'Deleting Leave'
    );

    setIsDeleting(false);
  }, [selectedLeaveToDelete, addToast, fetchLeaveList]);
  //#endregion

  //#region TABLE COLUMN

  const leaveColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'LeaveType',
        label: 'Leave Type',
        width: '25',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className="flex items-center justify-start">
            <TooltipText
              text={value || '-'}
              maxWidth="250px"
              tooltipThreshold={25}
              onClick={() => handleViewLeaveDetails(row)}
            />
          </div>
        )
      },
      {
        key: 'StartDate',
        label: 'Start Date',
        width: '18',
        sortable: true,
        align: 'center',
        render: (value) => (
          <div className="flex items-center justify-center">
            {value ? formatDate_dd_MonthName_yy(value as string) : '-'}
          </div>
        )
      },
      {
        key: 'EndDate',
        label: 'End Date',
        width: '18',
        sortable: true,
        align: 'center',
        render: (value) => (
          <div className="flex items-center justify-center">
            {value ? formatDate_dd_MonthName_yy(value as string) : '-'}
          </div>
        )
      },
      {
        key: 'NoOfDays',
        label: 'No Of Days',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'Reason',
        label: 'Reason',
        width: '24',
        sortable: false,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || '-'}
            maxWidth="240px"
            tooltipThreshold={24}
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
                title="Delete Leave"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null
        )
      },
    ],
    [canAction, handleViewLeaveDetails, handleConfirmationDialogBoxOpen]
  )

  //#endregion

  //#region CUSTOMIZE COLUMNS

  const requiredLeaveColumnKeys: string[] = ['LeaveType'];

  const [selectedLeaveColumnKeys, setSelectedLeaveColumnKeys] = useState<string[]>([]);

  useEffect(() => {

    if (leaveColumns.length === 0) return;

    try {
      const saved = LocalStorageHelper.getLeaveTableColumns();
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        const filtered = parsed.filter(k =>
          leaveColumns.some(col => col.key === k)
        );
        const final = Array.from(
          new Set([
            ...filtered,
            ...requiredLeaveColumnKeys,
          ])
        );
        setSelectedLeaveColumnKeys(final);
        return;
      }
    } catch { }

    const allKeys = leaveColumns.map(c => c.key);
    const final = Array.from(
      new Set([...allKeys, ...requiredLeaveColumnKeys])
    );
    setSelectedLeaveColumnKeys(final);
  }, [leaveColumns]);

  const visibleLeaveColumns = useMemo(
    () => leaveColumns.filter(col =>
      selectedLeaveColumnKeys.includes(col.key)
    ),
    [leaveColumns, selectedLeaveColumnKeys]
  );

  //#endregion

  //#region FILTER HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadLeaves(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({});
    setFilters({});

    // reset page
    setPagination({ currentPage: 1 });

    // load empty filters
    loadLeaves(1, {});

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

  //#region ADD LEAVE THEN NAVIGATE
  const handleAddLeaveModal = () => {
    navigate('/leave/add');
  };
  //#endregion

  return (

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>
      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Leave Type..."
        onSearchChange={(v) => {
          setSearchTerm(v)
          debouncedSearch(v)
        }}
        onClearSearch={clearSearchLeaves}
        isShowFilterButton
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters)
          setShowFilterPopup(true)
        }}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeLeaveColumnsModal(true)}

        // ADD
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddLeaveModal}

        // IMPORT 
        isShowImportButton={canAction}

        // EXPORT
        isShowExportButton={canExport}
        onExportExcel={handleExportLeaveExcel}
        onExportPdf={handleExportLeavePdf}
        exportLoading={isLoading}
      />
      <DataTable
        data={leaveListForTable}
        columns={visibleLeaveColumns}
        pagination={leavePaginationInfo}
        emptyMessage="No leave found"
        fixedHeight={true}
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeLeaveColumnsModal}
        onClose={() => setIsShowCustomizeLeaveColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(
            new Set([...keys, ...requiredLeaveColumnKeys])
          );
          setSelectedLeaveColumnKeys(withRequired);
          try {

            LocalStorageHelper.storeLeaveTableColumns(JSON.stringify(withRequired));
          } catch { }
        }}
        columns={leaveColumns}
        selectedKeys={selectedLeaveColumnKeys}
        requiredKeys={requiredLeaveColumnKeys}
        title="Customize Table Columns"
      />

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Leave"
        onSubmit={(e) => {
          e.preventDefault()
          applyFilters()
        }}
        saveText="Apply Filter"
        cancelText="Clear Filter"
        onCancel={() => clearFilters()}
       
        size="small-half"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Input
                label='Leave Type'
                type="text"
                value={tempFilters.LeaveType || ''}
                onChange={(e) => handleFilterChange('LeaveType', e.target.value)}
                placeholder="Enter Leave Type"
              />
            </div>
            <div>
              <Input
                label='Start Date'
                type="date"
                value={tempFilters.StartDate || ''}
                onChange={(e) => handleFilterChange('StartDate', e.target.value)}
                placeholder="Enter Start Date"
              />
            </div>
            <div>
              <Input
                label='End Date'
                type="date"
                value={tempFilters.EndDate || ''}
                onChange={(e) => handleFilterChange('EndDate', e.target.value)}
                placeholder="Enter End Date"
              />
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmationDialogBox
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false);
          setSelectedLeaveToDelete(null);
        }}
        onConfirm={() => {
          setIsConfirmationDialogBoxOpen(false);
          void handleDeleteLeave();
        }}
        title="You are about to delete Leave"
        message="Are you sure you want to delete this leave?"
        confirmText="Delete"
        cancelText="Cancel"
        loading={isDeleting}
        variant="danger"
      />

    </div>
  )
}

export default Leave