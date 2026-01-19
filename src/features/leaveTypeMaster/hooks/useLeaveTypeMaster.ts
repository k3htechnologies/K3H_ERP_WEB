import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import type { FilterInfo, SortInfo, TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateLeaveTypeMasterRequest,
  DeleteLeaveTypeMasterRequest,
  LeaveTypeMasterData,
  FilterWithPaginationLeaveTypeMasterRequest
} from '@/features/leaveTypeMaster/models/LeaveTypeMasterModel';
import { leaveTypeMasterService } from '@/features/leaveTypeMaster/services/LeaveTypeMasterService';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { updateFilter } from '@/core/utils/filterHelper';
import { handleExportFile } from '@/core/utils/exportFile';
import { getInitialFormState, getLeaveTypeMasterColumns, REQUIRED_COLUMN_KEYS } from '@/features/leaveTypeMaster/constants/leaveTypeMasterConstants';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';

export const useLeaveTypeMaster = () => {
  //#region STATE MANAGEMENT
  const [leaveTypeMasterList, setLeaveTypeMasterList] = useState<LeaveTypeMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchLeaveTypes(value)
  }, 350)
  const [viewLeaveTypeMasterDetailsData, setViewLeaveTypeMasterDetailsData] = useState<LeaveTypeMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT LEAVE TYPE MASTER
  const [editingLeaveTypeMasterData, setEditingLeaveTypeMasterData] = useState<LeaveTypeMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE LEAVE TYPE MASTER
  const [formData, setFormData] = useState<AddUpdateLeaveTypeMasterRequest>(() => getInitialFormState());
  const [prevMaxCarryForward, setPrevMaxCarryForward] = useState<number>(0);

  //DELETE LEAVETYPE MASTER
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteLeaveTypeMasterDetailsData, setDeleteLeaveTypeMasterDetailsData] = useState<LeaveTypeMasterData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeLeaveTypeMasterColumnsModal, setIsShowCustomizeLeaveTypeMasterColumnsModal] = useState(false);

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  const hasFetchedInitialLeaveTypes = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialLeaveTypes.current) return
    hasFetchedInitialLeaveTypes.current = true;
    fetchLeaveTypeList()
  }, [])

  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingLeaveTypeMasterData) {
        setFormData({
          LeaveTypeMasterId: editingLeaveTypeMasterData.LeaveTypeMasterId,
          Uniquekey: editingLeaveTypeMasterData.Uniquekey || getInitialFormState().Uniquekey,
          LeaveType: editingLeaveTypeMasterData.LeaveType || '',
          LeaveTypeCode: editingLeaveTypeMasterData.LeaveTypeCode || '',
          IsCarryForward: editingLeaveTypeMasterData.IsCarryForward || false,
          MaxCarryForward: editingLeaveTypeMasterData.MaxCarryForward || 0,
          IsEncashable: editingLeaveTypeMasterData.IsEncashable || false
        });
        setPrevMaxCarryForward(editingLeaveTypeMasterData.MaxCarryForward || 0);
      } else {
        setFormData(getInitialFormState());
        setPrevMaxCarryForward(0);
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingLeaveTypeMasterData]);

  //#endregion

  //#region TABLE COLUMN DEFINITION

  const leaveTypeMasterColumns = useMemo<TableColumn[]>(
    () => getLeaveTypeMasterColumns(),
    []
  )
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchLeaveTypeList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadLeaveTypes(page, filters, sort);
  }

  const loadLeaveTypes = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo,searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationLeaveTypeMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          LeaveTypeMasterId: filterParams.LeaveTypeMasterId ? Number(filterParams.LeaveTypeMasterId) : undefined,
          LeaveType: searchtext ?? filterParams.LeaveType ?? undefined,
          SortBy: getSortByParam(sortInfo ?? null, leaveTypeMasterColumns)
        }

        const response = await leaveTypeMasterService.apiCallPullLeaveTypeMaster(params);

        if (E.isRight(response)) {
          setLeaveTypeMasterList(response.right.Data);
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
      'Loading Leave Type'
    )
  }
  //#endregion

  //#region SEARCH LEAVE TYPE 
  const searchLeaveTypes = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchLeaveTypeList();
      return
    }
    await loadLeaveTypes(1, filters, sortInfo, searchValue)
  }
  //#endregion

  //#region CLEAR SEARCH LEAVE TYPE 
  const clearsearchLeaveTypes = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
     loadLeaveTypes(1, { LeaveType: '' }, sortInfo, undefined);
  }
  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportLeaveTypes = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationLeaveTypeMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          LeaveType: filters.LeaveType?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, leaveTypeMasterColumns),
          ExportType: exportType
        }

        const response = await leaveTypeMasterService.apiCallPullLeaveTypeMaster(params);
        handleExportFile(response, exportType, 'Leave Type Master', addToast)
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

  const handleExportLeaveTypeExcel = () => handleExportLeaveTypes('Excel')
  const handleExportLeaveTypePdf = () => handleExportLeaveTypes('PDF')
  //#endregion

  //#region HANDLE PAGE CHANGE EVENT
  const handlePageChange = (page: number) => {
    fetchLeaveTypeList(page);
  };
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {

    setSortInfo(sort);

    loadLeaveTypes(1, filters, sort, searchTerm || undefined);

  }, [filters, searchTerm]);
  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS
  const requiredLeaveTypeMasterColumnKeys: string[] = REQUIRED_COLUMN_KEYS;

  const allLeaveTypeMasterColumnKeys: string[] = leaveTypeMasterColumns.map(c => c.key)

  const [selectedLeaveTypeMasterColumnKeys, setSelectedLeaveTypeMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getLeaveTypeMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredLeaveTypeMasterColumnKeys]));
        return withRequired.filter(k => allLeaveTypeMasterColumnKeys.includes(k));
      }
    } catch { }
    return allLeaveTypeMasterColumnKeys
  })

  useEffect(() => {
    setSelectedLeaveTypeMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredLeaveTypeMasterColumnKeys])).filter(k => allLeaveTypeMasterColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaveTypeMasterColumns.length])

  const visibleLeaveTypeMasterColumns = useMemo(
    () => leaveTypeMasterColumns.filter(col => selectedLeaveTypeMasterColumnKeys.includes(col.key)),
    [leaveTypeMasterColumns, selectedLeaveTypeMasterColumnKeys]
  )
  //#endregion

  //#region VIEW EDIT
  const handleViewLeaveTypeDetails = useCallback((row: LeaveTypeMasterData) => {
    setViewLeaveTypeMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])
  //#endregion

  //#region EDIT LEAVE TYPE MASTER
  const handleEditLeaveTypeMaster = useCallback((row: LeaveTypeMasterData) => {
    setEditingLeaveTypeMasterData({
      ...row,
      LeaveType: row.LeaveType || "",
      LeaveTypeCode: row.LeaveTypeCode || "",
      IsCarryForward: row.IsCarryForward || false,
      MaxCarryForward: row.MaxCarryForward || 0,
      IsEncashable: row.IsEncashable || false,
    })
    setIsAddUpdateModalOpen(true);
  }, [])
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: LeaveTypeMasterData) => {
    setDeleteLeaveTypeMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadLeaveTypes(1, tempFilters)
    setShowFilterPopup(false)
  }
  //#endregion

  //#region CLEAR FILTER 
  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadLeaveTypes(1, {})
    setShowFilterPopup(false)
  }
  //#endregion

  //#region HANDLE FILTER CHANGE
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };
  //#endregion

  //#region HANDLE RESET FORM
  const handleResetForm = () => {
    setFormData(getInitialFormState());
    setErrors({});
  };
  //#endregion

  //#region ADD UPDATE EDIT LEAVE TYPE MASTER
  const handleFieldChange = (field: keyof AddUpdateLeaveTypeMasterRequest, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "IsCarryForward") {
        if (!value) {
          setPrevMaxCarryForward(prev.MaxCarryForward || 0);
          updated.MaxCarryForward = 0;
        } else {
          updated.MaxCarryForward = prevMaxCarryForward;
        }
      }

      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddLeaveTypeModal = () => {
    setEditingLeaveTypeMasterData(null);
    setFormData(getInitialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  const validateAddLeaveTypeMasterForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.LeaveType?.trim()) {
      newErrors.LeaveType = "Leave Type is required.";
    }

    if (!formData.LeaveTypeCode?.trim()) {
      newErrors.LeaveTypeCode = "Leave Type Code is required.";
    }

    if (formData.IsCarryForward) {
      if (!formData.MaxCarryForward || Number(formData.MaxCarryForward) <= 0) {
        newErrors.MaxCarryForward = "Max Carry Forward is required.";
      }
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushLeaveTypeMasterFormData = (): AddUpdateLeaveTypeMasterRequest => {
    return {
      LeaveTypeMasterId: formData.LeaveTypeMasterId || 0,
      Uniquekey: formData.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      LeaveType: formData.LeaveType || "",
      LeaveTypeCode: formData.LeaveTypeCode || "",
      IsCarryForward: formData.IsCarryForward || false,
      MaxCarryForward: formData.IsCarryForward ? formData.MaxCarryForward || 0 : 0,
      IsEncashable: formData.IsEncashable || false
    };
  };

  const handleAddUpdateLeaveTypeMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddLeaveTypeMasterForm()

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushLeaveTypeMasterFormData();
        const response = await leaveTypeMasterService.apiCallAddUpdateLeaveTypeMaster(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          const isAdd = formData.LeaveTypeMasterId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as LeaveTypeMasterData
            setLeaveTypeMasterList(prevData => [newRecord, ...prevData]);
            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as LeaveTypeMasterData;
            setLeaveTypeMasterList(prevData =>
              prevData.map(item =>
                item.LeaveTypeMasterId === formData.LeaveTypeMasterId
                  ? updatedRecord
                  : item
              )
            )
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setEditingLeaveTypeMasterData(null);
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
      Number(formData.LeaveTypeMasterId) === 0 ? 'Add Leave Type' : 'Update Leave Type'
    )
  };
  //#endregion

  //#region DELETE LEAVE TYPE MASTER
  const handleDeleteLeaveTypeMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteLeaveTypeMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteLeaveTypeMasterRequest = {
          LeaveTypeMasterId: deleteLeaveTypeMasterDetailsData.LeaveTypeMasterId,
          UniqueKey: deleteLeaveTypeMasterDetailsData.Uniquekey || ""
        }

        const response = await leaveTypeMasterService.apiCallDeleteLeaveTypeMaster(params);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;
          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;
          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (leaveTypeMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadLeaveTypes(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          setIsConfirmationDialogBoxOpen(false);
          setDeleteLeaveTypeMasterDetailsData(null);
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
      'Delete Leave Type'
    )
  }
  //#endregion

  return {
    leaveTypeMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewLeaveTypeMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingLeaveTypeMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    deleteLeaveTypeMasterDetailsData,
    isShowCustomizeLeaveTypeMasterColumnsModal,
    canAction,
    canExport,
    leaveTypeMasterColumns,
    visibleLeaveTypeMasterColumns,
    selectedLeaveTypeMasterColumnKeys,
    requiredLeaveTypeMasterColumnKeys,
    allLeaveTypeMasterColumnKeys,
    prevMaxCarryForward,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewLeaveTypeMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setFilters,
    setErrors,
    setEditingLeaveTypeMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteLeaveTypeMasterDetailsData,
    setIsShowCustomizeLeaveTypeMasterColumnsModal,
    setSelectedLeaveTypeMasterColumnKeys,
    setPrevMaxCarryForward,

    // Actions
    fetchLeaveTypeList,
    handlePageChange,
    handleSortColumn,
    handleViewLeaveTypeDetails,
    handleEditLeaveTypeMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddLeaveTypeModal,
    handleAddUpdateLeaveTypeMaster,
    handleDeleteLeaveTypeMaster,
    handleExportLeaveTypeExcel,
    handleExportLeaveTypePdf,
    handleResetForm,
    debouncedSearch,
    clearsearchLeaveTypes,
  }
}
