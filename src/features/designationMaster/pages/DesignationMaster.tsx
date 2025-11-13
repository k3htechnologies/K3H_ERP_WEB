import React, { useEffect, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateDesignationMasterRequest,
  DeleteDesignationMasterRequest,
  DesignationMasterData,
  FilterWithPaginationDesignationMasterRequest
} from '@/features/designationMaster/models/DesignationMasterModel';

import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Download, Edit, FileSpreadsheet, FileText, Filter, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { Button, Input } from '@/ui/components/forms';
import Checkbox from '@/ui/components/forms/Checkbox';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { DesignationMasterService } from '@/features/designationMaster/services/DesignationMasterService';

export const DesignationMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [designationMasterList, setDesignationMasterList] = useState<DesignationMasterData[]>([]);
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

  //VIEW DESIGNATION MASTER MODAL STATES
  const [viewDesignationMasterDetailsData, setViewDesignationMasterDetailsData] = useState<DesignationMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  // EDIT DESIGNATION MASTER
  const [editingDesignationMasterData, setEditingDesignationMasterData] = useState<DesignationMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //DELETE DESIGNATION MASTER STATES

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteDesignationMasterDetailsData, setDeleteDesignationMasterDetailsData] = useState<DesignationMasterData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeDesignationMasterColumnsModal, setIsShowCustomizeDesignationMasterColumnsModal] = useState(false);

  //EXPORT EXCEL AND PDF DIALOG BOX
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement | null>(null);
  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION

  const hasFetchedInitialDesignations = useRef(false)

  useEffect(() => {

    if (hasFetchedInitialDesignations.current) return

    hasFetchedInitialDesignations.current = true;

    fetchDesignationMasterList()
  }, [])

  //EXPORT EXCEL AND PDF DIALOG BOX
  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setIsExportOpen(false);
      }
    }
    document.addEventListener('click', handleDocClick);

    return () => document.removeEventListener('click', handleDocClick);
  }, []);
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchDesignationMasterList = async (page: number = pagination.currentPage) => {
    return loadDesignationMaster(page, filters)
  }

  const loadDesignationMaster = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        let sortByParam = undefined;

        if (sortInfo) {

          const column = designationMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }

        }

        const params: FilterWithPaginationDesignationMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          DesignationMasterId: filterParams.DesignationMasterId ? Number(filterParams.DesignationMasterId) : 0,
          DesignationName: filterParams.DesignationName?.trim() || undefined,
          SortBy: sortByParam
        }

        const response = await getDesignationMaster(params);

        if (E.isRight(response)) {

          setDesignationMasterList(response.right.Data);

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
      'Loading Designation Master Data...'
    )
  }

  // SERACH DESIGNATION MASTER
  const searchDesignationMaster = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchDesignationMasterList();
      return
    }

    const filterParams: FilterInfo = {
      DesignationName: searchValue.trim(),
    };

    await loadDesignationMaster(1, filterParams);

  }

  const clearsearchDesignationMaster = () => {
    setSearchTerm('');
    fetchDesignationMasterList();
  }
  // END SERACH DESIGNATION 

  // EXPORT EXCEL | PDF
  const handleExportDesignationMaster = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined
        if (sortInfo) {
          const column = designationMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationDesignationMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          DesignationName: filters.DesignationName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }

        const response = await getDesignationMaster(params);

        handleExportFile(response, exportType, 'Designation Master', addToast)

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

  const handleExportDesignationExcel = () => handleExportDesignationMaster('Excel')
  const handleExportDesignationPdf = () => handleExportDesignationMaster('PDF')

  //END EXPORT EXCEL | PDF

  //API | SERVICES CALL TO GET DESIGNATION 

  const getDesignationMaster = async (filterParams: FilterWithPaginationDesignationMasterRequest) => {

    return await DesignationMasterService.apiCallPullDesignationMaster(filterParams);
  }

  //END API | SERVICES CALL TO GET DESIGNATION

  //#endregion

  //#region TABLE CONFIGURATION

  const handlePageChange = (page: number) => {

    fetchDesignationMasterList(page);

  }

  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchDesignationMasterList(1);

  }

  const designationMasterPaginationInfo: PaginationInfo = {
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    totalRecords: pagination.totalRecords,
    pageSize: pagination.pageSize,
    onPageChange: handlePageChange
  }

  const designationMasterColumns: TableColumn[] = [
    {
      key: 'DesignationName',
      label: 'Designation Name',
      width: '33',
      sortable: true,
      fixed: 'left',
      align: 'left',
      render: (value, row) => (

        <div className={`flex items-center ${canAction ? 'justify-between' : 'justify-start'}`}>

          <TooltipText
            text={value || 'N/A'}
            maxWidth="250px"
            tooltipThreshold={25}
            onClick={() => handleViewDesignationDetails(row)} // just pass a function, no need for e.preventDefault here
          />

          {canAction && (
            <div className="flex items-center justify-end ml-2 w-20">
              {(row.NumberOfEmployee || 0) === 0 ? (
                <>
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleEditDesignationMaster(row)
                    }}
                    color='transparent'
                    fullWidth
                    isborderRadius
                    size='sm'
                    title="Edit Designation"
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
                    title="Delete Designation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleEditDesignationMaster(row)
                    }}
                    color='transparent'
                    fullWidth
                    isborderRadius
                    size='sm'
                    title="Edit Designation"
                    style={{
                      color: '#0B3251',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#1A4D73')} // lighter on hover
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#0B3251')} // revert
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <div className="w-[30px]" />
                </>

              )}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'NoticePeriod',
      label: 'Notice Period',
      width: '30',
      sortable: false,
      align: 'center',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value}
        </span>
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

  const requiredDesignationMasterColumnKeys: string[] = ['DesignationName'];

  const allDesignationMasterColumnKeys: string[] = designationMasterColumns.map(c => c.key)

  const [selectedDesignationMasterColumnKeys, setSelectedDesignationMasterColumnKeys] = useState<string[]>(() => {

    try {

      const saved = LocalStorageHelper.getDesignationMasterTableColumns();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(new Set([...parsed, ...requiredDesignationMasterColumnKeys]));

        // Filter out any keys that no longer exist
        return withRequired.filter(k => allDesignationMasterColumnKeys.includes(k));

      }
    } catch { }
    return allDesignationMasterColumnKeys
  })

  useEffect(() => {
    // Guarantee required columns remain selected if state changes elsewhere

    setSelectedDesignationMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredDesignationMasterColumnKeys])).filter(k => allDesignationMasterColumnKeys.includes(k)));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designationMasterColumns.length])

  const visibleDesignationMasterColumns = designationMasterColumns.filter(col => selectedDesignationMasterColumnKeys.includes(col.key));

  interface CustomizeDesignationMasterColumnsModalProps {
    isOpen: boolean
    onClose: () => void
    onApply: (keys: string[]) => void
    columns: TableColumn[]
    selectedKeys: string[]
    requiredKeys: string[]
  }

  const CustomizeDesignationMasterColumnsModal: React.FC<CustomizeDesignationMasterColumnsModalProps> = ({
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

    const handleApplyCustomizeDesignationMasterColumns = (e: React.FormEvent) => {
      e.preventDefault()
      onApply(localKeys)
      onClose()
    }

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Customize Designation Master Table Columns"
        onSubmit={handleApplyCustomizeDesignationMasterColumns}
        saveText="Apply Changes"
        cancelText="Cancel"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-end space-x-2">
            <Button type="button" onClick={selectAll} size='sm' color='gray'>Select All</Button>
            <Button type="button" onClick={clearAll} size='sm' color='gray'>Clear All</Button>
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
                  <Checkbox
                    size="sm"
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

  //#region VIEW DESIGNATION DETAILS MODAL COMPONENT

  interface ViewDesignationDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: DesignationMasterData | null
  }

  const ViewDesignationDetailsModal: React.FC<ViewDesignationDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings - Company setup (Designation Details)"
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
        }}
        saveText="Close"
        loading={false}
      >
        <div className="space-y-6">
          {/* Designation Information */}
          <div className="space-y-4">

            {/* Designation Name */}
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Designation Name
              </span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.DesignationName || 'N/A'}
              </span>
            </div>


            {/* Notice Period */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Notice Period
              </span>
              <span className="text-sm text-blue-600 font-medium">
                {data.NoticePeriod || 0}
              </span>
            </div>




            {/* Number of Employees */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Number of Employees</span>
              <span className="text-sm text-blue-600 font-medium">
                {data.NumberOfEmployee}
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

  const handleViewDesignationDetails = (row: DesignationMasterData) => {
    setViewDesignationMasterDetailsData(row)
    setIsViewModalOpen(true)
  }
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadDesignationMaster(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadDesignationMaster(1, {})
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

  //#region ADD UPDATE EDIT DESIGNATION MASTER
  const handleAddDesignationModal = () => {
    setEditingDesignationMasterData(null)
    setIsAddUpdateModalOpen(true)
  }

  interface AddUpdateDesignationModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: AddUpdateDesignationMasterRequest) => void
    data?: DesignationMasterData | null
    loading?: boolean
  }

  const AddUpdateDesignationModal: React.FC<AddUpdateDesignationModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    data,
    loading = false
  }) => {
    const [formData, setFormData] = useState<AddUpdateDesignationMasterRequest>({
      DesignationMasterId: 0,
      Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      DesignationName: '',
      NoticePeriod: 0
    })
    const [nameError, setNameError] = useState('')
    const [codeError, setCodeError] = useState('')

    useEffect(() => {
      if (isOpen) {
        if (data) {
          setFormData({
            DesignationMasterId: data.DesignationMasterId,
            Uniquekey: data.Uniquekey,
            DesignationName: data.DesignationName || '',
            NoticePeriod: data.NoticePeriod || 0
          })
        } else {
          setFormData({
            DesignationName: '',
            NoticePeriod: 0,
          })
        }
        setNameError('')
        setCodeError('')
      }
    }, [isOpen, data])

    const handleSubmitAddUpdateDesignation = (e: React.FormEvent) => {

      e.preventDefault()

      // Clear previous errors
      setNameError('')
      setCodeError('')

      let hasErrors = false;

      // Designation Name validation
      const designationName = formData.DesignationName?.trim() || ''
      if (designationName.trim() === "") {
        setNameError("Designation Name is required.")
        hasErrors = true
      }
      else if (designationName.length < 3) {
        setNameError("Designation Name must be at least 3 characters long.")
        hasErrors = true
      }

      // Notice Period validation
      const noticePeriod = formData.NoticePeriod || 0;
      if (noticePeriod === 0) {
        setCodeError('Notice Period is required.')
        hasErrors = true
      }
      

      if (hasErrors) {
        return
      }

      onSubmit({
        DesignationMasterId: data?.DesignationMasterId || 0,
        Uniquekey: data?.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        NoticePeriod: Number(noticePeriod),
        DesignationName: designationName.trim()
      })
    }

    const handleFieldChange = (field: keyof AddUpdateDesignationMasterRequest, value: string) => {

      setFormData(prev => ({ ...prev, [field]: value }))


      if (field === 'DesignationName') {
        setNameError('')
      } else if (field === 'NoticePeriod') {
        setCodeError('')
      }
    }


    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings - Company setup (Designation Details)"
        onSubmit={handleSubmitAddUpdateDesignation}
        saveText={data ? 'Update' : 'Save'}
        loading={loading}
      >
        <div className="space-y-6">
          <div className="space-y-4">

            {/* Designation Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.DesignationName}
                maxLength={100}
                onChange={(e) => handleFieldChange('DesignationName', e.target.value)}
                placeholder="Enter designation name"
              />
              {nameError && (
                <p className="text-red-500 text-sm mt-1">{nameError}</p>
              )}
            </div>


            {/* NOTICE PERIOD Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notice Period <span className="text-red-500">*</span>
              </label>

              <Input
                type="text"
                value={formData.NoticePeriod ?? ''}
                maxLength={4}
                onChange={(e) => {
                  const personalMobileNumber = e.target.value.replace(/\D/g, ''); // remove non-digits
                  handleFieldChange('NoticePeriod', personalMobileNumber)
                }}
                placeholder="Enter Notice Period"
              />


              {codeError && (
                <p className="text-red-500 text-sm mt-1">{codeError}</p>
              )}
            </div>

          </div>
        </div>
      </Modal>
    )
  }

  const handleEditDesignationMaster = (row: DesignationMasterData) => {
    setEditingDesignationMasterData({
      ...row,
      NoticePeriod: row.NoticePeriod ?? 'N/A',
      DesignationName: row.DesignationName ?? ''
    })
    setIsAddUpdateModalOpen(true)
  }


  const handleAddUpdateDesignationMaster = async (formData: AddUpdateDesignationMasterRequest) => {
    setIsAddUpdateModalOpen(false);
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const response = await DesignationMasterService.apiCallAddUpdateDesignationMaster(formData);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.DesignationMasterId === 0

          if (isAdd) {

            const newRecord = response.right.Data[0];

            setDesignationMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });

            addToast({ type: 'success', title: 'Designation added successfully' })
          } else {

            const updatedRecord = response.right.Data[0] as DesignationMasterData;

            setDesignationMasterList(prevData =>
              prevData.map(item =>
                item.DesignationMasterId === formData.DesignationMasterId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setIsAddUpdateModalOpen(false);

          setEditingDesignationMasterData(null);

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
      formData.DesignationMasterId === 0 ? 'Add Designation' : 'Update Designation...'
    )
  }
  //#endregion 

  //#region DELETE DESIGNATION MASTER

  const handleConfirmationDialogBoxOpen = (row: DesignationMasterData) => {
    setDeleteDesignationMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }

  const handleDeleteDesignationMaster = async () => {
    if (!deleteDesignationMasterDetailsData) return
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteDesignationMasterRequest = {
          DesignationMasterId: deleteDesignationMasterDetailsData.DesignationMasterId,
          UniqueKey: deleteDesignationMasterDetailsData.Uniquekey
        }

        const response = await DesignationMasterService.apiCallDeleteDesignationMaster(params);

        if (E.isRight(response)) {

          setDesignationMasterList(prevData => prevData.filter(item => item.DesignationMasterId !== deleteDesignationMasterDetailsData.DesignationMasterId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteDesignationMasterDetailsData(null);

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
      'Delete designation master data...'
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
          <div className="flex items-center justify-between gap-4 flex-wrap">

            {/* SEARCH BAR */}
            <div className="flex-1 relative min-w-0">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => searchDesignationMaster(e.target.value)}
                placeholder="Search by designation name..."
                leftIcon={
                  <Search className="h-4 w-4 text-gray-400" />
                }
                rightIcon={
                  <div className="flex items-center space-x-1 pr-1">
                    {/* CLEAR SEARCH (X) BUTTON */}
                    {searchTerm && (
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          clearsearchDesignationMaster();
                        }}
                        color='transparent'
                        fullWidth
                        isborderRadius
                        size='sm'
                        title="Clear search"
                      >
                        <X className="" />
                      </Button>
                    )}

                    {/* FILTER BUTTON */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setTempFilters(filters);
                        setShowFilterPopup(true);
                      }}
                      className={`flex items-center p-1.5 rounded-md transition-colors relative ${Object.keys(filters).length > 0
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      title={
                        Object.keys(filters).length > 0
                          ? `Active filters: ${Object.entries(filters)
                            .filter(([_, value]) => value)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}`
                          : 'Filter'
                      }
                    >
                      <Filter className="h-4 w-4" />
                      {Object.keys(filters).length > 0 && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">
                            {
                              Object.values(filters).filter(
                                (value) => value && value.trim() !== ''
                              ).length
                            }
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                }
              />

            </div>

            {/* ACTION BUTTON */}

            <div className="flex items-center space-x-1">

              {/* CUSTOMIZE TABLE BUTTON */}

              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsShowCustomizeDesignationMasterColumnsModal(true)
                }}
                className="px-3 py-2 mr-2 border border-gray-300 text-blue-600 bg-white hover:bg-gray-50 rounded-md"
                title="Customize Table"
              >
                Customize Table
              </button>

              {/* ADD BUTTON AND IMPORT BUTTON */}
              {canAction && (
                <>
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleAddDesignationModal()
                    }}
                    color='blue'
                    size='xs'
                    variant='solid'
                    colorMode='light'
                    defineWidth
                    title="Add Designation"

                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      // setImportisViewModalOpen(true)
                    }}
                    color='green'
                    colorMode='light'
                    size='xs'
                    defineWidth
                    title="Import"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>

                </>
              )}

              {/* EXPORT BUTTON */}
              {canExport && (
                <div className="relative" ref={exportRef}>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsExportOpen((s) => !s);
                    }}
                    color='purple'
                    colorMode='light'
                    size='xs'
                    defineWidth
                    title="Export"
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  {isExportOpen && (
                    <div className="absolute right-0 mt-2 w-42 bg-white rounded-md shadow-lg border border-gray-200 transition-all duration-150 z-50">
                      <div className="py-1">

                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleExportDesignationExcel();
                            setIsExportOpen(false);
                          }}
                          disabled={isLoading}
                          color='transparent'
                          fullWidth
                          isborderRadius
                          size='sm'
                          title="Export as Excel"
                        >
                          <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                          Export as Excel
                        </Button>

                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleExportDesignationPdf();
                            setIsExportOpen(false);
                          }}
                          disabled={isLoading}
                          color='transparent'
                          fullWidth
                          isborderRadius
                          size='sm'
                          title="Export as PDF"
                        >
                          <FileText className="h-4 w-4 mr-2 text-red-600" />
                          Export as PDF
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}


            </div>
          </div>
        </div>

        {/* DATA TABLE DESIGNATION */}
        <DataTable
          data={designationMasterList}
          columns={visibleDesignationMasterColumns}
          pagination={designationMasterPaginationInfo}
          emptyMessage="No designation found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />

        {/* VIEW DESIGNATION MODAL */}
        <ViewDesignationDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewDesignationMasterDetailsData(null)
          }}
          data={viewDesignationMasterDetailsData}
        />

        {/*  ADD EDIT UPDATE DESIGNATION MODAL */}
        <AddUpdateDesignationModal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false)
            setEditingDesignationMasterData(null)
          }}
          onSubmit={handleAddUpdateDesignationMaster}
          data={editingDesignationMasterData}
          loading={isLoading}
        />

        {/* CUSTOMIZE COLUMNS MODAL */}
        <CustomizeDesignationMasterColumnsModal
          isOpen={isShowCustomizeDesignationMasterColumnsModal}
          onClose={() => setIsShowCustomizeDesignationMasterColumnsModal(false)}
          onApply={(keys) => {

            const withRequired = Array.from(new Set([...keys, ...requiredDesignationMasterColumnKeys]));

            setSelectedDesignationMasterColumnKeys(withRequired);

            try {
              LocalStorageHelper.storeDesignationMasterTableColumns(JSON.stringify(withRequired))
            }
            catch {

            }
          }}

          columns={designationMasterColumns}

          selectedKeys={selectedDesignationMasterColumnKeys}

          requiredKeys={requiredDesignationMasterColumnKeys}
        />

        {/* FILTER DESIGNATION MODAL */}
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Designation Master"
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
                  Designation Name
                </label>
                <Input
                  type="text"
                  value={tempFilters.DesignationName || ''}
                  onChange={(e) => handleFilterChange('DesignationName', e.target.value)}
                  placeholder="Enter designation name"
                />
              </div>
            </div>
          </div>
        </Modal>

        {/* DELETE CONFIRMATION DESIGNATIONT MODAL */}
        <ConfirmationDialogBox
          isOpen={isConfirmationDialogBoxOpen}
          onClose={() => {
            setIsConfirmationDialogBoxOpen(false)
            setDeleteDesignationMasterDetailsData(null)
          }}
          onConfirm={handleDeleteDesignationMaster}
          title="You are about to delete a designation?"
          message="Deleting this designation will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
        />

      </div>
    </>

  )
}

export default DesignationMaster
