import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { Edit, Trash2, } from 'lucide-react';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { FieldItem } from '@/ui/components/forms/FieldItem';


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
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchDepartments(value)
  }, 350)

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

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  const hasFetchedInitialDepartments = useRef(false)

  useEffect(() => {

    if (hasFetchedInitialDepartments.current) return

    hasFetchedInitialDepartments.current = true;

    fetchDepartmentList()
  }, [])


  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion


  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchDepartmentList = async (page: number = pagination.currentPage) => {
    return await loadDepartments(page, filters);
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

    await loadDepartments(1, filterParams)

  }

  const clearsearchDepartments = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
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
  };

  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchDepartmentList(1);

  }

  const departmentMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const departmentListForTable = useMemo(() => departmentMasterList, [departmentMasterList]);


  // STABLE HANDLER VIEW EDIT CONFIRMATION DIALOG BOX
  const handleViewDepartmentDetails = useCallback((row: DepartmentMasterData) => {
    setViewDepartmentMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  const handleEditDepartmentMaster = useCallback((row: DepartmentMasterData) => {
    setEditingDepartmentMasterData({
      ...row,
      DepartmentCode: row.DepartmentCode || '',
      DepartmentName: row.DepartmentName || ''
    })
    setIsAddUpdateModalOpen(true);

  }, [])

  const handleConfirmationDialogBoxOpen = useCallback((row: DepartmentMasterData) => {
    setDeleteDepartmentMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])

  const departmentMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'DepartmentName',
        label: 'Department Name',
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
              onClick={() => handleViewDepartmentDetails(row)} // just pass a function, no need for e.preventDefault here
            />

            {canAction && (
              <div className="flex items-center justify-end ml-2 w-20">
                {(row.NumberOfEmployee || 0) === 0 ? (
                  <>
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleEditDepartmentMaster(row)
                      }}
                      color='transparent'
                      fullWidth
                      isborderRadius
                      size='sm'
                      title="Edit Department"
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
                      title="Delete Department"
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
                        handleEditDepartmentMaster(row)
                      }}
                      color='transparent'
                      fullWidth
                      isborderRadius
                      size='sm'
                      title="Edit Department"
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
    ],
    // dependencies: include everything used inside that might change
    [canAction, handleViewDepartmentDetails, handleEditDepartmentMaster, handleConfirmationDialogBoxOpen]
  )

  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS

  const requiredDepartmentMasterColumnKeys: string[] = ['DepartmentName'];

  const allDepartmentMasterColumnKeys: string[] = departmentMasterColumns.map(c => c.key)

  const [selectedDepartmentMasterColumnKeys, setSelectedDepartmentMasterColumnKeys] = useState<string[]>(() => {

    try {

      const saved = LocalStorageHelper.getDepartmentMasterTableColumns();

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

  const visibleDepartmentMasterColumns = useMemo(
    () => departmentMasterColumns.filter(col => selectedDepartmentMasterColumnKeys.includes(col.key)),
    [departmentMasterColumns, selectedDepartmentMasterColumnKeys]
  )

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
        title="View Department Master Details"
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
        }}
        cancelText="Close"
        loading={false}
      >
        <div className="space-y-6">

          <div className="space-y-4">
            <FieldItem label="Department Code" value={data.DepartmentCode} className='inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap' isRow withBorder={false} />
            <FieldItem label="Department Name" value={data.DepartmentName} isRow withBorder={false} />
            <FieldItem label="Number of Employees" value={data.NumberOfEmployee} className='inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 overflow-hidden text-ellipsis whitespace-nowrap' isRow withBorder={false} />

          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Action Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FieldItem label="Created By" isRow={true} value={data.CreatedBy} withBorder={false} />
                <FieldItem label="Created Date" isRow={true} value={formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')} withBorder={false} />

              </div>
              <div className="space-y-2">
                {data.ModifiedBy && (
                  <>
                    <FieldItem label="Modified By" isRow={true} value={data.ModifiedBy} withBorder={false} />
                    <FieldItem label="Modified Date" isRow={true} value={formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')} withBorder={false} />
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </Modal>
    )
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
    const [departmentCodeError, setDepartmentCodeError] = useState('')
    const [departmentNameError, setDepartmentNameError] = useState('')


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
            DepartmentMasterId: 0,
            Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            DepartmentCode: '',
            DepartmentName: ''
          })
        }
        setDepartmentCodeError('')
        setDepartmentNameError('')
      }
    }, [isOpen, data])

    const handleSubmitAddUpdateDepartment = (e: React.FormEvent) => {

      e.preventDefault()

      // Clear previous errors
      setDepartmentCodeError('')
      setDepartmentNameError('')

      let hasErrors = false;

      // Department Name validation
      const departmentName = formData.DepartmentName || ''
      if (departmentName.trim() === "") {
        setDepartmentNameError("Department Name is required.")
        hasErrors = true
      }
      else if (departmentName.length < 3) {
        setDepartmentNameError("Department Name must be at least 3 characters long.")
        hasErrors = true
      }

      // Department Code validation
      const departmentCode = formData.DepartmentCode || ''
      if (departmentCode.trim() === "") {
        setDepartmentCodeError("Department Code is required.")
        hasErrors = true
      } else if (departmentCode.length >= 5) {
        setDepartmentCodeError("Department Code must be at least 4 characters long.")
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
        setDepartmentNameError('')
      } else if (field === 'DepartmentCode') {
        setDepartmentCodeError('')
      }
    }

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        onCancel={onClose}
        title="Settings - Company setup (Department)"
        onSubmit={handleSubmitAddUpdateDepartment}
        saveText={data ? 'Update' : 'Save'}
        cancelText="Cancel"
        loading={loading}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>

              <Input
                label='Department Code'
                required
                error={departmentCodeError}
                type="text"
                value={formData.DepartmentCode}
                maxLength={4}
                onChange={(e) => handleFieldChange('DepartmentCode', e.target.value)}
                placeholder="Enter department code"
              />

            </div>

            <div>
              <Input
                label='Department Name'
                required
                error={departmentNameError}
                type="text"
                value={formData.DepartmentName}
                maxLength={100}
                onChange={(e) => handleFieldChange('DepartmentName', e.target.value)}
                placeholder="Enter department name"
              />

            </div>


          </div>
        </div>
      </Modal>
    )
  }

  const handleAddUpdateDepartmentMaster = async (formData: AddUpdateDepartmentMasterRequest) => {

    setIsAddUpdateModalOpen(false);

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



  const handleDeleteDepartmentMaster = async () => {

    setIsConfirmationDialogBoxOpen(false);

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

        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder="Search by department name..."
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchDepartments}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeDepartmentMasterColumnsModal(true)}
          isShowAddButton={canAction}
          addTitle="Add Department"
          onAdd={handleAddDepartmentModal}
          isShowImportButton={canAction}
          isShowExportButton={canExport}
          onExportExcel={handleExportDepartmentExcel}
          onExportPdf={handleExportDepartmentPdf}
          exportLoading={isLoading}
        />


        {/* DATA TABLE DEPARTMENT */}
        <DataTable
          data={departmentListForTable}
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


        <CustomizeColumnsModal
          isOpen={isShowCustomizeDepartmentMasterColumnsModal}
          onClose={() => setIsShowCustomizeDepartmentMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(
              new Set([...keys, ...requiredDepartmentMasterColumnKeys]),
            )

            setSelectedDepartmentMasterColumnKeys(withRequired)

            try {
              LocalStorageHelper.storeDepartmentMasterTableColumns(
                JSON.stringify(withRequired),
              )
            } catch { }
          }}
          columns={departmentMasterColumns}
          selectedKeys={selectedDepartmentMasterColumnKeys}
          requiredKeys={requiredDepartmentMasterColumnKeys}
          title="Customize Department Master Table Columns"
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
                <Input
                  label='Department Name'
                  type="text"
                  value={tempFilters.DepartmentName || ''}
                  onChange={(e) => handleFilterChange('DepartmentName', e.target.value)}
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
