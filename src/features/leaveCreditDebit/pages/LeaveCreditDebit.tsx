import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  DeleteLeaveCreditDebitRequest,
  LeaveCreditDebitData,
  FilterWithPaginationLeaveCreditDebitRequest,
} from '@/features/leaveCreditDebit/models/LeaveCreditDebitModel';

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
import { updateFilter } from '@/core/utils/filterHelper';

export const LeaveCreditDebit: React.FC = () => {

  //#region STATE MANAGEMENT
  const [leaveCreditDebitList, setLeaveCreditDebitList] = useState<LeaveCreditDebitData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const navigate = useNavigate();

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const { toasts, removeToast, addToast } = useToast()

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

  const handleAddLeaveCreditDebitModal = useCallback(() => {
    navigate('/leave-credit-debit/add');
  }, [navigate]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  }, []);

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION

  const hasFetchedInitialLeaveCreditDebits = useRef(false)

  useEffect(() => {

    if (hasFetchedInitialLeaveCreditDebits.current) return

    hasFetchedInitialLeaveCreditDebits.current = true;

    fetchLeaveCreditDebitList()
  }, [])

  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

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
          DepartmentMasterId: filterParams.DepartmentMasterId?.trim() || undefined,
          EmployeeId: filterParams.EmployeeId?.trim() || undefined,
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

      return
    }

    const filterParams: FilterInfo = {
      EmployeeId: searchValue.trim(),
    };

    await loadLeaveCreditDebits(1, filterParams)

  }
  //#endregion

  //#region CLEAR SERACH LEAVE CREDIT DEBIT 
  const clearsearchLeaveCreditDebits = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchLeaveCreditDebitList();
  }

  //#endregion

  //#region EXPORT EXCEL | PDF
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
          DepartmentMasterId: filters.DepartmentMasterId?.trim() || undefined,
          EmployeeId: filters.EmployeeId?.trim() || undefined,
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
      'Preparing Export'
    )
  }

  const handleExportLeaveCreditDebitExcel = () => handleExportLeaveCreditDebits('Excel')
  const handleExportLeaveCreditDebitPdf = () => handleExportLeaveCreditDebits('PDF')

  //#endregion

  //#region API | SERVICES CALL TO GET LEAVE CREDIT DEBIT 

  const getLeaveCreditDebits = async (filterParams: FilterWithPaginationLeaveCreditDebitRequest) => {

    return await leaveCreditDebitService.apiCallPullLeaveCreditDebit(filterParams);
  }
  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT

  const handlePageChange = (page: number) => {
    fetchLeaveCreditDebitList(page);
  };

  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchLeaveCreditDebitList(1);

  }
  //#endregion

  //#region TABLE PAGINATION INFO

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

  //#region VIEW EDIT
  const handleViewLeaveCreditDebitDetails = useCallback((row: LeaveCreditDebitData) => {
    navigate('/leave-credit-debit/view', { state: { data: row } });
  }, [navigate]);

  //#endregion

  //#region TABLE COLUMN

  const leaveCreditDebitColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'LeavePeriodMode',
        label: 'Period Mode',
        width: '15',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className={`flex items-center ${canAction ? 'justify-between' : 'justify-start'}`}>
            <TooltipText
              text={value || 'N/A'}
              maxWidth="250px"
              tooltipThreshold={30}
              onClick={() => handleViewLeaveCreditDebitDetails(row)}
            />
          </div>
        )
      },
      {
        key: 'FYyear',
        label: 'Financial Year',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => value || 'N/A'
      },
      {
        key: 'Month',
        label: 'Month',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => value || 'N/A'
      },
      {
        key: 'DepartmentMasterId',
        label: 'Department',
        width: '20',
        sortable: false,
        align: 'left',
        render: (value) => value || 'N/A'
      },
      {
        key: 'EmployeeId',
        label: 'Employee',
        width: '20',
        sortable: false,
        align: 'left',
        render: (value) => value || 'N/A'
      }
    ],
    [canAction, handleViewLeaveCreditDebitDetails]
  )

  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS

  const requiredLeaveCreditDebitColumnKeys: string[] = ['LeavePeriodMode'];

  const allLeaveCreditDebitColumnKeys: string[] = leaveCreditDebitColumns.map(c => c.key)

  const [selectedLeaveCreditDebitColumnKeys, setSelectedLeaveCreditDebitColumnKeys] = useState<string[]>(() => {

    try {

      const saved = localStorage.getItem('leaveCreditDebitTableColumns');

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredLeaveCreditDebitColumnKeys]));

        return withRequired.filter(k => allLeaveCreditDebitColumnKeys.includes(k));

      }
    } catch { }
    return allLeaveCreditDebitColumnKeys
  })

  useEffect(() => {
    setSelectedLeaveCreditDebitColumnKeys(prev => Array.from(new Set([...prev, ...requiredLeaveCreditDebitColumnKeys])).filter(k => allLeaveCreditDebitColumnKeys.includes(k)));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaveCreditDebitColumns.length])

  const visibleLeaveCreditDebitColumns = useMemo(
    () => leaveCreditDebitColumns.filter(col => selectedLeaveCreditDebitColumnKeys.includes(col.key)),
    [leaveCreditDebitColumns, selectedLeaveCreditDebitColumnKeys]
  )

  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadLeaveCreditDebits(1, tempFilters)
    setShowFilterPopup(false)
  }

  //#endregion

  //#region CLEAR FILTER 

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadLeaveCreditDebits(1, {})
    setShowFilterPopup(false)
  }

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
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder="Search By Employee"
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchLeaveCreditDebits}
          isShowFilterButton={false}
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeLeaveCreditDebitColumnsModal(true)}
          isShowAddButton={canAction}
          addTitle="Add Leave Credit Debit"
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
            </div>
          </div>
        </Modal>

        <ConfirmationDialogBox
          isOpen={isConfirmationDialogBoxOpen}
          onClose={() => {
            setIsConfirmationDialogBoxOpen(false)
            setDeleteLeaveCreditDebitDetailsData(null)
          }}
          onConfirm={handleDeleteLeaveCreditDebit}
          title="You are about to delete a Leave Credit Debit?"
          message="Deleting this leave credit debit will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
        />

      </div>
    </>
  );
};

export default LeaveCreditDebit;

