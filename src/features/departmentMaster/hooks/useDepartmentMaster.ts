import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import type { FilterInfo, SortInfo, TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type { AddUpdateDepartmentMasterRequest, DeleteDepartmentMasterRequest, DepartmentMasterData, FilterWithPaginationDepartmentMasterRequest } from '@/features/departmentMaster/models/DepartmentMasterModel';
import { departmentMasterService } from '@/features/departmentMaster/services/DepartmentMasterService'
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { updateFilter } from '@/core/utils/filterHelper';
import type { FilterPullExcelSample } from '@/features/technical/models/TechnicalModel';
import { technicalService } from '@/features/technical/services/TechnicalService';
import { handleExportFile } from '@/core/utils/exportFile';
import { getInitialFormState, getDepartmentMasterColumns, REQUIRED_COLUMN_KEYS } from '@/features/departmentMaster/constants/departmentMasterConstants';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';

export const useDepartmentMaster = () => {

  //#region STATE MANAGEMENT
  const [departmentMasterList, setDepartmentMasterList] = useState<DepartmentMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchDepartments(value)
  }, 350)
  const [viewDepartmentMasterDetailsData, setViewDepartmentMasterDetailsData] = useState<DepartmentMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT DEPARTMENT MASTER
  const [editingDepartmentMasterData, setEditingDepartmentMasterData] = useState<DepartmentMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE DEPARTMENT MASTER
  const [formData, setFormData] = useState<AddUpdateDepartmentMasterRequest>(() => getInitialFormState());

  //DELETE DEPARTMENT MASTER STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteDepartmentMasterDetailsData, setDeleteDepartmentMasterDetailsData] = useState<DepartmentMasterData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeDepartmentMasterColumnsModal, setIsShowCustomizeDepartmentMasterColumnsModal] = useState(false);

  //EXCEL IMPORT 
  const [showImportModal, setShowImportModal] = useState(false);

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION

  const hasFetchedInitialDepartments = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialDepartments.current) return
    hasFetchedInitialDepartments.current = true;
    fetchDepartmentList()
  }, [])

 
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingDepartmentMasterData) {
        setFormData({
          DepartmentMasterId: editingDepartmentMasterData.DepartmentMasterId,
          Uniquekey: editingDepartmentMasterData.Uniquekey || getInitialFormState().Uniquekey,
          DepartmentCode: editingDepartmentMasterData.DepartmentCode || '',
          DepartmentName: editingDepartmentMasterData.DepartmentName || ''
        });
      } else {
        setFormData(getInitialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingDepartmentMasterData]);

  //#endregion

  //#region TABLE COLUMN DEFINITION (moved earlier for use in loadDepartments)

  const departmentMasterColumns = useMemo<TableColumn[]>(
    () => getDepartmentMasterColumns(),
    []
  )
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchDepartmentList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadDepartments(page, filters, sort ?? sortInfo);
  }

  const loadDepartments = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationDepartmentMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          DepartmentMasterId: filterParams.DepartmentMasterId ? Number(filterParams.DepartmentMasterId) : 0,
          DepartmentName: searchtext ?? filterParams.DepartmentName ?? undefined,
          SortBy: getSortByParam(sortInfo ?? null, departmentMasterColumns)
        }

        const response = await departmentMasterService.apiCallPullDepartmentMaster(params);

        if (E.isRight(response)) {

          setDepartmentMasterList(response.right.Data);

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
      'Loading Department'
    )
  }
  //#endregion

  //#region SEARCH DEPARTMENT 
  const searchDepartments = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchDepartmentList();

      return
    }

    await loadDepartments(1, filters, sortInfo, searchValue)
  }
  //#endregion

  //#region CLEAR SEARCH DEPARTMENT 
  const clearsearchDepartments = () => {

    debouncedSearch.cancel?.();

    setSearchTerm('');

    loadDepartments(1, { DepartmentName: '' }, sortInfo, undefined);
  };

  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportDepartments = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationDepartmentMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          DepartmentName: filters.DepartmentName?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, departmentMasterColumns),
          ExportType: exportType
        }

        const response = await departmentMasterService.apiCallPullDepartmentMaster(params);
        handleExportFile(response, exportType, 'Department Master', addToast)
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

  const handleExportDepartmentExcel = () => handleExportDepartments('Excel')
  const handleExportDepartmentPdf = () => handleExportDepartments('PDF')
  //#endregion

  //#region HANDLE PAGE CHANGE EVENT
  const handlePageChange = (page: number) => {
    fetchDepartmentList(page);
  };
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {

    setSortInfo(sort);

    loadDepartments(1, filters, sort, searchTerm || undefined);

  }, [filters, searchTerm]);

  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS
  const requiredDepartmentMasterColumnKeys: string[] = REQUIRED_COLUMN_KEYS;

  const allDepartmentMasterColumnKeys: string[] = departmentMasterColumns.map(c => c.key)

  const [selectedDepartmentMasterColumnKeys, setSelectedDepartmentMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getDepartmentMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredDepartmentMasterColumnKeys]));
        return withRequired.filter(k => allDepartmentMasterColumnKeys.includes(k));
      }
    } catch { }
    return allDepartmentMasterColumnKeys
  })

  useEffect(() => {

    setSelectedDepartmentMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredDepartmentMasterColumnKeys])).filter(k => allDepartmentMasterColumnKeys.includes(k)));

  }, [departmentMasterColumns.length])

  const visibleDepartmentMasterColumns = useMemo(
    () => departmentMasterColumns.filter(col => selectedDepartmentMasterColumnKeys.includes(col.key)),
    [departmentMasterColumns, selectedDepartmentMasterColumnKeys]
  )
  //#endregion

  //#region VIEW EDIT
  const handleViewDepartmentDetails = useCallback((row: DepartmentMasterData) => {

    setViewDepartmentMasterDetailsData(row);

    setIsViewModalOpen(true);

  }, [])
  //#endregion

  //#region EDIT DEPARTMENT MASTER
  const handleEditDepartmentMaster = useCallback((row: DepartmentMasterData) => {
    setEditingDepartmentMasterData({
      ...row,
      DepartmentCode: row.DepartmentCode || '',
      DepartmentName: row.DepartmentName || ''
    })
    setIsAddUpdateModalOpen(true);
  }, [])
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: DepartmentMasterData) => {
    setDeleteDepartmentMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadDepartments(1, tempFilters)
    setShowFilterPopup(false)
  }
  //#endregion

  //#region Clear 
  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadDepartments(1, {})
    setShowFilterPopup(false)
  }
  //#endregion

  //#region HANDLE FILTER CHANGE
  const handleFilterChange = (key: string, value: string) => {

    setTempFilters(prev => updateFilter(prev, key, value));

  };
  //#endregion

  //#region ADD UPDATE EDIT DEPARTMENT MASTER
  const handleFieldChange = (field: keyof AddUpdateDepartmentMasterRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddDepartmentModal = () => {
    setEditingDepartmentMasterData(null);
    setFormData(getInitialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  const validateAddDepartmentMasterForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (formData.DepartmentCode.trim() === "") {
      newErrors.DepartmentCode = "Department Code is required";
    } else if (formData.DepartmentCode.trim().length >= 5) {
      newErrors.DepartmentCode = "Department Code must be at least 4 characters long";
    }

    if (formData.DepartmentName.trim() === "") {
      newErrors.DepartmentName = "Department Name is required"
    }
    else if (formData.DepartmentName.length < 3) {
      newErrors.DepartmentName = "Department Name must be at least 3 characters long"
    }


    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushDepartmentMasterFormData = (): AddUpdateDepartmentMasterRequest => {
    return {
      DepartmentMasterId: formData.DepartmentMasterId,
      Uniquekey: formData.Uniquekey,
      DepartmentCode: formData.DepartmentCode,
      DepartmentName: formData.DepartmentName
    };
  };

  const handleAddUpdateDepartmentMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddDepartmentMasterForm()

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const payload = PushDepartmentMasterFormData();

        const response = await departmentMasterService.apiCallAddUpdateDepartmentMaster(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.DepartmentMasterId === 0;

          if (isAdd) {

            const newRecord = response.right.Data[0] as DepartmentMasterData

            setDepartmentMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          } else {

            const updatedRecord = response.right.Data[0] as DepartmentMasterData;

            setDepartmentMasterList(prevData =>
              prevData.map(item =>
                item.DepartmentMasterId === formData.DepartmentMasterId
                  ? updatedRecord
                  : item
              )
            )
            
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setEditingDepartmentMasterData(null);
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
      Number(formData.DepartmentMasterId) === 0 ? 'Add Department' : 'Update Department'
    )
  };
  //#endregion

  //#region IMPORT EXCEL | DOWNLOAD
  const downloadExcelSampleDepartmentMaster = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterPullExcelSample = {
          TableName: 'DEPARTMENT MASTER'
        }

        const response = await technicalService.apiCallPullExcelSample(params);

        handleExportFile(response, 'Excel', 'Department Master', addToast, 'Sample file download successfully')
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

  const handleDownloadExcelSampleDepartmentMaster = () => downloadExcelSampleDepartmentMaster()

  const uploadExcel = async (file: File, mergeExisting: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const fd = new FormData();

        fd.append("ExcelFile", file);
        fd.append("IsAllDelete", mergeExisting);
        fd.append("TableName", 'DEPARTMENT MASTER');

        const response = await technicalService.apiCallExcelImport(fd);

        if (E.isRight(response)) {

          addToast({ type: 'success', title: "Excel imported sucessfully" });

          fetchDepartmentList();

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

  //#region DELETE DEPARTMENT MASTER
  const handleDeleteDepartmentMaster = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteDepartmentMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: DeleteDepartmentMasterRequest = {
          DepartmentMasterId: deleteDepartmentMasterDetailsData.DepartmentMasterId,
          UniqueKey: deleteDepartmentMasterDetailsData.Uniquekey
        }

        const response = await departmentMasterService.apiCallDeleteDepartmentMaster(params);

        if (E.isRight(response)) {

          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          }

          else if (departmentMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadDepartments(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteDepartmentMasterDetailsData(null);

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
      'Delete Department'
    )
  }
  //#endregion

  return {
    departmentMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewDepartmentMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingDepartmentMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    deleteDepartmentMasterDetailsData,
    isShowCustomizeDepartmentMasterColumnsModal,
    showImportModal,
    canAction,
    canExport,
    departmentMasterColumns,
    visibleDepartmentMasterColumns,
    selectedDepartmentMasterColumnKeys,
    requiredDepartmentMasterColumnKeys,
    allDepartmentMasterColumnKeys,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewDepartmentMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setFilters,
    setErrors,
    setEditingDepartmentMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteDepartmentMasterDetailsData,
    setIsShowCustomizeDepartmentMasterColumnsModal,
    setShowImportModal,
    setSelectedDepartmentMasterColumnKeys,

    // Actions
    fetchDepartmentList,
    handlePageChange,
    handleSortColumn,
    handleViewDepartmentDetails,
    handleEditDepartmentMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddDepartmentModal,
    handleAddUpdateDepartmentMaster,
    handleDeleteDepartmentMaster,
    handleExportDepartmentExcel,
    handleExportDepartmentPdf,
    handleDownloadExcelSampleDepartmentMaster,
    uploadExcel,
    debouncedSearch,
    clearsearchDepartments,
  }
}
