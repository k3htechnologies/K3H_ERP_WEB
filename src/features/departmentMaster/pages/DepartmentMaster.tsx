import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
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
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import type { FilterPullExcelSample } from '@/features/technical/models/TechnicalModel';
import { technicalService } from '@/features/technical/services/TechnicalService';
import { updateFilter } from '@/core/utils/filterHelper';


const initialFormState = (): AddUpdateDepartmentMasterRequest => ({
  DepartmentMasterId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  DepartmentCode: '',
  DepartmentName: ''
});

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
  const { addToast } = useToast()

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

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT DEPARTMENT MASTER
  const [editingDepartmentMasterData, setEditingDepartmentMasterData] = useState<DepartmentMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);


  //ADD UPDATE DEPARTMENT MASTER
  const [formData, setFormData] = useState<AddUpdateDepartmentMasterRequest>(() => initialFormState());

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

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingDepartmentMasterData) {
        setFormData({
          DepartmentMasterId: editingDepartmentMasterData.DepartmentMasterId,
          Uniquekey: editingDepartmentMasterData.Uniquekey || initialFormState().Uniquekey,
          DepartmentCode: editingDepartmentMasterData.DepartmentCode || '',
          DepartmentName: editingDepartmentMasterData.DepartmentName || ''
        });
      } else {
        setFormData(initialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingDepartmentMasterData]);

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
      'Loading Department'
    )
  }
  //#endregion

  //#region SERACH DEPARTMENT 
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
  //#endregion

  //#region CLEAR SERACH DEPARTMENT 
  const clearsearchDepartments = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchDepartmentList();
  }

  //#endregion

  //#region EXPORT EXCEL | PDF
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
      'Preparing Export'
    )
  }

  const handleExportDepartmentExcel = () => handleExportDepartments('Excel')
  const handleExportDepartmentPdf = () => handleExportDepartments('PDF')

  //#endregion

  //#region API | SERVICES CALL TO GET DEPARTMENT 

  const getDepartments = async (filterParams: FilterWithPaginationDepartmentMasterRequest) => {

    return await departmentMasterService.apiCallPullDepartmentMaster(filterParams);
  }
  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT

  const handlePageChange = (page: number) => {
    fetchDepartmentList(page);
  };

  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchDepartmentList(1);

  }
  //#endregion

  //#region TABLE PAGINATION INFO

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
  //#endregion

  //#region VIEW EDIT
  const handleViewDepartmentDetails = useCallback((row: DepartmentMasterData) => {
    setViewDepartmentMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  //#endregion

  //#region EDIT DEPARTMENT MASTER

  const handleEditDepartmentMaster = useCallback((row: DepartmentMasterData) => {
    setEditingDepartmentMasterData({
      ...row,
      DepartmentCode: row.DepartmentCode || '',
      DepartmentName: row.DepartmentName || ''
    })
    setIsAddUpdateModalOpen(true);

  }, [])


  //#endregion

  //#region CONFIRMATION DIALOG BOX

  const handleConfirmationDialogBoxOpen = useCallback((row: DepartmentMasterData) => {
    setDeleteDepartmentMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])

  //#endregion

  //#region TABLE COLUMN

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
              tooltipThreshold={30}
              onClick={() => handleViewDepartmentDetails(row)} // just pass a function, no need for e.preventDefault here
            />

          </div>
        )
      },
      {
        key: 'DepartmentCode',
        label: 'Department Code',
        width: '30',
        sortable: false,
        align: 'center',
        render: (value) => value || ''
      },
      {
        key: 'NumberOfEmployee',
        label: 'Employee Count',
        width: '20',
        sortable: false,
        align: 'center',
        render: (value) => value || '0'

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
        title="Department Master Details"
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
        }}
        cancelText="Close"
        loading={false}
        size='xl'
      >
        <div className="space-y-6">

          <div className="space-y-4">
            <FieldItem label="Department Code" value={data.DepartmentCode} isRow withBorder={true} />
            <FieldItem label="Department Name" value={data.DepartmentName} isRow withBorder={true} className='font-medium text-blue-900 ' />
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
                    color='red'
                    variant='solid'
                    colorMode="light"
                    size='md'
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsViewModalOpen(false)
                      handleConfirmationDialogBoxOpen(data)
                    }}
                    leftIcon={<Trash2 className="h-5 w-5" />}
                  >

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
                    handleEditDepartmentMaster(data)
                  }}
                  leftIcon={<Edit className="h-5 w-5" />}
                >

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
    loadDepartments(1, tempFilters)
    setShowFilterPopup(false)
  }

  //#endregion

  //#region CLEAR FILTER 

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadDepartments(1, {})
    setShowFilterPopup(false)
  }

  //#endregion

  //#region HANDLE FILTER CHNAGE

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  //#endregion

  //#region ADD UPDATE EDIT DEPARTMENT MASTER

  const handleFieldChange = (field: keyof AddUpdateDepartmentMasterRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddDepartmentModal = () => {
    setEditingDepartmentMasterData(null);
    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddDepartmentMasterForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}

    if (formData.DepartmentName.trim() === "") {

      newErrors.DepartmentName = "Department Name is required"
    }
    else if (formData.DepartmentName.length < 3) {
      newErrors.DepartmentName = "Department Name must be at least 3 characters long"
    }

    if (formData.DepartmentCode.trim() === "") {
      newErrors.DepartmentCode = "Department Code is required";
    } else if (formData.DepartmentCode.trim().length >= 5) {
      newErrors.DepartmentCode = "Department Code must be at least 4 characters long";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushDepartmentMasterFormData = (): AddUpdateDepartmentMasterRequest => {
    return {
      DepartmentMasterId: formData.DepartmentMasterId,
      Uniquekey: formData.Uniquekey,
      DepartmentCode: formData.DepartmentCode,
      DepartmentName: formData.DepartmentName
    };

  };

  const handleAddUpdateDepartmentMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddDepartmentMasterForm()

    if (!validation.isValid) {

      setErrors(validation.errors)

      return
    }

    await runApiWithLoader(
      setIsLoading,

      setIsLoadingMessage,
      async () => {

        const payload = PushDepartmentMasterFormData();

        const response = await departmentMasterService.apiCallAddUpdateDepartmentMaster(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.DepartmentMasterId === 0;

          if (isAdd) {

            const newRecord = response.right.Data[0] as DepartmentMasterData

            setDepartmentMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

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

          setEditingDepartmentMasterData(null);
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

      Number(formData.DepartmentMasterId) === 0 ? 'Add Department' : 'Update Department'
    )

  };

  //#endregion

  //#region IMPORT EXCEL | DOWNLOAD

  const excelImportDepartmentMaster = async () => {

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


  const downloadExcelSampleDepartmentMaster = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting

        const params: FilterPullExcelSample = {
          TableName: 'DEPARTMENT MASTER'
        }

        const response = await technicalService.apiCallPullExcelSample(params);

        handleExportFile(response, 'Excel', 'Department Master', addToast, 'Sample file download successfully')

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

  const handleExcelImportDepartmentMaster = () => excelImportDepartmentMaster()
  const handleDownloadExcelSampleDepartmentMaster = () => downloadExcelSampleDepartmentMaster()



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
      'Delete Department'
    )
  }

  //#endregion

  return (
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
          searchPlaceholder="Search By Department Name"
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchDepartments}
          isShowFilterButton={false}
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeDepartmentMasterColumnsModal(true)}
          // ADD
          isShowAddButton={canAction}
          addTitle="Add"
          onAdd={handleAddDepartmentModal}

          // IMPORT
          isShowImportButton={canAction}
          onUploadExcel={handleExcelImportDepartmentMaster}
          onDownloadSampleExcel={handleDownloadExcelSampleDepartmentMaster}

          // EXPORT
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
          emptyMessage="No Departments Data Found"
          fixedHeight={true}
          maxHeight="calc(100vh - 255px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
          loading={isLoading}
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
        <Modal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false);
            setEditingDepartmentMasterData(null);
            setFormData(initialFormState());
            setErrors({});
          }}
          onCancel={() => {
            setIsAddUpdateModalOpen(false);
            setEditingDepartmentMasterData(null);
            setFormData(initialFormState());
            setErrors({});
          }}
          title={editingDepartmentMasterData ? 'Update Department' : 'Add Department'}
          onSubmit={handleAddUpdateDepartmentMaster}
          saveText={'Save'}
          resetText='Reset'
          loading={isLoading}
          size='xl'
        >
          <div className="space-y-10 p-6 bg-blue-100">
            <div className="space-y-4" >
              <div>
                <Input
                  label='Department Code'
                  required
                  error={errors.DepartmentCode}
                  type="text"
                  value={formData.DepartmentCode.toUpperCase()}
                  maxLength={4}
                  onChange={(e) => handleFieldChange('DepartmentCode', e.target.value)}
                  placeholder="Enter Department Code"
                />

              </div>

              <div>
                <Input
                  label='Department Name'
                  required
                  error={errors.DepartmentName}
                  type="text"
                  value={formData.DepartmentName}
                  maxLength={100}
                  onChange={(e) => handleFieldChange('DepartmentName', e.target.value)}
                  placeholder="Enter Department Name"
                />

              </div>
            </div>
          </div>

        </Modal>
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
          title="Customize Table Columns"
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
          onCancel={() => clearFilters()}
          size="small-half"
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
  )
}

export default DepartmentMaster
