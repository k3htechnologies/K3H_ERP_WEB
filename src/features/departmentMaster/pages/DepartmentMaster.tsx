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


export const DepartmentMaster: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  const [departmentMasterList, setDepartmentMasterList] = useState<DepartmentMasterData[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination State
  const { pagination, setPagination } = usePagination(20);

  // Filter and Sort States
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const [filters, setFilters] = useState<FilterInfo>({});

  // Toast
  const { toasts, removeToast, addToast } = useToast()

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<DepartmentMasterData[]>([]);

  // EXPORT TO EXCEL | PDF LOADING STATE
  const [exportLoading, setExportLoading] = useState(false)


  //END STATE MANAGEMENT
  // ============================================================================

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    fetchDepartmentList()
  }, [])
  // ============================================================================
  // END INITIALIZATION
  // ============================================================================


  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const fetchDepartmentList = async (page: number = pagination.currentPage) => {
    return loadDepartments(page, filters)
  }

  const loadDepartments = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setLoading,
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
      }
    )
  }

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

  const handleExportDepartments = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setExportLoading,
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
      }
    )
  }

  
  const handleExportDepartmentExcel = () => handleExportDepartments('Excel')
  const handleExportDepartmentPdf = () => handleExportDepartments('PDF')

  const getDepartments = async (filterParams: FilterWithPaginationDepartmentMasterRequest) => {

    return await departmentMasterService.apiCallPullDepartmentMaster(filterParams);
  }



  // ============================================================================
  // END DATA LOADING
  // ============================================================================

  // ============================================================================
  // TABLE CONFIGURATION
  // ============================================================================

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
              // handleViewDetails(row)
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
    // {
    //   key: 'CreatedDate',
    //   label: 'Last Modified Date',
    //   width: '33',
    //   sortable: true,
    //   align: 'center',
    //   render: (value) => value ? formatDateToReadable(value) : '-'
    // }
  ]





  // ============================================================================
  // END TABLE CONFIGURATION
  // ============================================================================


  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <div className="h-full flex flex-col">

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
                  e.preventDefault()
                  e.stopPropagation()
                  // setTempFilters(filters)
                  // setShowFilterPopup(true)
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
                      disabled={exportLoading}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {exportLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
                      ) : (
                        <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                      )}
                      Export as Excel
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleExportDepartmentPdf()
                      }}
                      disabled={exportLoading}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {exportLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
                      ) : (
                        <FileText className="h-4 w-4 mr-2 text-red-600" />
                      )}
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

      </div>
    </>

  )
}

export default DepartmentMaster
