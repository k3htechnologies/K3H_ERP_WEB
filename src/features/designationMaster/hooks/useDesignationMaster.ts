import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import type { FilterInfo, SortInfo, TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateDesignationMasterRequest,
  DeleteDesignationMasterRequest,
  DesignationMasterData,
  FilterWithPaginationDesignationMasterRequest
} from '@/features/designationMaster/models/DesignationMasterModel';
import { designationMasterService } from '@/features/designationMaster/services/DesignationMasterService';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { updateFilter } from '@/core/utils/filterHelper';
import type { FilterPullExcelSample } from '@/features/technical/models/TechnicalModel';
import { technicalService } from '@/features/technical/services/TechnicalService';
import { handleExportFile } from '@/core/utils/exportFile';
import { getInitialFormState, getDesignationMasterColumns, REQUIRED_COLUMN_KEYS } from '@/features/designationMaster/constants/designationMasterConstants';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';

export const useDesignationMaster = () => {

  //#region STATE MANAGEMENT
  const [designationMasterList, setDesignationMasterList] = useState<DesignationMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchDesignationMaster(value)
  }, 350)
  const [viewDesignationMasterDetailsData, setViewDesignationMasterDetailsData] = useState<DesignationMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT DESIGNATION MASTER
  const [editingDesignationMasterData, setEditingDesignationMasterData] = useState<DesignationMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE DESIGNATION MASTER
  const [formData, setFormData] = useState<AddUpdateDesignationMasterRequest>(() => getInitialFormState());

  //DELETE DESIGNATION MASTER STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteDesignationMasterDetailsData, setDeleteDesignationMasterDetailsData] = useState<DesignationMasterData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeDesignationMasterColumnsModal, setIsShowCustomizeDesignationMasterColumnsModal] = useState(false);

  //EXCEL IMPORT 
  const [showImportModal, setShowImportModal] = useState(false);

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION

  const hasFetchedInitialDesignations = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialDesignations.current) return
    hasFetchedInitialDesignations.current = true;
    fetchDesignationMasterList()
  }, [])

  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingDesignationMasterData) {
        setFormData({
          DesignationMasterId: editingDesignationMasterData.DesignationMasterId,
          Uniquekey: editingDesignationMasterData.Uniquekey || getInitialFormState().Uniquekey,
          DesignationName: editingDesignationMasterData.DesignationName || '',
          NoticePeriod: editingDesignationMasterData.NoticePeriod || 0
        });
      } else {
        setFormData(getInitialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingDesignationMasterData]);

  //#endregion

  //#region TABLE COLUMN DEFINITION

  const designationMasterColumns = useMemo<TableColumn[]>(
    () => getDesignationMasterColumns(),
    []
  )
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchDesignationMasterList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadDesignationMaster(page, filters, sort ?? sortInfo);
  }

  const loadDesignationMaster = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationDesignationMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          DesignationMasterId: filterParams.DesignationMasterId ? Number(filterParams.DesignationMasterId) : 0,
          DesignationName: searchtext ?? filterParams.DesignationName ?? undefined,
          SortBy: getSortByParam(sortInfo ?? null, designationMasterColumns)
        }

        const response = await designationMasterService.apiCallPullDesignationMaster(params);

        if (E.isRight(response)) {
          setDesignationMasterList(response.right.Data);
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
      'Loading Designation'
    )
  }
  //#endregion

  //#region SEARCH DESIGNATION MASTER 
  const searchDesignationMaster = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchDesignationMasterList();
      return
    }
    await loadDesignationMaster(1, filters, sortInfo, searchValue)
  }
  //#endregion

  //#region CLEAR SEARCH DESIGNATION 
  const clearsearchDesignationMaster = () => {

    debouncedSearch.cancel?.();

    setSearchTerm('');

    loadDesignationMaster(1, { DesignationName: '' }, sortInfo, undefined);

  }
  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportDesignationMaster = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationDesignationMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          DesignationName: filters.DesignationName?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, designationMasterColumns),
          ExportType: exportType
        }

        const response = await designationMasterService.apiCallPullDesignationMaster(params);
        handleExportFile(response, exportType, 'Designation Master', addToast)
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

  const handleExportDesignationExcel = () => handleExportDesignationMaster('Excel')
  const handleExportDesignationPdf = () => handleExportDesignationMaster('PDF')
  //#endregion

  //#region HANDLE PAGE CHANGE EVENT
  const handlePageChange = (page: number) => {
    fetchDesignationMasterList(page);
  };
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {

    setSortInfo(sort);

    loadDesignationMaster(1, filters, sort, searchTerm || undefined);

  }, [filters, searchTerm]);
  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS
  const requiredDesignationMasterColumnKeys: string[] = REQUIRED_COLUMN_KEYS;

  const allDesignationMasterColumnKeys: string[] = designationMasterColumns.map(c => c.key)

  const [selectedDesignationMasterColumnKeys, setSelectedDesignationMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getDesignationMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredDesignationMasterColumnKeys]));
        return withRequired.filter(k => allDesignationMasterColumnKeys.includes(k));
      }
    } catch { }
    return allDesignationMasterColumnKeys
  })

  useEffect(() => {
    setSelectedDesignationMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredDesignationMasterColumnKeys])).filter(k => allDesignationMasterColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designationMasterColumns.length])

  const visibleDesignationMasterColumns = useMemo(
    () => designationMasterColumns.filter(col => selectedDesignationMasterColumnKeys.includes(col.key)),
    [designationMasterColumns, selectedDesignationMasterColumnKeys]
  )
  //#endregion

  //#region VIEW EDIT
  const handleViewDesignationDetails = useCallback((row: DesignationMasterData) => {
    setViewDesignationMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])
  //#endregion

  //#region EDIT DESIGNATION MASTER
  const handleEditDesignationMaster = useCallback((row: DesignationMasterData) => {
    setEditingDesignationMasterData({
      ...row,
      NoticePeriod: row.NoticePeriod ?? 0,
      DesignationName: row.DesignationName ?? ''
    })
    setIsAddUpdateModalOpen(true)
  }, [])
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: DesignationMasterData) => {
    setDeleteDesignationMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadDesignationMaster(1, tempFilters)
    setShowFilterPopup(false)
  }
  //#endregion

  //#region Clear 
  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadDesignationMaster(1, {})
  }
  //#endregion

  //#region HANDLE FILTER CHANGE
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };
  //#endregion

  //#region ADD UPDATE EDIT DESIGNATION MASTER
  const handleFieldChange = (field: keyof AddUpdateDesignationMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddDesignationModal = () => {
    setEditingDesignationMasterData(null);
    setFormData(getInitialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  const validateAddDesignationMasterForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (formData.DesignationName.trim() === "") {
      newErrors.DesignationName = "Designation Name is required"
    }
    else if (formData.DesignationName.length < 3) {
      newErrors.DesignationName = "Designation Name must be at least 3 characters long"
    }

    if (!formData.NoticePeriod || Number(formData.NoticePeriod) <= 0) {
      newErrors.NoticePeriod = "Notice Period is required";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushDesignationMasterFormData = (): AddUpdateDesignationMasterRequest => {
    return {
      DesignationMasterId: formData.DesignationMasterId,
      Uniquekey: formData.Uniquekey,
      DesignationName: (formData.DesignationName || '').trim(),
      NoticePeriod: Number(formData.NoticePeriod) || 0
    };
  };

  const handleAddUpdateDesignationMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddDesignationMasterForm()

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushDesignationMasterFormData();
        const response = await designationMasterService.apiCallAddUpdateDesignationMaster(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          const isAdd = formData.DesignationMasterId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as DesignationMasterData
            setDesignationMasterList(prevData => [newRecord, ...prevData]);
            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as DesignationMasterData;
            setDesignationMasterList(prevData =>
              prevData.map(item =>
                item.DesignationMasterId === formData.DesignationMasterId
                  ? updatedRecord
                  : item
              )
            )
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setEditingDesignationMasterData(null);
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
      Number(formData.DesignationMasterId) === 0 ? 'Add Designation' : 'Update Designation'
    )
  };
  //#endregion

  //#region IMPORT EXCEL | DOWNLOAD
  const downloadExcelSampleDesignationMaster = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterPullExcelSample = {
          TableName: 'DESIGNATION MASTER'
        }

        const response = await technicalService.apiCallPullExcelSample(params);
        handleExportFile(response, 'Excel', 'Designation Master', addToast, 'Sample file download successfully')
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

  const handleDownloadExcelSampleDesignationMaster = () => downloadExcelSampleDesignationMaster()

  const uploadExcel = async (file: File, mergeExisting: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const fd = new FormData();
        fd.append("ExcelFile", file);
        fd.append("IsAllDelete", mergeExisting);
        fd.append("TableName", 'DESIGNATION MASTER');

        const response = await technicalService.apiCallExcelImport(fd);

        if (E.isRight(response)) {
          addToast({ type: 'success', title: "Excel imported sucessfully" })
          fetchDesignationMasterList();
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

  //#region DELETE DESIGNATION MASTER
  const handleDeleteDesignationMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteDesignationMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteDesignationMasterRequest = {
          DesignationMasterId: deleteDesignationMasterDetailsData.DesignationMasterId,
          UniqueKey: deleteDesignationMasterDetailsData.Uniquekey
        }

        const response = await designationMasterService.apiCallDeleteDesignationMaster(params);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;
          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          }

          else if (designationMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadDesignationMaster(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);
          setDeleteDesignationMasterDetailsData(null);
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
      'Delete Designation'
    )
  }
  //#endregion

  return {
    designationMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewDesignationMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingDesignationMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    deleteDesignationMasterDetailsData,
    isShowCustomizeDesignationMasterColumnsModal,
    showImportModal,
    canAction,
    canExport,
    designationMasterColumns,
    visibleDesignationMasterColumns,
    selectedDesignationMasterColumnKeys,
    requiredDesignationMasterColumnKeys,
    allDesignationMasterColumnKeys,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewDesignationMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setFilters,
    setErrors,
    setEditingDesignationMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteDesignationMasterDetailsData,
    setIsShowCustomizeDesignationMasterColumnsModal,
    setShowImportModal,
    setSelectedDesignationMasterColumnKeys,

    // Actions
    fetchDesignationMasterList,
    handlePageChange,
    handleSortColumn,
    handleViewDesignationDetails,
    handleEditDesignationMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddDesignationModal,
    handleAddUpdateDesignationMaster,
    handleDeleteDesignationMaster,
    handleExportDesignationExcel,
    handleExportDesignationPdf,
    handleDownloadExcelSampleDesignationMaster,
    uploadExcel,
    debouncedSearch,
    clearsearchDesignationMaster,
  }
}
