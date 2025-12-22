import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  TenantApplicantCharges,
  FilterWithPaginationTenantApplicantChargesRequest
} from '@/features/rent/models/RentModel';

import { rentService } from '@/features/rent/services/RentService';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { useLocation, type Location, useNavigate } from 'react-router-dom';
import { Input } from '@/ui/components/forms';
import { updateFilter } from '@/core/utils/filterHelper';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { fetchBuildingDropdown } from '@/features/building/buildingDropdown';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import Tabs, { type TabItem } from '@/ui/components/Tab/Tab';
import type { FilterWithPaginationProposedOfferRentDetailsRequest } from '@/features/proposedOffer/models/ProposedOfferModel';
import { ProposedOfferService } from '@/features/proposedOffer/services/ProposedOfferService';

type PivotRentRow = {
  FlatNumber?: string;
  ApplicantType?: string;
  ApplicantName?: string;
  FlatCarpetAreaSqFt?: number;
  FlatConfiguration?: string;
  FlatType?: string;
  Tenure?: string;
  Stage?: string;
  ProposedOfferAmount?: number;
  Amount?: number;
  Unit?: string;
  [month: string]: any;
};

export const Rent: React.FC = () => {
  //#region STATE
  const [tenantApplicantChargesList, setTenantApplicantChargesList] = useState<TenantApplicantCharges[]>([]);

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
    searchRents(value);
  }, 350);

  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});


  const { canExport } = useMenuPermissions();

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

  //#region TAB ACTIVITY
  const rentTabList = [
    { id: "Additional Rent", label: "Additional Rent" },
    { id: "Rent", label: "Rent" },
    { id: "Corpus", label: "Corpus" },
    { id: "Brokerage", label: "Brokerage" },
    { id: "Shifting", label: "Shifting" }
  ];

  const [activeTab, setActiveTab] = useState<string>(rentTabList[0].id);

  const [tenureTabList, setTenureTabList] = useState<TabItem[]>([]);

  const [activeForTenureTab, setActiveForTenureTab] = useState<string>('');

  const isMonthBasedTab = ['Rent', 'Additional Rent', 'Brokerage'].includes(activeTab);
  const isStageBasedTab = ['Corpus', 'Shifting'].includes(activeTab);


  //#endregion

  //#region PROJECT SELECTION GET ID

  const { projectId } = useProject();

  //#endregion

  //#region INIT

  useEffect(() => {
    if (!projectId || !buildingId) return;

    if (activeTab === 'Rent' || activeTab === 'Brokerage') {

      fetchProposedOfferRentDetailsData();
    }
    else {

      setTenureTabList([]);
      setActiveForTenureTab('');
    }


  }, [activeTab, projectId, buildingId]);

  const selectedBuilding = useMemo(() => {
    if (!projectId || !buildingId) return null;
    return { label: buildingName, value: buildingId };
  }, [buildingId, buildingName]);

  const fetchBuildingCallback = useCallback(
    (pageNumber: number) =>
      fetchBuildingDropdown(pageNumber, { projectId: Number(projectId) }),
    [projectId]
  );

  useEffect(() => {
    setBuildingId(0);
    setBuildingName('');
  }, [projectId]);


  useEffect(() => {
    if (!projectId) return;

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

    setBuildingName(listState.buildingName ?? '');

    if (listState.searchTerm && String(listState.searchTerm).trim()) {

      setSearchTerm(String(listState.searchTerm));

      setBuildingId(Number(listState.buildingId));

      setBuildingName(String(listState.buildingName));

      loadRents(listState.page ?? 1, { FlatNumber: String(listState.searchTerm).trim() });

      return;
    }

    loadRents(listState.page ?? 1, listState.filters ?? {});

  }, [location.state, projectId]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);

  //#endregion

  //#region DATA LOAD RENT LIST
  const fetchRentList = async (page: number = pagination.currentPage) => {
    return await loadRents(page, filters);
  };

  const loadRents = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam: string | undefined;

        if (sortInfo) {
          const column = rentColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const params: FilterWithPaginationTenantApplicantChargesRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          ProjectId: Number(projectId),
          BuildingId: buildingId > 0 ? buildingId : undefined,
          TenantId: filterParams.TenantId ? Number(filterParams.TenantId) : undefined,
          TenantApplicantChargesId: filterParams.TenantApplicantChargesId ? Number(filterParams.TenantApplicantChargesId) : undefined,
          Tenure: filterParams.Tenure?.trim() || undefined,
          ChargeType: filterParams.ChargeType?.trim() || undefined,
          ApplicantType: filterParams.ApplicantType?.trim() || undefined,
          ApplicantName: filterParams.ApplicantName?.trim() || undefined,
          FlatNumber: filterParams.FlatNumber?.trim() || undefined,
          FlatCarpetAreaSqFt: filterParams.FlatCarpetAreaSqFt ? Number(filterParams.FlatCarpetAreaSqFt) : undefined,
          FlatType: filterParams.FlatType?.trim() || undefined,
          FlatConfiguration: filterParams.FlatConfiguration?.trim() || undefined,
          SortBy: sortByParam
        };

        const response = await getRents(params);

        if (E.isRight(response)) {

          setTenantApplicantChargesList(response.right.Data);

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
      'Loading Data'
    );
  };

  //#endregion

  //#region PROPOSED OFFER RENT TENURE DETAILS FETCH

  const fetchProposedOfferRentDetailsData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const params: FilterWithPaginationProposedOfferRentDetailsRequest = {
          ProjectId: Number(projectId),
          BuildingId: buildingId
        };

        const response = await ProposedOfferService.apiCallPullRentDetails(params);

        if (E.isRight(response)) {

          const data = response.right.Data ?? [];

          // DISTINCT Tenure
          const distinctTenures = Array.from(
            new Set(
              data
                .map((d: any) => d?.Tenure)
                .filter((t: any) => t && t.trim() !== '')
            )
          );

          const tabs: TabItem[] = distinctTenures.map((tenure) => ({
            id: String(tenure),
            label: String(tenure),
          }));

          setTenureTabList(tabs);

          if (tabs.length === 0) {
            setActiveForTenureTab('');
            return response;
          }

          const firstTenure = tabs[0].id;
          setActiveForTenureTab(firstTenure);


          const updatedFilters: FilterInfo = {
            ...filters,
            Tenure: firstTenure,
          };

          setFilters(updatedFilters);

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
      'Loading Proposed Offer Rent Details'
    );
  };
  //#endregion
  //#region SEARCH RENT FILTER
  const searchRents = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchRentList();

      return;
    }

    const filterParams: FilterInfo = {
      FlatNumber: searchValue.trim()
    };

    await loadRents(1, filterParams);
  };

  //#endregion

  //#region CLEAR SEARCH RENT
  const clearSearchRents = () => {

    setSearchTerm('');

    debouncedSearch.cancel?.();

    setFilters({});

    setTempFilters({});

    setPagination({ currentPage: 1 });

    loadRents(1, {});
  };

  //#endregion

  //#region EXCEL EXPORT TO EXCEL | PDF
  const handleExportRents = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam: string | undefined;
        if (sortInfo) {
          const column = rentColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const params: FilterWithPaginationTenantApplicantChargesRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          ProjectId: Number(projectId),
          BuildingId: buildingId > 0 ? buildingId : undefined,
          TenantId: filters.TenantId ? Number(filters.TenantId) : undefined,
          TenantApplicantChargesId: filters.TenantApplicantChargesId ? Number(filters.TenantApplicantChargesId) : undefined,
          Tenure: filters.Tenure?.trim() || undefined,
          ChargeType: filters.ChargeType?.trim() || undefined,
          ApplicantType: filters.ApplicantType?.trim() || undefined,
          ApplicantName: filters.ApplicantName?.trim() || undefined,
          FlatNumber: filters.FlatNumber?.trim() || undefined,
          FlatCarpetAreaSqFt: filters.FlatCarpetAreaSqFt ? Number(filters.FlatCarpetAreaSqFt) : undefined,
          FlatType: filters.FlatType?.trim() || undefined,
          FlatConfiguration: filters.FlatConfiguration?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        };

        const response = await getRents(params);

        handleExportFile(response, exportType, 'Rent', addToast);

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

  const handleExportRentExcel = () => handleExportRents('Excel');
  const handleExportRentPdf = () => handleExportRents('PDF');

  //#endregion

  //#region PULL RENT
  const getRents = async (filterParams: FilterWithPaginationTenantApplicantChargesRequest) => {
    return await rentService.apiCallPullTenantApplicantCharges(filterParams);
  };
  //#endregion

  //#region TABLE CONFIG
  const handlePageChange = useCallback((page: number) => {
    fetchRentList(page);
  }, [fetchRentList]);



  const rentPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize]
  );


  //#endregion

  //#region MONTH HEADERS

  //#region MONTH AND STAGES HEADERS
  const dynamicHeaders = useMemo(() => {
    const headers = new Set<string>();
    let hasTotal = false;
    let hasPaidTotal = false;

    tenantApplicantChargesList.forEach(item => {

      // MONTH BASED
      if (isMonthBasedTab && item.Date) {
        const d = new Date(item.Date);
        d.setHours(0, 0, 0, 0);

        if (d.getFullYear() === 1997 && d.getMonth() === 0 && d.getDate() === 1) {
          hasTotal = true;
          return;
        }

        if (d.getFullYear() === 1997 && d.getMonth() === 0 && d.getDate() === 2) {
          hasPaidTotal = true;
          return;
        }

        headers.add(formatDate_dd_MonthName_yy(d.toISOString()));
      }

      // STAGE BASED
      if (isStageBasedTab && item.Stage && item.Stage.trim()) {
        headers.add(item.Stage.trim());
      }
    });

    // SORT
    const sortedHeaders = Array.from(headers).sort((a, b) => {
      if (['Total', 'Paid Total'].includes(a)) return 1;
      if (['Total', 'Paid Total'].includes(b)) return -1;

      if (isMonthBasedTab) {
        return new Date(`01 ${a}`).getTime() - new Date(`01 ${b}`).getTime();
      }
      return a.localeCompare(b);
    });


    // ALWAYS ADD for STAGE TABS
    if (isStageBasedTab && tenantApplicantChargesList.length > 0) {
      sortedHeaders.push('Total', 'Paid Total');
    }

    // MONTH TABS → add only if detected
    if (isMonthBasedTab) {
      if (hasTotal) sortedHeaders.push('Total');
      if (hasPaidTotal) sortedHeaders.push('Paid Total');
    }

    return sortedHeaders;
  }, [tenantApplicantChargesList, isMonthBasedTab, isStageBasedTab]);


  //#endregion

  //#region PIVOT DATA (ONE ROW)

  const rentsForTable = useMemo<PivotRentRow[]>(() => {
    const map = new Map<string, PivotRentRow>();

    tenantApplicantChargesList.forEach(item => {
      if (!item.FlatNumber) return;

      if (!map.has(item.FlatNumber)) {
        const row: PivotRentRow = {
          FlatNumber: item.FlatNumber,
          ApplicantName: item.ApplicantName,
          ApplicantType: item.ApplicantType,
          FlatCarpetAreaSqFt: Number(item.FlatCarpetAreaSqFt) || 0,
          FlatConfiguration: item.FlatConfiguration,
          FlatType: item.FlatType,
          Unit: item.Unit,
          ProposedOfferAmount: Number(item.ProposedOfferAmount),
        };

        dynamicHeaders.forEach(h => (row[h] = '-'));
        map.set(item.FlatNumber, row);
      }

      const row = map.get(item.FlatNumber)!;

      // MONTH BASED VALUE
      if (isMonthBasedTab && item.Date) {
        const d = new Date(item.Date);
        const key =
          d.getFullYear() === 1997 && d.getMonth() === 0 && d.getDate() === 1
            ? 'Total'
            : d.getFullYear() === 1997 && d.getMonth() === 0 && d.getDate() === 2
              ? 'Paid Total'
              : formatDate_dd_MonthName_yy(d.toISOString());

        row[key] = item.Amount ? `₹${item.Amount}` : '-';
      }

      // STAGE BASED VALUE
      // STAGE BASED VALUE
      if (isStageBasedTab && item.Stage) {
        const amount = Number(item.Amount || 0);

        // Stage value
        row[item.Stage] = amount;

        // Total
        row['Total'] = (Number(row['Total']) || 0) + amount;

        // Paid Total (same logic for now)
        row['Paid Total'] = (Number(row['Paid Total']) || 0);
      }


    });

    return Array.from(map.values());
  }, [tenantApplicantChargesList, dynamicHeaders, activeTab]);


  //#endregion

  //#region COLUMNS
  const rentColumns = useMemo<TableColumn[]>(() => {
    const baseColumns: TableColumn[] = [
      { key: 'FlatNumber', label: 'Flat / Unit No.', fixed: 'left', width: '14' },
      { key: 'ApplicantName', label: 'Applicant', width: '18' },
      { key: 'ApplicantType', label: 'Applicant Type', width: '18' },
      { key: 'FlatCarpetAreaSqFt', label: 'Area SqFt', width: '18' },
      { key: 'FlatType', label: 'Flat Type', width: '18' },
      { key: 'Unit', label: 'Unit', width: '12' },
      { key: 'ProposedOfferAmount', label: 'Proposed Offer Amount', width: '20', align: 'right' }
    ];

    const dynamicColumns: TableColumn[] = dynamicHeaders.map(h => ({
      key: h,
      label: h,
      width: '12',
      align: 'right'
    }));

    return [...baseColumns, ...dynamicColumns];
  }, [dynamicHeaders]);


  //#endregion

  //#region FILTER HELPERS
  const applyFilters = () => {
    setFilters(tempFilters);
    loadRents(1, tempFilters);
    setShowFilterPopup(false);
  };

  const clearFilters = () => {
    setTempFilters({});
    setFilters({});

    // reset page
    setPagination({ currentPage: 1 });

    // load empty filters
    loadRents(1, {});

    setShowFilterPopup(false);

    // clear router state (very important)
    navigate(location.pathname, { replace: true, state: {} });
  };
  //#endregion

  //#region HANDLE CHANGE EVENT
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };
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
        onClearSearch={clearSearchRents}
        isShowFilterButton
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters);
          setShowFilterPopup(true);
        }}
        isShowCustomizeButton
        // NO ADD BUTTON - VIEW ONLY
        isShowAddButton={false}
        // NO IMPORT BUTTON - VIEW ONLY
        isShowImportButton={false}
        // EXPORT
        isShowExportButton={canExport}
        onExportExcel={handleExportRentExcel}
        onExportPdf={handleExportRentPdf}
        exportLoading={isLoading}
      />

      <div className="pb-5 flex items-center gap-4 flex-nowrap">

        {/* Building dropdown */}
        <div className="relative w-[300px] flex-shrink-0">
          <SingleSelectDropdownWithPagination
            title="Select Building"
            size="lg"
            initialValue={selectedBuilding}
            dataFetchCallBack={fetchBuildingCallback}
            onSelected={(item) => {
              if (!item) return;
              setBuildingId(Number(item.value));
              setBuildingName(item.label);
            }}
          />
        </div>

        {/* Tabs */}
        {selectedBuilding && (
          <div className="flex-1 min-w-0 pt-2">
            <Tabs
              tabs={rentTabList}
              defaultActive={activeTab}
              onTabChange={(t) => {

                setActiveTab(t.id)

                setActiveForTenureTab('')

                const newFilters: FilterInfo = {
                  ...filters,
                  ChargeType: t.id,
                  Tenure: '',
                };
                setFilters(newFilters);

                loadRents(1, newFilters);

              }}
              islarge
            />
          </div>
        )}

      </div>

      {tenureTabList.length > 0 && (activeTab === 'Rent' || activeTab === 'Brokerage') && (
        <Tabs
          tabs={tenureTabList}
          defaultActive={activeForTenureTab}
          onTabChange={(t) => {

            setActiveForTenureTab(t.id)

            const newFilters: FilterInfo = {
              ...filters,
              Tenure: t.id,
            };

            setFilters(newFilters);

            loadRents(1, newFilters);
          }}


          islarge
        />
      )}

      <DataTable
        data={rentsForTable}
        columns={rentColumns}
        pagination={rentPaginationInfo}
        emptyMessage={`No ${activeTab}${activeForTenureTab ? ` (${activeForTenureTab})` : ''} Data Found`}

        fixedHeight
      />

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Rent"
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
                label='Applicant Name'
                type="text"
                value={tempFilters.ApplicantName || ''}
                onChange={e => handleFilterChange('ApplicantName', e.target.value)}
                placeholder="Enter applicant name"
              />
            </div>

            <div>
              <Input
                label='Applicant Type'
                type="text"
                value={tempFilters.ApplicantType || ''}
                onChange={e => handleFilterChange('ApplicantType', e.target.value)}
                placeholder="Enter Applicant Type"
              />
            </div>

            <div>
              <Input
                label='Tenure'
                type="text"
                readOnly
                value={tempFilters.Tenure || ''}
                onChange={e => handleFilterChange('Tenure', e.target.value)}
                placeholder="Enter Tenure"
              />
            </div>

            <div>
              <Input
                label='Charge Type'
                type="text"
                readOnly
                value={tempFilters.ChargeType || ''}
                onChange={e => handleFilterChange('ChargeType', e.target.value)}
                placeholder="Enter Charge Type"
              />
            </div>

            <div>
              <Input
                label='Flat Type'
                type="text"
                value={tempFilters.FlatType || ''}
                onChange={e => handleFilterChange('FlatType', e.target.value)}
                placeholder="Enter Flat Type"
              />
            </div>

            <div>
              <Input
                label='Flat Configuration'
                type="text"
                value={tempFilters.FlatConfiguration || ''}
                onChange={e => handleFilterChange('FlatConfiguration', e.target.value)}
                placeholder="Enter Flat Configuration"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Rent;
