import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  CompanyMasterData,
  DeleteCompanyMasterRequest,
  FilterWithPaginationCompanyMasterRequest
} from '@/features/companyMaster/models/CompanyMasterModel';

import { CompanyMasterService } from '@/features/companyMaster/services/CompanyMasterService'
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { MultiImageViewer } from '@/ui/components/ImageViewer/ImageViewer';
import { CollapseCard } from '@/ui/components/Card/CollapseCard';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { Edit, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';


export const CompanyMaster: React.FC = () => {

  //#region STATE
  const [companyMasterList, setCompanyMasterList] = useState<CompanyMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const { toasts, removeToast, addToast } = useToast()

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchCompanies(value)
  }, 350)

  //VIEW COMPANY MASTER MODAL STATES
  const [viewCompanyMasterDetailsData, setViewCompanyMasterDetailsData] = useState<CompanyMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeCompanyMasterColumnsModal, setIsShowCustomizeCompanyMasterColumnsModal] = useState(false);

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  const hasFetchedInitialCompanies = useRef(false)

  //DELETE TNC MASTER STATES

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteCompanyMasterDetailsData, setDeleteCompanyMasterDetailsData] = useState<CompanyMasterData | null>(null)

  // NAVIGATE
  const navigate = useNavigate()
  const location = useLocation() as {
    state?: {
      listState?: {
        page: number;
        filters: FilterInfo;
      };
    };
  };
  //#endregion

  //#region INIT
  useEffect(() => {
    if (hasFetchedInitialCompanies.current) return;
    hasFetchedInitialCompanies.current = true;

    // 🔥 If coming back from AddCompany with saved state
    const savedListState = location.state?.listState;

    const initialPage = savedListState?.page ?? pagination.currentPage;
    const initialFilters: FilterInfo = savedListState?.filters ?? {};

    setFilters(initialFilters);
    setTempFilters(initialFilters);

    // load with same page + filters as before
    loadCompanies(initialPage, initialFilters);
  }, []);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion

  //#region DATA LOAD
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

      const emptyFilters: FilterInfo = { ...filters };
      delete emptyFilters.CompanyName;

      setFilters(emptyFilters);
      await loadCompanies(1, emptyFilters);
      return;

    }
    const newFilters: FilterInfo = {
      ...filters,
      CompanyName: searchValue.trim(),
    };
    setFilters(newFilters);
    await loadCompanies(1, newFilters);
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
  //#endregion

  //#region TABLE CONFIG
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

  const handleConfirmationDialogBoxOpen = useCallback((row: CompanyMasterData) => {
    setDeleteCompanyMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
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
              text={value || '-'}
              maxWidth="250px"
              tooltipThreshold={25}
              onClick={() => handleViewCompanyDetails(row)}
            />

            {canAction && (
              <div className="flex items-center justify-end ml-2 w-20">
                <>
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleEditCompanyMasterData(row);
                    }}
                    color='transparent'
                    fullWidth
                    isborderRadius
                    size='sm'
                    title="Edit Tnc"
                    style={{
                      color: '#0B3251',
                      padding: '0px 8px'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#1A4D73')} // lighter on hover
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#0B3251')} // revert
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleConfirmationDialogBoxOpen(row)
                    }}
                    color='transparent'
                    fullWidth
                    isborderRadius
                    size='sm'
                    style={{
                      color: 'red',
                      padding: '0px 8px'
                    }}
                    title="Delete Tnc"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>

              </div>
            )}
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
            text={value || '-'}
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
            text={value || '-'}
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
        render: (value) => value || '-'
      },
      {
        key: 'LandLineNumber',
        label: 'Land Line Number',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'EmailId',
        label: 'Email',
        width: '20',
        sortable: false,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || '-'}
            maxWidth="200px"
            tooltipThreshold={20}
          />
        )
      },

      {
        key: 'GSTNumber',
        label: 'GST Number',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value: string, row: any) => {
          const images: string[] = (row.GSTCertificateURL || '')
            .split(',')
            .map((x: string) => x.trim())
            .filter((x: string) => x.length > 0);

          if (!images.length) {
            return value || '-';
          }

          return (
            <MultiImageViewer
              images={images}
              title="GST Document"
              triggerLabel={value || '-'}
            />
          );
        }
      },
      {
        key: 'PANNumber',
        label: 'Pan Number',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value: string, row: any) => {
          const images: string[] = (row.PanCardURL || '')
            .split(',')
            .map((x: string) => x.trim())
            .filter((x: string) => x.length > 0);

          if (!images.length) {
            return value || '-';
          }

          return (
            <MultiImageViewer
              images={images}
              title="Pan Card Document"
              triggerLabel={value || '-'}
            />
          );
        }
      },

      {
        key: 'CINNumber',
        label: 'CIN Number',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value: string, row: any) => {
          const images: string[] = (row.CINURL || '')
            .split(',')
            .map((x: string) => x.trim())
            .filter((x: string) => x.length > 0);

          if (!images.length) {
            return value || '-';
          }

          return (
            <MultiImageViewer
              images={images}
              title="CIN Document"
              triggerLabel={value || '-'}
            />
          );
        }
      },

      {
        key: 'RERANumber',
        label: 'RERA Number',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },

      {
        key: 'StateName',
        label: 'State',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'DistrictName',
        label: 'District',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'CityName',
        label: 'City',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },

      {
        key: 'CreatedBy',
        label: 'Last Modified By',
        width: '15',
        sortable: true,
        align: 'center',
        render: (value) => value || '-'
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
    [handleViewCompanyDetails, handleConfirmationDialogBoxOpen]
  )
  //#endregion

  //#region CUSTOMIZE COLUMNS
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
  //#endregion

  //#region VIEW MODAL
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
        title="View Company Details"
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
        }}
        cancelText="Close"
        loading={false}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Basic Details
            </h4>

            <div className="space-y-3">

              <FieldItem label="Company Name" value={data.CompanyName} isRow />
              <FieldItem label="Company Type" value={data.CompanyType} isRow />
              <FieldItem label="Contact Person" value={data.ContactPerson} isRow />
              <FieldItem label="Mobile Number" value={data.MobileNumber} isRow />
              <FieldItem label="Landline Number" value={data.LandLineNumber} isRow />
              <FieldItem label="Email" value={data.EmailId} isRow />
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Government Identifiers
            </h4>
            <FieldItem label="GST Number" value={data.GSTNumber} isRow />
            <FieldItem label="PAN Number" value={data.PANNumber} isRow />
            <FieldItem label="CIN Number" value={data.CINNumber} isRow />
            <FieldItem label="RERA Number" value={data.RERANumber} isRow />
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Address
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FieldItem label="State" value={data.StateName} isRow={false} />
              <FieldItem label="District" value={data.DistrictName} isRow={false} />
              <FieldItem label="City" value={data.CityName} isRow={false} />

            </div>
          </div>
          {data.CompanyPartnerData && data.CompanyPartnerData.length > 0 && (
            <div className="py-2">
              <span className="text-sm font-medium text-gray-700 block mb-3">
                Partners ({data.CompanyPartnerData.length})
              </span>

              <div className="space-y-3">
                {data.CompanyPartnerData.map((partner, idx) => (
                  <CollapseCard
                    key={partner.CompanyPartnerId ?? idx}
                    name={partner.FullName || partner.FirstName || '-'}
                    mobileNumber={partner.MobileNumber || '-'}
                    partnershipPercent={partner.PartnerPercentage ?? '-'}
                    gender={partner.Gender || '-'}
                    defaultOpen={false}
                  >

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FieldItem label="DOB" value={formatDate_dd_MonthName_yy(partner.DateOfBirth || '-')} isRow={false} withBorder={false} />
                      <FieldItem label="Email" value={partner.EmailId} isRow={false} withBorder={false} />
                      <FieldItem label="Pan Number" value={partner.PanNumber} isRow={false} withBorder={false} />
                      <FieldItem label="Aadhar Card" value={partner.AadharCardNumber} isRow={false} withBorder={false} />
                    </div>
                  </CollapseCard>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Action Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FieldItem label="Created By" isRow={true} value={data.CreatedBy} />
                <FieldItem label="Created Date" isRow={true} value={formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')} />

              </div>
              <div className="space-y-2">
                {data.ModifiedBy && (
                  <>
                    <FieldItem label="Modified By" isRow={true} value={data.ModifiedBy} />
                    <FieldItem label="Modified Date" isRow={true} value={formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal >
    )
  }

  //#endregion

  //#region FILTER HELPERS
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

  //#endregion

  //#region DELETE COMPANY MASTER

  //#region EDIT COMPANY MASTER DATA
  const handleEditCompanyMasterData = (row: CompanyMasterData) => {
    navigate('/companyMaster/addCompany', {
      state: {
        editCompanyMasterData: row,
        fromList: true,
        listState: {
          page: pagination.currentPage,
          filters,
        },
      },
    });
  }
  //#endregion


  //#region ADD COMPANY MASTER DATA
  const handleAddCompanyMaster = () => {
    navigate('/companyMaster/addCompany', {
      state: {
        editCompanyMasterData: null,
        fromList: true,
        listState: {
          page: pagination.currentPage,
          filters,
        },
      },
    });
  }

  //#endregion

  const handleDeleteCompanyMaster = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteCompanyMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteCompanyMasterRequest = {
          CompanyId: deleteCompanyMasterDetailsData.CompanyId ?? 0,
          UniqueKey: deleteCompanyMasterDetailsData.Uniquekey ?? ""
        }

        const response = await CompanyMasterService.apiCallDeleteCompanyMaster(params);

        if (E.isRight(response)) {

          setCompanyMasterList(prevData => prevData.filter(item => item.CompanyId !== deleteCompanyMasterDetailsData.CompanyId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteCompanyMasterDetailsData(null);

        } else {
          addToast({ type: 'error', title: response.left.message });

          setIsConfirmationDialogBoxOpen(false);
        }

        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Delete comapany master data...'
    )
  }

  //#endregion


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
          isShowAddButton={canAction}
          isShowImportButton={canAction}
          isShowExportButton={canExport}
          onAdd={handleAddCompanyMaster}
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

        {/* DELETE CONFIRMATION TNC MODAL */}
        <ConfirmationDialogBox
          isOpen={isConfirmationDialogBoxOpen}
          onClose={() => {
            setIsConfirmationDialogBoxOpen(false)
            setDeleteCompanyMasterDetailsData(null)
          }}
          onConfirm={handleDeleteCompanyMaster}
          title="You are about to delete a company?"
          message="Deleting this company will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
        />
      </div>
    </>
  )
}

export default CompanyMaster


