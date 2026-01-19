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
import { Input } from '@/ui/components/forms';
import { updateFilter } from '@/core/utils/filterHelper';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { fetchBuildingDropdown } from '@/features/building/buildingDropdown';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import Tabs, { type TabItem } from '@/ui/components/Tab/Tab';
import { proposedOfferService } from '@/features/proposedOffer/services/ProposedOfferService';

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
  const { projectId } = useProject();
  const { addToast } = useToast();
  const { canExport } = useMenuPermissions();

  const { pagination, setPagination } = usePagination(20);
  const [sortInfo] = useState<SortInfo | undefined>();

  const [tenantApplicantChargesList, setTenantApplicantChargesList] = useState<TenantApplicantCharges[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const [buildingId, setBuildingId] = useState(0);
  const [buildingName, setBuildingName] = useState('');

  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  //#endregion

  //#region TAB ACTIVITY
  const rentTabList = [
    { id: "Additional Rent", label: "Additional Rent" },
    { id: "Rent", label: "Rent" },
    { id: "Corpus", label: "Corpus" },
    { id: "Brokerage", label: "Brokerage" },
    { id: "Shifting", label: "Shifting" }
  ];

  const [activeTab, setActiveTab] = useState(rentTabList[0].id);
  const [tenureTabList, setTenureTabList] = useState<TabItem[]>([]);
  const [activeTenureTab, setActiveTenureTab] = useState('');


  const isMonthBasedTab = ['Rent', 'Additional Rent', 'Brokerage'].includes(activeTab);
  const isStageBasedTab = ['Corpus', 'Shifting'].includes(activeTab);


  //#endregion

  //#region BUILDING DROPDOWN
  const selectedBuilding = useMemo(() => {
    if (!projectId || !buildingId) return null;
    return { label: buildingName, value: buildingId };
  }, [buildingId, buildingName]);

  const fetchBuildingCallback = useCallback((pageNumber: number) =>
    fetchBuildingDropdown(pageNumber, { projectId: Number(projectId) }),
    [projectId]
  );
  //#endregion

  //#region DEBOUNCE SEARCH
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setPagination({ currentPage: 1 });
    setFilters(prev => ({ ...prev, FlatNumber: value.trim() }));
  }, 350);
  //#endregion

  //#region TENURE FETCH
  useEffect(() => {
    if (!projectId || buildingId <= 0) return;
    if (!['Rent', 'Brokerage'].includes(activeTab)) {
      setTenureTabList([]);
      setActiveTenureTab('');
      return;
    }

    (async () => {
      const response = await proposedOfferService.apiCallPullRentDetails({
        ProjectId: Number(projectId),
        BuildingId: buildingId
      });

      if (E.isRight(response)) {
        const tenures = Array.from(
          new Set(response.right.Data?.map((d: any) => d?.Tenure).filter(Boolean))
        );

        const tabs = tenures.map(t => ({ id: t, label: t }));
        setTenureTabList(tabs);

        if (tabs.length > 0) {
          setActiveTenureTab(tabs[0].id);
          setFilters(prev => ({ ...prev, Tenure: tabs[0].id }));
        }
      }
    })();
  }, [activeTab, projectId, buildingId]);

  useEffect(() => {
    setBuildingId(0);
    setBuildingName('');
  }, [projectId]);

  //#endregion

  //#region DATA LOAD RENT LIST

  const loadRents = useCallback(async () => {

    if (!projectId || buildingId <= 0) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        let sortByParam: string | undefined;

        if (sortInfo) {
          const col = columns.find(c => c.key === sortInfo.column);
          if (col) {
            sortByParam = `${col.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const params: FilterWithPaginationTenantApplicantChargesRequest = {
          PageNumber: pagination.currentPage,
          PageSize: pagination.pageSize,
          ProjectId: Number(projectId),
          BuildingId: buildingId,
          ...filters,
          SortBy: sortByParam
        };

        const response = await rentService.apiCallPullTenantApplicantCharges(params);

        if (E.isRight(response)) {

          setTenantApplicantChargesList(response.right.Data);

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize)
          });

        } else {

          addToast({ type: 'error', title: response.left.message });

        }
      },
      undefined,
      e => addToast({ type: 'error', title: e.message }),
      undefined,
      'Loading ' + activeTab
    );
  }, [projectId, buildingId, filters, pagination.currentPage, pagination.pageSize, sortInfo]);


  useEffect(() => {
    loadRents();
  }, [loadRents]);
  //#endregion

  //#region HANLDE BUILDING CHANGE EVENT

  const handleBuildingChange = (item: { label: string; value: number | string | null }) => {
    if (!item?.value) return;
    const id = Number(item.value);
    if (isNaN(id)) return;

    setBuildingId(id);
    setBuildingName(item.label);
    setSearchTerm('');
    setPagination({ currentPage: 1 });
    setFilters({ ChargeType: activeTab });
    setTenantApplicantChargesList([]);
  };

  //#endregion

  //#region DYANMIC HEADERS & TABLE DATA
  const dynamicHeaders = useMemo(() => {
    const headers = new Set<string>();

    tenantApplicantChargesList.forEach(item => {
      if (item.Date === "1997-01-01T00:00:00" || item.Date === "1997-01-02T00:00:00") return

      if (isMonthBasedTab && item.Date) {
        headers.add(formatDate_dd_MonthName_yy(item.Date));
      }

      if (isStageBasedTab && item.Stage) {
        headers.add(item.Stage);
      }
    });

    const sorted = Array.from(headers).sort((a, b) => {
      if (isMonthBasedTab) {
        return new Date(`01 ${a}`).getTime() - new Date(`01 ${b}`).getTime();
      }
      return a.localeCompare(b);
    });

    // ✅ ALWAYS ADD TOTAL COLUMNS
    if (tenantApplicantChargesList.length > 0) {
      sorted.push('Total', 'Paid Total');
    }

    return sorted;
  }, [tenantApplicantChargesList, isMonthBasedTab, isStageBasedTab]);

  const tableData = useMemo<PivotRentRow[]>(() => {
    const map = new Map<string, PivotRentRow>();

    tenantApplicantChargesList.forEach(item => {
      if (!item.FlatNumber) return;

      if (!map.has(item.FlatNumber)) {
        const row: PivotRentRow = {
          FlatNumber: item.FlatNumber,
          ApplicantName: item.ApplicantName,
          ApplicantType: item.ApplicantType,
          FlatCarpetAreaSqFt: Number(item.FlatCarpetAreaSqFt) || 0,
          FlatType: item.FlatType,
          Unit: item.Unit,
          ProposedOfferAmount: Number(item.ProposedOfferAmount) || 0,
          Total: 0,
          'Paid Total': 0
        };

        dynamicHeaders.forEach(h => {
          if (!(h in row)) row[h] = '-';
        });

        map.set(item.FlatNumber, row);
      }

      const row = map.get(item.FlatNumber)!;

      const amount = Number(item.Amount || 0);

      // MONTH BASED
      if (isMonthBasedTab && item.Date && item.Date !== "1997-01-01T00:00:00" &&
        item.Date !== "1997-01-02T00:00:00") {
        const key = formatDate_dd_MonthName_yy(item.Date);
        row[key] = amount ? `₹${amount}` : '-';
      }

      // STAGE BASED
      if (isStageBasedTab && item.Stage) {
        row[item.Stage] = amount;
        row['Total'] += amount;
      }

      // ───────── TOTAL INDICATOR ─────────
      if (item.Date === "1997-01-01T00:00:00") {
        row.Total = amount; // ✅ ONLY HERE
      }

      // ───────── PAID TOTAL INDICATOR ─────────
      if (item.Date === "1997-01-02T00:00:00") {
        row['Paid Total'] = amount;
      }

    });

    return Array.from(map.values()).map(row => ({
      ...row,
      Total: row.Total ? `₹${row.Total}` : '-',
      'Paid Total': row['Paid Total'] ? `₹${row['Paid Total']}` : '-'
    }));
  }, [tenantApplicantChargesList, dynamicHeaders, isMonthBasedTab, isStageBasedTab]);


  //#endregion

  //#region EXCEL EXPORT TO EXCEL | PDF
  const handleExportRents = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        let sortByParam: string | undefined;
        if (sortInfo) {
          const column = columns.find(col => col.key === sortInfo.column);
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

        const response = await rentService.apiCallPullTenantApplicantCharges(params);

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

  //#region COLUMNS
  const columns = useMemo<TableColumn[]>(() => {
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
      width: h === 'Total' || h === 'Paid Total' ? '16' : '12',
      align: 'right' as const
    }));

    return [...baseColumns, ...dynamicColumns];
  }, [dynamicHeaders]);


  const paginationInfo: PaginationInfo = {
    ...pagination,
    onPageChange: p => setPagination({ currentPage: p })
  };

  //#endregion

  //#region  CLAER SEARCH & FILTERS
  const clearSearchRents = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();

    setPagination({ currentPage: 1 });

    setFilters(prev => ({
      ...prev,
      FlatNumber: ''
    }));
  };
  //#endregion

  //#region APPLY & CLEAR FILTERS

  const applyFilters = () => {
    setFilters(tempFilters);
    setPagination({ currentPage: 1 });
    setShowFilterPopup(false);
  };


  const clearFilters = () => {
    const resetFilters: FilterInfo = {
      ChargeType: activeTab,
      Tenure: activeTenureTab || ''
    };

    setTempFilters(resetFilters);
    setFilters(resetFilters);
    setPagination({ currentPage: 1 });
    setShowFilterPopup(false);
    setSearchTerm('');
    debouncedSearch.cancel?.();
  };

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
        isShowExportButton={canExport && tableData.length > 0}
        onExportExcel={handleExportRentExcel}
        onExportPdf={handleExportRentPdf}
        exportLoading={isLoading}
      />

      <div className="flex items-center gap-4 flex-nowrap">

        {/* Building dropdown */}
        <div className={`relative w-[300px] flex-shrink-0 ${selectedBuilding ? "pb-0" : "pb-5"}`}>
          <SingleSelectDropdownWithPagination
            title="Select Building"
            size="lg"
            initialValue={selectedBuilding}
            dataFetchCallBack={fetchBuildingCallback}
            onSelected={handleBuildingChange}
            className='Bold'
          />
        </div>

        {/* Tabs */}
        {selectedBuilding && (
          <div className="flex-1 min-w-0 pt-2">
            <Tabs
              tabs={rentTabList}
              defaultActive={activeTab}
              onTabChange={t => {
                setActiveTab(t.id);
                setActiveTenureTab('');
                setPagination({ currentPage: 1 });
                setFilters(prev => ({ ...prev, ChargeType: t.id, Tenure: '' }));
              }}
              islarge
            />
          </div>
        )}

      </div>


      {tenureTabList.length > 0 && (
        <div className='pt-1'>
          <div className="my-3 border-b border-gray-200" />
          <Tabs
            tabs={tenureTabList}
            defaultActive={activeTenureTab}
            onTabChange={t => {
              setActiveTenureTab(t.id);
              setPagination({ currentPage: 1 });
              setFilters(prev => ({ ...prev, Tenure: t.id }));
            }}
            islarge={false}
            isChips={true}
          />
        </div>
      )}

      <div className='pt-5'>
        <DataTable
          data={tableData}
          columns={columns}
          pagination={paginationInfo}
          emptyMessage="No Data Found"
          fixedHeight
        />
      </div>
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
                placeholder="Enter Flat Number"
              />
            </div>

            <div>
              <Input
                label='Applicant Name'
                type="text"
                value={tempFilters.ApplicantName || ''}
                onChange={e => handleFilterChange('ApplicantName', e.target.value)}
                placeholder="Enter Applicant Name"
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
                disabled
                value={tempFilters.Tenure || ''}
                onChange={e => handleFilterChange('Tenure', e.target.value)}
                placeholder="Enter Tenure"
              />
            </div>

            <div>
              <Input
                label='Charge Type'
                type="text"
                disabled
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
