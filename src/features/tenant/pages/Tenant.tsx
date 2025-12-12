import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  TenantData,
  FilterWithPaginationTenantRequest
} from '@/features/tenant/models/TenantModel';

import { tenantService } from '@/features/tenant/services/TenantService';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { useLocation, type Location, useNavigate } from 'react-router-dom';
import { Input } from '@/ui/components/forms';
import { updateFilter } from '@/core/utils/filterHelper';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { fetchBuildingDropdown } from '@/features/building/buildingDropdown';

var ProjectId = 1;
export const Tenant: React.FC = () => {
  //#region STATE
  const [tenantList, setTenantList] = useState<TenantData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const navigate = useNavigate();

  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');

  const [buildingId, setBuildingId] = useState(0);

  const [buildingName, setBuildingName] = useState('');

  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchTenants(value);
  }, 350);

  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  const [isShowCustomizeTenantColumnsModal, setIsShowCustomizeTenantColumnsModal] = useState(false);

  const { canAction, canExport } = useMenuPermissions();

  const location = useLocation() as Location & {
    state?: {
      listState?: {
        page?: number;
        filters?: FilterInfo;
        sortInfo?: SortInfo;
        searchTerm?: string;
        buildingId?: number;
        buildingName?: string;
      };
    };
  };


  //#endregion

  //#region INIT
  useEffect(() => {

    const incoming = location.state?.listState as
      | { page?: number; filters?: FilterInfo; sortInfo?: SortInfo; searchTerm?: string; buildingId?: number; buildingName?: string }
      | undefined;

    const listState = incoming ?? { page: 1, filters: {} as FilterInfo, sortInfo: undefined, searchTerm: '' };


    setPagination({ currentPage: listState.page ?? pagination.currentPage });

    setSortInfo(listState.sortInfo);

    setFilters(listState.filters ?? {});

    setTempFilters(listState.filters ?? {});

    setSearchTerm(listState.searchTerm ?? '');

    setBuildingId(listState.buildingId ?? 0);

    setBuildingName(listState.buildingName ?? "");

    if (listState.searchTerm && String(listState.searchTerm).trim()) {

      setSearchTerm(String(listState.searchTerm));

      setBuildingId(Number(listState.buildingId));

      setBuildingName(String(listState.buildingName));

      loadTenants(listState.page ?? 1, { FlatNumber: String(listState.searchTerm).trim() }, Number(listState.buildingId));

      return;
    }


    loadTenants(listState.page ?? 1, listState.filters ?? {}, Number(listState.buildingId));

  }, [location.state]);



  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);
  //#endregion

  //#region DATA LOAD
  const fetchTenantList = async (page: number = pagination.currentPage) => {
    return await loadTenants(page, filters, buildingId);
  };

  const loadTenants = async (page: number, filterParams: FilterInfo, buildingId: number) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam: string | undefined;

        if (sortInfo) {
          const column = tenantColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const params: FilterWithPaginationTenantRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          TenantId: filterParams.TenantId ? Number(filterParams.TenantId) : undefined,
          ProjectId: ProjectId,
          BuildingId: buildingId,
          FlatNumber: filterParams.FlatNumber?.trim() || undefined,
          FlatConfiguration: filterParams.FlatConfiguration?.trim() || undefined,
          FlatType: filterParams.FlatType?.trim() || undefined,
          SortBy: sortByParam
        };

        const response = await getTenants(params);

        if (E.isRight(response)) {
          setTenantList(response.right.Data);
          setPagination({
            currentPage: page,
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
      'Loading Tenant Data'
    );
  };

  //#endregion

  //#region SEARCH EMPLOYEE FILTER
  const searchTenants = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchTenantList();
      return;
    }

    const filterParams: FilterInfo = {
      FlatNumber: searchValue.trim()
    };

    await loadTenants(1, filterParams, buildingId);
  };


  //#endregion

  //#region CLAER SERACH EMPLOYEE
  const clearSearchTenants = () => {

    setSearchTerm('');

    debouncedSearch.cancel?.();

    setFilters({});
    setTempFilters({});
    setPagination({ currentPage: 1 });
    loadTenants(1, {}, buildingId);
    try {
      navigate(location.pathname, { replace: true, state: {} });
    } catch {
    }
  };

  //#endregion

  //#region  EXCEL EXPORT TO EXCEL | PDF
  const handleExportTenants = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam: string | undefined;
        if (sortInfo) {
          const column = tenantColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const params: FilterWithPaginationTenantRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          FlatNumber: filters.FlatNumber?.trim() || undefined,
          FlatConfiguration: filters.FlatConfiguration?.trim() || undefined,
          FlatType: filters.FlatType?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        };

        const response = await getTenants(params);

        handleExportFile(response, exportType, 'Tenant', addToast);

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' });
      },
      undefined,
      'Preparing Export...'
    );
  };

  const handleExportTenantExcel = () => handleExportTenants('Excel');
  const handleExportTenantPdf = () => handleExportTenants('PDF');

  //#endregion

  //#region PULL EMPLOYEE MASTER
  const getTenants = async (filterParams: FilterWithPaginationTenantRequest) => {
    return await tenantService.apiCallPullTenant(filterParams);
  };
  //#endregion

  //#region TABLE CONFIG
  const handlePageChange = useCallback((page: number) => {
    fetchTenantList(page);
  }, [fetchTenantList]);

  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    fetchTenantList(1);
  }, [fetchTenantList]);

  const tenantPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize]
  );

  const tenantsForTable = useMemo(() => tenantList, [tenantList]);
  //#endregion

  //#region VIEW EMPLOYEE MASTER

  const handleViewTenantDetails = useCallback((row: TenantData) => {
    navigate('/tenant/view', {
      state: {
        editTenantData: row,
        fromList: true,
        listState: {
          page: pagination.currentPage,
          filters,
          sortInfo,
          searchTerm,
          buildingId,
          buildingName
        },
      },
    });
  }, [navigate, pagination.currentPage, filters, sortInfo, searchTerm, buildingId, buildingName]);
  //#endregion

  //#region TABLE COLUMN
  const tenantColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'FlatNumber',
        label: 'Flat Number',
        width: '18',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="160px"
            tooltipThreshold={16}
            onClick={() => handleViewTenantDetails(row)}
          />
        )
      },
      {
        key: 'FlatType',
        label: 'Flat Type',
        width: '16',
        sortable: true,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="160px"
            tooltipThreshold={16}

          />
        )
      },
      {
        key: 'FlatConfiguration',
        label: 'Configuration',
        width: '18',
        sortable: true,
        align: 'left',
        render: value => <TooltipText text={value || 'N/A'} maxWidth="160px" tooltipThreshold={16} />
      },
      {
        key: 'FlatCarpetAreaSqFt',
        label: 'Carpet Area (sqft)',
        width: '18',
        sortable: true,
        align: 'center',
        render: value => value ?? '-'
      },
      {
        key: 'Facing',
        label: 'Facing',
        width: '14',
        sortable: false,
        align: 'left',
        render: value => value || 'N/A'
      },
      {
        key: 'FreeAreaOfferedPercent',
        label: 'Free Area Offered (%)',
        width: '14',
        sortable: false,
        align: 'left',
        render: value => value || 'N/A'
      },

      {
        key: 'ExtraAreaPurchasedSqFt',
        label: 'Extra Area Purchased (SqFt)',
        width: '12',
        sortable: false,
        align: 'center',
        render: value => value || 'N/A'
      },
      {
        key: 'TotalAreaSqFt',
        label: 'Total Area (sqft)',
        width: '18',
        sortable: true,
        align: 'center',
        render: value => value ?? '-'
      },
      {
        key: 'Wing',
        label: 'Wing',
        width: '12',
        sortable: false,
        align: 'center',
        render: value => value || 'N/A'
      },
      {
        key: 'Floor',
        label: 'Floor',
        width: '12',
        sortable: false,
        align: 'center',
        render: value => value || 'N/A'
      },
      {
        key: 'RERACarpetAreaSqFt',
        label: 'RERA Carpet Area (SqFt)',
        width: '12',
        sortable: false,
        align: 'center',
        render: value => value || 'N/A'
      },
      {
        key: 'InventoryFlatType',
        label: 'Inventory Flat Type',
        width: '12',
        sortable: false,
        align: 'center',
        render: value => value || 'N/A'
      },
      {
        key: 'InventoryFlatConfiguration',
        label: 'Inventory Flat Configuration',
        width: '12',
        sortable: false,
        align: 'center',
        render: value => value || 'N/A'
      },
      {
        key: 'ParkingNumber',
        label: 'Parking Number',
        width: '12',
        sortable: false,
        align: 'center',
        render: value => value || 'N/A'
      },
    ],
    [handleViewTenantDetails]

  );
  //#endregion

  //#region CUSTOMIZE COLUMNS
  const requiredTenantColumnKeys: string[] = ['FlatType'];

  const allTenantColumnKeys: string[] = tenantColumns.map(c => c.key);

  const [selectedTenantColumnKeys, setSelectedTenantColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getTenantTableColumns?.();
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        const withRequired = Array.from(new Set([...parsed, ...requiredTenantColumnKeys]));
        return withRequired.filter(k => allTenantColumnKeys.includes(k));
      }
    } catch {
      // ignore
    }
    return allTenantColumnKeys;
  });

  useEffect(() => {
    setSelectedTenantColumnKeys(prev =>
      Array.from(new Set([...prev, ...requiredTenantColumnKeys])).filter(k =>
        allTenantColumnKeys.includes(k)
      )
    );

  }, [tenantColumns.length]);

  const visibleTenantColumns = useMemo(
    () => tenantColumns.filter(col => selectedTenantColumnKeys.includes(col.key)),
    [tenantColumns, selectedTenantColumnKeys]
  );
  //#endregion

  //#region FILTER HELPERS
  const applyFilters = () => {
    setFilters(tempFilters);
    loadTenants(1, tempFilters, buildingId);
    setShowFilterPopup(false);
  };

  const clearFilters = () => {
    setTempFilters({});
    setFilters({});

    // reset page
    setPagination({ currentPage: 1 });

    // load empty filters
    loadTenants(1, {}, buildingId);

    setShowFilterPopup(false);

    // clear router state (very important)
    navigate(location.pathname, { replace: true, state: {} });
  };
  //#endregion

  //#region ADD NEW EMPLOYEE
  const handleAddTenantModal = () => {

    if (!buildingId || Number(buildingId) === 0) {
      addToast({ type: 'error', title: 'Please select Building first' });
      return;
    }

    navigate('/tenant/add', {
      state: {
        editTenantData: [],
        fromList: true,
        listState: {
          page: pagination.currentPage,
          filters,
          sortInfo,
          searchTerm,
          buildingId,
          buildingName
        },
      },
    });

  };
  //#endregion

  //#region  HANDLE CHANGE EVENT

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  //#endregion

  //#region IMPORT EXCEL | DOWNLOAD

  const excelImportTenant = async () => {

    await runApiWithLoader(

      setIsLoading,

      setIsLoadingMessage,

      async () => {
        return null;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Import failed' })
      },
      undefined,
      'Preparing Import'
    )
  }


  const downloadExcelSampleTenant = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        return null;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' })
      },
      undefined,
      'Preparing Downloading'
    )
  }

  const handleExcelImportTenant = () => excelImportTenant()
  const handleDownloadExcelSampleTenant = () => downloadExcelSampleTenant()

  //#endregion

  return (

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Flat Number"
        onSearchChange={v => {
          setSearchTerm(v);
          debouncedSearch(v);
        }}
        onClearSearch={clearSearchTenants}
        isShowFilterButton
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters);
          setShowFilterPopup(true);
        }}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeTenantColumnsModal(true)}
        // ADD
        isShowAddButton={canAction && Number(buildingId) > 0 ? true : false}

        addTitle="Add"
        onAdd={handleAddTenantModal}

        // IMPORT
        isShowImportButton={canAction}
        onUploadExcel={handleExcelImportTenant}
        onDownloadSampleExcel={handleDownloadExcelSampleTenant}

        // EXPORT
        isShowExportButton={canExport}
        onExportExcel={handleExportTenantExcel}
        onExportPdf={handleExportTenantPdf}
        exportLoading={isLoading}
      />

      <div className="pb-5 flex">

        <div className="relative min-w-0 w-[526px]">

          <SingleSelectDropdownWithPagination
            label="Building"
            title="Select Building"
            size="lg"
            initialValue={
              { label: buildingName ?? "", value: buildingId }

            }
            dataFetchCallBack={(pageNumber) => fetchBuildingDropdown(pageNumber, { projectId: 1 })}
            onSelected={(item) => {

              const buildingId = item && item.value ? Number(item.value) : undefined;

              const buildingName = item.label;

              setBuildingId(Number(buildingId));

              setBuildingName(buildingName);


              setPagination({ currentPage: 1 });

              loadTenants(1, {}, Number(buildingId));


              try {
                navigate(location.pathname, { replace: true, state: { listState: { page: 1, filters: {}, sortInfo, searchTerm, buildingId, buildingName } } });
              } catch { }
            }}
          />

        </div>
      </div>

      <DataTable
        data={tenantsForTable}
        columns={visibleTenantColumns}
        pagination={tenantPaginationInfo}
        emptyMessage="No tenants found"
        fixedHeight
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeTenantColumnsModal}
        onClose={() => setIsShowCustomizeTenantColumnsModal(false)}
        onApply={keys => {
          const withRequired = Array.from(new Set([...keys, ...requiredTenantColumnKeys]));
          setSelectedTenantColumnKeys(withRequired);
          try {
            LocalStorageHelper.storeTenantTableColumns?.(JSON.stringify(withRequired));
          } catch {
            // ignore
          }
        }}
        columns={tenantColumns}
        selectedKeys={selectedTenantColumnKeys}
        requiredKeys={requiredTenantColumnKeys}
        title="Customize Table Columns"
      />

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Tenant"
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
            <div>

              <Input
                label='Flat Number'
                type="text"
                value={tempFilters.FlatNumber || ''}
                onChange={e => handleFilterChange('FlatNumber', e.target.value)}
                placeholder="Enter flat number"
              />
            </div>

            <div>

              <Input
                label='Flat Type'
                type="text"
                value={tempFilters.FlatType || ''}
                onChange={e => handleFilterChange('FlatType', e.target.value)}
                placeholder="Enter flat type"
              />
            </div>
            <div>

              <Input
                label='Flat Configuration'
                type="text"
                value={tempFilters.FlatConfiguration || ''}
                onChange={e => handleFilterChange('FlatConfiguration', e.target.value)}
                placeholder="Enter flat configuration"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Tenant;
