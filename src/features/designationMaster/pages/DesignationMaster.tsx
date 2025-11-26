import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { Edit, LockIcon, Trash2 } from 'lucide-react';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { DesignationMasterService } from '@/features/designationMaster/services/DesignationMasterService';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { useNavigate } from 'react-router-dom';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import type { FilterPullExcelSample } from '@/features/technical/models/TechnicalModel';
import { technicalService } from '@/features/technical/services/TechnicalService';

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
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchDesignationMaster(value)
  }, 350)

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

  //NAVIGATE 
  const navigate = useNavigate();

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

  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchDesignationMasterList = async (page: number = pagination.currentPage) => {
    return await loadDesignationMaster(page, filters);
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

    await loadDesignationMaster(1, filterParams)
  }

  const clearsearchDesignationMaster = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
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

  const designationMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const designationMasterListForTable = useMemo(() => designationMasterList, [designationMasterList]);

  const handleViewDesignationDetails = (row: DesignationMasterData) => {
    setViewDesignationMasterDetailsData(row)
    setIsViewModalOpen(true)
  }

  const handleEditDesignationMaster = (row: DesignationMasterData) => {
    setEditingDesignationMasterData({
      ...row,
      NoticePeriod: row.NoticePeriod ?? 'N/A',
      DesignationName: row.DesignationName ?? ''
    })
    setIsAddUpdateModalOpen(true)
  }

  const handleConfirmationDialogBoxOpen = (row: DesignationMasterData) => {
    setDeleteDesignationMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }

  const designationMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'DesignationName',
        label: 'Designation Name',
        width: '33',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => {
          const showEdit = true
          const showDelete = (row.NumberOfEmployee || 0) === 0
          const showKey = true

          return (
            <div className="flex items-center justify-end ml-2 gap-1">
              <TooltipText
                text={value || 'N/A'}
                maxWidth="250px"
                tooltipThreshold={25}
                onClick={() => handleViewDesignationDetails(row)}
              />

              {/* SLOT 3: KEY */}
              <div className="w-[34px] flex justify-center">
                {showKey ? (
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      navigate(`/designationMaster/employeeModuleAccess/${row.DesignationMasterId}`, {
                        state: {
                          designationName: row.DesignationName
                        },
                      })
                    }}
                    color="transparent"
                    isborderRadius
                    size="sm"
                    style={{ color: 'black' }}
                    title="Module Access"
                  >
                    <LockIcon className="h-4 w-4" strokeWidth={row.IsSetAccessModule ? 2.5 : 0.5} />
                  </Button>
                ) : (
                  <div className="opacity-0 h-[32px] w-[34px]" />
                )}
              </div>
            </div>

          )
        }

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
      }
    ],
    // dependencies: include everything used inside that might change
    [canAction, handleViewDesignationDetails, handleEditDesignationMaster, handleConfirmationDialogBoxOpen]
  )

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


  const visibleDesignationMasterColumns = useMemo(
    () => designationMasterColumns.filter(col => selectedDesignationMasterColumnKeys.includes(col.key)),
    [designationMasterColumns, selectedDesignationMasterColumnKeys]
  )

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
        title="Designation Master Details"
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
        }}
        cancelText="Close"
        loading={false}
        size='xl'
      >
        <div className="space-y-6">
          {/* Designation Information */}
          <div className="space-y-4">

            <FieldItem label="Designation Code" value={data.DesignationName} isRow withBorder={true} />
            <FieldItem label="Notice Period" value={data.NoticePeriod} isRow withBorder={true} />
            <FieldItem label="Number of Employees" value={data.NumberOfEmployee} isRow withBorder={true} />

          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold pb-2">
              Action Details
            </h4>

            <FieldItem label="Created By / Date" isRow={true} value={data.CreatedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')} withBorder={data.ModifiedBy !== '' ? true : false} />

            {data.ModifiedBy !== '' ?
              <FieldItem label="Modified By / Date" isRow={true} value={data.ModifiedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')} withBorder={false} />

              :
              ''}


          </div>
          <div className="flex justify-between items-center pt-4">

            {canAction && (
              <>
                {(data.NumberOfEmployee || 0) === 0 ? (

                  <Button
                    color='gray'
                    variant='solid'
                    colorMode="light"
                    size='md'
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsViewModalOpen(false)
                      handleConfirmationDialogBoxOpen(data)
                    }}
                  >
                    <Trash2 className="h-5 w-5" />
                    Delete
                  </Button>
                ) : <div style={{ width: "120px", height: "44px" }}></div>}


                <Button
                  color='blue'
                  size='md'
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsViewModalOpen(false)
                    handleEditDesignationMaster(data)
                  }}
                >
                  <Edit className="h-5 w-5" />
                  Edit
                </Button>
              </>
            )}
          </div>

        </div>
      </Modal>
    )
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
    const [designationNameError, setDesignationNameError] = useState('')
    const [noticePeriodError, setNoticePeriodError] = useState('')

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
            DesignationMasterId: 0,
            Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            DesignationName: '',
            NoticePeriod: 0,
          })
        }
        setDesignationNameError('')
        setNoticePeriodError('')
      }
    }, [isOpen, data])

    const handleSubmitAddUpdateDesignation = (e: React.FormEvent) => {

      e.preventDefault()

      // Clear previous errors
      setDesignationNameError('')
      setNoticePeriodError('')

      let hasErrors = false;

      const designationName = formData.DesignationName?.trim() || ''

      if (designationName.trim() === "") {
        setDesignationNameError("Designation Name is required.")
        hasErrors = true
      }
      else if (designationName.length < 3) {
        setDesignationNameError("Designation Name must be at least 3 characters long.")
        hasErrors = true
      }

      const noticePeriod = formData.NoticePeriod || 0;
      if (noticePeriod === 0) {
        setNoticePeriodError('Notice Period is required.')
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
        setDesignationNameError('')
      } else if (field === 'NoticePeriod') {
        setNoticePeriodError('')
      }
    }


    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        onCancel={onClose}
        title={data ? 'Update Designation Master' : 'Add Designation Master'}
        onSubmit={handleSubmitAddUpdateDesignation}
        saveText={data ? 'Update Designation' : 'Save Designation'}
        resetText='Reset'
        loading={loading}
        size='small-half'
      >
        <div className="space-y-6 p-6 bg-blue-100">
          <div className="space-y-4">

            <div>
              <Input
                label='Designation Name'
                required
                error={designationNameError}
                type="text"
                value={formData.DesignationName}
                maxLength={100}
                onChange={(e) => handleFieldChange('DesignationName', e.target.value)}
                placeholder="Enter Designation Name"
              />

            </div>

            <div>

              <Input
                label='Notice Period'
                required
                error={noticePeriodError}
                type="text"
                value={formData.NoticePeriod ?? ''}
                maxLength={4}
                onChange={(e) => {
                  const personalMobileNumber = e.target.value.replace(/\D/g, ''); // remove non-digits
                  handleFieldChange('NoticePeriod', personalMobileNumber)
                }}
                placeholder="Enter Notice Period"
              />

            </div>

          </div>
        </div>
      </Modal>
    )
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

  //#region IMPORT EXCEL | DOWNLOAD

  const excelImportDesignationMaster = async () => {

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
      'Preparing Import...'
    )
  }


  const downloadExcelSampleDesignationMaster = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting

        const params: FilterPullExcelSample = {
          TableName: 'DESIGNATION MASTER'
        }

        const response = await technicalService.apiCallPullExcelSample(params);

        handleExportFile(response, 'Excel', 'Designation Master', addToast, 'Sample file download successfully')

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' })
      },
      undefined,
      'Preparing Downloading...'
    )
  }

  const handleExcelImportDesignationMaster = () => excelImportDesignationMaster()
  const handleDownloadExcelSampleDesignationMaster = () => downloadExcelSampleDesignationMaster()

  //#endregion

  //#region DELETE DESIGNATION MASTER


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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
          searchPlaceholder="Search By Designation Name"
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchDesignationMaster}
          isShowFilterButton={false}
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeDesignationMasterColumnsModal(true)}

          // ADD
          isShowAddButton={canAction}
          addTitle="Add Designation"
          onAdd={handleAddDesignationModal}

          // IMPORT
          isShowImportButton={canAction}
          onUploadExcel={handleExcelImportDesignationMaster}
          onDownloadSampleExcel={handleDownloadExcelSampleDesignationMaster}

          // EXPORT
          isShowExportButton={canExport}
          onExportExcel={handleExportDesignationExcel}
          onExportPdf={handleExportDesignationPdf}
          exportLoading={isLoading}
        />

        {/* DATA TABLE DESIGNATION */}
        <DataTable
          data={designationMasterListForTable}
          columns={visibleDesignationMasterColumns}
          pagination={designationMasterPaginationInfo}
          emptyMessage="No designation found"
          fixedHeight={true}
          maxHeight="calc(100vh - 255px)"
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

        <CustomizeColumnsModal
          isOpen={isShowCustomizeDesignationMasterColumnsModal}
          onClose={() => setIsShowCustomizeDesignationMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(
              new Set([...keys, ...requiredDesignationMasterColumnKeys]),
            )

            setSelectedDesignationMasterColumnKeys(withRequired)

            try {
              LocalStorageHelper.storeDesignationMasterTableColumns(
                JSON.stringify(withRequired),
              )
            } catch { }
          }}
          columns={designationMasterColumns}
          selectedKeys={selectedDesignationMasterColumnKeys}
          requiredKeys={requiredDesignationMasterColumnKeys}
          title="Customize Table Columns"
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
          onCancel={() => clearFilters()}
          size="small-half"
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <div>

                <Input
                  label='Designation Name'
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
