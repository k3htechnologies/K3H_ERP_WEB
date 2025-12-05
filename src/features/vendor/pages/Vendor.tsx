import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
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
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { useNavigate } from 'react-router-dom';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { Edit } from 'lucide-react';


export const Vendor: React.FC = () => {

  const [vendorList, setVendorList] = useState<VendorData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { toasts, removeToast, addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate();

  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchVendors(value)
  }, 350)
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteVendorDetailsData, setDeleteVendorDetailsData] = useState<VendorData | null>(null)
  const { canAction, canExport } = useMenuPermissions();
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});
  const [isShowCustomizeVendorColumnsModal, setIsShowCustomizeVendorColumnsModal] = useState(false);
  const hasFetchedInitialVendors = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialVendors.current) return
    hasFetchedInitialVendors.current = true;
    fetchVendorList()
  }, [])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  const fetchVendorList = async (page: number = pagination.currentPage) => {
    return await loadVendors(page, filters);
  }

  const loadVendors = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;
        if (sortInfo) {
          const column = vendorColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
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
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });
        } else {
          addToast({ type: 'error', title: response.left.message });
        }
        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Loading Vendor Data...'
    )
  }

  const searchVendors = async (searchValue: string) => {
    setSearchTerm(searchValue);
    if (searchValue.trim() === '') {
      fetchVendorList();
      return
    }
    const filterParams: FilterInfo = {
      VendorName: searchValue.trim(),
    };
    await loadVendors(1, filterParams)
  }

  const clearsearchVendors = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchVendorList();
  }

  const handleExportVendors = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined
        if (sortInfo) {
          const column = vendorColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
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
        handleExportFile(response, exportType, 'Vendor', addToast)
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' })
      },
      undefined,
      'Preparing Export...'
    )
  }

  const handleExportVendorExcel = () => handleExportVendors('Excel')
  const handleExportVendorPdf = () => handleExportVendors('PDF')

  const getVendors = async (filterParams: FilterWithPaginationVendorRequest) => {
    return await VendorService.apiCallPullVendor(filterParams);
  }

  const handlePageChange = (page: number) => {
    fetchVendorList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {
    setSortInfo(sortInfo);
    fetchVendorList(1);
  }

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

  const handleViewVendorDetails = useCallback((row: VendorData) => {
    navigate('/vendor/view', {
      state: {
        editVendorData: row,
        fromList: true,
      },
    })
  }, [navigate])

  const handleEditVendor = useCallback((row: VendorData) => {
    navigate(`/vendor/add/${row.VendorId}`, {
      state: {
        editVendorData: row,
        fromList: true,
      },
    })
  }, [navigate])

  const handleConfirmationDialogBoxOpen = useCallback((row: VendorData) => {
    setDeleteVendorDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])



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
          addToast({ type: 'success', title: response.right.SuccessMessage?.[0] || 'Vendor deleted successfully' })
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
      'Delete vendor data...'
    )
  }

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
        key: 'IsApproval',
        label: 'Approval Status',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {value ? 'Approved' : 'Pending'}
          </span>
        )
      },
      {
        key: 'CreatedBy',
        label: 'Last Modified By',
        width: '15',
        sortable: true,
        align: 'center',
        render: (value) => value || 'N/A'
      },
      {
        key: 'CreatedDate',
        label: 'Last Modified Date',
        width: '15',
        sortable: true,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
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
                  handleEditVendor(row as VendorData);
                }}
                color='transparent'
                isborderRadius
                size='sm'
                title="Edit Vendor"
                style={{
                  color: '#0B3251',
                  padding: '4px 8px'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#1A4D73')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#0B3251')}
              >
                <Edit className="h-4 w-4" />
              </Button>
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
    [canAction, handleViewVendorDetails, handleEditVendor, handleConfirmationDialogBoxOpen]
  )

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
  )

  const applyFilters = () => {
    setFilters(tempFilters)
    loadVendors(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadVendors(1, {})
    setShowFilterPopup(false)
  }
  const handleAddEmployeeModal = () => {
    navigate('/Vendor/add'); 
};
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...tempFilters }
    if (value.trim()) {
      newFilters[key] = value.trim()
    } else {
      delete newFilters[key]
    }
    setTempFilters(newFilters)
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <div className="h-full flex flex-col">
        <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>
        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder="Search by vendor name..."
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchVendors}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeVendorColumnsModal(true)}
          isShowAddButton={canAction}
          onAdd={handleAddEmployeeModal} 
          isShowImportButton={canAction}
          isShowExportButton={canExport}
          onExportExcel={handleExportVendorExcel}
          onExportPdf={handleExportVendorPdf}
          exportLoading={isLoading}
        />
        <DataTable
          data={vendorListForTable}
          columns={visibleVendorColumns}
          pagination={vendorPaginationInfo}
          emptyMessage="No vendors found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
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
          onCancel={() => clearFilters()}
          size="half-screen"
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                <Input
                  type="text"
                  value={tempFilters.VendorName || ''}
                  onChange={(e) => handleFilterChange('VendorName', e.target.value)}
                  placeholder="Enter vendor name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <Input
                  type="text"
                  value={tempFilters.CompanyName || ''}
                  onChange={(e) => handleFilterChange('CompanyName', e.target.value)}
                  placeholder="Enter company name"
                />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </>
  )
}

export default Vendor


