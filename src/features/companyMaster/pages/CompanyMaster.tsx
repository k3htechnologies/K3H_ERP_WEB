import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  CompanyMasterData,
  FilterWithPaginationCompanyMasterRequest
} from '@/features/companyMaster/models/CompanyMasterModel';

import { CompanyMasterService } from '@/features/companyMaster/services/CompanyMasterService'
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


export const CompanyMaster: React.FC = () => {

  const [companyMasterList, setCompanyMasterList] = useState<CompanyMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { toasts, removeToast, addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchCompanies(value)
  }, 350)
  const [viewCompanyMasterDetailsData, setViewCompanyMasterDetailsData] = useState<CompanyMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});
  const [isShowCustomizeCompanyMasterColumnsModal, setIsShowCustomizeCompanyMasterColumnsModal] = useState(false);
  const { canExport } = useMenuPermissions();
  const hasFetchedInitialCompanies = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialCompanies.current) return
    hasFetchedInitialCompanies.current = true;
    fetchCompanyList()
  }, [])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  const fetchCompanyList = async (page: number = pagination.currentPage) => {
    return await loadCompanies(page, filters);
  }

  const loadCompanies = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;
        if (sortInfo) {
          const column = companyMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationCompanyMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          CompanyId: filterParams.CompanyId ? Number(filterParams.CompanyId) : undefined,
          CompanyName: filterParams.CompanyName?.trim() || undefined,
          CompanyType: filterParams.CompanyType?.trim() || undefined,
          SortBy: sortByParam
        }
        const response = await getCompanies(params);
        if (E.isRight(response)) {
          setCompanyMasterList(response.right.Data);
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
      'Loading Company Data...'
    )
  }

  const searchCompanies = async (searchValue: string) => {
    setSearchTerm(searchValue);
    if (searchValue.trim() === '') {
      fetchCompanyList();
      return
    }
    const filterParams: FilterInfo = {
      CompanyName: searchValue.trim(),
    };
    await loadCompanies(1, filterParams)
  }

  const clearsearchCompanies = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchCompanyList();
  }

  const handleExportCompanies = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined
        if (sortInfo) {
          const column = companyMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationCompanyMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          CompanyName: filters.CompanyName?.trim() || undefined,
          CompanyType: filters.CompanyType?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }
        const response = await getCompanies(params);
        handleExportFile(response, exportType, 'Company Master', addToast)
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

  const handleExportCompanyExcel = () => handleExportCompanies('Excel')
  const handleExportCompanyPdf = () => handleExportCompanies('PDF')

  const getCompanies = async (filterParams: FilterWithPaginationCompanyMasterRequest) => {
    return await CompanyMasterService.apiCallPullCompanyMaster(filterParams);
  }

  const handlePageChange = (page: number) => {
    fetchCompanyList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {
    setSortInfo(sortInfo);
    fetchCompanyList(1);
  }

  const companyMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const companyListForTable = useMemo(() => companyMasterList, [companyMasterList]);

  const handleViewCompanyDetails = useCallback((row: CompanyMasterData) => {
    setViewCompanyMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  const companyMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'CompanyName',
        label: 'Company Name',
        width: '25',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className="flex items-center justify-start">
            <TooltipText
              text={value || 'N/A'}
              maxWidth="250px"
              tooltipThreshold={25}
              onClick={() => handleViewCompanyDetails(row)}
            />
          </div>
        )
      },
      {
        key: 'CompanyType',
        label: 'Company Type',
        width: '18',
        sortable: false,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="180px"
            tooltipThreshold={18}
          />
        )
      },
      {
        key: 'ContactPerson',
        label: 'Contact Person',
        width: '18',
        sortable: false,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="180px"
            tooltipThreshold={18}
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
        width: '20',
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
      }
    ],
    [handleViewCompanyDetails]
  )

  const requiredCompanyMasterColumnKeys: string[] = ['CompanyName'];
  const allCompanyMasterColumnKeys: string[] = companyMasterColumns.map(c => c.key)
  const [selectedCompanyMasterColumnKeys, setSelectedCompanyMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getCompanyMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredCompanyMasterColumnKeys]));
        return withRequired.filter(k => allCompanyMasterColumnKeys.includes(k));
      }
    } catch { }
    return allCompanyMasterColumnKeys
  })

  useEffect(() => {
    setSelectedCompanyMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredCompanyMasterColumnKeys])).filter(k => allCompanyMasterColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyMasterColumns.length])

  const visibleCompanyMasterColumns = useMemo(
    () => companyMasterColumns.filter(col => selectedCompanyMasterColumnKeys.includes(col.key)),
    [companyMasterColumns, selectedCompanyMasterColumnKeys]
  )

  interface ViewCompanyDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: CompanyMasterData | null
  }

  const ViewCompanyDetailsModal: React.FC<ViewCompanyDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings - Company setup (Company Details)"
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
        }}
        cancelText="Close"
        loading={false}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Company Name</span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.CompanyName || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Company Type</span>
              <span className="text-sm text-blue-600 font-medium">{data.CompanyType || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Contact Person</span>
              <span className="text-sm text-blue-600 font-medium">{data.ContactPerson || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Mobile Number</span>
              <span className="text-sm text-blue-600 font-medium">{data.MobileNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Landline Number</span>
              <span className="text-sm text-blue-600 font-medium">{data.LandLineNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.EmailId || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">GST Number</span>
              <span className="text-sm text-blue-600 font-medium">{data.GSTNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">PAN Number</span>
              <span className="text-sm text-blue-600 font-medium">{data.PANNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">CIN Number</span>
              <span className="text-sm text-blue-600 font-medium">{data.CINNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">City</span>
              <span className="text-sm text-blue-600 font-medium">{data.CityName || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">State</span>
              <span className="text-sm text-blue-600 font-medium">{data.StateName || 'N/A'}</span>
            </div>
            {data.CompanyPartnerData && data.CompanyPartnerData.length > 0 && (
              <div className="py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700 block mb-2">Partners ({data.CompanyPartnerData.length})</span>
                <div className="space-y-2">
                  {data.CompanyPartnerData.map((partner, idx) => (
                    <div key={idx} className="text-sm text-blue-600 font-medium">
                      {partner.FullName || partner.FirstName} ({partner.PartnerPercentage}%)
                    </div>
                  ))}
                </div>
              </div>
            )}
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
    )
  }

  const applyFilters = () => {
    setFilters(tempFilters)
    loadCompanies(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadCompanies(1, {})
    setShowFilterPopup(false)
  }

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
          searchPlaceholder="Search by company name..."
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchCompanies}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeCompanyMasterColumnsModal(true)}
          isShowAddButton={false}
          isShowImportButton={false}
          isShowExportButton={canExport}
          onExportExcel={handleExportCompanyExcel}
          onExportPdf={handleExportCompanyPdf}
          exportLoading={isLoading}
        />
        <DataTable
          data={companyListForTable}
          columns={visibleCompanyMasterColumns}
          pagination={companyMasterPaginationInfo}
          emptyMessage="No companies found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />
        <ViewCompanyDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewCompanyMasterDetailsData(null)
          }}
          data={viewCompanyMasterDetailsData}
        />
        <CustomizeColumnsModal
          isOpen={isShowCustomizeCompanyMasterColumnsModal}
          onClose={() => setIsShowCustomizeCompanyMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(new Set([...keys, ...requiredCompanyMasterColumnKeys]))
            setSelectedCompanyMasterColumnKeys(withRequired)
            try {
              LocalStorageHelper.storeCompanyMasterTableColumns(JSON.stringify(withRequired))
            } catch { }
          }}
          columns={companyMasterColumns}
          selectedKeys={selectedCompanyMasterColumnKeys}
          requiredKeys={requiredCompanyMasterColumnKeys}
          title="Customize Company Master Table Columns"
        />
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Company Master"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <Input
                  type="text"
                  value={tempFilters.CompanyName || ''}
                  onChange={(e) => handleFilterChange('CompanyName', e.target.value)}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Type</label>
                <Input
                  type="text"
                  value={tempFilters.CompanyType || ''}
                  onChange={(e) => handleFilterChange('CompanyType', e.target.value)}
                  placeholder="Enter company type"
                />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </>
  )
}

export default CompanyMaster


