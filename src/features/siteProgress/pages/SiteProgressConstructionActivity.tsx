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
import { SiteProgressBreadcrumb } from '@/features/siteProgress/Breadcrumb/SiteProgressBreadcrumb';
import type {
  FilterWithPaginationSiteProgressConstructionActivityRequest,
  SiteProgressConstructionActivityData
} from '@/features/siteProgress/models/SiteProgressModel';
import { SiteProgressService } from '@/features/siteProgress/services/SiteProgressService';

const SiteProgressConstructionActivity: React.FC = () => {
  //#region STATE
  const [constructionActivityList, setConstructionActivityList] = useState<SiteProgressConstructionActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { pagination, setPagination } = usePagination(100);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation() as Location & {
    state?: {
      projectId?: number;
      inventoryBuildingId?: number;
      constructionId?: number;
      subConstructionId?: number;
      inventoryFlatFloorBasementPodiumWingId?: number;
      inventoryFloorId?: number;
      inventoryFlatId?: number;
      breadcrumbs?: Array<{ label: string; path?: string }>;
    };
  };
  //#endregion

  //#region INIT
  useEffect(() => {

    fetchConstructionActivityList();
  }, [location.state]);
  //#endregion

  //#region DATA LOAD
  const fetchConstructionActivityList = async (page: number = pagination.currentPage, term: string = searchTerm) => {
    await loadConstructionActivity(page, term);
  };

  const loadConstructionActivity = async (page: number, term: string = searchTerm) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        if (term) { }
        const params: FilterWithPaginationSiteProgressConstructionActivityRequest = {
          ProjectId: location.state.projectId,
          InventoryBuildingId: location.state.inventoryBuildingId,
          ConstructionId: location.state.constructionId,
          SubConstructionId: location.state.subConstructionId,
          InventoryFlatFloorBasementPodiumWingId: location.state.inventoryFlatFloorBasementPodiumWingId,
          InventoryFloorId: location.state.inventoryFloorId,
          InventoryFlatId: location.state.inventoryFlatId
        };

        const response = await SiteProgressService.apiCallPullSiteProgressConstructionActivity(params);

        if (E.isRight(response)) {
          setConstructionActivityList(response.right.Data);
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
      'Loading Site Progress - Construction Activity'
    );
  };
  //#endregion

  //#region TABLE CONFIG
  const handlePageChange = useCallback((page: number) => {
    fetchConstructionActivityList(page);
  }, []);

  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    fetchConstructionActivityList(1);
  }, []);

  const constructionActivityPaginationInfo: PaginationInfo = useMemo(
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

  //#region VIEW
  const handleViewConstructionActivity = useCallback((row: SiteProgressConstructionActivityData) => {
    const currentBreadcrumbs = location.state?.breadcrumbs || [];
    const activityState = {
      projectId: row.ProjectId,
      inventoryBuildingId: location.state?.inventoryBuildingId,
      constructionId: location.state?.constructionId,
      subConstructionId: location.state?.subConstructionId,
      inventoryFlatFloorBasementPodiumWingId: location.state?.inventoryFlatFloorBasementPodiumWingId,
      inventoryFloorId: location.state?.inventoryFloorId,
      inventoryFlatId: location.state?.inventoryFlatId,
      breadcrumbs: currentBreadcrumbs
    };
    const newBreadcrumb = {
      label: `Activity: ${row.ActivityName || 'N/A'}`,
      path: '/siteProgress/SiteProgressConstructionActivity',
      state: activityState
    };

    navigate('/siteProgress/SiteProgressConstructionSubActivity', {
      state: {
        projectId: row.ProjectId,
        constructionActivityId: row.ConstructionActivityId,
        breadcrumbs: [...currentBreadcrumbs, newBreadcrumb]
      }
    });
  }, [navigate, location.state]);
  //#endregion

  //#region TABLE COLUMN
  const constructionActivityColumns = useMemo<TableColumn[]>(() => [
    {
      key: 'ActivityName',
      label: 'Activity',
      width: '32',
      sortable: true,
      fixed: 'left',
      align: 'left',
      render: (value, row) => (
        <TooltipText
          text={value || 'N/A'}
          maxWidth="260px"
          tooltipThreshold={26}
          onClick={() => handleViewConstructionActivity(row)}
        />
      )
    }
  ], [handleViewConstructionActivity]);
  //#endregion

  //#region BREAD CRUM ITEMS
  const breadcrumbItems = useMemo(() => {
    return location.state?.breadcrumbs || [];
  }, [location.state]);
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
        searchPlaceholder="Search By Activity"
        onSearchChange={(v) => {
          setSearchTerm(v);
          fetchConstructionActivityList(1, v);
        }}
        onClearSearch={() => {
          setSearchTerm('');
          fetchConstructionActivityList(1);
        }}
        isShowFilterButton={false}
        filters={{}}
        onOpenFilter={() => { }}
        isShowCustomizeButton={false}
        onCustomize={() => { }}
        isShowAddButton={false}
        isShowImportButton={false}
        isShowExportButton={false}
      />
      {/* ============================================================================
          BREADCRUMB NAVIGATION
           ============================================================================ */}
      <SiteProgressBreadcrumb items={breadcrumbItems} />

      {/* DATA TABLE */}
      <DataTable
        data={constructionActivityList}
        columns={constructionActivityColumns}
        pagination={constructionActivityPaginationInfo}
        emptyMessage="No Construction Activities Data Found"
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

export default SiteProgressConstructionActivity;