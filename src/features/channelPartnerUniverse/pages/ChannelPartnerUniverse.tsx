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
import { useChannelPartnerUniverseListState } from '@/features/channelPartnerUniverse/context/ChannelPartnerUniverseListStateContext';
import { useNavigate } from 'react-router-dom';
import { channelPartnerUniverseService } from '@/features/channelPartnerUniverse/services/ChannelPartneUniverseService';
import { AlertTriangle, Copy } from 'lucide-react';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import type { ChannelPartnerUniverseData, FilterWithPaginationChannelPartnerUniverseRequest } from '@/features/channelPartnerUniverse/models/ChannelPartnerUniverseModel';
import { Button, Input } from '@/ui/components/forms';
import { Modal } from '@/ui/components/Modal/Modal';
import { updateFilter } from '@/core/utils/filterHelper';
import { handleExportFile } from '@/core/utils/exportFile';
import { ACTIVE_INACTIVE_OPTIONS } from '@/core/constants';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { filterNumbers } from '@/core/utils/fileValidation';
import { getActiveInactiveStatuscolor } from '../utils/Status';
import { copyToClipboard, formatCurrency } from '@/core/utils/comman';

export const ChannelPartnerUniverse: React.FC = () => {

  //#region STATE
  const [channelPartnerMasterList, setChannelPartnerList] = useState<ChannelPartnerUniverseData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const { addToast } = useToast();
  const { canAction, canExport } = useMenuPermissions();

  const { listState, updateListState } = useChannelPartnerUniverseListState();
  const { searchTerm, filters, sortInfo } = listState;

  const { pagination, setPagination } = usePagination(listState.pageSize);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchChannelPartnerUniverse(value);
  }, 350);

  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  const navigate = useNavigate();

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

  const fetchChannelPartnerList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadChannelPartner(page, filters, sort);
  }

  const loadChannelPartner = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationChannelPartnerUniverseRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: false,
          ChannelPartnerId: filterParams.ChannelPartnerId ? Number(filterParams.ChannelPartnerId) : undefined,
          ChannelPartnerName: searchtext ?? filterParams.Name?.trim() ?? undefined,
          CompanyName: filterParams.CompanyName?.trim() || undefined,
          Designation: filterParams.Designation?.trim() || undefined,
          FirmsType: filterParams.FirmsType?.trim() || undefined,
          Type: filterParams.Type?.trim() || undefined,
          MobileNumber: filterParams.MobileNumber?.trim() || undefined,
          OfficeAddress: filterParams.OfficeAddress?.trim() || undefined,
          RERANumber: filterParams.RERANumber?.trim() || undefined,
          Status: filterParams.Status?.trim() || undefined,
          ActiveDays: Number(filterParams.ActiveDays) || 0,
          SortBy: getSortByParam(sortInfo ?? null, channelPartnerColumns)
        };

        const response = await channelPartnerUniverseService.apiCallPullChannelPartnerUniverse(params);

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

  const searchChannelPartnerUniverse = async (searchValue: string) => {

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

  const handlePageChange = useCallback((page: number) => {
    updateListState({ page });
  }, [sortInfo, updateListState]);

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


  const handleNavigateToView = (row: ChannelPartnerUniverseData) => {

    updateListState({
      channelPartnerId: row.ChannelPartnerId,
      channelPartnerName: row.Name
    });
    navigate('/cpUniverse/view');
  };

  const channelPartnerColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'SystemGeneratedCode',
        label: 'CP Code',
        width: '20',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => {

          return (
            <div className="flex items-center justify-center gap-2">

              <TooltipText
                text={value || '-'}
                maxWidth="150px"
                tooltipThreshold={20}
                tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
              />

              {row.VerifiedNonVerified !== 'Verified' && (
                <span title="Channel Partner Profile Incomplete">
                  <AlertTriangle className="w-4 h-4 text-amber-500 cursor-pointer" />
                </span>
              )}

              {value && (
                <Button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const success = await copyToClipboard(value);
                    if (success) {
                      addToast({ type: 'success', title: `${value} Copied!` });
                    }
                  }}
                  color="transparent"
                  size="sm"
                  style={{
                    padding: '2px 6px',
                    color: '#6B7280',
                    cursor: 'pointer'
                  }}
                  title="Copy"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              )}

            </div>
          );
        }
      },
      {
        key: 'Name',
        label: 'Full Name',
        width: '20',
        sortable: true,
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
        key: "DateOfBirth",
        label: "DOB",
        width: "14",
        sortable: false,
        align: "center",
        render: (value) => (value ? formatDate_dd_MonthName_yy(value) : "-"),
      },
      {
        key: 'Designation',
        label: 'Designation',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'CompanyName',
        label: 'Company Name',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'FirmsType',
        label: 'Firm Type',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'Type',
        label: 'Type',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },

      {
        key: 'EmailId',
        label: 'Email Id',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'MobileNumber',
        label: 'Mobile Number',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value, row) => value ? `${row.MobileNumberCountryCode || "+91"} ${value}` : '-'
      },

      {
        key: 'RERANumber',
        label: 'RERA Number',
        width: '12',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },

      {
        key: 'OfficeAddress',
        label: 'Office Address',
        width: '12',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'VerifiedNonVerified',
        label: 'Is Verified',
        width: '12',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'VillageName',
        label: 'CP Micromarket',
        width: '12',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'PrimaryProjectPortfolio',
        label: 'Primary Project',
        width: '12',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'SecondaryProjectPortfolio',
        label: 'Secondary Project',
        width: '12',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'MicromarketProximity',
        label: 'Micromarket Proximity',
        width: '12',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'ChannelPartnerCategory',
        label: 'CP Category',
        width: '12',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'NoOfGrossWalkins',
        label: 'Gross Walkins',
        width: '12',
        sortable: false,
        align: 'left',
        render: (value) => value || '0'
      },
      {
        key: 'NoOfNetBooking',
        label: 'Net Bookings',
        width: '12',
        sortable: false,
        align: 'left',
        render: (value) => value || '0'
      },

      {
        key: 'NetBookingRevenue',
        label: 'Net Revenue',
        width: '12',
        sortable: false,
        align: 'left',
        render: (value) => formatCurrency(value) || '0'
      },
      {
        key: 'NoOfGrossWalkinsLifeTime',
        label: 'Gross Walkins (Lifetime)',
        width: '12',
        sortable: false,
        align: 'left',
        render: (value) => value || '0'
      },

      {
        key: 'NoOfNetBookingLifeTime',
        label: 'Net Bookings (Lifetime)',
        width: '12',
        sortable: false,
        align: 'left',
        render: (value) => value || '0'
      },
      {
        key: 'NetBookingRevenueLifeTime',
        label: 'Net Revenue (Lifetime)',
        width: '12',
        sortable: false,
        align: 'left',
        render: (value) => formatCurrency(value) || '0'
      },
      {
        key: 'Status',
        label: 'Status',
        width: '12',
        sortable: false,
        align: 'left',
        render: (value) => {
          const { bg, text } = getActiveInactiveStatuscolor(value);

          return (
            <span
              className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
              style={{
                backgroundColor: bg,
                color: text
              }}
            >
              {value || "-"}
            </span>
          );
        }
      },
      {
        key: 'CreatedBy',
        label: 'Created By',
        width: '12',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'CreatedDate',
        label: 'Created Date',
        width: '12',
        sortable: false,
        align: 'left',
        render: (value) => (value ? formatDate_dd_MonthName_yy(value) : "-"),
      },
    ],
    [canAction]
  );

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  }

  const applyFilters = () => {
    updateListState({ filters: tempFilters, page: 1 });
    loadChannelPartner(1, tempFilters, sortInfo);
    setShowFilterPopup(false);
  };

  const clearFilters = () => {
    setTempFilters({});
    updateListState({ filters: {}, page: 1, searchTerm: '', sortInfo: undefined });
    loadChannelPartner(1, {}, undefined);
    navigate(location.pathname, { replace: true, state: {} });
  };

  const handleExportChannelPartner = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationChannelPartnerUniverseRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          ChannelPartnerName: filters.Name?.trim() || undefined,
          CompanyName: filters.CompanyName?.trim() || undefined,
          Designation: filters.Designation?.trim() || undefined,
          FirmsType: filters.FirmsType?.trim() || undefined,
          Type: filters.Type?.trim() || undefined,
          MobileNumber: filters.MobileNumber?.trim() || undefined,
          OfficeAddress: filters.OfficeAddress?.trim() || undefined,
          RERANumber: filters.RERANumber?.trim() || undefined,
          Status: filters.Status?.trim() || undefined,
          ActiveDays: Number(filters.ActiveDays) || 0,
          SortBy: getSortByParam(sortInfo ?? null, channelPartnerColumns),
          ExportType: exportType
        };

        const response = await channelPartnerUniverseService.apiCallPullChannelPartnerUniverse(params);

        handleExportFile(response, exportType, 'Channel Partner Universe', addToast);

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
      undefined,
      'Preparing Export'
    );
  };

  const handleExportChannelPartnerExcel = () => handleExportChannelPartner('Excel')
  const handleExportChannelPartnerPdf = () => handleExportChannelPartner('PDF')


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Full Name"
        onSearchChange={v => {
          updateListState({ searchTerm: v });
          debouncedSearch(v);
        }}
        onClearSearch={clearSearch}
        isShowFilterButton
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters || {});
          setShowFilterPopup(true);
        }}

        isShowCustomizeButton={false}
        onCustomize={() => { }}
        isShowAddButton={false}
        addTitle="Add"
        onAdd={() => { }}
        isShowExportButton={canExport && dataForTable.length > 0 ? true : false}
        onExportExcel={handleExportChannelPartnerExcel}
        onExportPdf={handleExportChannelPartnerPdf}
        exportLoading={isLoading}
      />

      <DataTable
        data={dataForTable}
        columns={channelPartnerColumns}
        pagination={paginationInfo}
        emptyMessage="No Channel Partner Universe found"
        fixedHeight
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
      />

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Channel Partner"
        onSubmit={e => {
          e.preventDefault();
          applyFilters();
        }}
        saveText="Apply "
        cancelText="Clear"
        onCancel={() => clearFilters()}

        size="small-half">
        <div className="space-y-6">
          <div>
            <SinglePageSelection
              label="Active / Inactive"
              placeholder="Select Active / Inactive"
              value={tempFilters.Status || ''}
              onChange={e => handleFilterChange('Status', String(e))}
              options={ACTIVE_INACTIVE_OPTIONS.map(opt => ({
                label: opt.name,
                value: opt.id
              }))}
            />
          </div>
          <div>
            <Input type="text"
              label='Active Days'
              value={tempFilters?.ActiveDays ?? ''}
              onChange={e => handleFilterChange('ActiveDays', filterNumbers(e.target.value))}
              placeholder="Enter Active Days" />
          </div>
          <div>
            <Input type="text"
              label='Full Name'
              value={tempFilters?.Name ?? ''}
              onChange={e => handleFilterChange('Name', e.target.value)}
              placeholder="Enter Full Name" />
          </div>
          <div>
            <Input type="text"
              label='Company Name'
              value={tempFilters?.CompanyName ?? ''}
              onChange={e => handleFilterChange('CompanyName', e.target.value)}
              placeholder="Enter Company Name" />
          </div>
          <div>
            <Input type="text"
              label='Designation'
              value={tempFilters?.Designation ?? ''}
              onChange={e => handleFilterChange('Designation', e.target.value)}
              placeholder="Enter Designation" />
          </div>
          <div>
            <Input type="text"
              label='Firm Type'
              value={tempFilters?.FirmsType ?? ''}
              onChange={e => handleFilterChange('FirmsType', e.target.value)}
              placeholder="Enter Firm Type" />
          </div>
          <div>
            <Input type="text"
              label='Type'
              value={tempFilters?.Type ?? ''}
              onChange={e => handleFilterChange('Type', e.target.value)}
              placeholder="Enter Type" />
          </div>

          <div>
            <Input type="text"
              label='Mobile Number'
              value={tempFilters?.MobileNumber ?? ''}
              onChange={e => handleFilterChange('MobileNumber', e.target.value)}
              placeholder="Enter Mobile Number" />
          </div>
          <div>
            <Input type="text"
              label='Office Address'
              value={tempFilters?.OfficeAddress ?? ''}
              onChange={e => handleFilterChange('OfficeAddress', e.target.value)}
              placeholder="Enter Office Address" />
          </div>
          <div>
            <Input type="text"
              label='RERA Number'
              value={tempFilters?.RERANumber ?? ''}
              onChange={e => handleFilterChange('RERANumber', e.target.value)}
              placeholder="Enter RERA Number" />
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default ChannelPartnerUniverse;


