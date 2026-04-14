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
  FilterWithPaginationSiteProgressWingConstructionRequest,
  SiteProgressWingConstructionData
} from '@/features/siteProgress/models/SiteProgressModel';
import { SiteProgressService } from '@/features/siteProgress/services/SiteProgressService';

const SiteProgressWingConstruction: React.FC = () => {
  //#region STATE
  const [wingConstructionList, setWingConstructionList] = useState<SiteProgressWingConstructionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
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
      breadcrumbs?: Array<{ label: string; path?: string }>;
    };
  };
  //#endregion

  //#region INIT
  useEffect(() => {
    
    fetchWingConstructionList();
    
  }, [location.state]);
  //#endregion

  //#region DATA LOAD
  const fetchWingConstructionList = async (page: number = pagination.currentPage, term: string = searchTerm) => {
    await loadWingConstruction(page, term);
  };

  const loadWingConstruction = async (page: number, term: string = searchTerm) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        if (term) { }

        const params: FilterWithPaginationSiteProgressWingConstructionRequest = {
          ProjectId: location.state.projectId,
          InventoryBuildingId: location.state.inventoryBuildingId,
          ConstructionId: location.state.constructionId,
          SubConstructionId: location.state.subConstructionId
        };

        const response = await SiteProgressService.apiCallPullSiteProgressWingConstruction(params);

        if (E.isRight(response)) {
          setWingConstructionList(response.right.Data);
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
      'Loading Site Progress - Wing Construction'
    );
  };
  //#endregion

  //#region TABLE CONFIG
  const handlePageChange = useCallback((page: number) => {
    fetchWingConstructionList(page);
  }, []);

  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    fetchWingConstructionList(1);
  }, []);

  const wingConstructionPaginationInfo: PaginationInfo = useMemo(
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
  const handleViewWingConstruction = useCallback((row: SiteProgressWingConstructionData) => {
    const currentBreadcrumbs = location.state?.breadcrumbs || [];
    const wingState = {
      projectId: row.ProjectId,
      inventoryBuildingId: row.InventoryBuildingId,
      constructionId: row.ConstructionId,
      subConstructionId: row.SubConstructionId,
      breadcrumbs: currentBreadcrumbs
    };
    const newBreadcrumb = { 
      label: `Wing: ${row.Wing || '-'}`,
      path: '/siteProgress/SiteProgressWingConstruction',
      state: wingState
    };
    
    navigate('/siteProgress/SiteProgressFloorConstruction', {
      state: {
        projectId: row.ProjectId,
        inventoryBuildingId: row.InventoryBuildingId,
        constructionId: row.ConstructionId,
        subConstructionId: row.SubConstructionId,
        inventoryFlatFloorBasementPodiumWingId: row.InventoryFlatFloorBasementPodiumWingId,
        breadcrumbs: [...currentBreadcrumbs, newBreadcrumb]
      }
    });
  }, [navigate, location.state]);
  //#endregion

  //#region TABLE COLUMN
  const wingConstructionColumns = useMemo<TableColumn[]>(() => [
    {
      key: 'Wing',
      label: 'Wing',
      width: '24',
      sortable: true,
      fixed: 'left',
      align: 'left',
      render: (value, row) => (
        <TooltipText
          text={value || '-'}
          maxWidth="220px"
          tooltipThreshold={22}
          onClick={() => handleViewWingConstruction(row)}
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
      key: 'PlanDuration',
      label: 'Duration',
      width: '16',
      sortable: false,
      align: 'center',
      render: value => value || '-'
    },
    {
      key: 'ActualStartDate',
      label: 'Actual Start',
      width: '16',
      sortable: false,
      align: 'center',
      render: value => value || '-'
    },
    {
      key: 'ActualEndDate',
      label: 'Actual End',
      width: '16',
      sortable: false,
      align: 'center',
      render: value => value || '-'
    },
    {
      key: 'ActualDaysDifference',
      label: 'Days Difference',
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
  ], [handleViewWingConstruction]);
  //#endregion

  //#region BREAD CRUM ITEMS
  const breadcrumbItems = useMemo(() => {
    return location.state?.breadcrumbs || [];
  }, [location.state]);
  //#endregion

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
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
        searchPlaceholder="Search By Wing"
        onSearchChange={(v) => {
          setSearchTerm(v);
          fetchWingConstructionList(1, v);
        }}
        onClearSearch={() => {
          setSearchTerm('');
          fetchWingConstructionList(1);
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

      {/* ============================================================================
          BREADCRUMB NAVIGATION
           ============================================================================ */}
      <SiteProgressBreadcrumb items={breadcrumbItems} />

      {/* DATA TABLE */}
      <DataTable
        data={wingConstructionList}
        columns={wingConstructionColumns}
        pagination={wingConstructionPaginationInfo}
        emptyMessage="No wing construction records found"
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

export default SiteProgressWingConstruction;