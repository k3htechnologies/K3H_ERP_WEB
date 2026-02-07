import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Loader } from '@/core/utils/loader';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { useChannelPartnerSourcingListState } from '@/features/ChannelPartnerSourcing/context/ChannelPartnerSourcingListStateContext';
import { useNavigate } from 'react-router-dom';
import type { ChannelPartnerData, FilterWithPaginationChannelPartnerRequest } from '@/features/ChannelPartner/models/ChannelPartnerModel';
import { ChannelPartnerService } from '@/features/ChannelPartner/services/ChannelPartnerService';

export const ChannelPartnerSourcing: React.FC = () => {

  //#region STATE
  const [channelPartnerMasterList, setChannelPartnerList] = useState<ChannelPartnerData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const { addToast } = useToast();
  const { canAction } = useMenuPermissions();

  const { listState, updateListState } = useChannelPartnerSourcingListState();
  const { searchTerm, filters, sortInfo } = listState;

  const { pagination, setPagination } = usePagination(listState.pageSize);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchChannelPartnerSourcing(value);
  }, 350);
  //#endregion

  const navigate = useNavigate();

  //#region INIT
  useEffect(() => {

    setPagination({ currentPage: listState.page });

    if (listState.searchTerm && String(listState.searchTerm).trim()) {

      loadChannelPartner(listState.page, { Name: String(listState.searchTerm).trim() }, listState.sortInfo);

    } else {

      loadChannelPartner(listState.page, listState.filters, listState.sortInfo);

    }
  }, [listState.page, listState.filters, listState.sortInfo, listState.searchTerm]);

  useEffect(() => {

    return () => {
      debouncedSearch.cancel?.();
    };

  }, [debouncedSearch]);
  //#endregion

  //#region DATA LOAD
  const fetchChannelPartnerList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadChannelPartner(page, filters, sort);
  }

  const loadChannelPartner = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationChannelPartnerRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          ChannelPartnerId: filterParams.ChannelPartnerId ? Number(filterParams.ChannelPartnerId) : undefined,
          MobileNumber: searchtext ?? filterParams.Name?.trim() ?? undefined,
          SortBy: getSortByParam(sortInfo ?? null, channelPartnerColumns)
        };

        const response = await ChannelPartnerService.apiCallPullChannelPartner(params);

        if (E.isRight(response)) {

          setChannelPartnerList(response.right.Data);

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
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Channel Partner'
    );
  };
  //#endregion

  //#region SEARCH & CLEAR
  const searchChannelPartnerSourcing = async (searchValue: string) => {

    updateListState({ searchTerm: searchValue });

    if (searchValue.trim() === '') {
      updateListState({ searchTerm: '', page: 1 });
      fetchChannelPartnerList(1);
      return;
    }

    updateListState({ searchTerm: searchValue, page: 1 });

    await loadChannelPartner(1, filters, sortInfo, searchValue);

  };

  const clearSearch = () => {
    debouncedSearch.cancel?.();
    updateListState({ searchTerm: '', filters: {}, page: 1, sortInfo: undefined });
    loadChannelPartner(1, {}, undefined, undefined);

  };
  //#endregion

  //#region TABLE CONFIG
  const handlePageChange = useCallback((page: number) => {
    updateListState({ page });
    fetchChannelPartnerList(page);
  }, [updateListState]
  );

  const handleSortColumn = useCallback(
    (sort: SortInfo) => {
      updateListState({ sortInfo: sort, page: 1 });
      loadChannelPartner(1, filters, sort, searchTerm || undefined);
    },
    [filters, searchTerm, updateListState]
  );

  const paginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination, handlePageChange]
  );

  const dataForTable = useMemo(() => channelPartnerMasterList, [channelPartnerMasterList]);
  //#endregion

  //#region COLUMNS

  const handleNavigateToView = (row: ChannelPartnerData) => {
    updateListState({
      channelPartnerId: row.ChannelPartnerId,
      channelPartnerName: row.Name
    });
    navigate('/sourcing/view');
  };

  const channelPartnerColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'Name',
        label: 'Name',
        width: '20',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <TooltipText
            text={value || '-'}
            maxWidth="250px"
            tooltipThreshold={25}
            onClick={() => handleNavigateToView(row)}
          />
        )
      },
      {
        key: 'MobileNumber',
        label: 'Mobile Number',
        width: '16',
        sortable: false,
        align: 'left',
        render: value => (value ? `+91 ${value}` : '-')
      },
      {
        key: 'CompanyName',
        label: 'Company Name',
        width: '16',
        sortable: false,
        align: 'left',
        render: value => (value ? `+91 ${value}` : '-')
      },
      {
        key: 'EmailId',
        label: 'Email',
        width: '20',
        sortable: false,
        align: 'left',
        render: value => value || '-'
      },
      {
        key: 'RERANumber',
        label: 'RERA Number',
        width: '16',
        sortable: false,
        align: 'left',
        render: value => value || '-'
      },
      {
        key: 'OfficeAddress',
        label: 'Office Address',
        width: '24',
        sortable: false,
        align: 'left',
        render: value => (
          <TooltipText text={value || '-'} maxWidth="260px" tooltipThreshold={26} />
        )
      },
    ],
    [canAction]
  );

  //#endregion


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Mobile Number"
        onSearchChange={v => {
          updateListState({ searchTerm: v });
          debouncedSearch(v);
        }}
        onClearSearch={clearSearch}
        isShowFilterButton={false}
        filters={filters}
        onOpenFilter={() => { }}
        isShowCustomizeButton={false}
        onCustomize={() => { }}
        isShowAddButton={false}
        addTitle="Add"
        onAdd={() => { }}
        isShowImportButton={false}
        isShowExportButton={false}
        exportLoading={isLoading}
      />

      <DataTable
        data={dataForTable}
        columns={channelPartnerColumns}
        pagination={paginationInfo}
        emptyMessage="No Channel Partner Sourcing found"
        fixedHeight
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
      />

    </div>
  );
};

export default ChannelPartnerSourcing;


