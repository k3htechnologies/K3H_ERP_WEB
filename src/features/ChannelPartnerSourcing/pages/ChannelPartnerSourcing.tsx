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
import MultiImageViewer from '@/ui/components/ImageViewer/ImageViewer';
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { isChannelPartnerComplete } from '@/features/ChannelPartner/utils/channelPartnerUtils';
import { AlertTriangle } from 'lucide-react';

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

  const { projectId } = useProject();

  //#region INIT
  useEffect(() => {

    setPagination({ currentPage: listState.page });

    if (listState.searchTerm && String(listState.searchTerm).trim()) {

      loadChannelPartner(listState.page, { Name: String(listState.searchTerm).trim() }, listState.sortInfo);

    } else {

      loadChannelPartner(listState.page, listState.filters, listState.sortInfo);

    }
  }, [projectId, listState.page, listState.filters, listState.sortInfo, listState.searchTerm]);

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
          IsCheckPermission: false,
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

    if (!projectId) {
      addToast({ type: 'error', title: 'Please select a project' });
      return;
    }

    updateListState({
      channelPartnerId: row.ChannelPartnerId,
      channelPartnerName: row.Name
    });
    navigate('/sourcing/view');
  };

  const channelPartnerColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'SystemGeneratedCode',
        label: 'Unique Code',
        width: '20',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => {
          const complete = isChannelPartnerComplete(row)
          return (
            <div className="flex items-center justify-center gap-2">

              <TooltipText
                text={value || '-'}
                maxWidth="150px"
                tooltipThreshold={20}
                tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
              />

              {!complete && (
                <span title="Channel Partner Profile Incomplete">
                  <AlertTriangle className="w-4 h-4 text-amber-500 cursor-pointer" />
                </span>
              )}

            </div>
          );
        }
      },
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
        key: 'Designation',
        label: 'Designation',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'CompanyName',
        label: 'Company Name',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'FirmsType',
        label: 'Firm Type',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'Type',
        label: 'Type',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },

      {
        key: 'EmailId',
        label: 'Email Id',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
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
        key: 'PanNumber',
        label: 'Pan Number',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value: string, row: any) => {
          return (
            <MultiImageViewer
              images={parseDocumentUrls(row.PanCardURL)}
              title="Pan Card Document"
              triggerLabel={value || '-'}
              isWrap={false}
            />
          );
        }
      },
      {
        key: 'AadharCardNumber',
        label: 'Aadhaar Card Number',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value: string, row: any) => {
          return (
            <MultiImageViewer
              images={parseDocumentUrls(row.AadharCardURL)}
              title="Aadhaar Document"
              triggerLabel={value || '-'}
              isWrap={false}
            />
          );
        }
      },
      {
        key: 'GSTNumber',
        label: 'GST Number',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value: string, row: any) => {
          return (
            <MultiImageViewer
              images={parseDocumentUrls(row.GSTCertificateURL)}
              title="GST Document"
              triggerLabel={value || '-'}
              isWrap={false}
            />
          );
        }
      },
      {
        key: 'RERANumber',
        label: 'RERA Number',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'CountryName',
        label: 'Country',
        width: '14',
        sortable: false,
        align: 'left',
        render: value => value || '-'
      },
      {
        key: 'DistrictName',
        label: 'District',
        width: '14',
        sortable: false,
        align: 'left',
        render: value => value || '-'
      },
      {
        key: 'CityName',
        label: 'City',
        width: '14',
        sortable: false,
        align: 'left',
        render: value => value || '-'
      },
      {
        key: 'VillageName',
        label: 'Village',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'OfficeAddress',
        label: 'Office Address',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
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


