import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  ChannelPartnerMasterData,
  FilterWithPaginationChannelPartnerMasterRequest
} from '@/features/ChannelPartnerMaster/models/ChannelPartnerMasterModel';

import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChannelPartnerMasterService } from '../services/ChannelPartnerMasterService';
import { updateFilter } from '@/core/utils/filterHelper';
import type { FilterPullExcelSample } from '@/features/technical/models/TechnicalModel';
import { technicalService } from '@/features/technical/services/TechnicalService';


export const ChannelPartnerMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [channelPartnerMasterList, setChannelPartnerMasterList] = useState<ChannelPartnerMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  // USE NAVIGATE
  const navigate = useNavigate();

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const { addToast } = useToast();

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchChannelPartnerMaster(value)
  }, 350);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeChannelPartnerColumnsModal, setIsShowCustomizeChannelPartnerColumnsModal] = useState(false);

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  const location = useLocation() as any;

  //#endregion

  //#region INIT
  useEffect(() => {
    const incoming = location.state?.listState;

    const listState = incoming ?? {
      page: 1, filters:
        {} as FilterInfo,
      sortInfo: undefined,
      searchTerm: ''
    };

    setPagination({ currentPage: listState.page ?? pagination.currentPage });

    setSortInfo(listState.sortInfo);

    setFilters(listState.filters ?? {});

    setTempFilters(listState.filters ?? {});

    setSearchTerm(listState.searchTerm ?? '');

    if (listState.searchTerm && String(listState.searchTerm).trim()) {
      loadChannelPartnerMaster(listState.page ?? 1, { Name: String(listState.searchTerm).trim() });
      return;
    }

    loadChannelPartnerMaster(listState.page ?? 1, listState.filters ?? {});
  }, [location.state]);

  //#region CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchChannelPartnerMasterList = async (page: number = pagination.currentPage) => {
    return await loadChannelPartnerMaster(page, filters);
  }

  const loadChannelPartnerMaster = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;

        if (sortInfo) {

          const column = ChannelPartnerMasterColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }
        const params: FilterWithPaginationChannelPartnerMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          ChannelPartnerId: filterParams.ChannelPartnerMasterId ? Number(filterParams.ChannelPartnerMasterId) : undefined,
          Name: filterParams.Name?.trim() || undefined,
          SortBy: sortByParam
        };

        const response = await ChannelPartnerMasterService.apiCallPullChannelPartnerMaster(params);
        if (E.isRight(response)) {

          setChannelPartnerMasterList(response.right.Data);

          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });

        } else {
          addToast({ type: 'error', title: response.left.message });
          return response;
        }
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Channel Partner Data'
    );
  };
  //#endregion

  //#region SEARCH & CLEAR
  const searchChannelPartnerMaster = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchChannelPartnerMasterList();

      return
    }

    const filterParams: FilterInfo = {
      Name: searchValue.trim(),
    };

    await loadChannelPartnerMaster(1, filterParams);
  };

  //#endregion

  //#region CLEAR CHANNEL PARTNER MASTER 
  const clearSearchChannelPartnerMaster = () => {
    setSearchTerm('');

    debouncedSearch.cancel?.();

    setFilters({});
    setTempFilters({});
    setPagination({ currentPage: 1 });
    loadChannelPartnerMaster(1, {});
    try {
      navigate(location.pathname, {
        replace: true,
        state: {}
      });
    } catch {
    }
  };
  //#endregion

  //#region EXPORT / IMPORT EXCEL AND PDF
  const handleExportChannelPartnerMaster = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined
        if (sortInfo) {
          const column = ChannelPartnerMasterColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }
        const params: FilterWithPaginationChannelPartnerMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          Name: filters.Name?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        };

        const response = await getChannelPartnerMaster(params);

        handleExportFile(response, exportType, 'Channel Partner Master', addToast);

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
      undefined,
      'Preparing Export'
    );
  };

  const handleExportChannelPartnerExcel = () => handleExportChannelPartnerMaster('Excel')
  const handleExportChannelPartnerPdf = () => handleExportChannelPartnerMaster('PDF')
  //#endregion

  //#region IMPORT EXCEL | DOWNLOAD

  const excelImportChannelPartnerMaster = async () => {

    await runApiWithLoader(

      setIsLoading,

      setIsLoadingMessage,

      async () => {


        return null;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Import failed' })
      },
      undefined,
      'Preparing Import'
    )
  }


  const downloadExcelSampleChannelPartnerMaster = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting

        const params: FilterPullExcelSample = {
          TableName: 'CHANNEL PARTNER'
        }

        const response = await technicalService.apiCallPullExcelSample(params);

        handleExportFile(response, 'Excel', 'Channel Partner Master', addToast, 'Sample file download successfully')

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' })
      },
      undefined,
      'Preparing Downloading'
    )
  }

  const handleExcelImportChannelPartnerMaster = () => excelImportChannelPartnerMaster()
  const handleDownloadExcelSampleChannelPartnerMaster = () => downloadExcelSampleChannelPartnerMaster()
  //#endregion

  //#region API | SERVICES CALL TO GET CHANNEL PARTNER
  const getChannelPartnerMaster = async (filterParams: FilterWithPaginationChannelPartnerMasterRequest) => {

    return await ChannelPartnerMasterService.apiCallPullChannelPartnerMaster(filterParams);
  }
  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT
  const handlePageChange = useCallback((page: number) => {
    fetchChannelPartnerMasterList(page);
  }, []);

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchChannelPartnerMasterList(1);

  }, []);
  //#endregion

  //#region TABLE PAGINATION INFO
  const ChannelPartnerPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination, handlePageChange]
  );

  const ChannelPartnerMasterForTable = useMemo(() => channelPartnerMasterList, [channelPartnerMasterList]);
  //#endregion

  //#region NAVIGATE TO  VIEW CHANNEL PARTNER
  const handleNavigateToView = (row: ChannelPartnerMasterData) => {
    navigate('/channelPartner/view', {
      state: {
        editChannelPartnerData: row,
        listState: {
          page: pagination.currentPage,
          filters,
          sortInfo,
          searchTerm
        }
      }
    });
  };

  //#region NAVIGATE TO ADD CHANNEL PARTNER
  const handleAddChannelPartnerModal = useCallback(() => {
    navigate('/channelPartner/add', {
      state: {
        fromList: true,
        listState: { page: pagination.currentPage, filters, sortInfo, searchTerm }
      }
    });
  }, [navigate, pagination.currentPage, filters, sortInfo, searchTerm]);
  //#endregion

  //#region TABLE COLUMNS
  const ChannelPartnerMasterColumns = useMemo<TableColumn[]>(() => [
    {
      key: 'Name',
      label: 'Full Name',
      width: '20',
      sortable: true,
      fixed: 'left',
      align: 'left',
      render: (value, row) => (
        <TooltipText
          text={value || 'N/A'}
          maxWidth="250px"
          tooltipThreshold={25}
          onClick={() => handleNavigateToView(row)}
        />
      )
    },
    {
      key: 'CompanyName',
      label: 'Company Name',
      width: '15',
      sortable: false,
      align: 'center',
      render: (value) => (
        <TooltipText
          text={value || 'N/A'}
          maxWidth="170px"
          tooltipThreshold={25}
        />
      )
    },
    {
      key: 'EmailId',
      label: 'Email Id',
      width: '15',
      sortable: false,
      align: 'center',
      render: (value) => (
        <TooltipText
          text={value || 'N/A'}
          maxWidth="170px"
          tooltipThreshold={15}
        />
      )
    },
    {
      key: 'MobileNumber',
      label: 'Mobile Number',
      width: '15',
      sortable: false,
      align: 'left',
      render: (value) => value ? `+91 ${value}` : '-'
    },

    {
      key: 'OfficeAddress',
      label: 'Office Address',
      width: '12',
      sortable: false,
      align: 'center',
      render: (value) => value || '-'
    },

    {
      key: 'PanNumber',
      label: 'Pan Number',
      width: '12',
      sortable: false,
      align: 'center',
      render: (value) => (
        <TooltipText
          text={value || 'N/A'}
          maxWidth="120px"
          tooltipThreshold={12}
        />
      )
    },
    {
      key: 'AadharCardNumber',
      label: 'Aadhar Card Number',
      width: '12',
      sortable: false,
      align: 'center',
      render: (value) => (
        <TooltipText
          text={value || 'N/A'}
          maxWidth="120px"
          tooltipThreshold={12}
        />
      )
    },
    {
      key: 'GSTNumber',
      label: 'GST Number',
      width: '15',
      sortable: false,
      align: 'center',
      render: (value) => (
        <TooltipText
          text={value || 'N/A'}
          maxWidth="150px"
          tooltipThreshold={15}
        />
      )
    },
    {
      key: 'RERANumber',
      label: 'RERA Number',
      width: '12',
      sortable: false,
      align: 'center',
      render: (value) => (
        <TooltipText
          text={value || 'N/A'}
          maxWidth="120px"
          tooltipThreshold={12}
        />
      )
    }

  ], [handleNavigateToView]);
  //#endregion

  //#region COLUMN CUSTOMIZATION
  const requiredChannelPartnerColumnKeys: string[] = ['Name'];

  const allChannelPartnerColumnKeys: string[] = ChannelPartnerMasterColumns.map(c => c.key);

  const [selectedChannelPartnerColumnKeys, setSelectedChannelPartnerColumnKeys] = useState<string[]>(() => {
    try {

      const saved = LocalStorageHelper.getChannelPartnerMasterTableColumns?.();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(new Set([...parsed, ...requiredChannelPartnerColumnKeys]));

        // Filter out any keys that no longer exist
        return withRequired.filter(k => allChannelPartnerColumnKeys.includes(k));
      }
    } catch { }
    return allChannelPartnerColumnKeys;
  });

  useEffect(() => {
    setSelectedChannelPartnerColumnKeys(prev => Array.from(new Set([...prev, ...requiredChannelPartnerColumnKeys])).filter(k => allChannelPartnerColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ChannelPartnerMasterColumns.length])

  const visibleChannelPartnerColumns = useMemo(
    () => ChannelPartnerMasterColumns.filter(col => selectedChannelPartnerColumnKeys.includes(col.key)),
    [ChannelPartnerMasterColumns, selectedChannelPartnerColumnKeys]
  );
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters);
    loadChannelPartnerMaster(1, tempFilters);
    setShowFilterPopup(false);
  };
  //#endregion

  //#region CLEAR FILTER
  const clearFilters = () => {
    setTempFilters({});
    setFilters({});

    // reset page
    setPagination({ currentPage: 1 });

    // load empty filters
    loadChannelPartnerMaster(1, {});

    setShowFilterPopup(false);
    // clear router state (very important)

    navigate(location.pathname, { replace: true, state: {} });

  };
  //#endregion

  //#region HANDLE FILTER CHNAGE
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  }
  //#endregion

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      {/* Loader */}

      <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Channel Partner Name"
        onSearchChange={v => {
          setSearchTerm(v);
          debouncedSearch(v);
        }}
        onClearSearch={clearSearchChannelPartnerMaster}
        isShowFilterButton
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters);
          setShowFilterPopup(true);
        }}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeChannelPartnerColumnsModal(true)}

        // ADD
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddChannelPartnerModal}

        // IMPORT
        isShowImportButton={canAction}
        onUploadExcel={handleExcelImportChannelPartnerMaster}
        onDownloadSampleExcel={handleDownloadExcelSampleChannelPartnerMaster}

        // EXPORT
        isShowExportButton={canExport}
        onExportExcel={handleExportChannelPartnerExcel}
        onExportPdf={handleExportChannelPartnerPdf}
        exportLoading={isLoading}
      />

      {/* DATA TABLE CHANNEL PARTNER*/}

      <DataTable
        data={ChannelPartnerMasterForTable}
        columns={visibleChannelPartnerColumns}
        pagination={ChannelPartnerPaginationInfo}
        emptyMessage="No Channel Partner found"
        fixedHeight
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
      />

      {/* CUSTOMIZE COLUMNS MODAL */}

      <CustomizeColumnsModal
        isOpen={isShowCustomizeChannelPartnerColumnsModal}
        onClose={() => setIsShowCustomizeChannelPartnerColumnsModal(false)}
        onApply={keys => {
          const withRequired = Array.from(

            new Set([...keys, ...requiredChannelPartnerColumnKeys])
          );
          setSelectedChannelPartnerColumnKeys(withRequired);

          try {
            LocalStorageHelper.storeChannelPartnerMasterTableColumns?.(

              JSON.stringify(withRequired)
            );
          } catch { }
        }}
        columns={ChannelPartnerMasterColumns}
        selectedKeys={selectedChannelPartnerColumnKeys}
        requiredKeys={requiredChannelPartnerColumnKeys}
        title="Customize Table Columns"
      />

      {/* FILTER CHANNEL PARTNER MODAL */}

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Channel Partner Master"
        onSubmit={e => {
          e.preventDefault();
          applyFilters();
        }}
        saveText="Apply Filter"
        cancelText="Clear Filter"
        onCancel={() => clearFilters()}
        resetText=''
        size="small-half"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <Input type="text"
              label='Channel Partner Name'
              value={tempFilters?.Name ?? ''}
              onChange={e => handleFilterChange('Name', e.target.value)}
              placeholder="Enter Channel Partner Name" />
          </div>
        </div>
      </Modal>
    </div>

  );
};

export default ChannelPartnerMaster;
