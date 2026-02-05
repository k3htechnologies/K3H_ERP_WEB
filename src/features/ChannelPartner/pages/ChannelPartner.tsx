import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  ChannelPartnerData,
  DeleteChannelPartnerRequest,
  FilterWithPaginationChannelPartnerRequest
} from '@/features/ChannelPartner/models/ChannelPartnerModel';

import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChannelPartnerService } from '../services/ChannelPartnerService';
import { updateFilter } from '@/core/utils/filterHelper';
import type { FilterPullExcelSample } from '@/features/technical/models/TechnicalModel';
import { technicalService } from '@/features/technical/services/TechnicalService';
import { Trash2 } from 'lucide-react';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import MultiImageViewer from '@/ui/components/ImageViewer/ImageViewer';
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import ExportImport from '@/ui/components/ExcelImport/ExcelImport';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';


export const ChannelPartner: React.FC = () => {

  //#region STATE MANAGEMENT
  const [channelPartnerMasterList, setChannelPartnerList] = useState<ChannelPartnerData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // USE NAVIGATE
  const navigate = useNavigate();

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const { addToast } = useToast();

  const { projectId } = useProject();

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = useDebouncedCallback((value: string) => {

    searchChannelPartner(value)
  }, 350);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //DELETE ChannelPartner MASTER
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deleteChannelPartnerDetailsData, setDeleteChannelPartnerDetailsData] = useState<ChannelPartnerData | null>(null)

  //EXCEL IMPORT 
  const [showImportModal, setShowImportModal] = useState(false);


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
      loadChannelPartner(listState.page ?? 1, { Name: String(listState.searchTerm).trim() });
      return;
    }

    loadChannelPartner(listState.page ?? 1, listState.filters ?? {});
  }, [location.state]);

  //#region CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

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
          ChannelPartnerName: searchtext ?? filterParams.Name?.trim() ?? undefined,
          CompanyName: filterParams.CompanyName?.trim() || undefined,
          FirmsType: filterParams.FirmsType?.trim() || undefined,
          MobileNumber: filterParams.MobileNumber?.trim() || undefined,
          OfficeAddress: filterParams.OfficeAddress?.trim() || undefined,
          GSTNumber: filterParams.GSTNumber?.trim() || undefined,
          RERANumber: filterParams.RERANumber?.trim() || undefined,
          PanNumber: filterParams.PanNumber?.trim() || undefined,
          AadharCardNumber: filterParams.AadharCardNumber?.trim() || undefined,
          Speciality: filterParams.Speciality?.trim() || undefined,
          ProjectName: filterParams.ProjectName?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, ChannelPartnerColumns),
          ProjectId: Number(projectId),

        };

        const response = await ChannelPartnerService.apiCallPullChannelPartner(params);

        if (E.isRight(response)) {

          setChannelPartnerList(response.right.Data);

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
      'Loading Channel Partner'
    );
  };
  //#endregion

  //#region SEARCH & CLEAR
  const searchChannelPartner = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchChannelPartnerList();

      return
    }

    await loadChannelPartner(1, filters, sortInfo, searchValue);
  };

  //#endregion

  //#region CLEAR CHANNEL PARTNER MASTER 
  const clearSearchChannelPartner = () => {
    setSearchTerm('');

    debouncedSearch.cancel?.();

    setFilters({});
    setTempFilters({});
    setPagination({ currentPage: 1 });
    loadChannelPartner(1, { Name: '' }, sortInfo, undefined);
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
  const handleExportChannelPartner = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationChannelPartnerRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          ChannelPartnerName: filters.Name?.trim() || undefined,
          CompanyName: filters.CompanyName?.trim() || undefined,
          FirmsType: filters.FirmsType?.trim() || undefined,
          MobileNumber: filters.MobileNumber?.trim() || undefined,
          OfficeAddress: filters.OfficeAddress?.trim() || undefined,
          GSTNumber: filters.GSTNumber?.trim() || undefined,
          RERANumber: filters.RERANumber?.trim() || undefined,
          PanNumber: filters.PanNumber?.trim() || undefined,
          AadharCardNumber: filters.AadharCardNumber?.trim() || undefined,
          Speciality: filters.Speciality?.trim() || undefined,
          ProjectName: filters.ProjectName?.trim() || undefined,
          ProjectId: Number(projectId),
          SortBy: getSortByParam(sortInfo ?? null, ChannelPartnerColumns),
          ExportType: exportType
        };

        const response = await getChannelPartner(params);

        handleExportFile(response, exportType, 'Channel Partner', addToast);

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
  //#endregion

  //#region IMPORT EXCEL | DOWNLOAD

  const downloadExcelSampleChannelPartner = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
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
  const handleDownloadExcelSampleChannelPartner = () => downloadExcelSampleChannelPartner()

  const uploadExcel = async (file: File, mergeExisting: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const fd = new FormData();

        fd.append("ExcelFile", file);
        fd.append("IsAllDelete", mergeExisting);
        fd.append("TableName", 'CHANNEL PARTNER');

        const response = await technicalService.apiCallExcelImport(fd);

        if (E.isRight(response)) {

          addToast({ type: 'success', title: "Excel imported sucessfully" })

          fetchChannelPartnerList();

        } else {
          addToast({ type: "error", title: response.left.message });
        }

        return response;
      },
      undefined,
      (err: any) => addToast({ type: "error", title: err.message }),
      undefined,
      "Importing Excel"
    );
  };
  //#endregion

  //#region API | SERVICES CALL TO GET CHANNEL PARTNER
  const getChannelPartner = async (filterParams: FilterWithPaginationChannelPartnerRequest) => {

    return await ChannelPartnerService.apiCallPullChannelPartner(filterParams);
  }
  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT
  const handlePageChange = useCallback((page: number) => {
    fetchChannelPartnerList(page);
  }, []);

  //#region TABLE SORT COLUMN

  const handleSortColumn = useCallback((sort: SortInfo) => {
    loadChannelPartner(1, filters, sort, searchTerm || undefined);
  }, [filters, searchTerm]);
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

  const ChannelPartnerForTable = useMemo(() => channelPartnerMasterList, [channelPartnerMasterList]);
  //#endregion

  //#region NAVIGATE TO  VIEW CHANNEL PARTNER
  const handleNavigateToView = (row: ChannelPartnerData) => {
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

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: ChannelPartnerData) => {
    setDeleteChannelPartnerDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  //#endregion

  //#region TABLE COLUMNS
  const ChannelPartnerColumns = useMemo<TableColumn[]>(() => [
    {
      key: 'Name',
      label: 'Full Name',
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
      key: 'EmailId',
      label: 'Email Id',
      width: '15',
      sortable: false,
      align: 'center',
      render: (value) => value ? `+91 ${value}` : '-'
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
      render: (value) => (
        <TooltipText
          text={value || '-'}
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
      render: (value) => value || '-'
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '12',
      fixed: 'right',
      align: 'center',
      render: (_value, row) => (
        canAction ? (
          <div className="flex items-center justify-center gap-2">

            <Button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleConfirmationDialogBoxOpen(row)
              }}
              color='transparent'
              isborderRadius
              size='sm'
              style={{
                color: 'red',
                padding: '4px 8px'
              }}
              title="Delete Channel Partner"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : null
      )
    }
  ], [handleNavigateToView, handleConfirmationDialogBoxOpen]);
  //#endregion

  //#region COLUMN CUSTOMIZATION
  const requiredChannelPartnerColumnKeys: string[] = ['Name', 'actions'];

  const allChannelPartnerColumnKeys: string[] = ChannelPartnerColumns.map(c => c.key);

  const [selectedChannelPartnerColumnKeys, setSelectedChannelPartnerColumnKeys] = useState<string[]>(() => {
    try {

      const saved = LocalStorageHelper.getChannelPartnerTableColumns?.();

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
  }, [ChannelPartnerColumns.length])

  const visibleChannelPartnerColumns = useMemo(

    () => ChannelPartnerColumns.filter(col => selectedChannelPartnerColumnKeys.includes(col.key)),

    [ChannelPartnerColumns, selectedChannelPartnerColumnKeys]
  );
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters);

    loadChannelPartner(1, tempFilters);

    setShowFilterPopup(false);
  };
  //#endregion

  //#region Clear
  const clearFilters = () => {
    setTempFilters({});
    setFilters({});

    // reset page
    setPagination({ currentPage: 1 });

    // load empty filters
    loadChannelPartner(1, {});

    navigate(location.pathname, { replace: true, state: {} });

  };
  //#endregion

  //#region HANDLE FILTER CHNAGE
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  }
  //#endregion

  //#region DELETE CHANNEL PARTNER MASTER
  const handleDeleteChannelPartner = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteChannelPartnerDetailsData) return;

    await runApiWithLoader(

      setIsLoading,

      setLoadingMessage,
      async () => {
        const params: DeleteChannelPartnerRequest = {

          ChannelPartnerId: deleteChannelPartnerDetailsData.ChannelPartnerId || 0,

          Uniquekey: deleteChannelPartnerDetailsData.Uniquekey || ""
        };

        const response = await ChannelPartnerService.apiCallDeleteChannelPartner(params);

        if (E.isRight(response)) {

          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          }

          else if (channelPartnerMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }
          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          await loadChannelPartner(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteChannelPartnerDetailsData(null);

        } else {

          addToast({ type: 'error', title: response.left.message });

          setIsConfirmationDialogBoxOpen(false);

        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Deleting Channel Partner"
    );
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      {/* Loader */}

      <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Full Name"
        onSearchChange={v => {
          setSearchTerm(v);
          debouncedSearch(v);
        }}
        onClearSearch={clearSearchChannelPartner}
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
        onUploadExcel={() => setShowImportModal(true)}
        onDownloadSampleExcel={handleDownloadExcelSampleChannelPartner}

        // EXPORT
        isShowExportButton={canExport}
        onExportExcel={handleExportChannelPartnerExcel}
        onExportPdf={handleExportChannelPartnerPdf}
        exportLoading={isLoading}
      />

      {/* DATA TABLE CHANNEL PARTNER*/}
      <DataTable
        data={ChannelPartnerForTable}
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
            LocalStorageHelper.storeChannelPartnerTableColumns?.(

              JSON.stringify(withRequired)
            );
          } catch { }
        }}
        columns={ChannelPartnerColumns}
        selectedKeys={selectedChannelPartnerColumnKeys}
        requiredKeys={requiredChannelPartnerColumnKeys}
        title="Customize Table Columns"
      />

      {/* FILTER CHANNEL PARTNER MODAL */}

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
              value={tempFilters?.ChannelPartnerName ?? ''}
              onChange={e => handleFilterChange('ChannelPartnerName', e.target.value)}
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
              label='Firm Type'
              value={tempFilters?.FirmsType ?? ''}
              onChange={e => handleFilterChange('FirmsType', e.target.value)}
              placeholder="Enter Firm Type" />
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
            <Input type="text"
              label='Project Name'
              value={tempFilters?.ProjectName ?? ''}
              onChange={e => handleFilterChange('ProjectName', e.target.value)}
              placeholder="Enter Project Name" />
          </div>
        </div>
      </Modal>

      <ExportImport
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onUpload={(file, mergeExisting) => {
          setShowImportModal(false);
          uploadExcel(file, mergeExisting);
        }}
      />

      {/* DELETE CONFIRMATION  ChannelPartner MODAL */}
      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false)
        }}
        onConfirm={handleDeleteChannelPartner}
        loading={isLoading}
        pageName='Channel Partner'
      />

    </div>

  );
};

export default ChannelPartner;
