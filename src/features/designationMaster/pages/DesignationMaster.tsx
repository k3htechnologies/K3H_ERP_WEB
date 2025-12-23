import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
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
import { updateFilter } from '@/core/utils/filterHelper';

const initialFormState = (): AddUpdateDesignationMasterRequest => ({
  DesignationMasterId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  DesignationName: '',
  NoticePeriod: 0
});

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
  const { addToast } = useToast()

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

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT DESIGNATION MASTER
  const [editingDesignationMasterData, setEditingDesignationMasterData] = useState<DesignationMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE DESIGNATION MASTER
  const [formData, setFormData] = useState<AddUpdateDesignationMasterRequest>(() => initialFormState());


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


  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingDesignationMasterData) {
        setFormData({
          DesignationMasterId: editingDesignationMasterData.DesignationMasterId,
          Uniquekey: editingDesignationMasterData.Uniquekey || initialFormState().Uniquekey,
          DesignationName: editingDesignationMasterData.DesignationName || '',
          NoticePeriod: editingDesignationMasterData.NoticePeriod || 0
        });
      } else {
        setFormData(initialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingDesignationMasterData]);
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
      'Loading Designation'
    )
  }

  //#endregion

  //#region SERACH DESIGNATION MASTER
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
  //#endregion

  //#region CLEAR SERACH DESIGNATION
  const clearsearchDesignationMaster = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchDesignationMasterList();
  }
  //#endregion

  //#region EXPORT EXCEL | PDF
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
      'Preparing Export'
    )
  }

  const handleExportDesignationExcel = () => handleExportDesignationMaster('Excel')
  const handleExportDesignationPdf = () => handleExportDesignationMaster('PDF')
  //#endregion

  //#region API | SERVICES CALL TO GET DESIGNATION 

  const getDesignationMaster = async (filterParams: FilterWithPaginationDesignationMasterRequest) => {

    return await DesignationMasterService.apiCallPullDesignationMaster(filterParams);
  }

  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT

  const handlePageChange = (page: number) => {

    fetchDesignationMasterList(page);

  }

  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchDesignationMasterList(1);

  }

  //#endregion

  //#region TABLE PAGINATION INFO

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

  //#endregion

  //#region VIEW EDIT CONFIRMATION DIALOG BOX

  const handleViewDesignationDetails = (row: DesignationMasterData) => {
    setViewDesignationMasterDetailsData(row)
    setIsViewModalOpen(true)
  }

  //#endregion

  //#region EDIT DESIGNATION MASTER

  const handleEditDesignationMaster = (row: DesignationMasterData) => {
    setEditingDesignationMasterData({
      ...row,
      NoticePeriod: row.NoticePeriod ?? 0,
      DesignationName: row.DesignationName ?? ''
    })
    setIsAddUpdateModalOpen(true)
  }
  //#endregion

  //#region CONFIRMATION DIALOG BOX

  const handleConfirmationDialogBoxOpen = (row: DesignationMasterData) => {
    setDeleteDesignationMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }
  //#endregion

  //#region TABLE COLUMN

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
          const showKey = canAction && row.NumberOfEmployee
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
      },
      {
        key: 'actions',
        label: 'Actions',
        width: '12',
        fixed: 'right',
        align: 'center',
        render: (_value, row) => (
          canAction && !row.NumberOfEmployee ? (
            <div className="flex items-center justify-center gap-2">

              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleConfirmationDialogBoxOpen(row)
                }}
                color='transparent'
                isborderRadius
                size='sm'
                style={{
                  color: 'red',
                  padding: '4px 8px'
                }}
                title="Delete Designation"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null
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

  //#endregion

  //#region CLEAR FILTER 

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadDesignationMaster(1, {})
    setShowFilterPopup(false)
  }
  //#endregion

  //#region HANDLE FILTER CHNAGE

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  //#endregion

  //#region ADD UPDATE EDIT DESIGNATION MASTER

  const handleFieldChange = (field: keyof AddUpdateDesignationMasterRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddDesignationModal = () => {
    setEditingDesignationMasterData(null);
    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }


  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddDesignationMasterForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}

    if (formData.DesignationName.trim() === "") {

      newErrors.DesignationName = "Designation Name is required"
    }
    else if (formData.DesignationName.length < 3) {
      newErrors.DesignationName = "Designation Name must be at least 3 characters long"
    }

    if (!formData.NoticePeriod || Number(formData.NoticePeriod) <= 0) {
      newErrors.NoticePeriod = "Notice Period is required";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushDesignationMasterFormData = (): AddUpdateDesignationMasterRequest => {
    return {
      DesignationMasterId: formData.DesignationMasterId,
      Uniquekey: formData.Uniquekey,
      DesignationName: (formData.DesignationName || '').trim(),
      NoticePeriod: Number(formData.NoticePeriod) || 0
    };

  };

  const handleAddUpdateDesignationMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddDesignationMasterForm()

    if (!validation.isValid) {

      setErrors(validation.errors)

      return
    }

    await runApiWithLoader(
      setIsLoading,

      setIsLoadingMessage,
      async () => {

        const payload = PushDesignationMasterFormData();

        const response = await DesignationMasterService.apiCallAddUpdateDesignationMaster(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.DesignationMasterId === 0;

          if (isAdd) {

            const newRecord = response.right.Data[0] as DesignationMasterData

            setDesignationMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

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

          setEditingDesignationMasterData(null);
        } else {

          addToast({ type: "error", title: response.left?.message });

        }
        return response;
      },
      undefined,
      (error: any) => {

        addToast({ type: 'error', title: error.message })
      },
      undefined,

      Number(formData.DesignationMasterId) === 0 ? 'Add Designation' : 'Update Designation'
    )

  };

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
      'Preparing Import'
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
      'Preparing Downloading'
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
      'Delete Designation'
    )
  }

  //#endregion

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* ============================================================================
          COMMAN LOADER FOR PAGE
           ============================================================================ */}

      <Loader loading={isLoading} title={loadingMessage}><div></div> </Loader>

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
        addTitle="Add"
        onAdd={handleAddDesignationModal}

        // IMPORT
        isShowImportButton={canAction}
        onUploadExcel={handleExcelImportDesignationMaster}
        onDownloadSampleExcel={handleDownloadExcelSampleDesignationMaster}

        // EXPORT
        isShowExportButton={canExport && designationMasterListForTable.length > 0}
        onExportExcel={handleExportDesignationExcel}
        onExportPdf={handleExportDesignationPdf}
        exportLoading={isLoading}
      />

      {/* DATA TABLE DESIGNATION */}
      <DataTable
        data={designationMasterListForTable}
        columns={visibleDesignationMasterColumns}
        pagination={designationMasterPaginationInfo}
        emptyMessage="No Designation Data Found"
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


      <Modal
        isOpen={isAddUpdateModalOpen}
        onClose={() => {
          setIsAddUpdateModalOpen(false);
          setEditingDesignationMasterData(null);
          setFormData(initialFormState());
          setErrors({});
        }}
        onCancel={() => {
          setIsAddUpdateModalOpen(false);
          setEditingDesignationMasterData(null);
          setFormData(initialFormState());
          setErrors({});
        }}
        title={editingDesignationMasterData ? 'Update Designation' : 'Add Designation'}
        onSubmit={handleAddUpdateDesignationMaster}
        saveText={editingDesignationMasterData ? 'Update Designation' : 'Save Designation'}
        resetText='Reset'
        loading={isLoading}
        size='xl'
      >
        <div className="space-y-10 p-6 bg-blue-100">
          <div className="space-y-4" >
            <div>
              <Input
                label='Designation Name'
                required
                error={errors.DesignationName}
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
                error={errors.NoticePeriod}
                type="text"
                value={formData.NoticePeriod ?? ''}
                maxLength={4}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  handleFieldChange('NoticePeriod', digits === '' ? 0 : Number(digits));
                }}
                placeholder="Enter Notice Period"
              />
            </div>
          </div>
        </div>

      </Modal>

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
  )
}

export default DesignationMaster
