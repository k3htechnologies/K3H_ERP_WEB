import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import type { FilterInfo, SortInfo, TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateHolidayMappingMasterRequest,
  DeleteHolidayMappingMasterRequest,
  HolidayMappingMasterData,
  FilterWithPaginationHolidayMappingMasterRequest
} from '@/features/holidayMappingMaster/models/HolidayMappingMasterModel';
import { holidayMappingMasterService } from '@/features/holidayMappingMaster/services/HolidayMappingMasterService';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { updateFilter } from '@/core/utils/filterHelper';
import { handleExportFile } from '@/core/utils/exportFile';
import { getInitialFormState, getHolidayMappingMasterColumns, REQUIRED_COLUMN_KEYS } from '@/features/holidayMappingMaster/constants/holidayMappingMasterConstants';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { useMultiSelectDropdown } from '@/core/hooks/useMultiSelectDropdown';
import { fetchBranchMasterDropdown } from '@/features/branchMaster/branchMasterDropDown';

export const useHolidayMappingMaster = () => {
  //#region STATE MANAGEMENT
  const [holidayMappingMasterList, setHolidayMappingMasterList] = useState<HolidayMappingMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchHolidayMappings(value)
  }, 350)
  const [viewHolidayMappingMasterDetailsData, setViewHolidayMappingMasterDetailsData] = useState<HolidayMappingMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});
  const [branchValue, setBranchValue] = useState<string | number | null>(null);

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT HOLIDAY MAPPING MASTER STATES
  const [editingHolidayMappingMasterData, setEditingHolidayMappingMasterData] = useState<HolidayMappingMasterData | null>(null)
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE HOLIDAY MAPPING MASTER STATES
  const [formData, setFormData] = useState<AddUpdateHolidayMappingMasterRequest>(() => getInitialFormState());

  //DELETE  HOLIDAY MAPPING MASTER STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteHolidayMappingMasterDetailsData, setDeleteHolidayMappingMasterDetailsData] = useState<HolidayMappingMasterData | null>(null)

  //DROP DOWN RESET KEY
  const [dropdownResetKey, setDropdownResetKey] = useState(0);

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeHolidayMappingMasterColumnsModal, setIsShowCustomizeHolidayMappingMasterColumnsModal] = useState(false);

  //#region DROP DOWN LABELS
  const [dropdownLabels, setDropdownLabels] = useState<{
    branchName?: string;
    holidayName?: string;
  }>({});
  //#endregion

  const branchValueDropdown = useMultiSelectDropdown({
    value: branchValue,
    fetchCallback: fetchBranchMasterDropdown,
    autoFetchOptions: true,
  });

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  const hasFetchedInitialHolidayMappings = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialHolidayMappings.current) return
    hasFetchedInitialHolidayMappings.current = true;
    fetchHolidayMappingList()
  }, [])

  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingHolidayMappingMasterData) {
        setFormData({
          HolidayMappingMasterId: editingHolidayMappingMasterData.HolidayMappingMasterId,
          Uniquekey: editingHolidayMappingMasterData.Uniquekey || getInitialFormState().Uniquekey,
          HolidayMasterId: editingHolidayMappingMasterData.HolidayMasterId || 0,
          BranchMasterId: editingHolidayMappingMasterData.BranchMasterId || '',
          HolidayDate: editingHolidayMappingMasterData.HolidayDate || '',
        });
        setDropdownLabels({
          branchName: editingHolidayMappingMasterData.BranchName || "",
          holidayName: editingHolidayMappingMasterData.HolidayName || "",
        });
      } else {
        setFormData(getInitialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingHolidayMappingMasterData]);

  //#endregion

  //#region TABLE COLUMN DEFINITION

  const holidayMappingMasterColumns = useMemo<TableColumn[]>(
    () => getHolidayMappingMasterColumns(),
    []
  )
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchHolidayMappingList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadHolidayMappings(page, filters, sort);
  }

  const loadHolidayMappings = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationHolidayMappingMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          HolidayMappingMasterId: filterParams.HolidayMappingMasterId ? Number(filterParams.HolidayMappingMasterId) : undefined,
          BranchName: filterParams.BranchName?.trim() || undefined,
          HolidayName: searchtext ?? filterParams.HolidayName?.trim() ?? undefined,
          FromHolidayDate: filterParams.FromHolidayDate?.trim() || undefined,
          ToHolidayDate: filterParams.ToHolidayDate?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, holidayMappingMasterColumns)
        }
        const response = await holidayMappingMasterService.apiCallPullHolidayMappingMaster(params);

        if (E.isRight(response)) {
          setHolidayMappingMasterList(response.right.Data);
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
      'Loading Holiday Mapping'
    )
  }
  //#endregion

  //#region SEARCH HOLIDAY MAPPING 
  const searchHolidayMappings = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchHolidayMappingList();
      return
    }
    await loadHolidayMappings(1, filters, sortInfo, searchValue)
  }
  //#endregion

  //#region CLEAR SEARCH HOLIDAY MAPPING
  const clearsearchHolidayMappings = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    loadHolidayMappings(1, { HolidayName: '' }, sortInfo, undefined);
  }
  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportHolidayMappings = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationHolidayMappingMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          BranchName: filters.BranchName?.trim() || undefined,
          HolidayName: filters.HolidayName?.trim() || undefined,
          FromHolidayDate: filters.FromHolidayDate?.trim() || undefined,
          ToHolidayDate: filters.ToHolidayDate?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, holidayMappingMasterColumns),
          ExportType: exportType
        }

        const response = await holidayMappingMasterService.apiCallPullHolidayMappingMaster(params);
        handleExportFile(response, exportType, 'Holiday Mapping Master', addToast)
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

  const handleExportHolidayMappingExcel = () => handleExportHolidayMappings('Excel')
  const handleExportHolidayMappingPdf = () => handleExportHolidayMappings('PDF')
  //#endregion

  //#region HANDLE PAGE CHANGE EVENT
  const handlePageChange = (page: number) => {
    fetchHolidayMappingList(page);
  };
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {

    setSortInfo(sort);

    loadHolidayMappings(1, filters, sort, searchTerm || undefined);

  }, [filters, searchTerm]);

  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS
  const requiredHolidayMappingMasterColumnKeys: string[] = REQUIRED_COLUMN_KEYS;

  const allHolidayMappingMasterColumnKeys: string[] = holidayMappingMasterColumns.map(c => c.key)

  const [selectedHolidayMappingMasterColumnKeys, setSelectedHolidayMappingMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getHolidayMappingMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredHolidayMappingMasterColumnKeys]));
        return withRequired.filter(k => allHolidayMappingMasterColumnKeys.includes(k));
      }
    } catch { }
    return allHolidayMappingMasterColumnKeys
  })

  useEffect(() => {
    setSelectedHolidayMappingMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredHolidayMappingMasterColumnKeys])).filter(k => allHolidayMappingMasterColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holidayMappingMasterColumns.length])

  const visibleHolidayMappingMasterColumns = useMemo(
    () => holidayMappingMasterColumns.filter(col => selectedHolidayMappingMasterColumnKeys.includes(col.key)),
    [holidayMappingMasterColumns, selectedHolidayMappingMasterColumnKeys]
  )
  //#endregion

  //#region VIEW EDIT
  const handleViewHolidayMappingDetails = useCallback((row: HolidayMappingMasterData) => {
    setViewHolidayMappingMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])
  //#endregion

  //#region EDIT HOLIDAY MAPPING MASTER
  const handleEditHolidayMappingMaster = useCallback((row: HolidayMappingMasterData) => {
    setEditingHolidayMappingMasterData({
      ...row,
      HolidayMasterId: row.HolidayMasterId || 0,
      BranchMasterId: row.BranchMasterId || '',
      HolidayDate: row.HolidayDate || ''
    })
    setIsAddUpdateModalOpen(true);
  }, [])
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: HolidayMappingMasterData) => {
    setDeleteHolidayMappingMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadHolidayMappings(1, tempFilters)
    setShowFilterPopup(false)
  }
  //#endregion

  //#region Clear 
  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadHolidayMappings(1, {})
    setShowFilterPopup(false)
  }
  //#endregion

  //#region HANDLE FILTER CHANGE
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };
  //#endregion

  //#region ADD UPDATE EDIT HOLIDAY MAPPING MASTER
  const handleFieldChange = (field: keyof AddUpdateHolidayMappingMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddHolidayMappingModal = () => {
    setEditingHolidayMappingMasterData(null);
    setFormData(getInitialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  const validateAddHolidayMappingMasterForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (formData.HolidayMasterId === 0) {
      newErrors.HolidayMasterId = "Holiday is required"
    }

    if (!formData.HolidayDate || formData.HolidayDate.trim() === "") {
      newErrors.HolidayDate = "Holiday Date is required"
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushHolidayMappingMasterFormData = (): AddUpdateHolidayMappingMasterRequest => {
    return {
      HolidayMappingMasterId: formData.HolidayMappingMasterId,
      Uniquekey: formData.Uniquekey,
      HolidayMasterId: formData.HolidayMasterId,
      BranchMasterId: formData.BranchMasterId ? String(formData.BranchMasterId) : "",
      HolidayDate: formData.HolidayDate
    };
  };

  const handleAddUpdateHolidayMappingMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddHolidayMappingMasterForm()

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushHolidayMappingMasterFormData();
        const response = await holidayMappingMasterService.apiCallAddUpdateHolidayMappingMaster(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          const isAdd = formData.HolidayMappingMasterId === 0;

          if (isAdd) {

            const newRecord = response.right.Data[0] as HolidayMappingMasterData

            setHolidayMappingMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          } else {

            const updatedRecord = response.right.Data[0] as HolidayMappingMasterData;

            setHolidayMappingMasterList(prevData =>
              prevData.map(item =>
                item.HolidayMappingMasterId === formData.HolidayMappingMasterId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setEditingHolidayMappingMasterData(null);

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
      Number(formData.HolidayMappingMasterId) === 0 ? 'Add Holiday Mapping' : 'Update Holiday Mapping'
    )
  };
  //#endregion

  //#region DELETE HOLIDAY MAPPING MASTER
  const handleDeleteHolidayMappingMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteHolidayMappingMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteHolidayMappingMasterRequest = {
          HolidayMappingMasterId: deleteHolidayMappingMasterDetailsData.HolidayMappingMasterId,
          UniqueKey: deleteHolidayMappingMasterDetailsData.Uniquekey || ""
        }

        const response = await holidayMappingMasterService.apiCallDeleteHolidayMappingMaster(params);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;
          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;
          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (holidayMappingMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadHolidayMappings(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          setIsConfirmationDialogBoxOpen(false);
          setDeleteHolidayMappingMasterDetailsData(null);
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
      'Delete Holiday Mapping'
    )
  }
  //#endregion

  return {
    holidayMappingMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewHolidayMappingMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingHolidayMappingMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    deleteHolidayMappingMasterDetailsData,
    isShowCustomizeHolidayMappingMasterColumnsModal,
    canAction,
    canExport,
    holidayMappingMasterColumns,
    visibleHolidayMappingMasterColumns,
    selectedHolidayMappingMasterColumnKeys,
    requiredHolidayMappingMasterColumnKeys,
    allHolidayMappingMasterColumnKeys,
    dropdownLabels,
    dropdownResetKey,
    branchValueDropdown,
    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewHolidayMappingMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setFilters,
    setErrors,
    setEditingHolidayMappingMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteHolidayMappingMasterDetailsData,
    setIsShowCustomizeHolidayMappingMasterColumnsModal,
    setSelectedHolidayMappingMasterColumnKeys,
    setDropdownLabels,
    setDropdownResetKey,
    setBranchValue,

    // Actions
    fetchHolidayMappingList,
    handlePageChange,
    handleSortColumn,
    handleViewHolidayMappingDetails,
    handleEditHolidayMappingMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddHolidayMappingModal,
    handleAddUpdateHolidayMappingMaster,
    handleDeleteHolidayMappingMaster,
    handleExportHolidayMappingExcel,
    handleExportHolidayMappingPdf,
    debouncedSearch,
    clearsearchHolidayMappings,
  }
}
