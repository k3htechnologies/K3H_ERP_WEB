import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import type { FilterInfo, SortInfo, TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateSubMaterialMasterRequest,
  DeleteSubMaterialMasterRequest,
  SubMaterialMasterData,
  FilterWithPaginationSubMaterialMaster
} from '@/features/subMaterialMaster/models/SubMaterialMasterModel';
import { subMaterialMasterService } from '@/features/subMaterialMaster/services/SubMaterialMasterService';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { updateFilter } from '@/core/utils/filterHelper';
import type { FilterPullExcelSample } from '@/features/technical/models/TechnicalModel';
import { technicalService } from '@/features/technical/services/TechnicalService';
import { handleExportFile } from '@/core/utils/exportFile';
import { getInitialFormState, getSubMaterialMasterColumns, REQUIRED_COLUMN_KEYS } from '@/features/subMaterialMaster/constants/subMaterialMasterConstants';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';

export const useSubMaterialMaster = () => {
  //#region STATE MANAGEMENT
  const [subMaterialMasterList, setSubMaterialMasterList] = useState<SubMaterialMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchSubMaterials(value)
  }, 350)
  const [viewSubMaterialMasterDetailsData, setViewSubMaterialMasterDetailsData] = useState<SubMaterialMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT SUB MATERIAL MASTER
  const [editingSubMaterialMasterData, setEditingSubMaterialMasterData] = useState<SubMaterialMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE SUB MATERIAL MASTER
  const [formData, setFormData] = useState<AddUpdateSubMaterialMasterRequest>(() => getInitialFormState());

  //DELETE SUB MATERIAL MASTER STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteSubMaterialMasterDetailsData, setDeleteSubMaterialMasterDetailsData] = useState<SubMaterialMasterData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeSubMaterialMasterColumnsModal, setIsShowCustomizeSubMaterialMasterColumnsModal] = useState(false);

  //EXCEL IMPORT 
  const [showImportModal, setShowImportModal] = useState(false);

  //DROPDOWN STATES
  const [dropdownLabels, setDropdownLabels] = useState<{
    materialName?: string;
    uom?: string;
  }>({});
  const [dropdownResetKey, setDropdownResetKey] = useState(0);

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION

  const hasFetchedInitialSubMaterials = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialSubMaterials.current) return
    hasFetchedInitialSubMaterials.current = true;
    fetchSubMaterialList()
  }, [])

  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingSubMaterialMasterData) {
        setFormData({
          SubMaterialMasterId: editingSubMaterialMasterData.SubMaterialMasterId,
          Uniquekey: editingSubMaterialMasterData.Uniquekey || getInitialFormState().Uniquekey,
          MaterialMasterId: editingSubMaterialMasterData.MaterialMasterId || 0,
          SubMaterialName: editingSubMaterialMasterData.SubMaterialName || '',
          UomMasterId: editingSubMaterialMasterData.UomMasterId || 0
        });

        setDropdownLabels({
          materialName: editingSubMaterialMasterData.MaterialName || "",
          uom: editingSubMaterialMasterData.UomCode || ""
        });
      } else {
        setFormData(getInitialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingSubMaterialMasterData]);

  //#endregion

  //#region TABLE COLUMN DEFINITION

  const subMaterialMasterColumns = useMemo<TableColumn[]>(
    () => getSubMaterialMasterColumns(),
    []
  )
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchSubMaterialList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadSubMaterials(page, filters, sort ?? sortInfo);
  }

  const loadSubMaterials = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationSubMaterialMaster = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          SubMaterialMasterId: filterParams.SubMaterialMasterId ? Number(filterParams.SubMaterialMasterId) : 0,
          SubMaterialName: searchtext ?? filterParams.SubMaterialName ?? undefined,
          MaterialName: filterParams.MaterialName?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, subMaterialMasterColumns)
        }

        const response = await subMaterialMasterService.apiCallPullSubMaterialMaster(params);

        if (E.isRight(response)) {
          setSubMaterialMasterList(response.right.Data);
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
      'Loading Sub Material'
    )
  }
  //#endregion

  //#region SEARCH SUB MATERIAL 
  const searchSubMaterials = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchSubMaterialList();
      return
    }

    await loadSubMaterials(1, filters, sortInfo, searchValue)

  }
  //#endregion

  //#region CLEAR SEARCH SUB MATERIAL 
  const clearsearchSubMaterials = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    loadSubMaterials(1, { SubMaterialName: '' }, sortInfo, undefined);
  }
  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportSubMaterials = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationSubMaterialMaster = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          SubMaterialName: filters.SubMaterialName?.trim() || undefined,
          MaterialName: filters.MaterialName?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, subMaterialMasterColumns),
          ExportType: exportType
        }

        const response = await subMaterialMasterService.apiCallPullSubMaterialMaster(params);
        handleExportFile(response, exportType, 'Sub Material Master', addToast)
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

  const handleExportSubMaterialExcel = () => handleExportSubMaterials('Excel')
  const handleExportSubMaterialPdf = () => handleExportSubMaterials('PDF')
  //#endregion

  //#region HANDLE PAGE CHANGE EVENT
  const handlePageChange = (page: number) => {
    fetchSubMaterialList(page);
  };
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {

    setSortInfo(sort);

    loadSubMaterials(1, filters, sort, searchTerm || undefined);

  }, [filters, searchTerm]);
  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS
  const requiredSubMaterialMasterColumnKeys: string[] = REQUIRED_COLUMN_KEYS;

  const allSubMaterialMasterColumnKeys: string[] = subMaterialMasterColumns.map(c => c.key)

  const [selectedSubMaterialMasterColumnKeys, setSelectedSubMaterialMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getSubMaterialMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredSubMaterialMasterColumnKeys]));
        return withRequired.filter(k => allSubMaterialMasterColumnKeys.includes(k));
      }
    } catch { }
    return allSubMaterialMasterColumnKeys
  })

  useEffect(() => {
    setSelectedSubMaterialMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredSubMaterialMasterColumnKeys])).filter(k => allSubMaterialMasterColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subMaterialMasterColumns.length])

  const visibleSubMaterialMasterColumns = useMemo(
    () => subMaterialMasterColumns.filter(col => selectedSubMaterialMasterColumnKeys.includes(col.key)),
    [subMaterialMasterColumns, selectedSubMaterialMasterColumnKeys]
  )
  //#endregion

  //#region VIEW EDIT
  const handleViewSubMaterialDetails = useCallback((row: SubMaterialMasterData) => {
    setViewSubMaterialMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])
  //#endregion

  //#region EDIT SUB MATERIAL MASTER
  const handleEditSubMaterialMaster = useCallback((row: SubMaterialMasterData) => {
    setEditingSubMaterialMasterData({
      ...row,
      MaterialMasterId: row.MaterialMasterId || 0,
      SubMaterialName: row.SubMaterialName || '',
      UomMasterId: row.UomMasterId || 0
    })
    setIsAddUpdateModalOpen(true);
  }, [])
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: SubMaterialMasterData) => {
    setDeleteSubMaterialMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadSubMaterials(1, tempFilters)
    setShowFilterPopup(false)
  }
  //#endregion

  //#region Clear 
  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadSubMaterials(1, {})
    setShowFilterPopup(false)
  }
  //#endregion

  //#region HANDLE FILTER CHANGE
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };
  //#endregion

  //#region ADD UPDATE EDIT SUB MATERIAL MASTER
  const handleFieldChange = (field: keyof AddUpdateSubMaterialMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddSubMaterialModal = () => {
    setEditingSubMaterialMasterData(null);
    setFormData(getInitialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  const validateAddSubMaterialMasterForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (formData.SubMaterialName.trim() === "") {
      newErrors.SubMaterialName = "Sub Material Name is required"
    }
    else if (formData.SubMaterialName.length < 3) {
      newErrors.SubMaterialName = "Sub Material Name must be at least 3 characters long"
    }

    if (formData.MaterialMasterId === 0) {
      newErrors.MaterialMasterId = "Material is required";
    }

    if (formData.UomMasterId === 0) {
      newErrors.UomMasterId = "UOM is required";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushSubMaterialMasterFormData = (): AddUpdateSubMaterialMasterRequest => {
    return {
      SubMaterialMasterId: formData.SubMaterialMasterId,
      Uniquekey: formData.Uniquekey,
      MaterialMasterId: formData.MaterialMasterId,
      SubMaterialName: formData.SubMaterialName,
      UomMasterId: formData.UomMasterId
    };
  };

  const handleAddUpdateSubMaterialMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddSubMaterialMasterForm()

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushSubMaterialMasterFormData();
        const response = await subMaterialMasterService.apiCallAddUpdateSubMaterialMaster(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          const isAdd = formData.SubMaterialMasterId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as SubMaterialMasterData
            setSubMaterialMasterList(prevData => [newRecord, ...prevData]);
            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as SubMaterialMasterData;
            setSubMaterialMasterList(prevData =>
              prevData.map(item =>
                item.SubMaterialMasterId === formData.SubMaterialMasterId
                  ? updatedRecord
                  : item
              )
            )
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setEditingSubMaterialMasterData(null);
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
      Number(formData.SubMaterialMasterId) === 0 ? 'Add Sub Material' : 'Update Sub Material'
    )
  };
  //#endregion

  //#region IMPORT EXCEL | DOWNLOAD
  const downloadExcelSampleSubMaterialMaster = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterPullExcelSample = {
          TableName: 'SUB MATERIAL MASTER'
        }

        const response = await technicalService.apiCallPullExcelSample(params);
        handleExportFile(response, 'Excel', 'Sub Material Master', addToast, 'Sample file download successfully')
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

  const handleDownloadExcelSampleSubMaterialMaster = () => downloadExcelSampleSubMaterialMaster()

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
          fetchSubMaterialList();
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

  //#region DELETE SUB MATERIAL MASTER
  const handleDeleteSubMaterialMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteSubMaterialMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteSubMaterialMasterRequest = {
          SubMaterialMasterId: deleteSubMaterialMasterDetailsData.SubMaterialMasterId,
          Uniquekey: deleteSubMaterialMasterDetailsData.Uniquekey
        }

        const response = await subMaterialMasterService.apiCallDeleteSubMaterialMaster(params);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;
          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;
          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (subMaterialMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadSubMaterials(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          setIsConfirmationDialogBoxOpen(false);
          setDeleteSubMaterialMasterDetailsData(null);
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
      'Delete Sub Material'
    )
  }
  //#endregion

  return {
    subMaterialMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewSubMaterialMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingSubMaterialMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    deleteSubMaterialMasterDetailsData,
    isShowCustomizeSubMaterialMasterColumnsModal,
    showImportModal,
    canAction,
    canExport,
    subMaterialMasterColumns,
    visibleSubMaterialMasterColumns,
    selectedSubMaterialMasterColumnKeys,
    requiredSubMaterialMasterColumnKeys,
    allSubMaterialMasterColumnKeys,
    dropdownLabels,
    dropdownResetKey,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewSubMaterialMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setFilters,
    setErrors,
    setEditingSubMaterialMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteSubMaterialMasterDetailsData,
    setIsShowCustomizeSubMaterialMasterColumnsModal,
    setShowImportModal,
    setSelectedSubMaterialMasterColumnKeys,
    setDropdownLabels,
    setDropdownResetKey,

    // Actions
    fetchSubMaterialList,
    handlePageChange,
    handleSortColumn,
    handleViewSubMaterialDetails,
    handleEditSubMaterialMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddSubMaterialModal,
    handleAddUpdateSubMaterialMaster,
    handleDeleteSubMaterialMaster,
    handleExportSubMaterialExcel,
    handleExportSubMaterialPdf,
    handleDownloadExcelSampleSubMaterialMaster,
    uploadExcel,
    debouncedSearch,
    clearsearchSubMaterials,
  }
}
