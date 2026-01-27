import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type { LeaveCreditConfigurationData, FilterWithPaginationLeaveCreditConfigurationRequest, } from '@/features/leaveCreditConfiguration/models/LeaveCreditConfigurationModel';

import { leaveCreditConfigurationService } from '@/features/leaveCreditConfiguration/services/LeaveCreditConfigurationService'
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input, Button } from '@/ui/components/forms';
import { DateInput } from '@/ui/components/forms/DateInput';
import { formatDate_dd_mm_yyyy, convert_dd_mm_yyyy_To_Yyyy_mm_dd } from '@/core/utils/dateFormat';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { Trash2 } from 'lucide-react';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import type { DeleteLeaveCreditConfigurationRequest } from '@/features/leaveCreditConfiguration/models/LeaveCreditConfigurationModel';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { useLocation, type Location, useNavigate } from 'react-router-dom';
import { updateFilter } from '@/core/utils/filterHelper';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';

export const LeaveCreditConfiguration: React.FC = () => {

  //#region STATE
  const [leaveCreditConfigurationList, setLeaveCreditConfigurationList] = useState<LeaveCreditConfigurationData[]>([]);
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
    searchLeaveCreditConfigurations(value)
  }, 350)


  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeLeaveCreditConfigurationColumnsModal, setIsShowCustomizeLeaveCreditConfigurationColumnsModal] = useState(false);

  //DELETE CONFIRMATION DIALOG
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [selectedLeaveCreditConfigurationToDelete, setSelectedLeaveCreditConfigurationToDelete] = useState<LeaveCreditConfigurationData | null>(null);
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
        LeaveCreditConfigurationId?: number;
      };
    };
  };
  //#endregion

  //#region INIT

  useEffect(() => {

    const incoming = location.state?.listState as
      | { page?: number; filters?: FilterInfo; sortInfo?: SortInfo; searchTerm?: string; LeaveCreditConfigurationId?: number }
      | undefined;

    const listState = incoming ?? { page: 1, filters: {} as FilterInfo, sortInfo: undefined, searchTerm: '', LeaveCreditConfigurationId: 0 };


    setPagination({ currentPage: listState.page ?? pagination.currentPage });

    setSortInfo(listState.sortInfo);

    setFilters(listState.filters ?? {});

    setTempFilters(listState.filters ?? {});

    setSearchTerm(listState.searchTerm ?? '');

    if (listState.searchTerm && String(listState.searchTerm).trim()) {

      setSearchTerm(String(listState.searchTerm));

      loadLeaveCreditConfigurations(listState.page ?? 1, { DepartmentName: String(listState.searchTerm).trim() });

      return;
    }


    loadLeaveCreditConfigurations(listState.page ?? 1, listState.filters ?? {});

  }, [location.state]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion

  //#region DATA LOAD
  const fetchLeaveCreditConfigurationList = async (page: number = pagination.currentPage) => {
    return await loadLeaveCreditConfigurations(page, filters);
  }

  const loadLeaveCreditConfigurations = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        let sortByParam = undefined;
        if (sortInfo) {
          const column = leaveCreditConfigurationColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationLeaveCreditConfigurationRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          LeaveCreditConfigurationId: filterParams.LeaveCreditConfigurationId ? Number(filterParams.LeaveCreditConfigurationId) : 0,
          LeavePeriodMode: filterParams.LeavePeriodMode?.trim() || undefined,
          FinancialYearStartDate: filterParams.FinancialYearStartDate?.trim() ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FinancialYearStartDate) || undefined : undefined,
          FinancialYearEndDate: filterParams.FinancialYearEndDate?.trim() ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FinancialYearEndDate) || undefined : undefined,
          DepartmentName: filterParams.DepartmentName?.trim() || undefined,
          DesignationName: filterParams.DesignationName?.trim() || undefined,
          SortBy: sortByParam
        }

        const response = await getLeaveCreditConfigurations(params);

        if (E.isRight(response)) {

          setLeaveCreditConfigurationList(response.right.Data);

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
      'Loading Leave Credit Configuration'
    )
  }

  //#endregion

  //#region SEARCH LEAVE CREDIT CONFIGURATION
  const searchLeaveCreditConfigurations = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchLeaveCreditConfigurationList();
      return;
    }

    const filterParams: FilterInfo = {
      DepartmentName: searchValue.trim()
    };

    await loadLeaveCreditConfigurations(1, filterParams);
  }
  //#endregion

  //#region CLEAR SEARCH LEAVE CREDIT CONFIGURATION
  const clearsearchLeaveCreditConfigurations = () => {
    setSearchTerm('');

    debouncedSearch.cancel?.();

    setFilters({});
    setTempFilters({});
    setPagination({ currentPage: 1 });
    loadLeaveCreditConfigurations(1, {});
    try {
      navigate(location.pathname, { replace: true, state: {} });
    } catch {
    }
  };

  //#endregion

  //#region EXCEL EXPORT PDF | EXCEL
  const handleExportLeaveCreditConfigurations = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        let sortByParam = undefined
        if (sortInfo) {
          const column = leaveCreditConfigurationColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationLeaveCreditConfigurationRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          LeavePeriodMode: filters.LeavePeriodMode?.trim() || undefined,
          FinancialYearStartDate: filters.FinancialYearStartDate?.trim() ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.FinancialYearStartDate) || undefined : undefined,
          FinancialYearEndDate: filters.FinancialYearEndDate?.trim() ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.FinancialYearEndDate) || undefined : undefined,
          DepartmentName: filters.DepartmentName?.trim() || undefined,
          DesignationName: filters.DesignationName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }
        const response = await getLeaveCreditConfigurations(params);
        handleExportFile(response, exportType, 'Leave Credit Configuration', addToast)
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

  const handleExportLeaveCreditConfigurationExcel = () => handleExportLeaveCreditConfigurations('Excel')
  const handleExportLeaveCreditConfigurationPdf = () => handleExportLeaveCreditConfigurations('PDF')
  //#endregion

  //#region GET LEAVE CREDIT CONFIGURATION DATA FROM API
  const getLeaveCreditConfigurations = async (filterParams: FilterWithPaginationLeaveCreditConfigurationRequest) => {
    return await leaveCreditConfigurationService.apiCallPullLeaveCreditConfiguration(filterParams);
  }
  //#endregion

  //#region TABLE CONFIG

  const handlePageChange = useCallback((page: number) => {
    fetchLeaveCreditConfigurationList(page);
  }, []);

  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    fetchLeaveCreditConfigurationList(1);
  }, []);

  const leaveCreditConfigurationPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const leaveCreditConfigurationListForTable = useMemo(() => leaveCreditConfigurationList, [leaveCreditConfigurationList]);

  //#endregion

  //#region VIEW LEAVE CREDIT CONFIGURATION DETAILS
  const handleViewLeaveCreditConfigurationDetails = useCallback((row: LeaveCreditConfigurationData) => {
    navigate('/leaveCreditConfiguration/view', {
      state: {
        editLeaveCreditConfigurationData: row,
        fromList: true,
        listState: {
          page: pagination.currentPage,
          filters,
          sortInfo,
          searchTerm,
          LeaveCreditConfigurationId: row.LeaveCreditConfigurationId,
        },
      },
    });
  }, [navigate, pagination.currentPage, filters, sortInfo, searchTerm]);
  //#endregion

  //#region DELETE LEAVE CREDIT CONFIGURATION
  const handleConfirmationDialogBoxOpen = useCallback((row: LeaveCreditConfigurationData) => {
    setSelectedLeaveCreditConfigurationToDelete(row);
    setIsConfirmationDialogBoxOpen(true);
  }, []);

  const handleDeleteLeaveCreditConfiguration = useCallback(async () => {
    if (!selectedLeaveCreditConfigurationToDelete?.LeaveCreditConfigurationId || !selectedLeaveCreditConfigurationToDelete?.Uniquekey) return;

    setIsDeleting(true);

    const payload: DeleteLeaveCreditConfigurationRequest = {
      LeaveCreditConfigurationId: selectedLeaveCreditConfigurationToDelete.LeaveCreditConfigurationId,
      Uniquekey: selectedLeaveCreditConfigurationToDelete.Uniquekey,
    };

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await leaveCreditConfigurationService.apiCallDeleteLeaveCreditConfiguration(payload);
        if (E.isRight(response)) {
          if (response.right.ErrorMessage && response.right.ErrorMessage.length > 0) {
            addToast({ type: 'error', title: response.right.ErrorMessage[0] });
          } else if (response.right.WarningMessage && response.right.WarningMessage.length > 0) {
            addToast({ type: 'warning', title: response.right.WarningMessage[0] });
            setIsConfirmationDialogBoxOpen(false);
            setSelectedLeaveCreditConfigurationToDelete(null);
            loadLeaveCreditConfigurations(pagination.currentPage, filters);
          } else {
            // Success - use backend SuccessMessage
            addToast({ type: 'success', title: response.right.SuccessMessage?.[0] });
            setIsConfirmationDialogBoxOpen(false);
            setSelectedLeaveCreditConfigurationToDelete(null);
            loadLeaveCreditConfigurations(pagination.currentPage, filters);
          }
        } else {
          addToast({ type: 'error', title: response.left.message });
        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error?.message || 'An error occurred' }),
      undefined,
      'Deleting Leave Credit Configuration'
    );

    setIsDeleting(false);
  }, [selectedLeaveCreditConfigurationToDelete, addToast, pagination.currentPage, filters]);
  //#endregion

  //#region TABLE COLUMN

  const leaveCreditConfigurationColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'DepartmentName',
        label: 'Department',
        width: '16',
        sortable: false,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <TooltipText
            text={value || '-'}
            maxWidth="250px"
            tooltipThreshold={30}
            onClick={() => handleViewLeaveCreditConfigurationDetails(row)}
          />
        )
      },
      {
        key: 'DesignationName',
        label: 'Designation',
        width: '16',
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
        width: '16',
        sortable: true,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'FinancialYearStartDate',
        label: 'FY Start Date',
        width: '16',
        sortable: false,
        align: 'center',
        render: (value) => value ? formatDate_dd_mm_yyyy(value) : '-'
      },
      {
        key: 'FinancialYearEndDate',
        label: 'FY End Date',
        width: '16',
        sortable: false,
        align: 'center',
        render: (value) => value ? formatDate_dd_mm_yyyy(value) : '-'
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
                title="Delete Leave Credit Configuration"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null
        )
      }
    ],
    [canAction, handleViewLeaveCreditConfigurationDetails, handleConfirmationDialogBoxOpen]
  )

  //#endregion

  //#region CUSTOMIZE COLUMNS

  const requiredLeaveCreditConfigurationColumnKeys: string[] = ['DepartmentMasterId'];

  const [selectedLeaveCreditConfigurationColumnKeys, setSelectedLeaveCreditConfigurationColumnKeys] = useState<string[]>([]);

  useEffect(() => {

    if (leaveCreditConfigurationColumns.length === 0) return;

    try {
      const saved = LocalStorageHelper.getLeaveCreditConfigurationTableColumns();
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        const filtered = parsed.filter(k =>
          leaveCreditConfigurationColumns.some(col => col.key === k)
        );
        const final = Array.from(
          new Set([
            ...filtered,
            ...requiredLeaveCreditConfigurationColumnKeys,
          ])
        );
        setSelectedLeaveCreditConfigurationColumnKeys(final);
        return;
      }
    } catch { }

    const allKeys = leaveCreditConfigurationColumns.map(c => c.key);
    const final = Array.from(
      new Set([...allKeys, ...requiredLeaveCreditConfigurationColumnKeys])
    );
    setSelectedLeaveCreditConfigurationColumnKeys(final);
  }, [leaveCreditConfigurationColumns]);

  const visibleLeaveCreditConfigurationColumns = useMemo(
    () => leaveCreditConfigurationColumns.filter(col =>
      selectedLeaveCreditConfigurationColumnKeys.includes(col.key)
    ),
    [leaveCreditConfigurationColumns, selectedLeaveCreditConfigurationColumnKeys]
  );

  //#endregion

  //#region FILTER HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadLeaveCreditConfigurations(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({});
    setFilters({});

    // reset page
    setPagination({ currentPage: 1 });

    // load empty filters
    loadLeaveCreditConfigurations(1, {});

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

  //#region ADD LEAVE CREDIT CONFIGURATION THEN NAVIGATE
  const handleAddLeaveCreditConfigurationModal = () => {
    navigate('/leaveCreditConfiguration/add');
  };
  //#endregion

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
        onClearSearch={clearsearchLeaveCreditConfigurations}
        isShowFilterButton
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters)
          setShowFilterPopup(true)
        }}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeLeaveCreditConfigurationColumnsModal(true)}
        isShowAddButton={canAction}
        addTitle=" Add"
        onAdd={handleAddLeaveCreditConfigurationModal}
        isShowExportButton={canExport}
        onExportExcel={handleExportLeaveCreditConfigurationExcel}
        onExportPdf={handleExportLeaveCreditConfigurationPdf}
        exportLoading={isLoading}
      />

      <DataTable
        data={leaveCreditConfigurationListForTable}
        columns={visibleLeaveCreditConfigurationColumns}
        pagination={leaveCreditConfigurationPaginationInfo}
        emptyMessage="No Leave Credit Configuration Data Found"
        fixedHeight={true}
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        loading={isLoading}
      />


      <CustomizeColumnsModal
        isOpen={isShowCustomizeLeaveCreditConfigurationColumnsModal}
        onClose={() => setIsShowCustomizeLeaveCreditConfigurationColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(
            new Set([...keys, ...requiredLeaveCreditConfigurationColumnKeys]),
          )

          setSelectedLeaveCreditConfigurationColumnKeys(withRequired)

          try {
            LocalStorageHelper.storeLeaveCreditConfigurationTableColumns(JSON.stringify(withRequired))
          } catch { }
        }}
        columns={leaveCreditConfigurationColumns}
        selectedKeys={selectedLeaveCreditConfigurationColumnKeys}
        requiredKeys={requiredLeaveCreditConfigurationColumnKeys}
        title="Customize Table Columns"
      />

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Leave Credit Configuration"
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
            <div>
              <DateInput
                label='Financial Year Start Date'
                value={tempFilters.FinancialYearStartDate || null}
                onChange={(value) => handleFilterChange('FinancialYearStartDate', value || '')}
              />
            </div>
            <div>
              <DateInput
                label='Financial Year End Date'
                value={tempFilters.FinancialYearEndDate || null}
                onChange={(value) => handleFilterChange('FinancialYearEndDate', value || '')}
              />
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmationDialogBox
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false);
          setSelectedLeaveCreditConfigurationToDelete(null);
        }}
        onConfirm={() => {
          setIsConfirmationDialogBoxOpen(false);
          void handleDeleteLeaveCreditConfiguration();
        }}
        title="You are about to delete Leave Credit Configuration"
        message="Are you sure you want to delete this leave credit configuration?"
        confirmText="Delete"
        cancelText="Cancel"
        loading={isDeleting}
        variant="danger"
      />

    </div>
  );
};

export default LeaveCreditConfiguration;

