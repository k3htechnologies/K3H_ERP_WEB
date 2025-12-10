import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, type Location } from 'react-router-dom';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import type {
  FilterWithPaginationSiteProgressFloorConstructionRequest,
  SiteProgressFloorConstructionData
} from '@/features/siteProgress/models/SiteProgressModel';
import { SiteProgressService } from '@/features/siteProgress/services/SiteProgressService';

const SiteProgressFloorConstruction: React.FC = () => {
  //#region STATE
  const [floorConstructionList, setFloorConstructionList] = useState<SiteProgressFloorConstructionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { pagination, setPagination } = usePagination(20);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation() as Location & {
    state?: {
      projectId?: number;
      inventoryBuildingId?: number;
      constructionId?: number;
      subConstructionId?: number;
      inventoryFlatFloorBasementPodiumWingId?: number;
    };
  };
  //#endregion

  //#region INIT
  useEffect(() => {
    if (!location.state?.projectId || !location.state?.inventoryBuildingId || !location.state?.constructionId || !location.state?.subConstructionId || !location.state?.inventoryFlatFloorBasementPodiumWingId) {
      addToast({ type: 'error', title: 'Wing context missing' });
      return;
    }
    fetchFloorConstructionList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);
  //#endregion

  //#region DATA LOAD
  const fetchFloorConstructionList = async (page: number = pagination.currentPage, term: string = searchTerm) => {
    await loadFloorConstruction(page, term);
  };

  const loadFloorConstruction = async (page: number, term: string = searchTerm) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        if (!location.state?.projectId || !location.state?.inventoryBuildingId || !location.state?.constructionId || !location.state?.subConstructionId || !location.state?.inventoryFlatFloorBasementPodiumWingId) return;

        const params: FilterWithPaginationSiteProgressFloorConstructionRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          ProjectId: location.state.projectId,
          InventoryBuildingId: location.state.inventoryBuildingId,
          ConstructionId: location.state.constructionId,
          SubConstructionId: location.state.subConstructionId,
          InventoryFlatFloorBasementPodiumWingId: location.state.inventoryFlatFloorBasementPodiumWingId,
          SearchTerm: term.trim() || undefined,
          SortBy: sortInfo ? `${sortInfo.column} ${sortInfo.direction.toUpperCase()}` : undefined
        };

        const response = await SiteProgressService.apiCallPullSiteProgressFloorConstruction(params);

        if (E.isRight(response)) {
          setFloorConstructionList(response.right.Data);
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
      'Loading Site Progress - Floor Construction'
    );
  };
  //#endregion

  //#region TABLE CONFIG
  const handlePageChange = useCallback((page: number) => {
    fetchFloorConstructionList(page);
  }, []);

  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    fetchFloorConstructionList(1);
  }, []);

  const floorConstructionPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize]
  );

  const filteredFloorConstructionList = useMemo(() => {
    if (!searchTerm.trim()) return floorConstructionList;
    const term = searchTerm.toLowerCase();
    return floorConstructionList.filter(item =>
      (item.Floor || '').toLowerCase().includes(term) ||
      (item.Status || '').toLowerCase().includes(term)
    );
  }, [floorConstructionList, searchTerm]);
  //#endregion

  //#region VIEW
  const handleViewFloorConstruction = useCallback((row: SiteProgressFloorConstructionData) => {
    if (!row.ProjectId || !row.InventoryBuildingId || !row.ConstructionId || !row.SubConstructionId || !row.InventoryFlatFloorBasementPodiumWingId || !row.InventoryFloorId) {
      addToast({ type: 'error', title: 'Floor details not available' });
      return;
    }
    navigate('/siteProgress/SiteProgressFlatConstruction', {
      state: {
        projectId: row.ProjectId,
        inventoryBuildingId: row.InventoryBuildingId,
        constructionId: row.ConstructionId,
        subConstructionId: row.SubConstructionId,
        inventoryFlatFloorBasementPodiumWingId: row.InventoryFlatFloorBasementPodiumWingId,
        inventoryFloorId: row.InventoryFloorId
      }
    });
  }, [navigate]);
  //#endregion

  //#region TABLE COLUMN
  const floorConstructionColumns = useMemo<TableColumn[]>(() => [
    {
      key: 'Floor',
      label: 'Floor',
      width: '24',
      sortable: true,
      fixed: 'left',
      align: 'left',
      render: (value, row) => (
        <TooltipText
          text={value || 'N/A'}
          maxWidth="220px"
          tooltipThreshold={22}
          onClick={() => handleViewFloorConstruction(row)}
        />
      )
    },
    {
      key: 'Status',
      label: 'Status',
      width: '16',
      sortable: true,
      align: 'center',
      render: value => value || '-'
    },
    {
      key: 'PlanStartDate',
      label: 'Plan Start',
      width: '16',
      sortable: false,
      align: 'center',
      render: value => value || '-'
    },
    {
      key: 'PlanEndDate',
      label: 'Plan End',
      width: '16',
      sortable: false,
      align: 'center',
      render: value => value || '-'
    },
    {
      key: 'NextAction',
      label: 'Next Action',
      width: '20',
      sortable: false,
      align: 'left',
      render: value => value || '-'
    }
  ], [handleViewFloorConstruction]);
  //#endregion

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* ============================================================================
          COMMAN LOADER FOR PAGE
           ============================================================================ */}
      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

      {/* ============================================================================
          COMBINED SEARCH BAR, FILTER IMPORT , EXPORT ROW
           ============================================================================ */}
      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Floor"
        onSearchChange={(v) => {
          setSearchTerm(v);
          fetchFloorConstructionList(1, v);
        }}
        onClearSearch={() => {
          setSearchTerm('');
          fetchFloorConstructionList(1);
        }}
        isShowFilterButton={false}
        filters={{}}
        onOpenFilter={() => {}}
        isShowCustomizeButton={false}
        onCustomize={() => {}}
        isShowAddButton={false}
        isShowImportButton={false}
        isShowExportButton={false}
      />

      {/* DATA TABLE */}
      <DataTable
        data={filteredFloorConstructionList}
        columns={floorConstructionColumns}
        pagination={floorConstructionPaginationInfo}
        emptyMessage="No floor construction records found"
        fixedHeight
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        loading={isLoading}
      />
    </div>
  );
};

export default SiteProgressFloorConstruction;