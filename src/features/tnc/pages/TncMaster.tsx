import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  TncMasterData,
  FilterWithPaginationTncMasterRequest
} from '@/features/tnc/models/TncMasterModel';

import { TncMasterService } from '@/features/tnc/services/TncMasterService';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';

export const TncMaster: React.FC = () => {
  //#region STATE
  const [tncList, setTncList] = useState<TncMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  const { toasts, removeToast, addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchTnc(value);
  }, 350);

  const [viewTncData, setViewTncData] = useState<TncMasterData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  const [isShowCustomizeTncColumnsModal, setIsShowCustomizeTncColumnsModal] = useState(false);

  const { canExport } = useMenuPermissions();
  const hasFetchedInitialTnc = useRef(false);
  //#endregion

  //#region INIT
  useEffect(() => {
    if (hasFetchedInitialTnc.current) return;
    hasFetchedInitialTnc.current = true;
    fetchTncList();
  }, []);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);
  //#endregion

  //#region DATA LOAD
  const fetchTncList = async (page: number = pagination.currentPage) => {
    return await loadTnc(page, filters);
  };

  const loadTnc = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam: string | undefined;

        if (sortInfo) {
          const column = tncColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const params: FilterWithPaginationTncMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          TermsAndConditionsMasterId: filterParams.TermsAndConditionsMasterId
            ? Number(filterParams.TermsAndConditionsMasterId)
            : undefined,
          ModuleName: filterParams.ModuleName?.trim() || undefined,
          Title: filterParams.Title?.trim() || undefined,
          SortBy: sortByParam
        };

        const response = await getTnc(params);

        if (E.isRight(response)) {
          setTncList(response.right.Data);
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
      'Loading Terms & Conditions...'
    );
  };

  const searchTnc = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchTncList();
      return;
    }

    const filterParams: FilterInfo = {
      Title: searchValue.trim()
    };

    await loadTnc(1, filterParams);
  };

  const clearSearchTnc = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchTncList();
  };

  const handleExportTnc = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam: string | undefined;
        if (sortInfo) {
          const column = tncColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const params: FilterWithPaginationTncMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          ModuleName: filters.ModuleName?.trim() || undefined,
          Title: filters.Title?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        };

        const response = await getTnc(params);

        handleExportFile(response, exportType, 'Terms & Conditions Master', addToast);

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

  const handleExportTncExcel = () => handleExportTnc('Excel');
  const handleExportTncPdf = () => handleExportTnc('PDF');

  const getTnc = async (filterParams: FilterWithPaginationTncMasterRequest) => {
    return await TncMasterService.apiCallPullTncMaster(filterParams);
  };
  //#endregion

  //#region TABLE CONFIG
  const handlePageChange = (page: number) => {
    fetchTncList(page);
  };

  const handleSortColumn = (sort: SortInfo) => {
    setSortInfo(sort);
    fetchTncList(1);
  };

  const tncPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize]
  );

  const tncListForTable = useMemo(() => tncList, [tncList]);

  const handleViewTncDetails = useCallback((row: TncMasterData) => {
    setViewTncData(row);
    setIsViewModalOpen(true);
  }, []);

  const tncColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'Title',
        label: 'Title',
        width: '28',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className="flex items-center justify-start">
            <TooltipText
              text={value || 'N/A'}
              maxWidth="320px"
              tooltipThreshold={30}
              onClick={() => handleViewTncDetails(row)}
            />
          </div>
        )
      },
      {
        key: 'ModuleName',
        label: 'Module',
        width: '20',
        sortable: true,
        align: 'left',
        render: value => (
          <TooltipText text={value || 'N/A'} maxWidth="220px" tooltipThreshold={22} />
        )
      },
      {
        key: 'Description',
        label: 'Description',
        width: '30',
        sortable: false,
        align: 'left',
        render: value => (
          <TooltipText text={value || 'N/A'} maxWidth="340px" tooltipThreshold={34} />
        )
      },
      {
        key: 'CreatedBy',
        label: 'Last Modified By',
        width: '12',
        sortable: true,
        align: 'center',
        render: value => value || 'N/A'
      },
      {
        key: 'CreatedDate',
        label: 'Last Modified Date',
        width: '12',
        sortable: true,
        align: 'center',
        render: value => (value ? formatDate_dd_MonthName_yy(value) : '-')
      }
    ],
    [handleViewTncDetails]
  );
  //#endregion

  //#region CUSTOMIZE COLUMNS
  const requiredTncColumnKeys: string[] = ['Title'];

  const allTncColumnKeys: string[] = tncColumns.map(c => c.key);

  const [selectedTncColumnKeys, setSelectedTncColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getTncMasterTableColumns?.();
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        const withRequired = Array.from(new Set([...parsed, ...requiredTncColumnKeys]));
        return withRequired.filter(k => allTncColumnKeys.includes(k));
      }
    } catch {
      // ignore
    }
    return allTncColumnKeys;
  });

  useEffect(() => {
    setSelectedTncColumnKeys(prev =>
      Array.from(new Set([...prev, ...requiredTncColumnKeys])).filter(k =>
        allTncColumnKeys.includes(k)
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tncColumns.length]);

  const visibleTncColumns = useMemo(
    () => tncColumns.filter(col => selectedTncColumnKeys.includes(col.key)),
    [tncColumns, selectedTncColumnKeys]
  );
  //#endregion

  //#region VIEW MODAL
  interface ViewTncDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: TncMasterData | null;
  }

  const ViewTncDetailsModal: React.FC<ViewTncDetailsModalProps> = ({ isOpen, onClose, data }) => {
    if (!data) return null;

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings - Company setup (Terms & Conditions Details)"
        onSubmit={e => {
          e.preventDefault();
          onClose();
        }}
        cancelText="Close"
        loading={false}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Module</span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.ModuleName || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Title</span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.Title || 'N/A'}
              </span>
            </div>
            <div className="py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700 block mb-1">Description</span>
              <p className="text-sm text-blue-600 font-medium whitespace-pre-line max-h-64 overflow-y-auto">
                {data.Description || 'N/A'}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Action Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Created By</span>
                  <span className="text-sm text-blue-600 font-medium">{data.CreatedBy || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Created Date</span>
                  <span className="text-sm text-blue-600 font-medium">
                    {formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {data.ModifiedBy && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Modified By</span>
                    <span className="text-sm text-blue-600 font-medium">{data.ModifiedBy}</span>
                  </div>
                )}
                {data.ModifiedDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Modified Date</span>
                    <span className="text-sm text-blue-600 font-medium">
                      {formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  };
  //#endregion

  //#region FILTER HELPERS
  const applyFilters = () => {
    setFilters(tempFilters);
    loadTnc(1, tempFilters);
    setShowFilterPopup(false);
  };

  const clearFilters = () => {
    setTempFilters({});
    setFilters({});
    loadTnc(1, {});
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
  //#endregion

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <div className="h-full flex flex-col">
        <Loader loading={isLoading} title={loadingMessage}>
          <div></div>
        </Loader>
        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder="Search by title..."
          onSearchChange={v => {
            setSearchTerm(v);
            debouncedSearch(v);
          }}
          onClearSearch={clearSearchTnc}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters);
            setShowFilterPopup(true);
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeTncColumnsModal(true)}
          isShowAddButton={false}
          isShowImportButton={false}
          isShowExportButton={canExport}
          onExportExcel={handleExportTncExcel}
          onExportPdf={handleExportTncPdf}
          exportLoading={isLoading}
        />
        <DataTable
          data={tncListForTable}
          columns={visibleTncColumns}
          pagination={tncPaginationInfo}
          emptyMessage="No terms & conditions found"
          fixedHeight
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />
        <ViewTncDetailsModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setViewTncData(null);
          }}
          data={viewTncData}
        />
        <CustomizeColumnsModal
          isOpen={isShowCustomizeTncColumnsModal}
          onClose={() => setIsShowCustomizeTncColumnsModal(false)}
          onApply={keys => {
            const withRequired = Array.from(new Set([...keys, ...requiredTncColumnKeys]));
            setSelectedTncColumnKeys(withRequired);
            try {
              LocalStorageHelper.storeTncMasterTableColumns?.(JSON.stringify(withRequired));
            } catch {
              // ignore
            }
          }}
          columns={tncColumns}
          selectedKeys={selectedTncColumnKeys}
          requiredKeys={requiredTncColumnKeys}
          title="Customize Terms & Conditions Master Table Columns"
        />
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Terms & Conditions Master"
          onSubmit={e => {
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Module Name</label>
                <Input
                  type="text"
                  value={tempFilters.ModuleName || ''}
                  onChange={e => handleFilterChange('ModuleName', e.target.value)}
                  placeholder="Enter module name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input
                  type="text"
                  value={tempFilters.Title || ''}
                  onChange={e => handleFilterChange('Title', e.target.value)}
                  placeholder="Enter title"
                />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default TncMaster;


