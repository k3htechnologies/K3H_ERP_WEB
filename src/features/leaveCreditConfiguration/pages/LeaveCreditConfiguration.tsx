import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type { LeaveCreditConfigurationData, FilterWithPaginationLeaveCreditConfigurationRequest, DeleteLeaveCreditConfigurationRequest } from '@/features/leaveCreditConfiguration/models/LeaveCreditConfigurationModel';
import { leaveCreditConfigurationService } from '@/features/leaveCreditConfiguration/services/LeaveCreditConfigurationService';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input, Button } from '@/ui/components/forms';
import { DateInput } from '@/ui/components/forms/DateInput';
import { formatDate_dd_mm_yyyy, convert_dd_mm_yyyy_To_Yyyy_mm_dd } from '@/core/utils/dateFormat';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { Trash2 } from 'lucide-react';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { useNavigate } from 'react-router-dom';
import { updateFilter } from '@/core/utils/filterHelper';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useLeaveCreditConfigurationListState } from '@/features/leaveCreditConfiguration/context/LeaveCreditConfigurationListStateContext';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';

export const LeaveCreditConfiguration: React.FC = () => {
  //#region STATE
  const [leaveCreditConfigurationList, setLeaveCreditConfigurationList] = useState<LeaveCreditConfigurationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const navigate = useNavigate();

  const { pagination, setPagination } = usePagination(20);

  const { addToast } = useToast();

  const [showFilterPopup, setShowFilterPopup] = useState(false);

  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  const [isShowCustomizeLeaveCreditConfigurationColumnsModal, setIsShowCustomizeLeaveCreditConfigurationColumnsModal] = useState(false);

  const { canAction, canExport } = useMenuPermissions();

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);

  const [deleteLeaveCreditConfigurationData, setDeleteLeaveCreditConfigurationData] = useState<LeaveCreditConfigurationData | null>(null);

  //#endregion

  //#region LEAVE CREDIT CONFIGURATION LIST STATE CONTEXT
  const { listState, updateListState, resetFilters, clearLeaveCreditConfigurationContext } = useLeaveCreditConfigurationListState();

  const { page, filters, sortInfo, searchTerm } = listState;
  //#endregion

  //#region DATA LOAD LEAVE CREDIT CONFIGURATION

  const loadLeaveCreditConfigurations = async (pageNum: number, filterParams: FilterInfo, sortInfo?: SortInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationLeaveCreditConfigurationRequest = {
          PageNumber: pageNum,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          LeaveCreditConfigurationId: filterParams.LeaveCreditConfigurationId ? Number(filterParams.LeaveCreditConfigurationId) : 0,
          LeavePeriodMode: filterParams.LeavePeriodMode?.trim() || undefined,
          StartDate: filterParams.StartDate?.trim() ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.StartDate) || undefined : undefined,
          EndDate: filterParams.EndDate?.trim() ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.EndDate) || undefined : undefined,
          DepartmentName: filterParams.DepartmentName?.trim() || undefined,
          DesignationName: filterParams.DesignationName?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, [])
        };

        const response = await leaveCreditConfigurationService.apiCallPullLeaveCreditConfiguration(params);

        if (E.isRight(response)) {

          setLeaveCreditConfigurationList(response.right.Data);

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
      'Loading Leave Credit Configuration'
    );
  };

  //#endregion

  //#region INIT
  useEffect(() => {

    clearLeaveCreditConfigurationContext();

    if (searchTerm && searchTerm.trim()) {

      loadLeaveCreditConfigurations(page, { DepartmentName: searchTerm.trim() }, sortInfo);

    } else {

      loadLeaveCreditConfigurations(page, filters, sortInfo);

    }
  }, [page, filters, sortInfo, searchTerm, clearLeaveCreditConfigurationContext]);


  useEffect(() => {

    setPagination({ currentPage: page });

  }, [page]);

  useEffect(() => {

    setTempFilters(filters);

  }, [filters]);

  //#endregion

  //#region SEARCH LEAVE CREDIT CONFIGURATION FILTER

  const debouncedSearch = useDebouncedCallback((value: string, isSearch: boolean = true) => {

    let filterParams: FilterInfo = {};

    if (value.trim() === '') {

      updateListState({ searchTerm: '', filters: {}, page: 1 });

      return;
    }

    if (isSearch) {

      filterParams = { DepartmentName: value.trim() };
    }

    updateListState({ searchTerm: value, filters: filterParams, page: 1 });

  }, 350);

  const searchLeaveCreditConfigurations = (searchValue: string) => {

    updateListState({ searchTerm: searchValue });

    debouncedSearch(searchValue, false);
  };

  //#endregion

  //#region CLEAR SEARCH LEAVE CREDIT CONFIGURATION
  const clearSearchLeaveCreditConfigurations = () => {
    debouncedSearch.cancel?.();
    resetFilters();
    setTempFilters({});
  };

  //#endregion

  //#region  EXCEL EXPORT TO EXCEL | PDF
  const handleExportLeaveCreditConfigurations = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationLeaveCreditConfigurationRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          LeavePeriodMode: filters.LeavePeriodMode?.trim() || undefined,
          StartDate: filters.StartDate?.trim() ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.StartDate) || undefined : undefined,
          EndDate: filters.EndDate?.trim() ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.EndDate) || undefined : undefined,
          DepartmentName: filters.DepartmentName?.trim() || undefined,
          DesignationName: filters.DesignationName?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, []),
          ExportType: exportType
        };

        const response = await leaveCreditConfigurationService.apiCallPullLeaveCreditConfiguration(params);

        handleExportFile(response, exportType, 'Leave Credit Configuration', addToast);

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' });
      },
      undefined,
      'Preparing Export'
    );
  };

  const handleExportLeaveCreditConfigurationExcel = () => handleExportLeaveCreditConfigurations('Excel');
  const handleExportLeaveCreditConfigurationPdf = () => handleExportLeaveCreditConfigurations('PDF');

  //#endregion

  //#region TABLE CONFIG
  const handlePageChange = useCallback((newPage: number) => {
    updateListState({ page: newPage });
  }, [updateListState]);

  const handleSortColumn = useCallback((sort: SortInfo) => {
    updateListState({ sortInfo: sort, page: 1 });
  }, [updateListState]);

  const leaveCreditConfigurationPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize]
  );

  const leaveCreditConfigurationListForTable = useMemo(() => leaveCreditConfigurationList, [leaveCreditConfigurationList]);
  //#endregion

  //#region VIEW LEAVE CREDIT CONFIGURATION DETAILS
  const handleViewLeaveCreditConfigurationDetails = useCallback((row: LeaveCreditConfigurationData) => {
    updateListState({
      leaveCreditConfigurationId: row.LeaveCreditConfigurationId,
    });
    navigate('/leaveCreditConfiguration/view');
  }, [navigate, updateListState]);
  //#endregion

  //#region CONFIRMATION DIALOG BOX

  const handleConfirmationDialogBoxOpen = useCallback((row: LeaveCreditConfigurationData) => {
    setDeleteLeaveCreditConfigurationData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])

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
        sortable: false,
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
  );
  //#endregion

  //#region CUSTOMIZE COLUMNS
  const requiredLeaveCreditConfigurationColumnKeys: string[] = ['DepartmentName', 'actions'];

  const allLeaveCreditConfigurationColumnKeys: string[] = leaveCreditConfigurationColumns.map(c => c.key);

  const [selectedLeaveCreditConfigurationColumnKeys, setSelectedLeaveCreditConfigurationColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getLeaveCreditConfigurationTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        const withRequired = Array.from(new Set([...parsed, ...requiredLeaveCreditConfigurationColumnKeys]));
        return withRequired.filter(k => allLeaveCreditConfigurationColumnKeys.includes(k));
      }
    } catch {
      // ignore
    }
    return allLeaveCreditConfigurationColumnKeys;
  });

  useEffect(() => {
    setSelectedLeaveCreditConfigurationColumnKeys(prev =>
      Array.from(new Set([...prev, ...requiredLeaveCreditConfigurationColumnKeys])).filter(k =>
        allLeaveCreditConfigurationColumnKeys.includes(k)
      )
    );

  }, [leaveCreditConfigurationColumns.length]);

  const visibleLeaveCreditConfigurationColumns = useMemo(
    () => leaveCreditConfigurationColumns.filter(col => selectedLeaveCreditConfigurationColumnKeys.includes(col.key)),
    [leaveCreditConfigurationColumns, selectedLeaveCreditConfigurationColumnKeys]
  );
  //#endregion

  //#region  HANDLE CHANGE EVENT

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  //#endregion

  //#region  DELETE LEAVE CREDIT CONFIGURATION EVENT
  const handleDeleteLeaveCreditConfiguration = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteLeaveCreditConfigurationData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: DeleteLeaveCreditConfigurationRequest = {
          LeaveCreditConfigurationId: deleteLeaveCreditConfigurationData.LeaveCreditConfigurationId,
          Uniquekey: deleteLeaveCreditConfigurationData.Uniquekey ?? "",
        };

        const response = await leaveCreditConfigurationService.apiCallDeleteLeaveCreditConfiguration(params);

        if (E.isRight(response)) {

          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          }

          else if (leaveCreditConfigurationList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadLeaveCreditConfigurations(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteLeaveCreditConfigurationData(null);

        } else {

          addToast({ type: 'error', title: response.left.message });

          setIsConfirmationDialogBoxOpen(false);

        }

        return response
      },
      undefined,
      (error: unknown) => {
        const err = error as { message?: string };
        addToast({ type: 'error', title: err.message || 'An error occurred' });
      },
      undefined,
      'Delete Leave Credit Configuration'
    );
  };

  //#endregion


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Department Name"
        onSearchChange={searchLeaveCreditConfigurations}
        onClearSearch={clearSearchLeaveCreditConfigurations}
        isShowFilterButton
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters);
          setShowFilterPopup(true);
        }}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeLeaveCreditConfigurationColumnsModal(true)}
        // ADD
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={() => navigate('/leaveCreditConfiguration/add')}
        // EXPORT
        isShowExportButton={canExport && leaveCreditConfigurationListForTable.length > 0}
        onExportExcel={handleExportLeaveCreditConfigurationExcel}
        onExportPdf={handleExportLeaveCreditConfigurationPdf}
        exportLoading={isLoading}
      />

      <DataTable
        data={leaveCreditConfigurationListForTable}
        columns={visibleLeaveCreditConfigurationColumns}
        pagination={leaveCreditConfigurationPaginationInfo}
        emptyMessage="No Leave Credit Configuration Data Found"
        fixedHeight
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeLeaveCreditConfigurationColumnsModal}
        onClose={() => setIsShowCustomizeLeaveCreditConfigurationColumnsModal(false)}
        onApply={keys => {
          const withRequired = Array.from(new Set([...keys, ...requiredLeaveCreditConfigurationColumnKeys]));
          setSelectedLeaveCreditConfigurationColumnKeys(withRequired);
          try {
            LocalStorageHelper.storeLeaveCreditConfigurationTableColumns(JSON.stringify(withRequired));
          } catch {
            // ignore
          }
        }}
        columns={leaveCreditConfigurationColumns}
        selectedKeys={selectedLeaveCreditConfigurationColumnKeys}
        requiredKeys={requiredLeaveCreditConfigurationColumnKeys}
        title="Customize Table Columns"
      />

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false);
          setDeleteLeaveCreditConfigurationData(null);
        }}
        onConfirm={handleDeleteLeaveCreditConfiguration}
        loading={isLoading}
        pageName='Leave Credit Configuration'
      />

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Leave Credit Configuration"
        onSubmit={e => {
          e.preventDefault();
          updateListState({ filters: tempFilters, page: 1 });
          setShowFilterPopup(false);
        }}
        saveText="Apply "
        cancelText="Clear"
        onCancel={() => {
          setTempFilters({});
          resetFilters();
        }}
        size="small-half"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Input
                label='Department'
                type="text"
                value={tempFilters.DepartmentName || ''}
                onChange={e => handleFilterChange('DepartmentName', e.target.value)}
                placeholder="Enter department name"
              />
            </div>
            <div>
              <Input
                label='Designation'
                type="text"
                value={tempFilters.DesignationName || ''}
                onChange={e => handleFilterChange('DesignationName', e.target.value)}
                placeholder="Enter designation name"
              />
            </div>
            <div>
              <DateInput
                label='Start Date'
                value={tempFilters.StartDate || null}
                onChange={(value) => handleFilterChange('StartDate', value || '')}
              />
            </div>
            <div>
              <DateInput
                label='End Date'
                value={tempFilters.EndDate || null}
                onChange={(value) => handleFilterChange('EndDate', value || '')}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div >
  );
};

export default LeaveCreditConfiguration;
