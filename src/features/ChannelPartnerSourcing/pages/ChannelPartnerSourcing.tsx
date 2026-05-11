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
import { AlertTriangle } from 'lucide-react';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { Modal } from '@/ui/components/Modal/Modal';
import { updateFilter } from '@/core/utils/filterHelper';
import { Input } from '@/ui/components/forms';

export const ChannelPartnerSourcing: React.FC = () => {

  //#region STATE
  const [channelPartnerMasterList, setChannelPartnerList] = useState<ChannelPartnerData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

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
          ChannelPartnerName: filterParams.Name?.trim() || undefined,
          CompanyName: filterParams.CompanyName?.trim() || undefined,
          Designation: filterParams.Designation?.trim() || undefined,
          FirmsType: filterParams.FirmsType?.trim() || undefined,
          Type: filterParams.Type?.trim() || undefined,
          MobileNumber: searchtext ?? filterParams.MobileNumber?.trim() ?? undefined,
          OfficeAddress: filterParams.OfficeAddress?.trim() || undefined,
          GSTNumber: filterParams.GSTNumber?.trim() || undefined,
          RERANumber: filterParams.RERANumber?.trim() || undefined,
          PanNumber: filterParams.PanNumber?.trim() || undefined,
          AadharCardNumber: filterParams.AadharCardNumber?.trim() || undefined,
          Speciality: filterParams.Speciality?.trim() || undefined,
          CityName: filterParams.CityName?.trim() || undefined,
          VillageName: filterParams.VillageName?.trim() || undefined,
          ProjectId: projectId ?? 0,
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
        key: 'NoOfIbm',
        label: 'No of IBM',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '0'
      },
      {
        key: 'NoOfObm',
        label: 'No of OBM',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '0'
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
        render: (value) => value ? `+91 ${value}` : '-'
      },



      {
        key: 'PanNumber',
        label: 'Pan Number',
        width: '12',
        sortable: false,
        align: 'left',
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
        align: 'left',
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
        align: 'left',
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
        align: 'left',
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
    ],
    [canAction]
  );

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

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
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
              label='GST Number'
              value={tempFilters?.GSTNumber ?? ''}
              onChange={e => handleFilterChange('GSTNumber', e.target.value)}
              placeholder="Enter GST Number" />
          </div>
          <div>
            <Input type="text"
              label='RERA Number'
              value={tempFilters?.RERANumber ?? ''}
              onChange={e => handleFilterChange('RERANumber', e.target.value)}
              placeholder="Enter RERA Number" />
          </div>
          <div>
            <Input type="text"
              label='PAN Number'
              value={tempFilters?.PanNumber ?? ''}
              onChange={e => handleFilterChange('PanNumber', e.target.value)}
              placeholder="Enter PAN Number" />
          </div>
          <div>
            <Input type="text"
              label='Aadhaar Card Number'
              value={tempFilters?.AadharCardNumber ?? ''}
              onChange={e => handleFilterChange('AadharCardNumber', e.target.value)}
              placeholder="Enter Aadhaar Card Number" />
          </div>
          <div>
            <Input type="text"
              label='Speciality'
              value={tempFilters?.Speciality ?? ''}
              onChange={e => handleFilterChange('Speciality', e.target.value)}
              placeholder="Enter Speciality" />
          </div>
          <div>

            <Input
              label='City'
              type="text"
              value={tempFilters.CityName || ''}
              onChange={e => handleFilterChange('CityName', e.target.value)}
              placeholder="Enter City"
            />
          </div>
          <div>

            <Input
              label='Village'
              type="text"
              value={tempFilters.VillageName || ''}
              onChange={e => handleFilterChange('VillageName', e.target.value)}
              placeholder="Enter Village"
            />
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default ChannelPartnerSourcing;


