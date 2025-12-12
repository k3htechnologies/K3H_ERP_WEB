import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  ShiftMappingMasterData,
  FilterWithPaginationShiftMappingMasterRequest,
  AddUpdateShiftMappingMasterRequest,
  DeleteShiftMappingMasterRequest
} from '@/features/shiftMappingMaster/models/ShiftMappingMasterModel';

import { ShiftMappingMasterService } from '@/features/shiftMappingMaster/services/ShiftMappingMasterService'
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { Edit, Trash2 } from 'lucide-react';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { updateFilter } from '@/core/utils/filterHelper';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { fetchEmployeeMasterDropdown } from '@/features/employeeMaster/employeeMasterDropDown';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
import { fetchDepartmentMasterDropdown } from '@/features/departmentMaster/departmentMasterDropdown';
import { fetchShiftMasterDropdown } from '../ShiftMasterDropDown';

const initialFormState = (): AddUpdateShiftMappingMasterRequest => ({
  ShiftManagementMasterMappingId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  ShiftManagementMasterId: 0,
  DepartmentMasterId: "",
  EmployeeId: ""
});

export const ShiftMappingMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [shiftMappingMasterList, setShiftMappingMasterList] = useState<ShiftMappingMasterData[]>([]);
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
    searchShiftMappings(value)
  }, 350)

  //VIEW SHIFT MAPPING MASTER MODAL STATES
  const [viewShiftMappingMasterDetailsData, setViewShiftMappingMasterDetailsData] = useState<ShiftMappingMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT SHIFT MAPPING MASTER
  const [editingShiftMappingMasterData, setEditingShiftMappingMasterData] = useState<ShiftMappingMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE SHIFT MAPPING MASTER
  const [formData, setFormData] = useState<AddUpdateShiftMappingMasterRequest>(() => initialFormState());

  //DELETE SHIFT MAPPING MASTER
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteShiftMappingMasterDetailsData, setDeleteShiftMappingMasterDetailsData] = useState<ShiftMappingMasterData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeShiftMappingMasterColumnsModal, setIsShowCustomizeShiftMappingMasterColumnsModal] = useState(false);

  const [dropdownLabels, setDropdownLabels] = useState<{
    departmentName?: string;
    employeeName?: string;
    shiftName?: string
  }>({});
  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  const hasFetchedInitialShiftMappings = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialShiftMappings.current) return

    hasFetchedInitialShiftMappings.current = true;

    fetchShiftMappingList()
  }, [])

  //#region CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingShiftMappingMasterData) {
        setFormData({
          ShiftManagementMasterMappingId: editingShiftMappingMasterData.ShiftManagementMasterMappingId,
          Uniquekey: editingShiftMappingMasterData.Uniquekey || initialFormState().Uniquekey,
          ShiftManagementMasterId: editingShiftMappingMasterData?.ShiftManagementMasterId || 0,
          DepartmentMasterId: editingShiftMappingMasterData.DepartmentMasterId || '',
          EmployeeId: editingShiftMappingMasterData.EmployeeId || '',
        });
        setDropdownLabels({
          departmentName: editingShiftMappingMasterData.DepartmentName || "",
          employeeName: editingShiftMappingMasterData.EmployeeName || "",
          shiftName: editingShiftMappingMasterData.ShiftName || ""
        });
      } else {
        setFormData(initialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingShiftMappingMasterData]);

  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchShiftMappingList = async (page: number = pagination.currentPage) => {
    return await loadShiftMappings(page, filters);
  }

  const loadShiftMappings = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;

        if (sortInfo) {

          const column = shiftMappingMasterColumns.find(col => col.key === sortInfo.column)

          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationShiftMappingMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          ShiftManagementMasterMappingId: filterParams.ShiftManagementMasterMappingId ? Number(filterParams.ShiftManagementMasterMappingId) : undefined,
          ShiftName: filterParams.ShiftName?.trim() || undefined,
          DepartmentName: filterParams.DepartmentName?.trim() || undefined,
          EmployeeName: filterParams.EmployeeName?.trim() || undefined,
          SortBy: sortByParam
        }

        const response = await getShiftMappings(params);

        if (E.isRight(response)) {

          setShiftMappingMasterList(response.right.Data);

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
      'Loading Shift Mapping Data'
    )
  }
  //#endregion

  //#region SEARCH SHIFT MAPPING 
  const searchShiftMappings = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchShiftMappingList();

      return
    }
    const filterParams: FilterInfo = {
      ShiftName: searchValue.trim(),
    };

    await loadShiftMappings(1, filterParams)
  }
  //#endregion

  //#region CLEAR SERACH SHIFT MAPPING
  const clearsearchShiftMappings = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchShiftMappingList();
  }
  //#endregion 

  //#region EXPORT EXCEL | PDF
  const handleExportShiftMappings = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined
        if (sortInfo) {
          const column = shiftMappingMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationShiftMappingMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          ShiftName: filters.ShiftName?.trim() || undefined,
          DepartmentName: filters.DepartmentName?.trim() || undefined,
          EmployeeName: filters.EmployeeName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }

        const response = await getShiftMappings(params);

        handleExportFile(response, exportType, 'Shift Mapping Master', addToast)

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

  const handleExportShiftMappingExcel = () => handleExportShiftMappings('Excel')
  const handleExportShiftMappingPdf = () => handleExportShiftMappings('PDF')

  //#endregion

  //#region API | SERVICES CALL TO GET SHIFT MAPPING
  const getShiftMappings = async (filterParams: FilterWithPaginationShiftMappingMasterRequest) => {

    return await ShiftMappingMasterService.apiCallPullShiftMappingMaster(filterParams);
  }
  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT

  const handlePageChange = (page: number) => {
    fetchShiftMappingList(page);
  };
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchShiftMappingList(1);
  }
  //#endregion

  //#region TABLE PAGINATION INFO

  const shiftMappingMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const shiftMappingListForTable = useMemo(() => shiftMappingMasterList, [shiftMappingMasterList]);

  //#endregion

  //#region VIEW EDIT SHIFT MAPPING  MASTER
  const handleViewShiftMappingDetails = useCallback((row: ShiftMappingMasterData) => {
    setViewShiftMappingMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  //#endregion

  //#region EDIT SHIFT MAPPING  MASTER

  const handleEditShiftMappingMaster = useCallback((row: ShiftMappingMasterData) => {
    setEditingShiftMappingMasterData({
      ...row,
      ShiftManagementMasterId: row.ShiftManagementMasterId || 0,
      DepartmentMasterId: row.DepartmentMasterId || '',
      EmployeeId: row.EmployeeId || '',

    })
    setIsAddUpdateModalOpen(true);

  }, [])
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: ShiftMappingMasterData) => {
    setDeleteShiftMappingMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])

  //#endregion

  //#region TABLE COLUMN
  const shiftMappingMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'ShiftName',
        label: 'Shift Name',
        width: '20',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className="flex items-center justify-start">
            <TooltipText
              text={value || 'N/A'}
              maxWidth="250px"
              tooltipThreshold={25}
              onClick={() => handleViewShiftMappingDetails(row)}
            />
          </div>
        )
      },
      {
        key: 'DepartmentName',
        label: 'Department Name',
        width: '20',
        sortable: true,
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
        key: 'EmployeeName',
        label: 'Employee Name',
        width: '20',
        sortable: true,
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
        key: 'ShiftCode',
        label: 'Shift Code',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="150px"
            tooltipThreshold={15}
            tooltipClassName='inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap'
          />
        )
      },
      {
        key: 'ShiftBeginTime',
        label: 'Start Time',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => value || 'N/A'
      },
      {
        key: 'ShiftEndTime',
        label: 'End Time',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => value || 'N/A'
      },
    ],
    // dependencies: include everything used inside that might change
    [handleViewShiftMappingDetails]
  )
  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS

  const requiredShiftMappingMasterColumnKeys: string[] = ['ShiftName'];

  const allShiftMappingMasterColumnKeys: string[] = shiftMappingMasterColumns.map(c => c.key)

  const [selectedShiftMappingMasterColumnKeys, setSelectedShiftMappingMasterColumnKeys] = useState<string[]>(() => {
    try {

      const saved = LocalStorageHelper.getShiftMappingMasterTableColumns();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(new Set([...parsed, ...requiredShiftMappingMasterColumnKeys]));

        // Filter out any keys that no longer exist
        return withRequired.filter(k => allShiftMappingMasterColumnKeys.includes(k));
      }
    } catch { }
    return allShiftMappingMasterColumnKeys
  })

  useEffect(() => {
    // Guarantee required columns remain selected if state changes elsewhere

    setSelectedShiftMappingMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredShiftMappingMasterColumnKeys])).filter(k => allShiftMappingMasterColumnKeys.includes(k)));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shiftMappingMasterColumns.length])

  const visibleShiftMappingMasterColumns = useMemo(
    () => shiftMappingMasterColumns.filter(col => selectedShiftMappingMasterColumnKeys.includes(col.key)),
    [shiftMappingMasterColumns, selectedShiftMappingMasterColumnKeys]
  )

  //#endregion

  //#region VIEW SHIFT MAPPING DETAILS MODAL COMPONENT

  interface ViewShiftMappingDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: ShiftMappingMasterData | null
  }

  const ViewShiftMappingDetailsModal: React.FC<ViewShiftMappingDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Shift Mapping Details"
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

            <FieldItem label="Department Name" value={data.DepartmentName} isRow withBorder={true} className='font-medium text-blue-900 ' />
            <FieldItem label="Employee Name" value={data.EmployeeName} isRow withBorder={true} />
            <FieldItem label="Shift Name" value={data.ShiftName} isRow withBorder={true} />
            <FieldItem label="Shift Code" value={data.ShiftCode} isRow withBorder={true} />
            <FieldItem label="Shift Begin Time" value={data.ShiftBeginTime} isRow withBorder={true} />
            <FieldItem label="Shift End Time" value={data.ShiftEndTime} isRow withBorder={true} />
            <FieldItem label="Shift Duration Time" value={data.ShiftDurationTime} isRow withBorder={true} />
            <FieldItem label="Shift Work Duration Time" value={data.ShiftWorkDurationTime} isRow withBorder={true} />
            <FieldItem label="Remarks" value={data.Remarks} isRow withBorder={true} />

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
                  <Button
                    color='gray'
                    variant='solid'
                    colorMode="light"
                    size='sm'
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

                  <Button
                    color='blue'
                    size='sm'
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsViewModalOpen(false)
                      handleEditShiftMappingMaster(data)
                    }}
                  >
                    <Edit className="h-5 w-5" />
                    Edit
                  </Button>
                </>
              )}
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
    loadShiftMappings(1, tempFilters)
    setShowFilterPopup(false)
  }

  //#endregion

  //#region CLEAR FILTER

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadShiftMappings(1, {})
    setShowFilterPopup(false)
  }

  //#endregion

  //#region HANDLE FILTER CHNAGE

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  //#endregion

  //#region ADD UPDATE SHIFT MASTER

  const handleFieldChange = (field: keyof AddUpdateShiftMappingMasterRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddShiftMappingMasterModal = () => {
    setEditingShiftMappingMasterData(null);
    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddShiftMappingMasterForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}

    if (!formData.DepartmentMasterId) {
      newErrors.DepartmentMasterId = "Department Name is required.";
    }

    if (!formData.EmployeeId) {
      newErrors.EmployeeId = "Employee Name is required.";
    }

    if (!formData.ShiftManagementMasterId) {
      newErrors.ShiftManagementMasterId = "Shift Name is required.";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  }

  const PushWeekShiftMappingFormData = (): AddUpdateShiftMappingMasterRequest => {
    return {
      ShiftManagementMasterMappingId: formData.ShiftManagementMasterMappingId,
      Uniquekey: formData.Uniquekey,
      ShiftManagementMasterId: formData.ShiftManagementMasterId,
      DepartmentMasterId: formData.DepartmentMasterId,
      EmployeeId: formData.EmployeeId
    };

  };

  const handleAddUpdateShiftMappingMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});

    const validation = validateAddShiftMappingMasterForm();

    if (!validation.isValid) {

      setErrors(validation.errors);

      return;
    }

    await runApiWithLoader(
      setIsLoading,

      setIsLoadingMessage,
      async () => {

        const payload = PushWeekShiftMappingFormData();

        const response = await ShiftMappingMasterService.apiCallAddUpdateShiftMappingMaster(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.ShiftManagementMasterMappingId === 0

          if (isAdd) {

            const newRecord = response.right.Data[0] as ShiftMappingMasterData

            setShiftMappingMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: 'Shift Mapping added successfully' })
          } else {

            const updatedRecord = response.right.Data[0] as ShiftMappingMasterData;

            setShiftMappingMasterList(prevData =>
              prevData.map(item =>
                item.ShiftManagementMasterMappingId === formData.ShiftManagementMasterMappingId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setIsAddUpdateModalOpen(false);

          setEditingShiftMappingMasterData(null);

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
      formData.ShiftManagementMasterMappingId === 0 ? 'Add Shift Mapping' : 'Update Shift Mapping...'
    )
  };

  //#endregion

  //#region DELETE SHIFT MAPPING MASTER

  const handleDeleteShiftMappingMaster = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteShiftMappingMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteShiftMappingMasterRequest = {
          ShiftManagementMasterMappingId: deleteShiftMappingMasterDetailsData.ShiftManagementMasterMappingId,
          UniqueKey: deleteShiftMappingMasterDetailsData.Uniquekey || ""
        }
        const response = await ShiftMappingMasterService.apiCallDeleteShiftMappingMaster(params);

        if (E.isRight(response)) {

          setShiftMappingMasterList(prevData => prevData.filter(item => item.ShiftManagementMasterMappingId !== deleteShiftMappingMasterDetailsData.ShiftManagementMasterMappingId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: "success", title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteShiftMappingMasterDetailsData(null);

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
      'Delete Shift Mapping master data'
    )
  }


  return (
    

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

        {/* COMMAN LOADER FOR PAGE */}

        <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

        {/* COMBINED SEARCH BAR, FILTER IMPORT , EXPORT ROW */}

        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder="Search By Shift Name"
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchShiftMappings}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeShiftMappingMasterColumnsModal(true)}

          // ADD
          isShowAddButton={canAction}
          addTitle='Add Shift'
          onAdd={handleAddShiftMappingMasterModal}

          // IMPORT
          isShowImportButton={false}

          // EXPORT 
          isShowExportButton={canExport}
          onExportExcel={handleExportShiftMappingExcel}
          onExportPdf={handleExportShiftMappingPdf}
          exportLoading={isLoading}
        />

        {/* DATA TABLE SHIFT MAPPING  MASTER */}

        <DataTable
          data={shiftMappingListForTable}
          columns={visibleShiftMappingMasterColumns}
          pagination={shiftMappingMasterPaginationInfo}
          emptyMessage="No shift mappings found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />

        {/* VIEW SHIFT MAPPING  MASTER MODAL */}

        <ViewShiftMappingDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewShiftMappingMasterDetailsData(null)
          }}
          data={viewShiftMappingMasterDetailsData}
        />

        {/*  ADD EDIT UPDATE SHIFT MAPPING  MASTER MODAL */}
        <Modal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false)
            setEditingShiftMappingMasterData(null)
            setFormData(initialFormState());
            setErrors({})
          }}
          onCancel={() => {
            setIsAddUpdateModalOpen(false)
            setEditingShiftMappingMasterData(null)
            setFormData(initialFormState());
          }}
          title={editingShiftMappingMasterData ? 'Update Shift Mapping ' : 'Add Shift Mapping'}
          onSubmit={handleAddUpdateShiftMappingMaster}
          saveText={editingShiftMappingMasterData ? 'Update Shift Mapping' : 'Save Shift Mapping'}
          resetText='Reset'
          loading={isLoading}
          size="xl"
        >
          <div className="space-y-6 p-6 bg-blue-100">
            <div className='space-y-4'>
              <div>
                <SingleSelectDropdownWithPagination
                  label="Week Off Policy Name"
                  title="Select Week Off Policy Name "
                  size="lg"
                  required
                  dataFetchCallBack={fetchShiftMasterDropdown}
                  onSelected={(item) => handleFieldChange("ShiftManagementMasterId", Number(item.value))}
                  initialValue={createDropdownInitialValue(formData.ShiftManagementMasterId, dropdownLabels.shiftName)}
                  error={errors.ShiftManagementMasterId}
                />
              </div>

              <SingleSelectDropdownWithPagination
                label="Employee"
                title="Select Employee"
                size="lg"
                required
                dataFetchCallBack={fetchEmployeeMasterDropdown}
                onSelected={(item) => handleFieldChange("EmployeeId", item.value)}
                initialValue={createDropdownInitialValue(formData.EmployeeId, dropdownLabels.employeeName)}
                error={errors.EmployeeId}
              />
            </div>

            <div>
              <SingleSelectDropdownWithPagination
                label="Department"
                title="Select Department"
                size="lg"
                required
                dataFetchCallBack={fetchDepartmentMasterDropdown}
                onSelected={(item) => handleFieldChange("DepartmentMasterId", item.value)}
                initialValue={createDropdownInitialValue(formData.DepartmentMasterId, dropdownLabels.departmentName)}
                error={errors.DepartmentMasterId}
              />
            </div>
          </div>
        </Modal >

        {/* CUSTOMIZE COLUMNS MODAL */}

        <CustomizeColumnsModal
          isOpen={isShowCustomizeShiftMappingMasterColumnsModal}
          onClose={() => setIsShowCustomizeShiftMappingMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(
              new Set([...keys, ...requiredShiftMappingMasterColumnKeys]),
            )

            setSelectedShiftMappingMasterColumnKeys(withRequired)

            try {
              LocalStorageHelper.storeShiftMappingMasterTableColumns(
                JSON.stringify(withRequired)
              )
            } catch { }
          }}
          columns={shiftMappingMasterColumns}
          selectedKeys={selectedShiftMappingMasterColumnKeys}
          requiredKeys={requiredShiftMappingMasterColumnKeys}
          title="Customize Shift Mapping Master Table Columns"
        />

        {/* FILTER SHIFT MAPPING  MASTER MODAL */}
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Shift Mapping Master"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift Name</label>
                <Input
                  type="text"
                  value={tempFilters.ShiftName || ''}
                  onChange={(e) => handleFilterChange('ShiftName', e.target.value)}
                  placeholder="Enter shift name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <Input
                  type="text"
                  value={tempFilters.DepartmentName || ''}
                  onChange={(e) => handleFilterChange('DepartmentName', e.target.value)}
                  placeholder="Enter department name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                <Input
                  type="text"
                  value={tempFilters.EmployeeName || ''}
                  onChange={(e) => handleFilterChange('EmployeeName', e.target.value)}
                  placeholder="Enter employee name"
                />
              </div>
            </div>
          </div>
        </Modal>

        {/* DELETE CONFIRMATION  SHIFT MAPPING MODAL */}
        < ConfirmationDialogBox
          isOpen={isConfirmationDialogBoxOpen}
          onClose={() => {
            setIsConfirmationDialogBoxOpen(false)
            setDeleteShiftMappingMasterDetailsData(null)
          }}
          onConfirm={handleDeleteShiftMappingMaster}
          title="You are about to delete a  Shift Mapping?"
          message="Deleting this  Shift Mapping will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
        />
      </div>
  )
}

export default ShiftMappingMaster


