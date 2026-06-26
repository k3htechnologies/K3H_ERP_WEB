import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import type { FilterInfo, SortInfo, TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateMaterialMasterRequest,
  DeleteMaterialMasterRequest,
  MaterialMasterData,
  FilterWithPaginationMaterialMaster
} from '@/features/materialMaster/models/MaterialMasterModel';
import { materialMasterService } from '@/features/materialMaster/services/MaterialMasterService';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { updateFilter } from '@/core/utils/filterHelper';
import type { FilterPullExcelSample } from '@/features/technical/models/TechnicalModel';
import { technicalService } from '@/features/technical/services/TechnicalService';
import { handleExportFile } from '@/core/utils/exportFile';
import { getInitialFormState, getMaterialMasterColumns, REQUIRED_COLUMN_KEYS } from '@/features/materialMaster/constants/materialMasterConstants';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';

export const useMaterialMaster = () => {
  //#region STATE MANAGEMENT
  const [materialMasterList, setMaterialMasterList] = useState<MaterialMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchMaterials(value)
  }, 350)
  const [viewMaterialMasterDetailsData, setViewMaterialMasterDetailsData] = useState<MaterialMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT MATERIAL MASTER
  const [editingMaterialMasterData, setEditingMaterialMasterData] = useState<MaterialMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE MATERIAL MASTER
  const [formData, setFormData] = useState<AddUpdateMaterialMasterRequest>(() => getInitialFormState());

  //DELETE MATERIAL MASTER STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteMaterialMasterDetailsData, setDeleteMaterialMasterDetailsData] = useState<MaterialMasterData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeMaterialMasterColumnsModal, setIsShowCustomizeMaterialMasterColumnsModal] = useState(false);

  //EXCEL IMPORT 
  const [showImportModal, setShowImportModal] = useState(false);

  
  const { canAction, canExport } = useMenuPermissions();
  

  const hasFetchedInitialMaterials = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialMaterials.current) return
    hasFetchedInitialMaterials.current = true;
    fetchMaterialList()
  }, [])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingMaterialMasterData) {
        setFormData({
          MaterialMasterId: editingMaterialMasterData.MaterialMasterId,
          Uniquekey: editingMaterialMasterData.Uniquekey || getInitialFormState().Uniquekey,
          MaterialCode: editingMaterialMasterData.MaterialCode?.toString() || '',
          MaterialName: editingMaterialMasterData.MaterialName || ''
        });
      } else {
        setFormData(getInitialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingMaterialMasterData]);

 

  const materialMasterColumns = useMemo<TableColumn[]>(
    () => getMaterialMasterColumns(),
    []
  )
  

  const fetchMaterialList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadMaterials(page, filters, sort ?? sortInfo);
  }

  const loadMaterials = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationMaterialMaster = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          MaterialMasterId: filterParams.MaterialMasterId ? Number(filterParams.MaterialMasterId) : 0,
          MaterialName: searchtext ?? filterParams.MaterialName ?? undefined,
          SortBy: getSortByParam(sortInfo ?? null, materialMasterColumns)
        }

        const response = await materialMasterService.apiCallPullMaterialMaster(params);

        if (E.isRight(response)) {
          setMaterialMasterList(response.right.Data);
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
      'Loading Material'
    )
  }
  
  const searchMaterials = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchMaterialList();
      return
    }

    await loadMaterials(1, filters, sortInfo, searchValue)
  }
  
  const clearsearchMaterials = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    loadMaterials(1, { MaterialName: '' }, sortInfo, undefined);
  }
  
  const handleExportMaterials = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationMaterialMaster = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          MaterialName: filters.MaterialName?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, materialMasterColumns),
          ExportType: exportType
        }

        const response = await materialMasterService.apiCallPullMaterialMaster(params);
        handleExportFile(response, exportType, 'Material Master', addToast)
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

  const handleExportMaterialExcel = () => handleExportMaterials('Excel')
  const handleExportMaterialPdf = () => handleExportMaterials('PDF')
 
  const handlePageChange = useCallback((page: number) => {
    loadMaterials(page, filters, sortInfo, searchTerm || undefined);
  }, [sortInfo, searchTerm]);
  
  const handleSortColumn = useCallback((sort: SortInfo) => {

    setSortInfo(sort);

    loadMaterials(1, filters, sort, searchTerm || undefined);

  }, [filters, searchTerm]);

  
  const requiredMaterialMasterColumnKeys: string[] = REQUIRED_COLUMN_KEYS;

  const allMaterialMasterColumnKeys: string[] = materialMasterColumns.map(c => c.key)

  const [selectedMaterialMasterColumnKeys, setSelectedMaterialMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getMaterialMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredMaterialMasterColumnKeys]));
        return withRequired.filter(k => allMaterialMasterColumnKeys.includes(k));
      }
    } catch { }
    return allMaterialMasterColumnKeys
  })

  useEffect(() => {
    setSelectedMaterialMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredMaterialMasterColumnKeys])).filter(k => allMaterialMasterColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialMasterColumns.length])

  const visibleMaterialMasterColumns = useMemo(
    () => materialMasterColumns.filter(col => selectedMaterialMasterColumnKeys.includes(col.key)),
    [materialMasterColumns, selectedMaterialMasterColumnKeys]
  )
  //#endregion

  //#region VIEW EDIT
  const handleViewMaterialDetails = useCallback((row: MaterialMasterData) => {
    setViewMaterialMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])
  //#endregion

  //#region EDIT MATERIAL MASTER
  const handleEditMaterialMaster = useCallback((row: MaterialMasterData) => {
    setEditingMaterialMasterData({
      ...row,
      MaterialCode: row.MaterialCode || '',
      MaterialName: row.MaterialName || ''
    })
    setIsAddUpdateModalOpen(true);
  }, [])
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: MaterialMasterData) => {
    setDeleteMaterialMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadMaterials(1, tempFilters)
    setShowFilterPopup(false)
  }
  //#endregion

  //#region Clear 
  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadMaterials(1, {})
    setShowFilterPopup(false)
  }
  //#endregion

  //#region HANDLE FILTER CHANGE
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };
  //#endregion

  //#region ADD UPDATE EDIT MATERIAL MASTER
  const handleFieldChange = (field: keyof AddUpdateMaterialMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddMaterialModal = () => {
    setEditingMaterialMasterData(null);
    setFormData(getInitialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  const validateAddMaterialMasterForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (formData.MaterialName.trim() === "") {
      newErrors.MaterialName = "Material Name is required"
    }
    else if (formData.MaterialName.length < 3) {
      newErrors.MaterialName = "Material Name must be at least 3 characters long"
    }

    if (formData.MaterialCode.trim() === "") {
      newErrors.MaterialCode = "Material Code is required";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushMaterialMasterFormData = (): AddUpdateMaterialMasterRequest => {
    return {
      MaterialMasterId: formData.MaterialMasterId,
      Uniquekey: formData.Uniquekey,
      MaterialCode: formData.MaterialCode,
      MaterialName: formData.MaterialName
    };
  };

  const handleAddUpdateMaterialMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddMaterialMasterForm()

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushMaterialMasterFormData();
        const response = await materialMasterService.apiCallToAddUpdateMaterialMaster(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          const isAdd = formData.MaterialMasterId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as MaterialMasterData
            setMaterialMasterList(prevData => [newRecord, ...prevData]);
            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as MaterialMasterData;
            setMaterialMasterList(prevData =>
              prevData.map(item =>
                item.MaterialMasterId === formData.MaterialMasterId
                  ? updatedRecord
                  : item
              )
            )
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setEditingMaterialMasterData(null);
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
      Number(formData.MaterialMasterId) === 0 ? 'Add Material' : 'Update Material'
    )
  };
  //#endregion

  //#region IMPORT EXCEL | DOWNLOAD
  const downloadExcelSampleMaterialMaster = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterPullExcelSample = {
          TableName: 'MATERIAL MASTER'
        }

        const response = await technicalService.apiCallPullExcelSample(params);
        handleExportFile(response, 'Excel', 'Material Master', addToast, 'Sample file download successfully')
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

  const handleDownloadExcelSampleMaterialMaster = () => downloadExcelSampleMaterialMaster()

  const uploadExcel = async (file: File, mergeExisting: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const fd = new FormData();
        fd.append("ExcelFile", file);
        fd.append("IsAllDelete", mergeExisting);
        fd.append("TableName", 'MATERIAL MASTER');

        const response = await technicalService.apiCallExcelImport(fd);

        if (E.isRight(response)) {
          addToast({ type: 'success', title: "Excel imported sucessfully" })
          fetchMaterialList();
        } else {
          addToast({ type: "error", title: response.left.message });
        }

        return response;
      },
      undefined,
      (err: any) => addToast({ type: "error", title: err.message }),
      undefined,
      "Importing Excel"
    );
  };
  //#endregion

  //#region DELETE MATERIAL MASTER
  const handleDeleteMaterialMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteMaterialMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteMaterialMasterRequest = {
          MaterialMasterId: deleteMaterialMasterDetailsData.MaterialMasterId,
          Uniquekey: deleteMaterialMasterDetailsData.Uniquekey
        }

        const response = await materialMasterService.apiCallDeleteMaterialMaster(params);

        if (E.isRight(response)) {

          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          }

          else if (materialMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadMaterials(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteMaterialMasterDetailsData(null);

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
      'Delete Material'
    )
  }
  //#endregion

  return {
    materialMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewMaterialMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingMaterialMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    deleteMaterialMasterDetailsData,
    isShowCustomizeMaterialMasterColumnsModal,
    showImportModal,
    canAction,
    canExport,
    materialMasterColumns,
    visibleMaterialMasterColumns,
    selectedMaterialMasterColumnKeys,
    requiredMaterialMasterColumnKeys,
    allMaterialMasterColumnKeys,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewMaterialMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setFilters,
    setErrors,
    setEditingMaterialMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteMaterialMasterDetailsData,
    setIsShowCustomizeMaterialMasterColumnsModal,
    setShowImportModal,
    setSelectedMaterialMasterColumnKeys,

    // Actions
    fetchMaterialList,
    handlePageChange,
    handleSortColumn,
    handleViewMaterialDetails,
    handleEditMaterialMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddMaterialModal,
    handleAddUpdateMaterialMaster,
    handleDeleteMaterialMaster,
    handleExportMaterialExcel,
    handleExportMaterialPdf,
    handleDownloadExcelSampleMaterialMaster,
    uploadExcel,
    debouncedSearch,
    clearsearchMaterials,
  }
}
