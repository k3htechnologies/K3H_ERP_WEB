import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  BankListMasterData,
  FilterWithPaginationBankListMasterRequest
} from '@/features/bankListMaster/models/BankListMasterModel';

import { BankListMasterService } from '@/features/bankListMaster/services/BankListMasterService';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';

const BankListMaster: React.FC = () => {
  const [bankList, setBankList] = useState<BankListMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const {addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchBanks(value);
  }, 350);

  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [isShowCustomizeColumnsModal, setIsShowCustomizeColumnsModal] = useState(false);

  const { canExport } = useMenuPermissions();
  const hasFetchedInitial = useRef(false);

  useEffect(() => {
    if (hasFetchedInitial.current) return;
    hasFetchedInitial.current = true;
    fetchBankList();
  }, []);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);

  const fetchBankList = async (page: number = pagination.currentPage) => {
    return await loadBanks(page, filters);
  };

  const loadBanks = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam: string | undefined;
        if (sortInfo) {
          const column = bankColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const params: FilterWithPaginationBankListMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          BankListMasterId: filterParams.BankListMasterId ? Number(filterParams.BankListMasterId) : undefined,
          BankName: filterParams.BankName?.trim() || undefined,
          SortBy: sortByParam
        };

        const response = await BankListMasterService.apiCallPullBankListMaster(params);

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
      'Loading Bank List...'
    );
  };

  const searchBanks = async (value: string) => {
    setSearchTerm(value);
    if (value.trim() === '') {
      fetchBankList();
      return;
    }
    const filterParams: FilterInfo = { BankName: value.trim() };
    await loadBanks(1, filterParams);
  };

  const clearSearchBanks = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchBankList();
  };

  const handleExportBanks = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam: string | undefined;
        if (sortInfo) {
          const column = bankColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const params: FilterWithPaginationBankListMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          BankName: filters.BankName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        };

        const response = await BankListMasterService.apiCallPullBankListMaster(params);

        handleExportFile(response, exportType, 'Bank List Master', addToast);

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

  const handleExportBankExcel = () => handleExportBanks('Excel');
  const handleExportBankPdf = () => handleExportBanks('PDF');

  const handlePageChange = (page: number) => {
    fetchBankList(page);
  };

  const handleSortColumn = (sort: SortInfo) => {
    setSortInfo(sort);
    fetchBankList(1);
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
        sortable: false,
        fixed: 'left',
        align: 'left',
        render: value => (
          value || 'N/A'
        )
      }
    ],
    []
  );

  const requiredBankColumnKeys: string[] = ['BankNameWithCode'];
  const allBankColumnKeys: string[] = bankColumns.map(c => c.key);

  const [selectedBankColumnKeys, setSelectedBankColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getBankListMasterTableColumns?.();
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        const withRequired = Array.from(new Set([...parsed, ...requiredBankColumnKeys]));
        return withRequired.filter(k => allBankColumnKeys.includes(k));
      }
    } catch {
      // ignore
    }
    return allBankColumnKeys;
  });

  useEffect(() => {
    setSelectedBankColumnKeys(prev =>
      Array.from(new Set([...prev, ...requiredBankColumnKeys])).filter(k =>
        allBankColumnKeys.includes(k)
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankColumns.length]);

  const visibleBankColumns = useMemo(
    () => bankColumns.filter(col => selectedBankColumnKeys.includes(col.key)),
    [bankColumns, selectedBankColumnKeys]
  );

  const applyFilters = () => {
    setFilters(tempFilters);
    loadBanks(1, tempFilters);
    setShowFilterPopup(false);
  };

  const clearFilters = () => {
    setTempFilters({});
    setFilters({});
    loadBanks(1, {});
    setShowFilterPopup(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters: FilterInfo = { ...tempFilters };
    if (value.trim()) {
      newFilters[key] = value.trim();
    } else {
      delete newFilters[key];
    }
    setTempFilters(newFilters);
  };

  return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Loader loading={isLoading} title={loadingMessage}>
          <div></div>
        </Loader>
        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder="Search By Bank Name"
          onSearchChange={v => {
            setSearchTerm(v);
            debouncedSearch(v);
          }}
          onClearSearch={clearSearchBanks}
          isShowFilterButton={false}
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters);
            setShowFilterPopup(true);
          }}
          isShowCustomizeButton={false}
          onCustomize={() => setIsShowCustomizeColumnsModal(true)}
          isShowAddButton={false}
          isShowImportButton={false}
          isShowExportButton={canExport && bankListForTable.length >0}
          onExportExcel={handleExportBankExcel}
          onExportPdf={handleExportBankPdf}
          exportLoading={isLoading}
        />
        <DataTable
          data={bankListForTable}
          columns={visibleBankColumns}
          pagination={bankPaginationInfo}
          emptyMessage="No banks found"
          fixedHeight
          maxHeight="calc(100vh - 255px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />
        <CustomizeColumnsModal
          isOpen={isShowCustomizeColumnsModal}
          onClose={() => setIsShowCustomizeColumnsModal(false)}
          onApply={keys => {
            const withRequired = Array.from(new Set([...keys, ...requiredBankColumnKeys]));
            setSelectedBankColumnKeys(withRequired);
            try {
              LocalStorageHelper.storeBankListMasterTableColumns?.(JSON.stringify(withRequired));
            } catch {
              // ignore
            }
          }}
          columns={bankColumns}
          selectedKeys={selectedBankColumnKeys}
          requiredKeys={requiredBankColumnKeys}
          title="Customize Bank List Master Table Columns"
        />
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Bank List Master"
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            applyFilters();
          }}
          saveText="Apply Filter"
          cancelText="Clear Filter"
          onCancel={() => clearFilters()}
          size="half-screen"
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <Input
                  type="text"
                  value={tempFilters.BankName || ''}
                  onChange={e => handleFilterChange('BankName', e.target.value)}
                  placeholder="Enter bank name"
                />
              </div>
            </div>
          </div>
        </Modal>
      </div>
  );
};

export default BankListMaster;
