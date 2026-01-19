import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  VendorData,
  FilterWithPaginationVendorRequest
} from '@/features/vendor/models/VendorModel';

import { vendorService } from '@/features/vendor/services/VendorService'
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
import { useNavigate } from 'react-router-dom';
import { useVendorListState } from '@/features/vendor/context/VendorListStateContext';
import { Trash2 } from 'lucide-react';
import { updateFilter } from '@/core/utils/filterHelper';
import { technicalService } from '@/features/technical/services/TechnicalService';
import type { FilterMagicLinkWithValidate, FilterPullExcelSample } from '@/features/technical/models/TechnicalModel';
import ExportImport from '@/ui/components/ExcelImport/ExcelImport';
import { TextArea } from '@/ui/components/forms/Textarea';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';


export const Vendor: React.FC = () => {
  //#region STATE
  const [vendorList, setVendorList] = useState<VendorData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const { addToast } = useToast()
  const navigate = useNavigate();
  const { listState, updateListState } = useVendorListState();
  const { searchTerm, filters, sortInfo } = listState;

  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchVendors(value)
  }, 350)

  const [showFilterPopup, setShowFilterPopup] = useState(false);

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteVendorDetailsData, setDeleteVendorDetailsData] = useState<VendorData | null>(null)

  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  const [isShowCustomizeVendorColumnsModal, setIsShowCustomizeVendorColumnsModal] = useState(false);

  //EXCEL IMPORT 
  const [showImportModal, setShowImportModal] = useState(false);

  //SHARE MAGIC LINK OPTION
  const [isShareMagicLinkModalOpen, setIsShareMagicLinkModalOpen] = useState(false);
  const [magicLink, setmagicLink] = useState<string>('');

  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INIT
  useEffect(() => {
    // Sync pagination with context state
    setPagination({ currentPage: listState.page });

    // Load vendors with current context state
    if (listState.searchTerm && String(listState.searchTerm).trim()) {
      loadVendors(listState.page, { VendorName: String(listState.searchTerm).trim() }, listState.sortInfo);
    } else {
      loadVendors(listState.page, listState.filters, listState.sortInfo);
    }
  }, [listState.page, listState.filters, listState.sortInfo, listState.searchTerm]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  //#endregion

  //#region DATA LOAD

  const fetchVendorList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadVendors(page, filters, sort ?? sortInfo);
  };

  const loadVendors = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationVendorRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          VendorId: filterParams.VendorId ? Number(filterParams.VendorId) : undefined,
          VendorName: searchtext ?? filterParams.VendorName?.trim() ?? undefined,
          CompanyName: filterParams.CompanyName?.trim() || undefined,
          CompanyType: filterParams.CompanyType?.trim() || undefined,
          MobileNumber: filterParams.MobileNumber?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, vendorColumns)
        }

        const response = await vendorService.apiCallPullVendor(params);

        if (E.isRight(response)) {

          setVendorList(response.right.Data);

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
      'Loading Vendor'
    );
  };

  //#endregion

  //#region SEARCH VENDOR FILTER
  const searchVendors = async (searchValue: string) => {
    updateListState({ searchTerm: searchValue });

    if (searchValue.trim() === '') {
      fetchVendorList();
      return;
    }

    updateListState({ searchTerm: searchValue, page: 1 });
    await loadVendors(1, filters, sortInfo, searchValue);
  };


  //#endregion

  //#region CLAER SERACH VENDOR
  const clearSearchVendors = () => {
    updateListState({ searchTerm: '', filters: {}, page: 1 });

    debouncedSearch.cancel?.();

    setTempFilters({});
    setPagination({ currentPage: 1 });
    loadVendors(1, { VendorName: '' }, sortInfo, undefined);
  };

  //#endregion

  //#region  EXCEL EXPORT TO EXCEL | PDF
  const handleExportVendors = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {


        const params: FilterWithPaginationVendorRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          VendorName: filters.VendorName?.trim() || undefined,
          CompanyName: filters.CompanyName?.trim() || undefined,
          CompanyType: filters.CompanyType?.trim() || undefined,
          MobileNumber: filters.MobileNumber?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, vendorColumns),
          ExportType: exportType
        }

        const response = await vendorService.apiCallPullVendor(params);

        handleExportFile(response, exportType, 'Vendor Master', addToast);

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


  const handleExportVendorExcel = () => handleExportVendors('Excel')
  const handleExportVendorPdf = () => handleExportVendors('PDF')

  //#endregion

  //#region TABLE CONFIG

  const handlePageChange = useCallback((page: number) => {
    updateListState({ page });
    fetchVendorList(page);
  }, [updateListState]);

  const handleSortColumn = useCallback((sort: SortInfo) => {
    updateListState({ sortInfo: sort, page: 1 });
    loadVendors(1, filters, sort, searchTerm || undefined);
  }, [filters, updateListState, searchTerm]);

  const vendorPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const vendorListForTable = useMemo(() => vendorList, [vendorList]);
  //#endregion

  //#region VIEW VENDOR MASTER
  const handleViewVendorDetails = useCallback((row: VendorData) => {
    updateListState({ vendorId: row.VendorId, vendorName: row.VendorName });
    navigate('/vendor/view');
  }, [navigate, updateListState]);

  //#endregion

  //#region CONFIRMATION DIALOG BOX

  const handleConfirmationDialogBoxOpen = useCallback((row: VendorData) => {
    setDeleteVendorDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])

  //#endregion

  //#region TABLE COLUMN
  const vendorColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'VendorName',
        label: 'Vendor Name',
        width: '20',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="250px"
            tooltipThreshold={25}
            onClick={() => handleViewVendorDetails(row)}
          />
        )
      },
      {
        key: 'CompanyName',
        label: 'Company Name',
        width: '20',
        sortable: true,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="200px"
            tooltipThreshold={20}
          />
        )
      },
      {
        key: 'CompanyType',
        label: 'Company Type',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="150px"
            tooltipThreshold={15}
          />
        )
      },
      {
        key: 'MobileNumber',
        label: 'Mobile Number',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || 'N/A'
      },
      {
        key: 'EmailId',
        label: 'Email',
        width: '18',
        sortable: false,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="200px"
            tooltipThreshold={20}
          />
        )
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
                  handleConfirmationDialogBoxOpen(row as VendorData)
                }}
                color='transparent'
                isborderRadius
                size='sm'
                style={{
                  color: 'red',
                  padding: '4px 8px'
                }}
                title="Delete Vendor"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null
        )
      }
    ],
    [canAction, handleViewVendorDetails, handleConfirmationDialogBoxOpen]
  )

  //#endregion

  //#region CUSTOMIZE COLUMNS
  const requiredVendorColumnKeys: string[] = ['VendorName'];
  const allVendorColumnKeys: string[] = vendorColumns.map(c => c.key)
  const [selectedVendorColumnKeys, setSelectedVendorColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getVendorTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredVendorColumnKeys]));
        return withRequired.filter(k => allVendorColumnKeys.includes(k));
      }
    } catch {
      // Ignore parsing errors
    }
    return allVendorColumnKeys
  })

  useEffect(() => {
    setSelectedVendorColumnKeys(prev => Array.from(new Set([...prev, ...requiredVendorColumnKeys])).filter(k => allVendorColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorColumns.length])

  const visibleVendorColumns = useMemo(
    () => vendorColumns.filter(col => selectedVendorColumnKeys.includes(col.key)),
    [vendorColumns, selectedVendorColumnKeys]
  );
  //#endregion

  //#region FILTER HELPERS
  const applyFilters = () => {
    updateListState({ filters: tempFilters, page: 1 });
    loadVendors(1, tempFilters);
    setShowFilterPopup(false);
  };

  const clearFilters = () => {
    setTempFilters({});
    updateListState({ filters: {}, page: 1 });
    loadVendors(1, {});
    setShowFilterPopup(false);
  };
  //#endregion

  //#region ADD NEW EMPLOYEE
  const handleAddVendor = () => {
    navigate('/vendor/add');
  };
  //#endregion

  //#region  HANDLE CHANGE EVENT

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  //#endregion


  //#region IMPORT EXCEL | DOWNLOAD
  const downloadExcelSampleVendor = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        // Find the column label for sorting

        const params: FilterPullExcelSample = {
          TableName: 'Vendor'
        }

        const response = await technicalService.apiCallPullExcelSample(params);

        handleExportFile(response, 'Excel', 'Vendor', addToast, 'Sample file download successfully')

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


  const handleDownloadExcelSampleVendor = () => downloadExcelSampleVendor()

  const uploadExcel = async (file: File, mergeExisting: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const fd = new FormData();

        fd.append("ExcelFile", file);
        fd.append("IsAllDelete", mergeExisting);
        fd.append("TableName", 'Vendor');

        const response = await technicalService.apiCallExcelImport(fd);

        if (E.isRight(response)) {

          addToast({ type: 'success', title: "Excel imported sucessfully" })

          fetchVendorList();

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

  //#region  DELETE VENDOR EVENT
  const handleDeleteVendor = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteVendorDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params = {
          VendorId: deleteVendorDetailsData.VendorId ?? 0,
          UniqueKey: deleteVendorDetailsData.Uniquekey ?? ""
        }

        const response = await vendorService.apiCallDeleteVendor(params);

        if (E.isRight(response)) {

          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          }

          else if (vendorList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }
          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          await loadVendors(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteVendorDetailsData(null);

        } else {

          addToast({ type: 'error', title: response.left.message });

          setIsConfirmationDialogBoxOpen(false);

        }

        return response
      },
      undefined,
      (error: unknown) => {
        const err = error as { message?: string };
        addToast({ type: 'error', title: err.message || 'An error occurred' })
      },
      undefined,
      'Delete Vendor'
    )
  }

  //#endregion

  //region MAGIC LICK
  const handleMagicLinkWithValidate = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        // Find the column label for sorting

        const params: FilterMagicLinkWithValidate = {
          ClientRegistrationId: Number(LocalStorageHelper.getStoredEmployeeData()?.ClientRegistrationId),
          MagicLinkType: 'VENDOR MANAGEMENT'
        }

        const response = await technicalService.apiCallPullMagicLinkWithValidate(params);

        if (E.isRight(response)) {

          setmagicLink(response.right.Data ?? '');

        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;

      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' })
      },
      undefined,
      'Generate Link'
    )
  }
  const handleCopyMagicLink = async () => {
    if (!magicLink) return;
    try {
      await navigator.clipboard.writeText(magicLink);

      addToast({ type: "success", title: "Link copied to clipboard" });

    } catch {

      addToast({ type: "error", title: "Failed to copy link" });

    }
  };

  const handleShareMagicLink = async () => {
    if (!magicLink) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Vendor Magic Link',
          text: 'Use this link to access Vendor Portal',
          url: magicLink
        });
      } catch {

      }
    } else {
      await handleCopyMagicLink();
    }
  };
  //#endregion
  return (

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full flex flex-col">
      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Vendor Name"
        onSearchChange={(v) => {
          updateListState({ searchTerm: v });
          debouncedSearch(v)
        }}
        onClearSearch={clearSearchVendors}
        isShowFilterButton
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters)
          setShowFilterPopup(true)
        }}
        isShowCustomizeButton

        onCustomize={() => setIsShowCustomizeVendorColumnsModal(true)}

        // ADD
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddVendor}

        // ADD EXTRA MAGIC LINK
        isShowAddExtraButton={canAction}
        addExtraTitle="Share"
        onAddExtra={async () => {
          await handleMagicLinkWithValidate();
          setIsShareMagicLinkModalOpen(true);
        }}


        // IMPORT
        isShowImportButton={canAction}
        onUploadExcel={() => setShowImportModal(true)}
        onDownloadSampleExcel={handleDownloadExcelSampleVendor}

        // EXPORT
        isShowExportButton={canExport && vendorListForTable.length > 0}
        onExportExcel={handleExportVendorExcel}
        onExportPdf={handleExportVendorPdf}
        exportLoading={isLoading}
      />
      <DataTable
        data={vendorListForTable}
        columns={visibleVendorColumns}
        pagination={vendorPaginationInfo}
        emptyMessage="No Vendors Data Found"
        fixedHeight={true}
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false)
          setDeleteVendorDetailsData(null)
        }}
        onConfirm={handleDeleteVendor}
        loading={isLoading}
        pageName='vendor'
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeVendorColumnsModal}
        onClose={() => setIsShowCustomizeVendorColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(new Set([...keys, ...requiredVendorColumnKeys]))
          setSelectedVendorColumnKeys(withRequired)
          try {
            LocalStorageHelper.storeVendorTableColumns(JSON.stringify(withRequired))
          } catch { /* empty */ }
        }}
        columns={vendorColumns}
        selectedKeys={selectedVendorColumnKeys}
        requiredKeys={requiredVendorColumnKeys}
        title="Customize Vendor Table Columns"
      />

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Vendor"
        onSubmit={(e) => {
          e.preventDefault()
          applyFilters()
        }}
        saveText="Apply"
        cancelText="Clear"
       
        onCancel={() => clearFilters()}
        size="small-half"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>

              <Input
                label='Vendor Name'
                type="text"
                value={tempFilters.VendorName || ''}
                onChange={(e) => handleFilterChange('VendorName', e.target.value)}
                placeholder="Enter Vendor Name"
              />
            </div>
            <div>

              <Input
                label='Company Name'
                type="text"
                value={tempFilters.CompanyName || ''}
                onChange={(e) => handleFilterChange('CompanyName', e.target.value)}
                placeholder="Enter Company Name"
              />
            </div>
            <div>

              <Input
                label='Company Type'
                type="text"
                value={tempFilters.CompanyType || ''}
                onChange={(e) => handleFilterChange('CompanyType', e.target.value)}
                placeholder="Enter Company Type"
              />
            </div>
            <div>

              <Input
                label='Mobile Number'
                type="text"
                value={tempFilters.MobileNumber || ''}
                onChange={(e) => handleFilterChange('MobileNumber', e.target.value)}
                placeholder="Enter Mobile Number"
              />
            </div>
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

      {/*  SHARE MAGIC LINK MODAL */}
      <Modal
        isOpen={isShareMagicLinkModalOpen}
        onClose={() => setIsShareMagicLinkModalOpen(false)}
        onCancel={() => setIsShareMagicLinkModalOpen(false)}
        title="Share Link"
        size="xl"
      >
        <div className="space-y-6 p-6 bg-blue-100">

          <TextArea
            label="Magic Link"
            rows={3}
            className="thin-scroll"
            value={magicLink ?? ''}
            readOnly
          />

          <div className="flex items-center justify-end gap-3">

            <Button
              color="primary"
              onClick={handleCopyMagicLink}
              type='button'
            >
              Copy Link
            </Button>

            <Button
              color="secondary"
              onClick={handleShareMagicLink}
              type='button'
            >
              Share Link
            </Button>

          </div>

        </div>
      </Modal>


    </div>
  )
}

export default Vendor


