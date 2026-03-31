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
import type { DeleteLeaveRequest } from '@/features/leave/models/LeaveModel';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { useNavigate } from 'react-router-dom';
import { updateFilter } from '@/core/utils/filterHelper';
import { formatDate_dd_MonthName_yy, formatDate_dd_mm_yyyy, convert_dd_mm_yyyy_To_Yyyy_mm_dd } from '@/core/utils/dateFormat';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useLeaveListState } from '@/features/leave/context/LeaveListStateContext';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import DatePickerInput from '@/ui/components/forms/Datepicker';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';

export const Leave: React.FC = () => {
  //#region STATE
  const [leaveList, setLeaveList] = useState<LeaveData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const navigate = useNavigate();

  const { pagination, setPagination } = usePagination(20);

  const { addToast } = useToast();

  const [showFilterPopup, setShowFilterPopup] = useState(false);

  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  const [isShowCustomizeLeaveColumnsModal, setIsShowCustomizeLeaveColumnsModal] = useState(false);

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteLeaveData, setDeleteLeaveData] = useState<LeaveData | null>(null)

  const { canAction, canExport } = useMenuPermissions()

  //#endregion

  //#region LEAVE LIST STATE CONTEXT
  const { listState, updateListState, resetFilters, clearLeaveContext } = useLeaveListState();

  const { page, filters, sortInfo, searchTerm } = listState;
  //#endregion

  //#region VIEW LEAVE DETAILS
  const handleViewLeaveDetails = useCallback((row: LeaveData) => {
    updateListState({ leaveId: row.LeaveId });
    navigate('/leave/view');
  }, [navigate, updateListState]);

  //#endregion

  //#region DELETE LEAVE
  const handleConfirmationDialogBoxOpen = useCallback((row: LeaveData) => {
    setDeleteLeaveData(row);
    setIsConfirmationDialogBoxOpen(true);
  }, []);

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
        width: '10',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'Reason',
        label: 'Reason',
        width: '35',
        sortable: false,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || '-'}
            maxWidth="350px"
            tooltipThreshold={35}
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
  );

  //#endregion

  //#region DATA LOAD LEAVE

  const loadLeaves = async (pageNum: number, filterParams: FilterInfo, sortInfo?: SortInfo) => {

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationLeaveRequest = {
          PageNumber: pageNum,
          PageSize: pagination.pageSize,
          LeaveType: filterParams.LeaveType?.trim() || undefined,
          LeaveTypeMasterId: filterParams.LeaveTypeMasterId ? Number(filterParams.LeaveTypeMasterId) : undefined,
          StartDate: filterParams.StartDate?.trim() || undefined,
          EndDate: filterParams.EndDate?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, []),
          CanApprove: false,
          IsReport: false,
          IsCheckPermission: true
        };

        const response = await LeaveService.apiCallPullLeave(params);

        if (E.isRight(response)) {

          setLeaveList(response.right.Data);

          setPagination({
            currentPage: pageNum,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize)
          });

        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      'Loading Leave'
    );
  };

  //#endregion

  //#region INIT
  useEffect(() => {

    clearLeaveContext();

    if (searchTerm && searchTerm.trim()) {

      loadLeaves(page, { LeaveType: searchTerm.trim() }, sortInfo);

    } else {

      loadLeaves(page, filters, sortInfo);

    }
  }, [page, filters, sortInfo, searchTerm, clearLeaveContext]);


  useEffect(() => {

    setPagination({ currentPage: page });

  }, [page]);

  useEffect(() => {

    setTempFilters(filters);

  }, [filters]);

  //#endregion

  //#region SEARCH LEAVE FILTER

  const debouncedSearch = useDebouncedCallback((value: string, isSerach: boolean = true) => {

    let filterParams: FilterInfo = {};

    if (value.trim() === '') {

      updateListState({ searchTerm: '', filters: {}, page: 1 });

      return;
    }

    if (isSerach) {

      filterParams = { LeaveType: value.trim() };
    }

    updateListState({ searchTerm: value, filters: filterParams, page: 1 });

  }, 350);

  const searchLeaves = (searchValue: string) => {

    updateListState({ searchTerm: searchValue });

    debouncedSearch(searchValue, false);
  };

  //#endregion

  //#region CLEAR SEARCH LEAVE
  const clearSearchLeaves = () => {
    debouncedSearch.cancel?.();
    resetFilters();
    setTempFilters({});
  };

  //#endregion

  //#region  EXCEL EXPORT TO EXCEL | PDF
  const handleExportLeaves = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationLeaveRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          LeaveType: filters.LeaveType?.trim() || undefined,
          LeaveTypeMasterId: filters.LeaveTypeMasterId ? Number(filters.LeaveTypeMasterId) : undefined,
          StartDate: filters.StartDate?.trim() || undefined,
          EndDate: filters.EndDate?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, []),
          IsReport: false,
          CanApprove: false,
          ExportType: exportType
        };

        const response = await LeaveService.apiCallPullLeave(params);
        handleExportFile(response, exportType, 'Leave', addToast);
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      'Preparing Export'
    );
  };

  const handleExportLeaveExcel = () => handleExportLeaves('Excel');
  const handleExportLeavePdf = () => handleExportLeaves('PDF');
  //#endregion

  //#region HANDLE PAGE CHANGE EVENT

  const handlePageChange = useCallback((page: number) => {
    updateListState({ page });
  }, [updateListState]);

  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = (sortInfo: SortInfo) => {

    updateListState({ sortInfo, page: 1 });

  }
  //#endregion

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

  //#region DELETE LEAVE
  const handleDeleteLeave = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteLeaveData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const payload: DeleteLeaveRequest = {
          LeaveId: deleteLeaveData.LeaveId,
          Uniquekey: deleteLeaveData.Uniquekey,
        };

        const response = await LeaveService.apiCallDeleteLeave(payload);

        if (E.isRight(response)) {

          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          }

          else if (leaveList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadLeaves(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage?.[0] });

          setIsConfirmationDialogBoxOpen(false);

          setDeleteLeaveData(null);

        } else {

          addToast({ type: 'error', title: response.left.message });

        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      'Deleting Leave'
    );
  };
  //#endregion

  //#region CUSTOMIZE COLUMNS

  const requiredLeaveColumnKeys: string[] = ['LeaveType', 'actions'];

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
    updateListState({ filters: tempFilters, page: 1 });
    setShowFilterPopup(false);
  };

  const clearFilters = () => {
    resetFilters();
    setTempFilters({});
    setShowFilterPopup(false);
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
        searchPlaceholder="Search By Leave Type"
        onSearchChange={
          searchLeaves
        }
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
        saveText="Apply "
        cancelText="Clear"
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
              <DatePickerInput
                label='Start Date'
                value={tempFilters.StartDate ? formatDate_dd_mm_yyyy(tempFilters.StartDate) : ''}
                onChange={(val) => handleFilterChange('StartDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val) || '')}
              />
            </div>

            <div>
              <DatePickerInput
                label='End Date'
                value={tempFilters.EndDate ? formatDate_dd_mm_yyyy(tempFilters.EndDate) : ''}
                onChange={(val) => handleFilterChange('EndDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val) || '')}
              />
            </div>

          </div>
        </div>
      </Modal>

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false)
          setDeleteLeaveData(null)
        }}
        onConfirm={handleDeleteLeave}
        loading={isLoading}
        pageName='leave'
      />

    </div>
  )
}

export default Leave