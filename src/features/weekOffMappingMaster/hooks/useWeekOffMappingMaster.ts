import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import type { FilterInfo, SortInfo, TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateWeekOffMappingMasterRequest,
  DeleteWeekOffMappingMasterRequest,
  WeekOffMappingMasterData,
  FilterWithPaginationWeekOffMappingMasterRequest
} from '@/features/weekOffMappingMaster/models/WeekOffMappingMasterModel';
import { weekOffMappingMasterService } from '@/features/weekOffMappingMaster/services/WeekOffMappingMasterService';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { updateFilter } from '@/core/utils/filterHelper';
import { handleExportFile } from '@/core/utils/exportFile';
import { getInitialFormState, getWeekOffMappingMasterColumns, REQUIRED_COLUMN_KEYS } from '@/features/weekOffMappingMaster/constants/weekOffMappingMasterConstants';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';

export const useWeekOffMappingMaster = () => {
  //#region STATE MANAGEMENT
  const [weekOffMappingMasterList, setWeekOffMappingMasterList] = useState<WeekOffMappingMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchWeekOffMappings(value)
  }, 350)
  const [viewWeekOffMappingMasterDetailsData, setViewWeekOffMappingMasterDetailsData] = useState<WeekOffMappingMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT WEEK OFF MAPPING MASTER
  const [editingWeekOffMappingMasterData, setEditingWeekOffMappingMasterData] = useState<WeekOffMappingMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE WEEK OFF MAPPING MASTER
  const [formData, setFormData] = useState<AddUpdateWeekOffMappingMasterRequest>(() => getInitialFormState());

  //DELETE WEEK OFF MAPPING MASTER
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteWeekOffMappingMasterDetailsData, setDeleteWeekOffMappingMasterDetailsData] = useState<WeekOffMappingMasterData | null>(null)

  //DROP DOWN RESET KEY
  const [dropdownResetKey, setDropdownResetKey] = useState(0);

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeWeekOffMappingMasterColumnsModal, setIsShowCustomizeWeekOffMappingMasterColumnsModal] = useState(false);

  //#region DROP DOWN LABELS
  const [dropdownLabels, setDropdownLabels] = useState<{
    departmentName?: string;
    employeeName?: string;
    weekOffPolicyName?: string
  }>({});

  //RADIO PILL STATE
  const [mappingWeekoff, setMappingWeekoff] = useState<string>("Department");
  //#endregion

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  const hasFetchedInitialWeekOffMappings = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialWeekOffMappings.current) return
    hasFetchedInitialWeekOffMappings.current = true;
    fetchWeekOffMappingList()
  }, [])

  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingWeekOffMappingMasterData) {
        setFormData({
          WeekOffPolicyMasterMappingId: editingWeekOffMappingMasterData.WeekOffPolicyMasterMappingId,
          Uniquekey: editingWeekOffMappingMasterData.Uniquekey || getInitialFormState().Uniquekey,
          WeekOffPolicyMasterId: editingWeekOffMappingMasterData.WeekOffPolicyMasterId || 0,
          DepartmentMasterId: editingWeekOffMappingMasterData.DepartmentMasterId || '',
          EmployeeId: editingWeekOffMappingMasterData.EmployeeId || '',
        });
        setMappingWeekoff(editingWeekOffMappingMasterData.DepartmentMasterId ? 'Department' : 'Employee')
        setDropdownLabels({
          departmentName: editingWeekOffMappingMasterData.DepartmentName || "",
          employeeName: editingWeekOffMappingMasterData.EmployeeName || "",
          weekOffPolicyName: editingWeekOffMappingMasterData.WeekOffPolicyName || ""
        });
      } else {
        setFormData(getInitialFormState());
        setMappingWeekoff("Department");
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingWeekOffMappingMasterData]);

  //#endregion

  //#region TABLE COLUMN DEFINITION

  const weekOffMappingMasterColumns = useMemo<TableColumn[]>(
    () => getWeekOffMappingMasterColumns(),
    []
  )
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchWeekOffMappingList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadWeekOffMappings(page, filters, sort);
  }

  const loadWeekOffMappings = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationWeekOffMappingMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          WeekOffPolicyMasterMappingId: filterParams.WeekOffPolicyMasterMappingId ? Number(filterParams.WeekOffPolicyMasterMappingId) : undefined,
          WeekOffPolicyName: searchtext ?? filterParams.WeekOffPolicyName?.trim() ?? undefined,
          DepartmentName: filterParams.DepartmentName?.trim() || undefined,
          EmployeeName: filterParams.EmployeeName?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, weekOffMappingMasterColumns)
        }

        const response = await weekOffMappingMasterService.apiCallPullWeekOffMappingMaster(params);

        if (E.isRight(response)) {
          setWeekOffMappingMasterList(response.right.Data);
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
      'Loading Week Off Mapping'
    )
  }
  //#endregion

  //#region SEARCH WEEK OFF MAPPING 
  const searchWeekOffMappings = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchWeekOffMappingList();
      return
    }
    await loadWeekOffMappings(1, filters, sortInfo, searchValue)
  }
  //#endregion

  //#region CLEAR SEARCH WEEK OFF MAPPING
  const clearsearchWeekOffMappings = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    loadWeekOffMappings(1, { WeekOffPolicyName: '' }, sortInfo, undefined);
  }
  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportWeekOffMappings = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationWeekOffMappingMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          WeekOffPolicyName: filters.WeekOffPolicyName?.trim() || undefined,
          DepartmentName: filters.DepartmentName?.trim() || undefined,
          EmployeeName: filters.EmployeeName?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, weekOffMappingMasterColumns),
          ExportType: exportType
        }

        const response = await weekOffMappingMasterService.apiCallPullWeekOffMappingMaster(params);
        handleExportFile(response, exportType, 'Week Off Mapping Master', addToast)
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

  const handleExportWeekOffMappingExcel = () => handleExportWeekOffMappings('Excel')
  const handleExportWeekOffMappingPdf = () => handleExportWeekOffMappings('PDF')
  //#endregion

  //#region HANDLE PAGE CHANGE EVENT
  const handlePageChange = (page: number) => {
    fetchWeekOffMappingList(page);
  };
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    loadWeekOffMappings(1, filters, sort, searchTerm || undefined);
  }, [filters,searchTerm]);
  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS
  const requiredWeekOffMappingMasterColumnKeys: string[] = REQUIRED_COLUMN_KEYS;

  const allWeekOffMappingMasterColumnKeys: string[] = weekOffMappingMasterColumns.map(c => c.key)

  const [selectedWeekOffMappingMasterColumnKeys, setSelectedWeekOffMappingMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getWeekOffMappingMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredWeekOffMappingMasterColumnKeys]));
        return withRequired.filter(k => allWeekOffMappingMasterColumnKeys.includes(k));
      }
    } catch { }
    return allWeekOffMappingMasterColumnKeys
  })

  useEffect(() => {
    setSelectedWeekOffMappingMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredWeekOffMappingMasterColumnKeys])).filter(k => allWeekOffMappingMasterColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffMappingMasterColumns.length])

  const visibleWeekOffMappingMasterColumns = useMemo(
    () => weekOffMappingMasterColumns.filter(col => selectedWeekOffMappingMasterColumnKeys.includes(col.key)),
    [weekOffMappingMasterColumns, selectedWeekOffMappingMasterColumnKeys]
  )
  //#endregion

  //#region VIEW EDIT
  const handleViewWeekOffMappingDetails = useCallback((row: WeekOffMappingMasterData) => {
    setViewWeekOffMappingMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])
  //#endregion

  //#region EDIT WEEK OFF MAPPING MASTER
  const handleEditWeekOffMappingMaster = useCallback((row: WeekOffMappingMasterData) => {
    setEditingWeekOffMappingMasterData({
      ...row,
      WeekOffPolicyMasterId: row.WeekOffPolicyMasterId || 0,
      DepartmentMasterId: row.DepartmentMasterId || '',
      EmployeeId: row.EmployeeId || ''
    })
    setIsAddUpdateModalOpen(true);
  }, [])
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: WeekOffMappingMasterData) => {
    setDeleteWeekOffMappingMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadWeekOffMappings(1, tempFilters)
    setShowFilterPopup(false)
  }
  //#endregion

  //#region CLEAR FILTER 
  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadWeekOffMappings(1, {})
    setShowFilterPopup(false)
  }
  //#endregion

  //#region HANDLE FILTER CHANGE
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };
  //#endregion

  //#region ADD UPDATE EDIT WEEK OFF MAPPING MASTER
  const handleFieldChange = (field: keyof AddUpdateWeekOffMappingMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleApplicableTypeChange = (value: string) => {
    setMappingWeekoff(value);
    if (value === "Department") {
      setFormData((prev) => ({ ...prev, EmployeeId: "" }));
    } else {
      setFormData((prev) => ({ ...prev, DepartmentMasterId: "" }));
    }
  };

  const handleAddWeekOffMappingMasterModal = () => {
    setEditingWeekOffMappingMasterData(null);
    setFormData(getInitialFormState());
    setMappingWeekoff("Department");
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  const validateAddWeekOffMappingMasterForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (mappingWeekoff === "Department" && !formData.DepartmentMasterId) {
      newErrors.DepartmentMasterId = "Department Name is required.";
    }

    if (mappingWeekoff === "Employee" && !formData.EmployeeId) {
      newErrors.EmployeeId = "Employee Name is required.";
    }

    if (!formData.WeekOffPolicyMasterId) {
      newErrors.WeekOffPolicyMasterId = "Week Off Policy Name is required.";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushWeekOffMappingFormData = (): AddUpdateWeekOffMappingMasterRequest => {
    return {
      WeekOffPolicyMasterMappingId: formData.WeekOffPolicyMasterMappingId,
      Uniquekey: formData.Uniquekey,
      WeekOffPolicyMasterId: formData.WeekOffPolicyMasterId,
      DepartmentMasterId: mappingWeekoff === "Department" ? formData.DepartmentMasterId : "",
      EmployeeId: mappingWeekoff === "Employee" ? formData.EmployeeId : ""
    };
  };

  const handleAddUpdateWeekOffMappingMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddWeekOffMappingMasterForm()

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushWeekOffMappingFormData();
        const response = await weekOffMappingMasterService.apiCallAddUpdateWeekOffMappingMaster(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          const isAdd = formData.WeekOffPolicyMasterMappingId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as WeekOffMappingMasterData
            setWeekOffMappingMasterList(prevData => [newRecord, ...prevData]);
            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as WeekOffMappingMasterData;
            setWeekOffMappingMasterList(prevData =>
              prevData.map(item =>
                item.WeekOffPolicyMasterMappingId === formData.WeekOffPolicyMasterMappingId
                  ? updatedRecord
                  : item
              )
            )
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setEditingWeekOffMappingMasterData(null);
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
      Number(formData.WeekOffPolicyMasterMappingId) === 0 ? 'Add Week Off Mapping' : 'Update Week Off Mapping'
    )
  };
  //#endregion

  //#region DELETE WEEK OFF MAPPING MASTER
  const handleDeleteWeekOffMappingMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteWeekOffMappingMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteWeekOffMappingMasterRequest = {
          WeekOffPolicyMasterMappingId: deleteWeekOffMappingMasterDetailsData.WeekOffPolicyMasterMappingId,
          UniqueKey: deleteWeekOffMappingMasterDetailsData.Uniquekey || ""
        }

        const response = await weekOffMappingMasterService.apiCallDeleteWeekOffMappingMaster(params);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;
          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;
          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (weekOffMappingMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadWeekOffMappings(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          setIsConfirmationDialogBoxOpen(false);
          setDeleteWeekOffMappingMasterDetailsData(null);
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
      'Delete Week Off Mapping'
    )
  }
  //#endregion

  return {
    weekOffMappingMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewWeekOffMappingMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingWeekOffMappingMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    deleteWeekOffMappingMasterDetailsData,
    isShowCustomizeWeekOffMappingMasterColumnsModal,
    canAction,
    canExport,
    weekOffMappingMasterColumns,
    visibleWeekOffMappingMasterColumns,
    selectedWeekOffMappingMasterColumnKeys,
    requiredWeekOffMappingMasterColumnKeys,
    allWeekOffMappingMasterColumnKeys,
    dropdownLabels,
    dropdownResetKey,
    mappingWeekoff,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewWeekOffMappingMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setFilters,
    setErrors,
    setEditingWeekOffMappingMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteWeekOffMappingMasterDetailsData,
    setIsShowCustomizeWeekOffMappingMasterColumnsModal,
    setSelectedWeekOffMappingMasterColumnKeys,
    setDropdownLabels,
    setDropdownResetKey,
    setMappingWeekoff,

    // Actions
    fetchWeekOffMappingList,
    handlePageChange,
    handleSortColumn,
    handleViewWeekOffMappingDetails,
    handleEditWeekOffMappingMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleApplicableTypeChange,
    handleAddWeekOffMappingMasterModal,
    handleAddUpdateWeekOffMappingMaster,
    handleDeleteWeekOffMappingMaster,
    handleExportWeekOffMappingExcel,
    handleExportWeekOffMappingPdf,
    debouncedSearch,
    clearsearchWeekOffMappings,
  }
}
