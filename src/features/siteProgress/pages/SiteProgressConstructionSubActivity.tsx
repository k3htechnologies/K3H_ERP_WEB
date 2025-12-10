import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, type Location } from 'react-router-dom';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import type {
  FilterWithPaginationSiteProgressConstructionSubActivityRequest,
  SiteProgressConstructionSubActivityData
} from '@/features/siteProgress/models/SiteProgressModel';
import { SiteProgressService } from '@/features/siteProgress/services/SiteProgressService';

const SiteProgressConstructionSubActivity: React.FC = () => {
  //#region STATE
  const [constructionSubActivityList, setConstructionSubActivityList] = useState<SiteProgressConstructionSubActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { pagination, setPagination } = usePagination(20);
  const { addToast } = useToast();
  const location = useLocation() as Location & {
    state?: {
      projectId?: number;
      constructionActivityId?: number;
    };
  };
  //#endregion

  //#region INIT
  useEffect(() => {
    
    fetchConstructionSubActivityList();
  }, [location.state]);
  //#endregion

  //#region DATA LOAD
  const fetchConstructionSubActivityList = async (page: number = pagination.currentPage, term: string = searchTerm) => {
    await loadConstructionSubActivity(page, term);
  };

  const loadConstructionSubActivity = async (page: number, term: string = searchTerm) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        
        const params: FilterWithPaginationSiteProgressConstructionSubActivityRequest = {
          ProjectId: location.state.projectId,
          ConstructionActivityId: location.state.constructionActivityId
        };

        const response = await SiteProgressService.apiCallPullSiteProgressConstructionSubActivity(params);

        if (E.isRight(response)) {
          setConstructionSubActivityList(response.right.Data);
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
      'Loading Site Progress - Sub Activity'
    );
  };
  //#endregion

  //#region TABLE CONFIG
  const handlePageChange = useCallback((page: number) => {
    fetchConstructionSubActivityList(page);
  }, []);

  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    fetchConstructionSubActivityList(1);
  }, []);

  const constructionSubActivityPaginationInfo: PaginationInfo = useMemo(
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

  //#region TABLE COLUMN
  const constructionSubActivityColumns = useMemo<TableColumn[]>(() => [
    {
      key: 'SubActivityName',
      label: 'Sub Activity',
      width: '32',
      sortable: true,
      fixed: 'left',
      align: 'left',
      render: (value) => (
        <TooltipText
          text={value || 'N/A'}
          maxWidth="260px"
          tooltipThreshold={26}
        />
      )
    },
    {
      key: 'IsCompleted',
      label: 'Completed',
      width: '16',
      sortable: true,
      align: 'center',
      render: (value) => value ? 'Yes' : 'No'
    }
  ], []);
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
        searchPlaceholder="Search By Sub Activity"
        onSearchChange={(v) => {
          setSearchTerm(v);
          fetchConstructionSubActivityList(1, v);
        }}
        onClearSearch={() => {
          setSearchTerm('');
          fetchConstructionSubActivityList(1);
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
        data={constructionSubActivityList}
        columns={constructionSubActivityColumns}
        pagination={constructionSubActivityPaginationInfo}
        emptyMessage="No construction sub activities found"
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

export default SiteProgressConstructionSubActivity;