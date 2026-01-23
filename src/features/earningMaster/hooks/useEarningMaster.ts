import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import type { FilterInfo, SortInfo, TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateEarningMasterRequest,
  DeleteEarningMasterRequest,
  EarningMasterData,
  FilterWithPaginationEarningMasterRequest
} from '@/features/earningMaster/models/EarningMasterModel';
import { earningMasterService } from '@/features/earningMaster/services/EarningMasterService';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { updateFilter } from '@/core/utils/filterHelper';
import { handleExportFile } from '@/core/utils/exportFile';
import { getInitialFormState, getEarningMasterColumns, REQUIRED_COLUMN_KEYS } from '@/features/earningMaster/constants/earningMasterConstants';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';

export const useEarningMaster = () => {
  //#region STATE MANAGEMENT
  const [earningMasterList, setEarningMasterList] = useState<EarningMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchEarnings(value)
  }, 350)
  const [viewEarningMasterDetailsData, setViewEarningMasterDetailsData] = useState<EarningMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT EARNING MASTER
  const [editingEarningMasterData, setEditingEarningMasterData] = useState<EarningMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE EARNING MASTER
  const [formData, setFormData] = useState<AddUpdateEarningMasterRequest>(() => getInitialFormState());

  //DELETE EARNING MASTER STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteEarningMasterDetailsData, setDeleteEarningMasterDetailsData] = useState<EarningMasterData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeEarningMasterColumnsModal, setIsShowCustomizeEarningMasterColumnsModal] = useState(false);

  //DROPDOWN STATES
  const [dropdownLabels, setDropdownLabels] = useState<{
    branchName?: string;
  }>({});
  const [dropdownResetKey, setDropdownResetKey] = useState(0);

  const [applicable, setApplicable] = useState<string>("Percenatge");
  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  const hasFetchedInitialEarnings = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialEarnings.current) return
    hasFetchedInitialEarnings.current = true;
    fetchEarningList()
  }, [])

  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingEarningMasterData) {
        setFormData({
          EarningMasterId: editingEarningMasterData.EarningMasterId,
          Uniquekey: editingEarningMasterData.Uniquekey || getInitialFormState().Uniquekey,
          Name: editingEarningMasterData.Name || '',
          Applicable: editingEarningMasterData.Applicable || '',
          Type: editingEarningMasterData.Type || '',
          Value: editingEarningMasterData.Value || 0,
          MinSalary: editingEarningMasterData.MinSalary || 0,
          MaxSalary: editingEarningMasterData.MaxSalary || 0,
          BranchMasterId: editingEarningMasterData.BranchMasterId || 0
        });
        setApplicable(editingEarningMasterData.Applicable);
        setDropdownLabels({
          branchName: editingEarningMasterData.BranchName || ""
        });
      } else {
        setFormData(getInitialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingEarningMasterData]);

  //#endregion

  //#region TABLE COLUMN DEFINITION

  const earningMasterColumns = useMemo<TableColumn[]>(
    () => getEarningMasterColumns(),
    []
  )
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchEarningList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadEarnings(page, filters, sort);
  }

  const loadEarnings = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationEarningMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          EarningMasterId: filterParams.EarningMasterId ? Number(filterParams.EarningMasterId) : undefined,
          Name: searchtext ?? filterParams.Name ?? undefined,
          SortBy: getSortByParam(sortInfo ?? null, earningMasterColumns)
        }
        const response = await earningMasterService.apiCallPullEarningMaster(params);

        if (E.isRight(response)) {
          setEarningMasterList(response.right.Data);
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
      'Loading Earning'
    )
  }
  //#endregion

  //#region SEARCH EARNING 
  const searchEarnings = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchEarningList();
      return
    }

     await loadEarnings(1, filters, sortInfo, searchValue)
  }
  //#endregion

  //#region CLEAR SEARCH EARNING 
  const clearsearchEarnings = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    loadEarnings(1, { Name: '' }, sortInfo, undefined);
  }
  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportEarnings = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationEarningMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          Name: filters.Name?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, earningMasterColumns),
          ExportType: exportType
        }

        const response = await earningMasterService.apiCallPullEarningMaster(params);
        handleExportFile(response, exportType, 'Earning Master', addToast)
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

  const handleExportEarningExcel = () => handleExportEarnings('Excel')
  const handleExportEarningPdf = () => handleExportEarnings('PDF')
  //#endregion

  //#region HANDLE PAGE CHANGE EVENT
  const handlePageChange = (page: number) => {
    fetchEarningList(page);
  };
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    loadEarnings(1, filters, sort, searchTerm || undefined);
  }, [filters,searchTerm]);
  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS
  const requiredEarningMasterColumnKeys: string[] = REQUIRED_COLUMN_KEYS;

  const allEarningMasterColumnKeys: string[] = earningMasterColumns.map(c => c.key)

  const [selectedEarningMasterColumnKeys, setSelectedEarningMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getEarningMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredEarningMasterColumnKeys]));
        return withRequired.filter(k => allEarningMasterColumnKeys.includes(k));
      }
    } catch { }
    return allEarningMasterColumnKeys
  })

  useEffect(() => {
    setSelectedEarningMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredEarningMasterColumnKeys])).filter(k => allEarningMasterColumnKeys.includes(k)));
   
  }, [earningMasterColumns.length])

  const visibleEarningMasterColumns = useMemo(
    () => earningMasterColumns.filter(col => selectedEarningMasterColumnKeys.includes(col.key)),
    [earningMasterColumns, selectedEarningMasterColumnKeys]
  )
  //#endregion

  //#region VIEW EDIT
  const handleViewEarningDetails = useCallback((row: EarningMasterData) => {
    setViewEarningMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])
  //#endregion

  //#region EDIT EARNING MASTER
  const handleEditEarningMaster = useCallback((row: EarningMasterData) => {
    setEditingEarningMasterData({
      ...row,
      Name: row.Name || '',
      Type: row.Type || '',
      Value: row.Value || 0,
      BranchMasterId: row.BranchMasterId || 0
    })
    setIsAddUpdateModalOpen(true);
  }, [])
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: EarningMasterData) => {
    setDeleteEarningMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadEarnings(1, tempFilters)
    setShowFilterPopup(false)
  }
  //#endregion

  //#region Clear 
  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadEarnings(1, {})
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
    setDropdownLabels({});
    setErrors({});
    setDropdownResetKey(prev => prev + 1);
    setApplicable("Percenatge");
  };
  //#endregion

  //#region ADD UPDATE EDIT EARNING MASTER
  const handleFieldChange = (field: keyof AddUpdateEarningMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddEarningModal = () => {
    setEditingEarningMasterData(null);
    setFormData(getInitialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  const validateAddEarningMasterForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (formData.Name.trim() === "") {
      newErrors.Name = "Name is required"
    }

    if (!formData.Value || Number(formData.Value) <= 0) {
      newErrors.Value = "Value is required";
    }

    if (!formData.MinSalary || Number(formData.MinSalary) <= 0) {
      newErrors.MinSalary = "Min Salary is required";
    }

    if (!formData.MaxSalary || Number(formData.MaxSalary) <= 0) {
      newErrors.MaxSalary = "Max Salary is required";
    }

    if (formData.MinSalary && formData.MaxSalary && Number(formData.MaxSalary) <= Number(formData.MinSalary)) {
      newErrors.MaxSalary = "Max Salary must be greater than Min Salary";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushEarningMasterFormData = (): AddUpdateEarningMasterRequest => {
    return {
      EarningMasterId: formData.EarningMasterId,
      Uniquekey: formData.Uniquekey,
      Name: formData.Name,
      Applicable: formData.Applicable,
      Type: formData.Type,
      Value: formData.Value,
      MinSalary: formData.MinSalary,
      MaxSalary: formData.MaxSalary,
      BranchMasterId: formData.BranchMasterId
    };
  };

  const handleAddUpdateEarningMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddEarningMasterForm()

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushEarningMasterFormData();
        const response = await earningMasterService.apiCallAddUpdateEarningMaster(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          const isAdd = formData.EarningMasterId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as EarningMasterData
            setEarningMasterList(prevData => [newRecord, ...prevData]);
            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as EarningMasterData;
            setEarningMasterList(prevData =>
              prevData.map(item =>
                item.EarningMasterId === formData.EarningMasterId
                  ? updatedRecord
                  : item
              )
            )
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setEditingEarningMasterData(null);
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
      Number(formData.EarningMasterId) === 0 ? 'Add Earning' : 'Update Earning'
    )
  };
  //#endregion

  //#region DELETE EARNING MASTER
  const handleDeleteEarningMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteEarningMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteEarningMasterRequest = {
          EarningMasterId: deleteEarningMasterDetailsData.EarningMasterId || 0,
          UniqueKey: deleteEarningMasterDetailsData.Uniquekey || ""
        }
        const response = await earningMasterService.apiCallDeleteEarningMaster(params);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;
          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;
          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (earningMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadEarnings(pageToShow, filters, sortInfo);

          addToast({ type: "success", title: response.right.SuccessMessage[0] })
          setIsConfirmationDialogBoxOpen(false);
          setDeleteEarningMasterDetailsData(null);
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
      'Delete Earning Master'
    )
  }
  //#endregion

  return {
    earningMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewEarningMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingEarningMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    deleteEarningMasterDetailsData,
    isShowCustomizeEarningMasterColumnsModal,
    canAction,
    canExport,
    earningMasterColumns,
    visibleEarningMasterColumns,
    selectedEarningMasterColumnKeys,
    requiredEarningMasterColumnKeys,
    allEarningMasterColumnKeys,
    dropdownLabels,
    dropdownResetKey,
    applicable,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewEarningMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setFilters,
    setErrors,
    setEditingEarningMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteEarningMasterDetailsData,
    setIsShowCustomizeEarningMasterColumnsModal,
    setSelectedEarningMasterColumnKeys,
    setDropdownLabels,
    setDropdownResetKey,
    setApplicable,

    // Actions
    fetchEarningList,
    handlePageChange,
    handleSortColumn,
    handleViewEarningDetails,
    handleEditEarningMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddEarningModal,
    handleAddUpdateEarningMaster,
    handleDeleteEarningMaster,
    handleExportEarningExcel,
    handleExportEarningPdf,
    handleResetForm,
    debouncedSearch,
    clearsearchEarnings,
  }
}
