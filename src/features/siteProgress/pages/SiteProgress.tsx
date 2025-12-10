import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import type {
  FilterWithPaginationSiteProgressConstructionRequest,
  SiteProgressConstructionData
} from '@/features/siteProgress/models/SiteProgressModel';
import { SiteProgressService } from '@/features/siteProgress/services/SiteProgressService';
var storedProjectId = 1;
const SiteProgress: React.FC = () => {

  //#region STATE
  const [siteProgressConstructionList, setSiteProgressConstructionList] = useState<SiteProgressConstructionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { pagination, setPagination } = usePagination(20);
  const { addToast } = useToast();
  const navigate = useNavigate();
  //#endregion

  //#region INIT
  useEffect(() => {

    fetchSiteProgressConstructionList();

  }, []);
  //#endregion

  //#region DATA LOAD
  const fetchSiteProgressConstructionList = async (page: number = pagination.currentPage, term: string = searchTerm) => {
    await loadSiteProgressConstruction(page, term);
  };

  const loadSiteProgressConstruction = async (page: number, term: string = searchTerm) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {


        const params: FilterWithPaginationSiteProgressConstructionRequest = {
          ProjectId: storedProjectId
        };

        const response = await SiteProgressService.apiCallPullSiteProgressConstruction(params);

        if (E.isRight(response)) {

          setSiteProgressConstructionList(response.right.Data);

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
      'Loading Site Progress - Construction'
    );
  };
  //#endregion

  //#region TABLE CONFIG
  const handlePageChange = useCallback((page: number) => {
    fetchSiteProgressConstructionList(page);
  }, []);

  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    fetchSiteProgressConstructionList(1);
  }, []);

  const siteProgressConstructionPaginationInfo: PaginationInfo = useMemo(
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
  const handleViewConstruction = useCallback((row: SiteProgressConstructionData) => {

    if (!row.InventoryBuildingId) {

      navigate('/siteProgress/SiteProgressConstructionActivity', {
        state: {
          projectId: row.ProjectId,
          inventoryBuildingId: row.InventoryBuildingId,
          constructionId: row.ConstructionId,
          subConstructionId: 0,
          inventoryFlatFloorBasementPodiumWingId: 0,
          inventoryFloorId: 0,
          inventoryFlatId: 0
        }
      });

    }
    else {
      navigate('/siteProgress/SiteProgressSubConstruction', {
        state: {
          projectId: row.ProjectId,
          inventoryBuildingId: row.InventoryBuildingId,
          constructionId: row.ConstructionId
        }
      });
    }
  }, [navigate]);
  //#endregion

  //#region TABLE COLUMN
  const siteProgressConstructionColumns = useMemo<TableColumn[]>(() => [
    {
      key: 'Construction',
      label: 'Construction',
      width: '32',
      sortable: true,
      fixed: 'left',
      align: 'left',
      render: (value, row) => (
        <TooltipText
          text={value || 'N/A'}
          maxWidth="240px"
          tooltipThreshold={24}
          onClick={() => handleViewConstruction(row)}
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

  ], [handleViewConstruction]);
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
        searchPlaceholder="Search By Construction"
        onSearchChange={(v) => {
          setSearchTerm(v);
          fetchSiteProgressConstructionList(1, v);
        }}
        onClearSearch={() => {
          setSearchTerm('');
          fetchSiteProgressConstructionList(1);
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

      {/* DATA TABLE */}
      <DataTable
        data={siteProgressConstructionList}
        columns={siteProgressConstructionColumns}
        pagination={siteProgressConstructionPaginationInfo}
        emptyMessage="No construction records found"
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

export default SiteProgress;