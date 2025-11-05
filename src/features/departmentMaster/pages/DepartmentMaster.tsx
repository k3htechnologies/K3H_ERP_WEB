import React, { useEffect, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  DepartmentMasterData,
  FilterWithPaginationDepartmentMasterRequest
} from '@/features/departmentMaster/models/DepartmentMasterModel';

import { departmentMasterService } from '@/features/departmentMaster/services/DepartmentMasterService'
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Download, Edit, FileSpreadsheet, FileText, Filter, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';


export const DepartmentMaster: React.FC = () => {
  //#region STATE MANAGEMENT
  const [departmentMasterList, setDepartmentMasterList] = useState<DepartmentMasterData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO

  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const { toasts, removeToast, addToast } = useToast()

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<DepartmentMasterData[]>([]);

  //MODAL STATES
  const [ViewDepartmentDetailsData, setViewDepartmentDetailsData] = useState<DepartmentMasterData | null>(null)
  const [modalOpen, setModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({})

  //#endregion

  //#region INITIALIZATION

  useEffect(() => {
    fetchDepartmentList()
  }, [])
  //#endregion

  //#region DATA LOADING

  const fetchDepartmentList = async (page: number = pagination.currentPage) => {
    return loadDepartments(page, filters)
  }

  const loadDepartments = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setLoading,
      setLoadingMessage,
      async () => {

        let sortByParam = undefined;

        if (sortInfo) {

          const column = departmentMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }

        }

        const params: FilterWithPaginationDepartmentMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          DepartmentMasterId: filterParams.DepartmentMasterId ? Number(filterParams.DepartmentMasterId) : 0,
          DepartmentName: filterParams.DepartmentName?.trim() || undefined,
          SortBy: sortByParam
        }

        const response = await getDepartments(params);

        if (E.isRight(response)) {

          setDepartmentMasterList(response.right.Data);

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
      'Loading Department Data...'
    )
  }

  // SERACH DEPARTMENT 
  const searchDepartments = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      setSearchResults([]);
      fetchDepartmentList();
      return
    }

    const filterParams: FilterInfo = {
      DepartmentName: searchValue.trim(),
    };

    await loadDepartments(1, filterParams);

  }

  const clearsearchDepartments = () => {
    setSearchTerm('');
    setSearchResults([]);
    fetchDepartmentList();
  }
  // END SERACH DEPARTMENT 

  // EXPORT EXCEL | PDF
  const handleExportDepartments = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setLoading,
      setLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined
        if (sortInfo) {
          const column = departmentMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationDepartmentMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          DepartmentName: filters.DepartmentName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }

        const response = await getDepartments(params);

        handleExportFile(response, exportType, 'Department Master', addToast)

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

  const handleExportDepartmentExcel = () => handleExportDepartments('Excel')
  const handleExportDepartmentPdf = () => handleExportDepartments('PDF')

  //END EXPORT EXCEL | PDF

  //API | SERVICES CALL TO GET DEPARTMENT 

  const getDepartments = async (filterParams: FilterWithPaginationDepartmentMasterRequest) => {

    return await departmentMasterService.apiCallPullDepartmentMaster(filterParams);
  }

  //END API | SERVICES CALL TO GET DEPARTMENT

  //#endregion

  //#region TABLE CONFIGURATION

  const handlePageChange = (page: number) => {

    fetchDepartmentList(page);

  }

  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchDepartmentList(1);

  }

  const departmentMasterPaginationInfo: PaginationInfo = {
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    totalRecords: pagination.totalRecords,
    pageSize: pagination.pageSize,
    onPageChange: handlePageChange
  }

  const departmentMasterColumns: TableColumn[] = [
    {
      key: 'DepartmentName',
      label: 'Department Name',
      width: '33',
      sortable: true,
      align: 'left',
      render: (value, row) => (
        <div className="flex items-center justify-between">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleViewepartmentDetails(row)
            }}
            className="flex-1 text-left text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors duration-200"
            title="Click to view department details"
          >
            {value || 'N/A'}
          </button>
          <div className="flex items-center justify-end ml-2 w-20">
            {(row.NumberOfEmployee || 0) === 0 ? (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    // handleEdit(row)
                  }}
                  className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200 mr-1"
                  title="Edit Department"
                  style={{
                    color: '#0B3251',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#1A4D73')} // lighter on hover
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#0B3251')} // revert
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    // handleDelete(row)
                  }}
                  className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
                  title="Delete Department"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    // handleEdit(row)
                  }}
                  className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
                  title="Edit Department"
                  style={{
                    color: '#0B3251',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#1A4D73')} // lighter on hover
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#0B3251')} // revert
                >
                  <Edit className="h-4 w-4" />
                </button>
                <div className="w-[30px]" />
              </>

            )}
          </div>
        </div>
      )
    },
    {
      key: 'DepartmentCode',
      label: 'Department Code',
      width: '30',
      sortable: false,
      align: 'center',
      render: (value) => (
        <TooltipText
          text={value}
          maxWidth="170px"
          tooltipThreshold={15}
          tooltipClassName='inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap'
        />
      )
    },
    {
      key: 'NumberOfEmployee',
      label: 'Employee Count',
      width: '20',
      sortable: false,
      align: 'center',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {value}
        </span>
      )
    },
    {
      key: 'CreatedBy',
      label: 'Last Modified By',
      width: '33',
      sortable: true,
      align: 'center',
      render: (value) => value || 'N/A'
    },
    {
      key: 'CreatedDate',
      label: 'Last Modified Date',
      width: '33',
      sortable: true,
      align: 'center',
      render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
    }
  ]

  //#endregion

  //#region VIEW DEPARTMENT DETAILS MODAL COMPONENT

  interface ViewDepartmentDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: DepartmentMasterData | null
  }

  const ViewDepartmentDetailsModal: React.FC<ViewDepartmentDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings - Company setup (Department Details)"
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
        }}
        saveText="Close"
        loading={false}
      >
        <div className="space-y-6">
          {/* Department Information */}
          <div className="space-y-4">

            {/* Department Code */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Department Code
              </span>
              <span className="text-sm text-blue-600 font-medium">
                <TooltipText
                  text={data.DepartmentCode || 'N/A'}
                  maxWidth="170px"
                  tooltipThreshold={15}
                  tooltipClassName='inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap'
                />
              </span>
            </div>


            {/* Department Name */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Department Name
              </span>
              <span className="text-sm text-blue-600 font-medium">
                {data.DepartmentName || 'N/A'}
              </span>
            </div>


            {/* Number of Employees */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Number of Employees</span>
              <span className="text-sm text-blue-600 font-medium">
                <TooltipText
                  text={data.NumberOfEmployee.toString()}
                  maxWidth="170px"
                  tooltipThreshold={15}
                  tooltipClassName='inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 overflow-hidden text-ellipsis whitespace-nowrap'
                />

              </span>
            </div>

          </div>
          {/* Action Details Header */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Action Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Created By</span>
                  <span className="text-sm text-blue-600 font-medium">
                    {data.CreatedBy || 'N/A'}
                  </span>
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
                    <span className="text-sm text-blue-600 font-medium">
                      {data.ModifiedBy}
                    </span>
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

  const handleViewepartmentDetails = (row: DepartmentMasterData) => {
    setViewDepartmentDetailsData(row)
    setModalOpen(true)
  }
  //#endregion

  //#region FILTER MODAL
  <Modal
    isOpen={showFilterPopup}
    onClose={() => setShowFilterPopup(false)}
    title="Filter - Department Master"
    onSubmit={(e) => {
      e.preventDefault()
      applyFilters()
    }}
    saveText="Apply Filter"
    cancelText="Clear Filter"
    onCancel={() => clearFilters()}
    size="half-screen"
  >
    <form onSubmit={(e) => {
      e.preventDefault()
      applyFilters()
    }} className="space-y-6">
      <div className="space-y-4">
        {/* Department Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department Name
          </label>
          <input
            type="text"
            value={tempFilters.DepartmentName || ''}
            onChange={(e) => handleFilterChange('DepartmentName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter department name"
          />
        </div>
      </div>
    </form>
  </Modal>

  const applyFilters = () => {
    setFilters(tempFilters)
    loadDepartments(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadDepartments(1, {})
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
  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <div className="h-full flex flex-col">
        {/* ============================================================================
          COMMAN LOADER FOR PAGE
           ============================================================================ */}

        <Loader loading={loading} title={loadingMessage}>  <div></div> </Loader>

        {/* ============================================================================
          COMBINED SEARCH BAR, FILTER IMPORT , EXPORT ROW
           ============================================================================ */}


        <div className="bg-white border-b border-gray-200 pb-4">
          <div className="flex items-center space-x-4">

            {/* SEARCH BAR */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => searchDepartments(e.target.value)}
                placeholder="Search by department name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={clearsearchDepartments}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* ACTION BUTTON */}
            <div className="flex items-center space-x-1">
              {/* Add Button */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // handleAdd()
                }}
                className="flex items-center p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                title="Add Department"
              >
                <Plus className="h-4 w-4" />
              </button>

              {/* FILTER BUTTON */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setTempFilters(filters);
                  setShowFilterPopup(true);
                }}
                className={`flex items-center p-2 rounded-md transition-colors relative ${Object.keys(filters).length > 0
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                title={Object.keys(filters).length > 0 ? `Active filters: ${Object.entries(filters).filter(([_, value]) => value).map(([key, value]) => `${key}: ${value}`).join(', ')}` : 'Filter'}
              >
                <Filter className="h-4 w-4" />
                {Object.keys(filters).length > 0 && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">
                      {Object.values(filters).filter(value => value && value.trim() !== '').length}
                    </span>
                  </div>
                )}
              </button>

              {/* IMPORT BUTTON */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // setImportModalOpen(true)
                }}
                className="flex items-center p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                title="Import"
              >
                <Upload className="h-4 w-4" />
              </button>

              {/* EXPORT DROPDOWN */}
              <div className="relative group">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  className="flex items-center p-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                  title="Export"
                >
                  <Download className="h-4 w-4" />
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleExportDepartmentExcel()
                      }}
                      disabled={loading}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >

                      <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />

                      Export as Excel
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleExportDepartmentPdf()
                      }}
                      disabled={loading}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >

                      <FileText className="h-4 w-4 mr-2 text-red-600" />

                      Export as PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DATA TABLE */}
        <DataTable
          data={departmentMasterList}
          columns={departmentMasterColumns}
          pagination={departmentMasterPaginationInfo}
          emptyMessage="No departments found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />

        {/* VIEW */}
        <ViewDepartmentDetailsModal isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setViewDepartmentDetailsData(null)
          }}
          data={ViewDepartmentDetailsData}
        />
      </div>
    </>

  )
}

export default DepartmentMaster
