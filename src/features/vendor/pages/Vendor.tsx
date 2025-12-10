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

import { VendorService } from '@/features/vendor/services/VendorService'
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
import { useLocation, type Location, useNavigate } from 'react-router-dom';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { Trash2 } from 'lucide-react';
import { updateFilter } from '@/core/utils/filterHelper';
import { technicalService } from '@/features/technical/services/TechnicalService';
import type { FilterPullExcelSample } from '@/features/technical/models/TechnicalModel';


export const Vendor: React.FC = () => {
  //#region STATE
  const [vendorList, setVendorList] = useState<VendorData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate();

  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchVendors(value)
  }, 350)

  const [showFilterPopup, setShowFilterPopup] = useState(false);

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteVendorDetailsData, setDeleteVendorDetailsData] = useState<VendorData | null>(null)

  const [filters, setFilters] = useState<FilterInfo>({});

  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  const [isShowCustomizeVendorColumnsModal, setIsShowCustomizeVendorColumnsModal] = useState(false);

  const { canAction, canExport } = useMenuPermissions();

  const location = useLocation() as Location & {
    state?: {
      listState?: {
        page?: number;
        filters?: FilterInfo;
        sortInfo?: SortInfo;
        searchTerm?: string;
      };
    };
  };
  //#endregion

  //#region INIT
  useEffect(() => {

    const incoming = location.state?.listState as
      | { page?: number; filters?: FilterInfo; sortInfo?: SortInfo; searchTerm?: string }
      | undefined;

    const listState = incoming ?? { page: 1, filters: {} as FilterInfo, sortInfo: undefined, searchTerm: '' };


    setPagination({ currentPage: listState.page ?? pagination.currentPage });

    setSortInfo(listState.sortInfo);

    setFilters(listState.filters ?? {});

    setTempFilters(listState.filters ?? {});

    setSearchTerm(listState.searchTerm ?? '');

    if (listState.searchTerm && String(listState.searchTerm).trim()) {

      setSearchTerm(String(listState.searchTerm));

      loadVendors(listState.page ?? 1, { VendorName: String(listState.searchTerm).trim() });

      return;
    }
    loadVendors(listState.page ?? 1, listState.filters ?? {});

  }, [location.state]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  //#endregion

  //#region DATA LOAD

  const fetchVendorList = async (page: number = pagination.currentPage) => {
    return await loadVendors(page, filters);
  };

  const loadVendors = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam: string | undefined;

        if (sortInfo) {
          const column = vendorColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const params: FilterWithPaginationVendorRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          VendorId: filterParams.VendorId ? Number(filterParams.VendorId) : undefined,
          VendorName: filterParams.VendorName?.trim() || undefined,
          CompanyName: filterParams.CompanyName?.trim() || undefined,
          CompanyType: filterParams.CompanyType?.trim() || undefined,
          MobileNumber: filterParams.MobileNumber?.trim() || undefined,
          SortBy: sortByParam
        }

        const response = await getVendors(params);

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
      'Loading Vendor Data'
    );
  };

  //#endregion

  //#region SEARCH VENDOR FILTER
  const searchVendors = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchVendorList();
      return;
    }

    const filterParams: FilterInfo = {
      VendorName: searchValue.trim()
    };

    await loadVendors(1, filterParams);
  };


  //#endregion

  //#region CLAER SERACH VENDOR
  const clearSearchVendors = () => {
    setSearchTerm('');

    debouncedSearch.cancel?.();

    setFilters({});
    setTempFilters({});
    setPagination({ currentPage: 1 });
    loadVendors(1, {});
    try {
      navigate(location.pathname, { replace: true, state: {} });
    } catch {
    }
  };

  //#endregion

  //#region  EXCEL EXPORT TO EXCEL | PDF
  const handleExportVendors = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam: string | undefined;
        if (sortInfo) {
          const column = vendorColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const params: FilterWithPaginationVendorRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          VendorName: filters.VendorName?.trim() || undefined,
          CompanyName: filters.CompanyName?.trim() || undefined,
          CompanyType: filters.CompanyType?.trim() || undefined,
          MobileNumber: filters.MobileNumber?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }

        const response = await getVendors(params);

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

  //#region PULL VENDOR MASTER
  const getVendors = async (filterParams: FilterWithPaginationVendorRequest) => {
    return await VendorService.apiCallPullVendor(filterParams);
  };
  //#endregion

  //#region TABLE CONFIG

  const handlePageChange = useCallback((page: number) => {
    fetchVendorList(page);
  }, [fetchVendorList]);

   const handleSortColumn = useCallback((sort: SortInfo) => {
      setSortInfo(sort);
      fetchVendorList(1);
    }, []);

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
    navigate('/vendor/view', {
      state: {
        editVendorData: row,
        fromList: true,
        listState: {
          page: pagination.currentPage,
          filters,
          sortInfo,
          searchTerm,
        },
      },
    })
  }, [navigate, pagination.currentPage, filters, sortInfo, searchTerm]);

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
    setFilters(tempFilters);
    loadVendors(1, tempFilters);
    setShowFilterPopup(false);
  };

  const clearFilters = () => {
    setTempFilters({});
    setFilters({});

    // reset page
    setPagination({ currentPage: 1 });

    // load empty filters
    loadVendors(1, {});

    setShowFilterPopup(false);

    // clear router state (very important)
    navigate(location.pathname, { replace: true, state: {} });
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

  const excelImportVendor = async () => {

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


  const downloadExcelSampleVendor = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
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

  const handleExcelImportVendor = () => excelImportVendor()
  const handleDownloadExcelSampleVendor = () => downloadExcelSampleVendor()



  //#endregion

  //#region  DELETE VENDOR EVENT
  const handleDeleteVendor = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteVendorDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const params = {
          VendorId: deleteVendorDetailsData.VendorId ?? 0,
          UniqueKey: deleteVendorDetailsData.Uniquekey ?? ""
        }

        const response = await VendorService.apiCallDeleteVendor(params);

        if (E.isRight(response)) {

          setVendorList(prevData => prevData.filter(item => item.VendorId !== deleteVendorDetailsData.VendorId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });
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

  return (
    
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full flex flex-col">
        <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder="Search By Vendor Name"
          onSearchChange={(v) => {
            setSearchTerm(v)
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
          addTitle="Add Vendor"
          onAdd={handleAddVendor}

           // IMPORT
          isShowImportButton={canAction}
          onUploadExcel={handleExcelImportVendor}
          onDownloadSampleExcel={handleDownloadExcelSampleVendor}

           // EXPORT
          isShowExportButton={canExport}
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
        <ConfirmationDialogBox
          isOpen={isConfirmationDialogBoxOpen}
          onClose={() => {
            setIsConfirmationDialogBoxOpen(false)
            setDeleteVendorDetailsData(null)
          }}
          onConfirm={handleDeleteVendor}
          title="You are about to delete a vendor?"
          message="Deleting this vendor will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
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
          saveText="Apply Filter"
          cancelText="Clear Filter"
          resetText=''
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
      </div>
  )
}

export default Vendor


