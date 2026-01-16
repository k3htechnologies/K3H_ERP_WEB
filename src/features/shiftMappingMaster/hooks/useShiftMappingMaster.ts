import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import type { FilterInfo, SortInfo, TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateShiftMappingMasterRequest,
  DeleteShiftMappingMasterRequest,
  ShiftMappingMasterData,
  FilterWithPaginationShiftMappingMasterRequest
} from '@/features/shiftMappingMaster/models/ShiftMappingMasterModel';
import { shiftMappingMasterService } from '@/features/shiftMappingMaster/services/ShiftMappingMasterService';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { updateFilter } from '@/core/utils/filterHelper';
import { handleExportFile } from '@/core/utils/exportFile';
import { getInitialFormState, getShiftMappingMasterColumns, REQUIRED_COLUMN_KEYS } from '@/features/shiftMappingMaster/constants/shiftMappingMasterConstants';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';

export const useShiftMappingMaster = () => {
  //#region STATE MANAGEMENT
  const [shiftMappingMasterList, setShiftMappingMasterList] = useState<ShiftMappingMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchShiftMappings(value)
  }, 350)
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
  const [formData, setFormData] = useState<AddUpdateShiftMappingMasterRequest>(() => getInitialFormState());

  //DELETE SHIFT MAPPING MASTER
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteShiftMappingMasterDetailsData, setDeleteShiftMappingMasterDetailsData] = useState<ShiftMappingMasterData | null>(null)

  //DROP DOWN RESET KEY
  const [dropdownResetKey, setDropdownResetKey] = useState(0);

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeShiftMappingMasterColumnsModal, setIsShowCustomizeShiftMappingMasterColumnsModal] = useState(false);

  //#region DROP DOWN LABELS
  const [dropdownLabels, setDropdownLabels] = useState<{
    departmentName?: string;
    EmployeeName?: string;
    shiftName?: string
  }>({});

  //RADIO PILL STATE
  const [mappingShift, setMappingShift] = useState<string>("Department");
  //#endregion

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

  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
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
          Uniquekey: editingShiftMappingMasterData.Uniquekey || getInitialFormState().Uniquekey,
          ShiftManagementMasterId: editingShiftMappingMasterData?.ShiftManagementMasterId || 0,
          DepartmentMasterId: editingShiftMappingMasterData.DepartmentMasterId || '',
          EmployeeId: editingShiftMappingMasterData.EmployeeId || '',
        });
        setMappingShift(editingShiftMappingMasterData.DepartmentMasterId ? 'Department' : 'Employee')
        setDropdownLabels({
          departmentName: editingShiftMappingMasterData.DepartmentName || "",
          EmployeeName: editingShiftMappingMasterData.EmployeeName || "",
          shiftName: editingShiftMappingMasterData.ShiftName || ""
        });
      } else {
        setFormData(getInitialFormState());
        setMappingShift("Department");
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingShiftMappingMasterData]);

  //#endregion

  //#region TABLE COLUMN DEFINITION

  const shiftMappingMasterColumns = useMemo<TableColumn[]>(
    () => getShiftMappingMasterColumns(),
    []
  )
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchShiftMappingList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadShiftMappings(page, filters, sort);
  }

  const loadShiftMappings = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationShiftMappingMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          ShiftManagementMasterMappingId: filterParams.ShiftManagementMasterMappingId ? Number(filterParams.ShiftManagementMasterMappingId) : undefined,
          ShiftName: searchtext ?? filterParams.ShiftName?.trim() ?? undefined,
          DepartmentName: filterParams.DepartmentName?.trim() || undefined,
          EmployeeName: filterParams.EmployeeName?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, shiftMappingMasterColumns)
        }

        const response = await shiftMappingMasterService.apiCallPullShiftMappingMaster(params);

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
      'Loading Shift Mapping'
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
     await loadShiftMappings(1, filters, sortInfo, searchValue)
  }
  //#endregion

  //#region CLEAR SEARCH SHIFT MAPPING
  const clearsearchShiftMappings = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    loadShiftMappings(1, { ShiftName: '' }, sortInfo, undefined);
  }
  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportShiftMappings = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationShiftMappingMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          ShiftName: filters.ShiftName?.trim() || undefined,
          DepartmentName: filters.DepartmentName?.trim() || undefined,
          EmployeeName: filters.EmployeeName?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, shiftMappingMasterColumns),
          ExportType: exportType
        }

        const response = await shiftMappingMasterService.apiCallPullShiftMappingMaster(params);
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

  //#region HANDLE PAGE CHANGE EVENT
  const handlePageChange = (page: number) => {
    fetchShiftMappingList(page);
  };
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    loadShiftMappings(1, filters, sort, searchTerm || undefined);
  }, [filters,searchTerm]);
  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS
  const requiredShiftMappingMasterColumnKeys: string[] = REQUIRED_COLUMN_KEYS;

  const allShiftMappingMasterColumnKeys: string[] = shiftMappingMasterColumns.map(c => c.key)

  const [selectedShiftMappingMasterColumnKeys, setSelectedShiftMappingMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getShiftMappingMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredShiftMappingMasterColumnKeys]));
        return withRequired.filter(k => allShiftMappingMasterColumnKeys.includes(k));
      }
    } catch { }
    return allShiftMappingMasterColumnKeys
  })

  useEffect(() => {
    setSelectedShiftMappingMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredShiftMappingMasterColumnKeys])).filter(k => allShiftMappingMasterColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shiftMappingMasterColumns.length])

  const visibleShiftMappingMasterColumns = useMemo(
    () => shiftMappingMasterColumns.filter(col => selectedShiftMappingMasterColumnKeys.includes(col.key)),
    [shiftMappingMasterColumns, selectedShiftMappingMasterColumnKeys]
  )
  //#endregion

  //#region VIEW EDIT
  const handleViewShiftMappingDetails = useCallback((row: ShiftMappingMasterData) => {
    setViewShiftMappingMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])
  //#endregion

  //#region EDIT SHIFT MAPPING MASTER
  const handleEditShiftMappingMaster = useCallback((row: ShiftMappingMasterData) => {
    setEditingShiftMappingMasterData({
      ...row,
      ShiftManagementMasterId: row.ShiftManagementMasterId || 0,
      DepartmentMasterId: row.DepartmentMasterId || '',
      EmployeeId: row.EmployeeId || ''
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

  //#region HANDLE FILTER CHANGE
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };
  //#endregion

  //#region ADD UPDATE EDIT SHIFT MAPPING MASTER
  const handleFieldChange = (field: keyof AddUpdateShiftMappingMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleApplicableTypeChange = (value: string) => {
    setMappingShift(value);
    if (value === "Department") {
      setFormData((prev) => ({ ...prev, EmployeeId: "" }));
    } else {
      setFormData((prev) => ({ ...prev, DepartmentMasterId: "" }));
    }
  };

  const handleAddShiftMappingMasterModal = () => {
    setEditingShiftMappingMasterData(null);
    setFormData(getInitialFormState());
    setMappingShift("Department");
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  const validateAddShiftMappingMasterForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (mappingShift === "Department" && !formData.DepartmentMasterId) {
      newErrors.DepartmentMasterId = "Department Name is required.";
    }

    if (mappingShift === "Employee" && !formData.EmployeeId) {
      newErrors.EmployeeId = "Employee Name is required.";
    }

    if (!formData.ShiftManagementMasterId) {
      newErrors.ShiftManagementMasterId = "Shift Name is required.";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushShiftMappingFormData = (): AddUpdateShiftMappingMasterRequest => {
    return {
      ShiftManagementMasterMappingId: formData.ShiftManagementMasterMappingId,
      Uniquekey: formData.Uniquekey,
      ShiftManagementMasterId: formData.ShiftManagementMasterId,
      DepartmentMasterId: mappingShift === "Department" ? formData.DepartmentMasterId : "",
      EmployeeId: mappingShift === "Employee" ? formData.EmployeeId : ""
    };
  };

  const handleAddUpdateShiftMappingMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddShiftMappingMasterForm()

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushShiftMappingFormData();
        const response = await shiftMappingMasterService.apiCallAddUpdateShiftMappingMaster(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          const isAdd = formData.ShiftManagementMasterMappingId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ShiftMappingMasterData
            setShiftMappingMasterList(prevData => [newRecord, ...prevData]);
            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
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

          setEditingShiftMappingMasterData(null);
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
      Number(formData.ShiftManagementMasterMappingId) === 0 ? 'Add Shift Mapping' : 'Update Shift Mapping'
    )
  };
  //#endregion

  //#region DELETE SHIFT MAPPING MASTER
  const handleDeleteShiftMappingMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteShiftMappingMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteShiftMappingMasterRequest = {
          ShiftManagementMasterMappingId: deleteShiftMappingMasterDetailsData.ShiftManagementMasterMappingId,
          UniqueKey: deleteShiftMappingMasterDetailsData.Uniquekey || ""
        }

        const response = await shiftMappingMasterService.apiCallDeleteShiftMappingMaster(params);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;
          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;
          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (shiftMappingMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadShiftMappings(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })
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
      'Delete Shift Mapping'
    )
  }
  //#endregion

  return {
    shiftMappingMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewShiftMappingMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingShiftMappingMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    deleteShiftMappingMasterDetailsData,
    isShowCustomizeShiftMappingMasterColumnsModal,
    canAction,
    canExport,
    shiftMappingMasterColumns,
    visibleShiftMappingMasterColumns,
    selectedShiftMappingMasterColumnKeys,
    requiredShiftMappingMasterColumnKeys,
    allShiftMappingMasterColumnKeys,
    dropdownLabels,
    dropdownResetKey,
    mappingShift,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewShiftMappingMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setFilters,
    setErrors,
    setEditingShiftMappingMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteShiftMappingMasterDetailsData,
    setIsShowCustomizeShiftMappingMasterColumnsModal,
    setSelectedShiftMappingMasterColumnKeys,
    setDropdownLabels,
    setDropdownResetKey,
    setMappingShift,

    // Actions
    fetchShiftMappingList,
    handlePageChange,
    handleSortColumn,
    handleViewShiftMappingDetails,
    handleEditShiftMappingMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleApplicableTypeChange,
    handleAddShiftMappingMasterModal,
    handleAddUpdateShiftMappingMaster,
    handleDeleteShiftMappingMaster,
    handleExportShiftMappingExcel,
    handleExportShiftMappingPdf,
    debouncedSearch,
    clearsearchShiftMappings,
  }
}
