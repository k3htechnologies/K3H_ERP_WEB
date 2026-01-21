import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import type { FilterInfo, SortInfo, TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateBranchMasterRequest,
  DeleteBranchMasterRequest,
  BranchMasterData,
  FilterWithPaginationBranchMasterRequest
} from '@/features/branchMaster/models/BranchMasterModel';
import { branchMasterService } from '@/features/branchMaster/services/BranchMasterService';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { updateFilter } from '@/core/utils/filterHelper';
import { handleExportFile } from '@/core/utils/exportFile';
import { getInitialFormState, getBranchMasterColumns, REQUIRED_COLUMN_KEYS } from '@/features/branchMaster/constants/branchMasterConstants';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';

export const useBranchMaster = () => {
  //#region STATE MANAGEMENT
  const [branchMasterList, setBranchMasterList] = useState<BranchMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchBranches(value)
  }, 350)
  const [viewBranchMasterDetailsData, setViewBranchMasterDetailsData] = useState<BranchMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT BRANCH MASTER
  const [editingBranchMasterData, setEditingBranchMasterData] = useState<BranchMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE BRANCH MASTER
  const [formData, setFormData] = useState<AddUpdateBranchMasterRequest>(() => getInitialFormState());

  //DELETE BRANCH MASTER STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteBranchMasterDetailsData, setDeleteBranchMasterDetailsData] = useState<BranchMasterData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeBranchMasterColumnsModal, setIsShowCustomizeBranchMasterColumnsModal] = useState(false);

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  const hasFetchedInitialBranches = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialBranches.current) return
    hasFetchedInitialBranches.current = true;
    fetchBranchList()
  }, [])

  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingBranchMasterData) {
        setFormData({
          BranchMasterId: editingBranchMasterData.BranchMasterId,
          Uniquekey: editingBranchMasterData.Uniquekey || getInitialFormState().Uniquekey,
          BranchCode: editingBranchMasterData.BranchCode || '',
          BranchName: editingBranchMasterData.BranchName || '',
          Location: editingBranchMasterData.Location || '',
          IsHeadOffice: editingBranchMasterData.IsHeadOffice || false,
        });
      } else {
        setFormData(getInitialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingBranchMasterData]);

  //#endregion

  //#region TABLE COLUMN DEFINITION

  const branchMasterColumns = useMemo<TableColumn[]>(
    () => getBranchMasterColumns(),
    []
  )
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchBranchList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadBranches(page, filters, sort ?? sortInfo);
  }

  const loadBranches = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationBranchMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          BranchMasterId: filterParams.BranchMasterId ? Number(filterParams.BranchMasterId) : 0,
          BranchName: searchtext ?? filterParams.BranchName?.trim() ?? undefined,
          SortBy: getSortByParam(sortInfo ?? null, branchMasterColumns)
        }

        const response = await branchMasterService.apiCallPullBranchMaster(params);

        if (E.isRight(response)) {
          setBranchMasterList(response.right.Data);
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
      'Loading Branch'
    )
  }
  //#endregion

  //#region SEARCH BRANCH 
  const searchBranches = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchBranchList();
      return
    }

    await loadBranches(1, filters, sortInfo, searchValue)
  }
  //#endregion

  //#region CLEAR SEARCH BRANCH 
  const clearsearchBranches = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    loadBranches(1, { BranchName: '' }, sortInfo, undefined);
  }
  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportBranches = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationBranchMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          BranchName: filters.BranchName?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, branchMasterColumns),
          ExportType: exportType
        }

        const response = await branchMasterService.apiCallPullBranchMaster(params);
        handleExportFile(response, exportType, 'Branch Master', addToast)
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

  const handleExportBranchExcel = () => handleExportBranches('Excel')
  const handleExportBranchPdf = () => handleExportBranches('PDF')
  //#endregion

  //#region HANDLE PAGE CHANGE EVENT
  const handlePageChange = (page: number) => {
    fetchBranchList(page);
  };
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    loadBranches(1, filters, sort, searchTerm || undefined);
  }, [filters, searchTerm]);
  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS
  const requiredBranchMasterColumnKeys: string[] = REQUIRED_COLUMN_KEYS;

  const allBranchMasterColumnKeys: string[] = branchMasterColumns.map(c => c.key)

  const [selectedBranchMasterColumnKeys, setSelectedBranchMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getBranchMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredBranchMasterColumnKeys]));
        return withRequired.filter(k => allBranchMasterColumnKeys.includes(k));
      }
    } catch { }
    return allBranchMasterColumnKeys
  })

  useEffect(() => {
    setSelectedBranchMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredBranchMasterColumnKeys])).filter(k => allBranchMasterColumnKeys.includes(k)));
  }, [branchMasterColumns.length])

  const visibleBranchMasterColumns = useMemo(
    () => branchMasterColumns.filter(col => selectedBranchMasterColumnKeys.includes(col.key)),
    [branchMasterColumns, selectedBranchMasterColumnKeys]
  )
  //#endregion

  //#region VIEW EDIT
  const handleViewBranchDetails = useCallback((row: BranchMasterData) => {
    setViewBranchMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])
  //#endregion

  //#region EDIT BRANCH MASTER
  const handleEditBranchMaster = useCallback((row: BranchMasterData) => {
    setEditingBranchMasterData({
      ...row,
      BranchCode: row.BranchCode || '',
      BranchName: row.BranchName || '',
      Location: row.Location || '',
      IsHeadOffice: row.IsHeadOffice || false
    })
    setIsAddUpdateModalOpen(true);
  }, [])
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: BranchMasterData) => {
    setDeleteBranchMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadBranches(1, tempFilters)
    setShowFilterPopup(false)
  }
  //#endregion

  //#region Clear 
  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadBranches(1, {})
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

  //#region ADD UPDATE EDIT BRANCH MASTER
  const handleFieldChange = (field: keyof AddUpdateBranchMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddBranchMasterModal = () => {
    setEditingBranchMasterData(null);
    setFormData(getInitialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  const validateAddBranchMasterForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (formData.BranchName.trim() === "") {
      newErrors.BranchName = "Branch Name is required"
    }
    else if (formData.BranchName.length < 3) {
      newErrors.BranchName = "Branch Name must be at least 3 characters long"
    }

    if (formData.BranchCode.trim() === "") {
      newErrors.BranchCode = "Branch Code is required";
    } else if (formData.BranchCode.trim().length >= 5) {
      newErrors.BranchCode = "Branch Code must be at least 4 characters long";
    }

    if (formData.Location.trim() === "") {
      newErrors.Location = "Location is required";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushBranchMasterFormData = (): AddUpdateBranchMasterRequest => {
    return {
      BranchMasterId: formData.BranchMasterId,
      Uniquekey: formData.Uniquekey,
      BranchCode: formData.BranchCode,
      BranchName: formData.BranchName,
      Location: formData.Location,
      IsHeadOffice: formData.IsHeadOffice
    };
  };

  const handleAddUpdateBranchMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddBranchMasterForm()

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushBranchMasterFormData();
        const response = await branchMasterService.apiCallAddUpdateBranchMaster(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.BranchMasterId === 0;

          if (isAdd) {

            const newRecord = response.right.Data[0] as BranchMasterData
            setBranchMasterList(prevData => [newRecord, ...prevData]);
            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          } else {

            const updatedRecord = response.right.Data[0] as BranchMasterData;
            setBranchMasterList(prevData =>
              prevData.map(item =>
                item.BranchMasterId === formData.BranchMasterId
                  ? updatedRecord
                  : item
              )
            )
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setEditingBranchMasterData(null);
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
      Number(formData.BranchMasterId) === 0 ? 'Add Branch' : 'Update Branch'
    )
  };
  //#endregion

  //#region DELETE BRANCH MASTER
  const handleDeleteBranchMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteBranchMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteBranchMasterRequest = {
          BranchMasterId: deleteBranchMasterDetailsData.BranchMasterId,
          UniqueKey: deleteBranchMasterDetailsData.Uniquekey || ''
        }

        const response = await branchMasterService.apiCallDeleteBranchMaster(params);

        if (E.isRight(response)) {

          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          }
          else if (branchMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadBranches(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          setIsConfirmationDialogBoxOpen(false);
          setDeleteBranchMasterDetailsData(null);
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
      'Delete Branch'
    )
  }
  //#endregion

  return {
    branchMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewBranchMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingBranchMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    deleteBranchMasterDetailsData,
    isShowCustomizeBranchMasterColumnsModal,
    canAction,
    canExport,
    branchMasterColumns,
    visibleBranchMasterColumns,
    selectedBranchMasterColumnKeys,
    requiredBranchMasterColumnKeys,
    allBranchMasterColumnKeys,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewBranchMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setFilters,
    setErrors,
    setEditingBranchMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteBranchMasterDetailsData,
    setIsShowCustomizeBranchMasterColumnsModal,
    setSelectedBranchMasterColumnKeys,

    // Actions
    fetchBranchList,
    handlePageChange,
    handleSortColumn,
    handleViewBranchDetails,
    handleEditBranchMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddBranchMasterModal,
    handleAddUpdateBranchMaster,
    handleDeleteBranchMaster,
    handleExportBranchExcel,
    handleExportBranchPdf,
    handleResetForm,
    debouncedSearch,
    clearsearchBranches,
  }
}
