import React, { useEffect, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateDepartmentMasterRequest,
  DeleteDepartmentMasterRequest,
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
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';


export const DepartmentMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [departmentMasterList, setDepartmentMasterList] = useState<DepartmentMasterData[]>([]);
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

  //VIEW DEPARTMENT MASTER MODAL STATES
  const [viewDepartmentMasterDetailsData, setViewDepartmentMasterDetailsData] = useState<DepartmentMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  // EDIT DEPARTMENT MASTER
  const [editingDepartmentMasterData, setEditingDepartmentMasterData] = useState<DepartmentMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //DELETE DEPARTMENT MASTER STATES

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteDepartmentMasterDetailsData, setDeleteDepartmentMasterDetailsData] = useState<DepartmentMasterData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeDepartmentMasterColumnsModal, setIsShowCustomizeDepartmentMasterColumnsModal] = useState(false);

  //#endregion

  //#region INITIALIZATION

  useEffect(() => {
    fetchDepartmentList()
  }, [])
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchDepartmentList = async (page: number = pagination.currentPage) => {
    return loadDepartments(page, filters)
  }

  const loadDepartments = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
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
    fetchDepartmentList();
  }
  // END SERACH DEPARTMENT 

  // EXPORT EXCEL | PDF
  const handleExportDepartments = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
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

          <TooltipText
            text={value || 'N/A'}
            maxWidth="250px"
            tooltipThreshold={20}
            onClick={() => handleViewDepartmentDetails(row)} // just pass a function, no need for e.preventDefault here
          />

          <div className="flex items-center justify-end ml-2 w-20">
            {(row.NumberOfEmployee || 0) === 0 ? (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleEditDepartmentMaster(row)
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
                    handleConfirmationDialogBoxOpen(row)
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
                    handleEditDepartmentMaster(row)
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

  //#region CUSTOMIZE TABLE COLUMNS

  const requiredDepartmentMasterColumnKeys: string[] = ['DepartmentName'];

  const allDepartmentMasterColumnKeys: string[] = departmentMasterColumns.map(c => c.key)

  const [selectedDepartmentMasterColumnKeys, setSelectedDepartmentMasterColumnKeys] = useState<string[]>(() => {

    try {

      const saved = localStorage.getItem('departmentMaster.selectedColumns');

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(new Set([...parsed, ...requiredDepartmentMasterColumnKeys]));

        // Filter out any keys that no longer exist
        return withRequired.filter(k => allDepartmentMasterColumnKeys.includes(k));

      }
    } catch { }
    return allDepartmentMasterColumnKeys
  })

  useEffect(() => {
    // Guarantee required columns remain selected if state changes elsewhere

    setSelectedDepartmentMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredDepartmentMasterColumnKeys])).filter(k => allDepartmentMasterColumnKeys.includes(k)));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentMasterColumns.length])

  const visibleDepartmentMasterColumns = departmentMasterColumns.filter(col => selectedDepartmentMasterColumnKeys.includes(col.key));

  interface CustomizeDepartmentMasterColumnsModalProps {
    isOpen: boolean
    onClose: () => void
    onApply: (keys: string[]) => void
    columns: TableColumn[]
    selectedKeys: string[]
    requiredKeys: string[]
  }

  const CustomizeDepartmentMasterColumnsModal: React.FC<CustomizeDepartmentMasterColumnsModalProps> = ({
    isOpen,
    onClose,
    onApply,
    columns,
    selectedKeys,
    requiredKeys
  }) => {
    const [localKeys, setLocalKeys] = useState<string[]>(selectedKeys)

    useEffect(() => {
      if (isOpen) setLocalKeys(Array.from(new Set([...selectedKeys, ...requiredKeys])))
    }, [isOpen, selectedKeys, requiredKeys])

    const toggleKey = (key: string) => {
      if (requiredKeys.includes(key)) return
      setLocalKeys(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]))
    }

    const selectAll = () => setLocalKeys(Array.from(new Set([...columns.map(c => c.key), ...requiredKeys])))
    const clearAll = () => setLocalKeys([...requiredKeys])

    const handleApplyCustomizeDepartmentMasterColumns = (e: React.FormEvent) => {
      e.preventDefault()
      onApply(localKeys)
      onClose()
    }

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Customize Employee Master Table Columns"
        onSubmit={handleApplyCustomizeDepartmentMasterColumns}
        saveText="Apply Changes"
        cancelText="Cancel"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-end space-x-2">
            <button type="button" onClick={selectAll} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md">Select All</button>
            <button type="button" onClick={clearAll} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md">Clear All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
            {columns.map(col => {
              const checked = localKeys.includes(col.key)
              const required = requiredKeys.includes(col.key)
              return (
                <label key={col.key} className="flex items-center justify-between px-3 py-2 border rounded-md bg-gray-50">
                  <span className="text-sm text-gray-800 flex-1">
                    {col.label} {required && <span className="ml-1 text-xs text-blue-600">(Required)</span>}
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={required}
                    onChange={() => toggleKey(col.key)}
                    className="h-4 w-4"
                  />
                </label>
              )
            })}
          </div>
        </div>
      </Modal>
    )
  }
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

                <TooltipText
                  text={data.DepartmentName || 'N/A'}
                  maxWidth="250px"
                  tooltipThreshold={20}
                />
              </span>
            </div>


            {/* Number of Employees */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Number of Employees</span>
              <span className="text-sm text-blue-600 font-medium">
                <TooltipText
                  text={data.NumberOfEmployee}
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

  const handleViewDepartmentDetails = (row: DepartmentMasterData) => {
    setViewDepartmentMasterDetailsData(row)
    setIsViewModalOpen(true)
  }
  //#endregion

  //#region FILTER MODAL HELPERS
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

  //#region ADD UPDATE EDIT DEPARTMENT MASTER
  const handleAddDepartmentModal = () => {
    setEditingDepartmentMasterData(null)
    setIsAddUpdateModalOpen(true)
  }

  interface AddUpdateDepartmentModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: AddUpdateDepartmentMasterRequest) => void
    data?: DepartmentMasterData | null
    loading?: boolean
  }

  const AddUpdateDepartmentModal: React.FC<AddUpdateDepartmentModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    data,
    loading = false
  }) => {
    const [formData, setFormData] = useState<AddUpdateDepartmentMasterRequest>({
      DepartmentMasterId: 0,
      Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      DepartmentCode: '',
      DepartmentName: ''
    })
    const [nameError, setNameError] = useState('')
    const [codeError, setCodeError] = useState('')

    useEffect(() => {
      if (isOpen) {
        if (data) {
          setFormData({
            DepartmentMasterId: data.DepartmentMasterId,
            Uniquekey: data.Uniquekey,
            DepartmentCode: data.DepartmentCode || '',
            DepartmentName: data.DepartmentName || ''
          })
        } else {
          setFormData({
            DepartmentCode: '',
            DepartmentName: ''
          })
        }
        setNameError('')
        setCodeError('')
      }
    }, [isOpen, data])

    const handleSubmitAddUpdateDepartment = (e: React.FormEvent) => {

      e.preventDefault()

      // Clear previous errors
      setNameError('')
      setCodeError('')

      let hasErrors = false;

      // Department Name validation
      const departmentName = formData.DepartmentName || ''
      if (departmentName.trim() === "") {
        setNameError("Department Name is required.")
        hasErrors = true
      }
      else if (departmentName.length < 3) {
        setNameError("Department Name must be at least 3 characters long.")
        hasErrors = true
      }

      // Department Code validation
      const departmentCode = formData.DepartmentCode || ''
      if (departmentCode.trim() === "") {
        setCodeError("Department Code is required.")
        hasErrors = true
      } else if (departmentCode.length >= 5) {
        setCodeError("Department Code must be at least 4 characters long.")
        hasErrors = true
      }

      if (hasErrors) {
        return
      }

      onSubmit({
        DepartmentMasterId: data?.DepartmentMasterId || 0,
        Uniquekey: data?.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        DepartmentCode: departmentCode,
        DepartmentName: departmentName
      })
    }

    const handleFieldChange = (field: keyof AddUpdateDepartmentMasterRequest, value: string) => {

      setFormData(prev => ({ ...prev, [field]: value }))

      if (field === 'DepartmentName') {
        setNameError('')
      } else if (field === 'DepartmentCode') {
        setCodeError('')
      }
    }

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings - Company setup (Department)"
        onSubmit={handleSubmitAddUpdateDepartment}
        saveText={data ? 'Update' : 'Save'}
        loading={loading}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.DepartmentCode}
                maxLength={4}
                onChange={(e) => handleFieldChange('DepartmentCode', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${codeError ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter department code"
              />
              {codeError && (
                <p className="text-red-500 text-sm mt-1">{codeError}</p>
              )}
            </div>

            {/* Department Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.DepartmentName}
                maxLength={100}
                onChange={(e) => handleFieldChange('DepartmentName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${nameError ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter department name"
              />
              {nameError && (
                <p className="text-red-500 text-sm mt-1">{nameError}</p>
              )}
            </div>


          </div>
        </div>
      </Modal>
    )
  }

  const handleEditDepartmentMaster = (row: DepartmentMasterData) => {
    setEditingDepartmentMasterData({
      ...row,
      DepartmentCode: row.DepartmentCode || '',
      DepartmentName: row.DepartmentName || ''
    })
    setIsAddUpdateModalOpen(true);

  }

  const handleAddUpdateDepartmentMaster = async (formData: AddUpdateDepartmentMasterRequest) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const response = await departmentMasterService.apiCallAddUpdateDepartmentMaster(formData);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.DepartmentMasterId === 0

          if (isAdd) {

            const newRecord = response.right.Data[0] as DepartmentMasterData

            setDepartmentMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: 'Department added successfully' })
          } else {

            const updatedRecord = response.right.Data[0] as DepartmentMasterData;

            setDepartmentMasterList(prevData =>
              prevData.map(item =>
                item.DepartmentMasterId === formData.DepartmentMasterId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setIsAddUpdateModalOpen(false);

          setEditingDepartmentMasterData(null);

        } else {

          addToast({ type: 'error', title: response.left.message });
        }

        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Operation failed' })
      },
      undefined,
      formData.DepartmentMasterId === 0 ? 'Add Department' : 'Update Department...'
    )
  }
  //#endregion 

  //#region DELETE DEPARTMENT MASTER

  const handleConfirmationDialogBoxOpen = (row: DepartmentMasterData) => {
    setDeleteDepartmentMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }

  const handleDeleteDepartmentMaster = async () => {
    if (!deleteDepartmentMasterDetailsData) return
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteDepartmentMasterRequest = {
          DepartmentMasterId: deleteDepartmentMasterDetailsData.DepartmentMasterId,
          UniqueKey: deleteDepartmentMasterDetailsData.Uniquekey
        }

        const response = await departmentMasterService.apiCallDeleteDepartmentMaster(params);

        if (E.isRight(response)) {

          setDepartmentMasterList(prevData => prevData.filter(item => item.DepartmentMasterId !== deleteDepartmentMasterDetailsData.DepartmentMasterId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteDepartmentMasterDetailsData(null);

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
      'Delete department master data...'
    )
  }

  //#endregion
  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <div className="h-full flex flex-col">
        {/* ============================================================================
          COMMAN LOADER FOR PAGE
           ============================================================================ */}

        <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

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

              {/* CUSTOMIZE TABLE BUTTON */}

              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsShowCustomizeDepartmentMasterColumnsModal(true)
                }}
                className="px-3 py-2 mr-2 border border-gray-300 text-blue-600 bg-white hover:bg-gray-50 rounded-md"
                title="Customize Table"
              >
                Customize Table
              </button>

              {/* Add Button */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleAddDepartmentModal()
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
                  // setImportisViewModalOpen(true)
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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

        {/* DATA TABLE DEPARTMENT */}
        <DataTable
          data={departmentMasterList}
          columns={visibleDepartmentMasterColumns}
          pagination={departmentMasterPaginationInfo}
          emptyMessage="No departments found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />

        {/* VIEW DEPARTMENT MODAL */}
        <ViewDepartmentDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewDepartmentMasterDetailsData(null)
          }}
          data={viewDepartmentMasterDetailsData}
        />

        {/*  ADD EDIT UPDATE DEPARTMENT MODAL */}
        <AddUpdateDepartmentModal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false)
            setEditingDepartmentMasterData(null)
          }}
          onSubmit={handleAddUpdateDepartmentMaster}
          data={editingDepartmentMasterData}
          loading={isLoading}
        />

        {/* CUSTOMIZE COLUMNS MODAL */}
        <CustomizeDepartmentMasterColumnsModal
          isOpen={isShowCustomizeDepartmentMasterColumnsModal}
          onClose={() => setIsShowCustomizeDepartmentMasterColumnsModal(false)}
          onApply={(keys) => {

            const withRequired = Array.from(new Set([...keys, ...requiredDepartmentMasterColumnKeys]));

            setSelectedDepartmentMasterColumnKeys(withRequired);

            try {
              localStorage.setItem('departmentMaster.selectedColumns', JSON.stringify(withRequired))
            }
            catch {

            }
          }}

          columns={departmentMasterColumns}

          selectedKeys={selectedDepartmentMasterColumnKeys}

          requiredKeys={requiredDepartmentMasterColumnKeys}
        />

        {/* FILTER DEPARTMENT MODAL */}
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
          <div className="space-y-6">
            <div className="space-y-4">
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
          </div>
        </Modal>

        {/* DELETE CONFIRMATION DEPARTMENT MODAL */}
        <ConfirmationDialogBox
          isOpen={isConfirmationDialogBoxOpen}
          onClose={() => {
            setIsConfirmationDialogBoxOpen(false)
            setDeleteDepartmentMasterDetailsData(null)
          }}
          onConfirm={handleDeleteDepartmentMaster}
          title="You are about to delete a department?"
          message="Deleting this department will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
        />

      </div>
    </>

  )
}

export default DepartmentMaster
