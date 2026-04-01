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
  FilterWithPaginationSiteProgressSubConstructionRequest,
  SiteProgressSubConstructionData
} from '@/features/siteProgress/models/SiteProgressModel';
import { SiteProgressService } from '@/features/siteProgress/services/SiteProgressService';

const SiteProgressSubConstruction: React.FC = () => {
  //#region STATE
  const [subConstructionList, setSubConstructionList] = useState<SiteProgressSubConstructionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { pagination, setPagination } = usePagination(50);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const location = useLocation() as Location & {
    state?: {
      projectId?: number;
      inventoryBuildingId?: number;
      constructionId?: number;
      breadcrumbs?: Array<{ label: string; path?: string }>;
    };
  };
  //#endregion

  //#region INIT
  useEffect(() => {

    fetchSubConstructionList();

  }, [location.state]);
  //#endregion

  //#region DATA LOAD
  const fetchSubConstructionList = async (page: number = pagination.currentPage, term: string = searchTerm) => {
    await loadSubConstruction(page, term);
  };

  const loadSubConstruction = async (page: number, term: string = searchTerm) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        if (term) { }

        const params: FilterWithPaginationSiteProgressSubConstructionRequest = {
          ProjectId: location.state.projectId,
          InventoryBuildingId: location.state.inventoryBuildingId,
          ConstructionId: location.state.constructionId
        };

        const response = await SiteProgressService.apiCallPullSiteProgressSubConstruction(params);

        if (E.isRight(response)) {
          setSubConstructionList(response.right.Data);
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
      'Loading Site Progress - Sub Construction'
    );
  };
  //#endregion

  //#region TABLE CONFIG
  const handlePageChange = useCallback((page: number) => {
    fetchSubConstructionList(page);
  }, []);

  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    fetchSubConstructionList(1);
  }, []);

  const subConstructionPaginationInfo: PaginationInfo = useMemo(
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
  const handleViewSubConstruction = useCallback((row: SiteProgressSubConstructionData) => {

    const currentBreadcrumbs = location.state?.breadcrumbs || [];
    const subConstructionState = {
      projectId: row.ProjectId,
      inventoryBuildingId: row.InventoryBuildingId,
      constructionId: row.ConstructionId,
      subConstructionId: row.SubConstructionId,
      breadcrumbs: currentBreadcrumbs
    };

    const newBreadcrumb = {
      label: `Sub Construction: ${row.SubConstruction || '-'}`,
      path: '/siteProgress/SiteProgressSubConstruction',
      state: subConstructionState
    };

    if (row.NextAction?.toUpperCase() === "ACTIVITY") {
      navigate('/siteProgress/SiteProgressConstructionActivity', {
        state: {
          projectId: row.ProjectId,
          inventoryBuildingId: row.InventoryBuildingId,
          constructionId: row.ConstructionId,
          subConstructionId: row.SubConstructionId,
          inventoryFlatFloorBasementPodiumWingId: 0,
          inventoryFloorId: 0,
          inventoryFlatId: 0,
          breadcrumbs: [...currentBreadcrumbs, newBreadcrumb]
        }
      });
    }
    if (row.NextAction?.toUpperCase() === "WING") {
      navigate('/siteProgress/SiteProgressWingConstruction', {
        state: {
          projectId: row.ProjectId,
          inventoryBuildingId: row.InventoryBuildingId,
          constructionId: row.ConstructionId,
          subConstructionId: row.SubConstructionId,
          breadcrumbs: [...currentBreadcrumbs, newBreadcrumb]
        }
      });
    }
  }, [navigate, location.state]);
  //#endregion

  //#region TABLE COLUMN
  const subConstructionColumns = useMemo<TableColumn[]>(() => [
    {
      key: 'SubConstruction',
      label: 'Sub Construction',
      width: '32',
      sortable: true,
      fixed: 'left',
      align: 'left',
      render: (value, row) => (
        <TooltipText
          text={value || '-'}
          maxWidth="240px"
          tooltipThreshold={24}
          onClick={() => handleViewSubConstruction(row)}
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
  ], [handleViewSubConstruction]);
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
        searchPlaceholder="Search By Sub Construction"
        onSearchChange={(v) => {
          setSearchTerm(v);
          fetchSubConstructionList(1, v);
        }}
        onClearSearch={() => {
          setSearchTerm('');
          fetchSubConstructionList(1);
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
        data={subConstructionList}
        columns={subConstructionColumns}
        pagination={subConstructionPaginationInfo}
        emptyMessage="No sub Construction Records Found"
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

export default SiteProgressSubConstruction;