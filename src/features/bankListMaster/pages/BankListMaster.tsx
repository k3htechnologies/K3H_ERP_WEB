import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  BankListMasterData,
  FilterWithPaginationBankListMasterRequest
} from '@/features/bankListMaster/models/BankListMasterModel';

import { bankListMasterService } from '@/features/bankListMaster/services/BankListMasterService';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';

const BankListMaster: React.FC = () => {

  const [bankList, setBankList] = useState<BankListMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchBanks(value);
  }, 350);

  const { canExport } = useMenuPermissions();

  const hasFetchedInitial = useRef(false);

  useEffect(() => {

    if (hasFetchedInitial.current) return;
    hasFetchedInitial.current = true;

    loadBanks(1);

  }, []);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);


  const loadBanks = async (page: number, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationBankListMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          BankName: searchtext !== undefined ? searchtext : (searchTerm || undefined),
          SortBy: sortInfo ? getSortByParam(sortInfo, bankColumns) : undefined
        };

        const response = await bankListMasterService.apiCallPullBankListMaster(params);

        if (E.isRight(response)) {

          setBankList(response.right.Data);

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
      'Loading Bank List'
    );
  };

  const searchBanks = async (value: string) => {
    setSearchTerm(value);
    if (value.trim() === '') {
      loadBanks(1);
      return;
    }
    await loadBanks(1, value);
  };

  const clearSearchBanks = () => {

    debouncedSearch.cancel?.();

    setSearchTerm('');

    setSortInfo(undefined);

    loadBanks(1, '');

  };

  const handleExportBanks = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationBankListMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          ExportType: exportType,
          BankName: searchTerm || undefined,
          SortBy: getSortByParam(sortInfo ?? null, bankColumns)
        };

        const response = await bankListMasterService.apiCallPullBankListMaster(params);

        handleExportFile(response, exportType, 'Bank List', addToast);

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' });
      },
      undefined,
      'Preparing Export'
    );
  };

  const handleExportBankExcel = () => handleExportBanks('Excel');
  const handleExportBankPdf = () => handleExportBanks('PDF');

  const handlePageChange = (page: number) => {
    loadBanks(page);
  };

  const handleSortColumn = (sort: SortInfo) => {
    setSortInfo(sort);
    loadBanks(1);
  };

  const bankPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize]
  );

  const bankListForTable = useMemo(() => bankList, [bankList]);

  const bankColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'BankNameWithCode',
        label: 'Bank Name',
        width: '100',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: value => (
          value || '-'
        )
      }
    ],
    []
  );


  return (

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Loader loading={isLoading} title={loadingMessage}> <div></div> </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Bank Name"
        onSearchChange={v => {
          setSearchTerm(v);
          debouncedSearch(v);
        }}
        onClearSearch={clearSearchBanks}
        isShowExportButton={canExport && bankListForTable.length > 0}
        onExportExcel={handleExportBankExcel}
        onExportPdf={handleExportBankPdf}
        exportLoading={isLoading}
      />
      <DataTable
        data={bankListForTable}
        columns={bankColumns}
        pagination={bankPaginationInfo}
        emptyMessage="No Banks List Found"
        fixedHeight
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
      />

    </div>
  );
};

export default BankListMaster;
