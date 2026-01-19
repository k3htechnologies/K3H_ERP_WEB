import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import type { FilterInfo, SortInfo, TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateUomMasterRequest,
  DeleteUomMasterRequest,
  UomMasterData,
  FilterWithPaginationUomMaster
} from '@/features/uomMaster/models/UOMMasterModel';
import { uomMasterService } from '@/features/uomMaster/services/UOMMasterService';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { updateFilter } from '@/core/utils/filterHelper';
import { handleExportFile } from '@/core/utils/exportFile';
import { getInitialFormState, getUomMasterColumns, REQUIRED_COLUMN_KEYS } from '@/features/uomMaster/constants/uomMasterConstants';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';

export const useUomMaster = () => {
  //#region STATE MANAGEMENT
  const [uomMasterList, setUomMasterList] = useState<UomMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchUoms(value)
  }, 350)
  const [viewUomMasterDetailsData, setViewUomMasterDetailsData] = useState<UomMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT UOM MASTER
  const [editingUomMasterData, setEditingUomMasterData] = useState<UomMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE UOM MASTER
  const [formData, setFormData] = useState<AddUpdateUomMasterRequest>(() => getInitialFormState());

  //DELETE UOM MASTER STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteUomMasterDetailsData, setDeleteUomMasterDetailsData] = useState<UomMasterData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeUomMasterColumnsModal, setIsShowCustomizeUomMasterColumnsModal] = useState(false);

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION

  const hasFetchedInitialUoms = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialUoms.current) return
    hasFetchedInitialUoms.current = true;
    fetchUomList()
  }, [])

  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingUomMasterData) {
        setFormData({
          UomMasterId: editingUomMasterData.UomMasterId,
          Uniquekey: editingUomMasterData.UniqueKey || null,
          UomCode: editingUomMasterData.UomCode?.toString() || '',
          UomName: editingUomMasterData.Uom || ''
        });
      } else {
        setFormData(getInitialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingUomMasterData]);

  //#endregion

  //#region TABLE COLUMN DEFINITION

  const uomMasterColumns = useMemo<TableColumn[]>(
    () => getUomMasterColumns(),
    []
  )
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchUomList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadUoms(page, filters, sort ?? sortInfo);
  }

  const loadUoms = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationUomMaster = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          UomMasterId: filterParams.UomMasterId ? Number(filterParams.UomMasterId) : 0,
          Uom: searchtext ?? filterParams.UomName ?? undefined,
          SortBy: getSortByParam(sortInfo ?? null, uomMasterColumns)
        }

        const response = await uomMasterService.apiCallPullUomMaster(params);

        if (E.isRight(response)) {
          setUomMasterList(response.right.Data);
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
      'Loading UOM'
    )
  }
  //#endregion

  //#region SEARCH UOM 
  const searchUoms = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchUomList();
      return
    }

    await loadUoms(1, filters, sortInfo, searchValue)
  }
  //#endregion

  //#region CLEAR SEARCH UOM 
  const clearsearchUoms = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    loadUoms(1, { UomName: '' }, sortInfo, undefined);
  }
  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportUoms = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationUomMaster = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          Uom: filters.UomName?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, uomMasterColumns),
          ExportType: exportType
        }

        const response = await uomMasterService.apiCallPullUomMaster(params);
        handleExportFile(response, exportType, 'UOM Master', addToast)
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

  const handleExportUomExcel = () => handleExportUoms('Excel')
  const handleExportUomPdf = () => handleExportUoms('PDF')
  //#endregion

  //#region HANDLE PAGE CHANGE EVENT
  const handlePageChange = (page: number) => {
    fetchUomList(page);
  };
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    loadUoms(1, filters, sort, searchTerm || undefined);
  }, [filters, searchTerm]);
  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS
  const requiredUomMasterColumnKeys: string[] = REQUIRED_COLUMN_KEYS;

  const allUomMasterColumnKeys: string[] = uomMasterColumns.map(c => c.key)

  const [selectedUomMasterColumnKeys, setSelectedUomMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getUomMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredUomMasterColumnKeys]));
        return withRequired.filter(k => allUomMasterColumnKeys.includes(k));
      }
    } catch { }
    return allUomMasterColumnKeys
  })

  useEffect(() => {
    setSelectedUomMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredUomMasterColumnKeys])).filter(k => allUomMasterColumnKeys.includes(k)));
  }, [uomMasterColumns.length])

  const visibleUomMasterColumns = useMemo(
    () => uomMasterColumns.filter(col => selectedUomMasterColumnKeys.includes(col.key)),
    [uomMasterColumns, selectedUomMasterColumnKeys]
  )
  //#endregion

  //#region VIEW EDIT
  const handleViewUomDetails = useCallback((row: UomMasterData) => {
    setViewUomMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])
  //#endregion

  //#region EDIT UOM MASTER
  const handleEditUomMaster = useCallback((row: UomMasterData) => {
    setEditingUomMasterData({
      ...row,
      UomCode: row.UomCode?.toString() || '',
      Uom: row.Uom || ''
    })
    setIsAddUpdateModalOpen(true);
  }, [])
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: UomMasterData) => {
    setDeleteUomMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadUoms(1, tempFilters)
    setShowFilterPopup(false)
  }
  //#endregion

  //#region CLEAR FILTER 
  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadUoms(1, {})
    setShowFilterPopup(false)
  }
  //#endregion

  //#region HANDLE FILTER CHANGE
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };
  //#endregion

  //#region ADD UPDATE EDIT UOM MASTER
  const handleFieldChange = (field: keyof AddUpdateUomMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddUomModal = () => {
    setEditingUomMasterData(null);
    setFormData(getInitialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  const validateAddUomMasterForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (formData.UomName.trim() === "") {
      newErrors.UomName = "UOM Name is required"
    }
    else if (formData.UomName.length < 3) {
      newErrors.UomName = "UOM Name must be at least 3 characters long"
    }

    if (formData.UomCode.trim() === "") {
      newErrors.UomCode = "UOM Code is required";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushUomMasterFormData = (): AddUpdateUomMasterRequest => {
    return {
      UomMasterId: formData.UomMasterId,
      Uniquekey: formData.Uniquekey,
      UomCode: formData.UomCode,
      UomName: formData.UomName
    };
  };

  const handleAddUpdateUomMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddUomMasterForm()

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushUomMasterFormData();
        const response = await uomMasterService.apiCallAddUpdateUomMaster(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          const isAdd = formData.UomMasterId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as UomMasterData
            setUomMasterList(prevData => [newRecord, ...prevData]);
            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as UomMasterData;
            setUomMasterList(prevData =>
              prevData.map(item =>
                item.UomMasterId === formData.UomMasterId
                  ? updatedRecord
                  : item
              )
            )
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setEditingUomMasterData(null);
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
      Number(formData.UomMasterId) === 0 ? 'Add UOM' : 'Update UOM'
    )
  };
  //#endregion

  //#region DELETE UOM MASTER
  const handleDeleteUomMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteUomMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteUomMasterRequest = {
          UomMasterId: deleteUomMasterDetailsData.UomMasterId,
          Uniquekey: deleteUomMasterDetailsData.UniqueKey
        }

        const response = await uomMasterService.apiCallDeleteUomMaster(params);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;
          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;
          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (uomMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadUoms(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteUomMasterDetailsData(null);

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
      'Delete UOM'
    )
  }
  //#endregion

  return {
    uomMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewUomMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingUomMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    deleteUomMasterDetailsData,
    isShowCustomizeUomMasterColumnsModal,
    canAction,
    canExport,
    uomMasterColumns,
    visibleUomMasterColumns,
    selectedUomMasterColumnKeys,
    requiredUomMasterColumnKeys,
    allUomMasterColumnKeys,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewUomMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setFilters,
    setErrors,
    setEditingUomMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteUomMasterDetailsData,
    setIsShowCustomizeUomMasterColumnsModal,
    setSelectedUomMasterColumnKeys,

    // Actions
    fetchUomList,
    handlePageChange,
    handleSortColumn,
    handleViewUomDetails,
    handleEditUomMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddUomModal,
    handleAddUpdateUomMaster,
    handleDeleteUomMaster,
    handleExportUomExcel,
    handleExportUomPdf,
    debouncedSearch,
    clearsearchUoms,
  }
}
