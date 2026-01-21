import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import type { FilterInfo, SortInfo, TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateApprovalDocumentCategoryMasterRequest,
  DeleteApprovalDocumentCategoryMasterRequest,
  ApprovalDocumentCategoryMasterData,
  FilterWithPaginationApprovalDocumentCategoryMaster
} from '@/features/approvalDocumentCategory/models/ApprovalDocumentCategoryMasterModel';
import { approvalDocumentCategoryMasterService } from '@/features/approvalDocumentCategory/services/ApprovalDocumentCategoryMasterService';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { updateFilter } from '@/core/utils/filterHelper';
import type { FilterPullExcelSample } from '@/features/technical/models/TechnicalModel';
import { technicalService } from '@/features/technical/services/TechnicalService';
import { handleExportFile } from '@/core/utils/exportFile';
import { getInitialFormState, getApprovalDocumentCategoryMasterColumns, REQUIRED_COLUMN_KEYS } from '@/features/approvalDocumentCategory/constants/approvalDocumentCategoryMasterConstants';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { useProject } from '@/features/projectMaster/context/ProjectContext';

export const useApprovalDocumentCategoryMaster = () => {
  //#region STATE MANAGEMENT
  const [approvalDocumentCategoryMasterList, setApprovalDocumentCategoryMasterList] = useState<ApprovalDocumentCategoryMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchApprovalDocumentCategories(value);
  }, 350);
  const [viewApprovalDocumentCategoryMasterDetailsData, setViewApprovalDocumentCategoryMasterDetailsData] = useState<ApprovalDocumentCategoryMasterData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT APPROVAL DOCUMENT CATEGORY MASTER
  const [editingApprovalDocumentCategoryMasterData, setEditingApprovalDocumentCategoryMasterData] = useState<ApprovalDocumentCategoryMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE APPROVAL DOCUMENT CATEGORY MASTER
  const [formData, setFormData] = useState<AddUpdateApprovalDocumentCategoryMasterRequest>(() => getInitialFormState());

  //DELETE APPROVAL DOCUMENT CATEGORY MASTER STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deleteApprovalDocumentCategoryMasterDetailsData, setDeleteApprovalDocumentCategoryMasterDetailsData] = useState<ApprovalDocumentCategoryMasterData | null>(null);

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeApprovalDocumentCategoryMasterColumnsModal, setIsShowCustomizeApprovalDocumentCategoryMasterColumnsModal] = useState(false);

  //EXCEL IMPORT 
  const [showImportModal, setShowImportModal] = useState(false);
  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region PROJECT SELECTION GET ID
  const { projectId } = useProject();
  //#endregion

  //#region INITIALIZATION
  useEffect(() => {
    if (!projectId) return;
    fetchApprovalDocumentCategoryList();
  }, [projectId]);

  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingApprovalDocumentCategoryMasterData) {
        setFormData({
          ApprovalDocumentCategoryId: editingApprovalDocumentCategoryMasterData.ApprovalDocumentCategoryId,
          Uniquekey: editingApprovalDocumentCategoryMasterData.Uniquekey || getInitialFormState().Uniquekey,
          ProjectId: Number(projectId),
          ApprovalDocumentCategory: editingApprovalDocumentCategoryMasterData.ApprovalDocumentCategoryName || '',
          OrderBy: editingApprovalDocumentCategoryMasterData.OrderBy || 0
        });
      } else {
        setFormData(getInitialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingApprovalDocumentCategoryMasterData, projectId]);
  //#endregion

  //#region TABLE COLUMN DEFINITION
  const approvalDocumentCategoryMasterColumns = useMemo<TableColumn[]>(
    () => getApprovalDocumentCategoryMasterColumns(),
    []
  );
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH
  const fetchApprovalDocumentCategoryList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadApprovalDocumentCategories(page, filters, sort ?? sortInfo);
  };

  const loadApprovalDocumentCategories = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationApprovalDocumentCategoryMaster = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          ApprovalDocumentCategoryId: filterParams.ApprovalDocumentCategoryId ? Number(filterParams.ApprovalDocumentCategoryId) : 0,
          ApprovalDocumentCategory: searchtext ?? filterParams.ApprovalDocumentCategory?.trim() ?? undefined,
          ProjectId: Number(projectId),
          SortBy: getSortByParam(sortInfo ?? null, approvalDocumentCategoryMasterColumns)
        };

        const response = await approvalDocumentCategoryMasterService.apiCallPullApprovalDocumentCategoryMaster(params);

        if (E.isRight(response)) {
          setApprovalDocumentCategoryMasterList(response.right.Data);
          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize)
          });
        } else {
          addToast({ type: 'error', title: response.left.message });
        }
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      'Loading Approval Document Category'
    );
  };
  //#endregion

  //#region SEARCH APPROVAL DOCUMENT CATEGORY
  const searchApprovalDocumentCategories = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchApprovalDocumentCategoryList();
      return;
    }

    await loadApprovalDocumentCategories(1, filters, sortInfo, searchValue);
  };
  //#endregion

  //#region CLEAR SEARCH APPROVAL DOCUMENT CATEGORY
  const clearsearchApprovalDocumentCategories = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    loadApprovalDocumentCategories(1, { ApprovalDocumentCategory: '' }, sortInfo, undefined);
  };
  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportApprovalDocumentCategories = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationApprovalDocumentCategoryMaster = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          ApprovalDocumentCategory: filters.ApprovalDocumentCategory?.trim() || undefined,
          ProjectId: Number(projectId),
          SortBy: getSortByParam(sortInfo ?? null, approvalDocumentCategoryMasterColumns),
          ExportType: exportType
        };

        const response = await approvalDocumentCategoryMasterService.apiCallPullApprovalDocumentCategoryMaster(params);
        handleExportFile(response, exportType, 'Approval Document Category Master', addToast);
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' });
      },
      undefined,
      'Preparing Export'
    );
  };

  const handleExportApprovalDocumentCategoryExcel = () => handleExportApprovalDocumentCategories('Excel');
  const handleExportApprovalDocumentCategoryPdf = () => handleExportApprovalDocumentCategories('PDF');
  //#endregion

  //#region HANDLE PAGE CHANGE EVENT
  const handlePageChange = (page: number) => {
    fetchApprovalDocumentCategoryList(page);
  };
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    loadApprovalDocumentCategories(1, filters, sort, searchTerm || undefined);
  }, [filters, searchTerm]);
  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS
  const requiredApprovalDocumentCategoryMasterColumnKeys: string[] = REQUIRED_COLUMN_KEYS;

  const allApprovalDocumentCategoryMasterColumnKeys: string[] = approvalDocumentCategoryMasterColumns.map(c => c.key);

  const [selectedApprovalDocumentCategoryMasterColumnKeys, setSelectedApprovalDocumentCategoryMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getApprovalDocumentCategoryMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        const withRequired = Array.from(new Set([...parsed, ...requiredApprovalDocumentCategoryMasterColumnKeys]));
        return withRequired.filter(k => allApprovalDocumentCategoryMasterColumnKeys.includes(k));
      }
    } catch { }
    return allApprovalDocumentCategoryMasterColumnKeys;
  });

  useEffect(() => {
    setSelectedApprovalDocumentCategoryMasterColumnKeys(prev =>
      Array.from(new Set([...prev, ...requiredApprovalDocumentCategoryMasterColumnKeys])).filter(k =>
        allApprovalDocumentCategoryMasterColumnKeys.includes(k)
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvalDocumentCategoryMasterColumns.length]);

  const visibleApprovalDocumentCategoryMasterColumns = useMemo(
    () =>
      approvalDocumentCategoryMasterColumns.filter(col =>
        selectedApprovalDocumentCategoryMasterColumnKeys.includes(col.key)
      ),
    [approvalDocumentCategoryMasterColumns, selectedApprovalDocumentCategoryMasterColumnKeys]
  );
  //#endregion

  //#region VIEW EDIT
  const handleViewApprovalDocumentCategoryDetails = useCallback((row: ApprovalDocumentCategoryMasterData) => {
    setViewApprovalDocumentCategoryMasterDetailsData(row);
    setIsViewModalOpen(true);
  }, []);
  //#endregion

  //#region EDIT APPROVAL DOCUMENT CATEGORY MASTER
  const handleEditApprovalDocumentCategoryMaster = useCallback((row: ApprovalDocumentCategoryMasterData) => {
    setEditingApprovalDocumentCategoryMasterData({
      ...row,
      ProjectId: Number(projectId),
      ApprovalDocumentCategoryName: row.ApprovalDocumentCategoryName || '',
      OrderBy: row.OrderBy || 0
    });
    setIsAddUpdateModalOpen(true);
  }, [projectId]);
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: ApprovalDocumentCategoryMasterData) => {
    setDeleteApprovalDocumentCategoryMasterDetailsData(row);
    setIsConfirmationDialogBoxOpen(true);
  }, []);
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters);
    loadApprovalDocumentCategories(1, tempFilters);
    setShowFilterPopup(false);
  };
  //#endregion

  //#region Clear
  const clearFilters = () => {
    setTempFilters({});
    setFilters({});
    loadApprovalDocumentCategories(1, {});
    setShowFilterPopup(false);
  };
  //#endregion

  //#region HANDLE FILTER CHANGE
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };
  //#endregion

  //#region ADD UPDATE EDIT APPROVAL DOCUMENT CATEGORY MASTER
  const handleFieldChange = (field: keyof AddUpdateApprovalDocumentCategoryMasterRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddApprovalDocumentCategoryModal = () => {
    setEditingApprovalDocumentCategoryMasterData(null);
    setFormData(getInitialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  };

  const validateAddApprovalDocumentCategoryMasterForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.ApprovalDocumentCategory?.trim()) {
      newErrors.approvalDocumentCategory = 'Approval Document Category is required';
    }

    if (formData.OrderBy === 0) {
      newErrors.OrderBy = 'Sequence is required';
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };

  const PushApprovalDocumentCategoryMasterFormData = (): AddUpdateApprovalDocumentCategoryMasterRequest => {
    return {
      ApprovalDocumentCategoryId: formData.ApprovalDocumentCategoryId,
      Uniquekey: formData.Uniquekey,
      ProjectId: Number(projectId),
      ApprovalDocumentCategory: formData.ApprovalDocumentCategory,
      OrderBy: formData.OrderBy
    };
  };

  const handleAddUpdateApprovalDocumentCategoryMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});

    const validation = validateAddApprovalDocumentCategoryMasterForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushApprovalDocumentCategoryMasterFormData();

        const response =
          await approvalDocumentCategoryMasterService.apiCallAddUpdateApprovalDocumentCategoryMaster(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          const isAdd = formData.ApprovalDocumentCategoryId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ApprovalDocumentCategoryMasterData;

            setApprovalDocumentCategoryMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });

            addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          } else {
            const updatedRecord = response.right.Data[0] as ApprovalDocumentCategoryMasterData;

            setApprovalDocumentCategoryMasterList(prevData =>
              prevData.map(item =>
                item.ApprovalDocumentCategoryId === formData.ApprovalDocumentCategoryId ? updatedRecord : item
              )
            );

            addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          }

          setEditingApprovalDocumentCategoryMasterData(null);
        } else {
          addToast({ type: 'error', title: response.left?.message });
        }
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      Number(formData.ApprovalDocumentCategoryId) === 0 ? 'Add Approval Document Category' : 'Update Approval Document Category'
    );
  };
  //#endregion

  //#region IMPORT EXCEL | DOWNLOAD
  const downloadExcelSampleApprovalDocumentCategoryMaster = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterPullExcelSample = {
          TableName: 'APPROVAL DOCUMENT CATEGORY'
        };

        const response = await technicalService.apiCallPullExcelSample(params);

        handleExportFile(
          response,
          'Excel',
          'Approval Document Category',
          addToast,
          'Sample file download successfully'
        );

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' });
      },
      undefined,
      'Preparing Downloading'
    );
  };

  const handleDownloadExcelSampleApprovalDocumentCategoryMaster = () => downloadExcelSampleApprovalDocumentCategoryMaster();

  const uploadExcel = async (file: File, mergeExisting: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const fd = new FormData();

        fd.append("ExcelFile", file);
        fd.append("IsAllDelete", mergeExisting);
        fd.append("TableName", 'APPROVAL DOCUMENT CATEGORY');
        fd.append("ProjectId", String(projectId));

        const response = await technicalService.apiCallExcelImport(fd);

        if (E.isRight(response)) {
          addToast({ type: 'success', title: "Excel imported sucessfully" });
          fetchApprovalDocumentCategoryList();
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

  //#region DELETE APPROVAL DOCUMENT CATEGORY MASTER
  const handleDeleteApprovalDocumentCategoryMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteApprovalDocumentCategoryMasterDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteApprovalDocumentCategoryMasterRequest = {
          ApprovalDocumentCategoryId: deleteApprovalDocumentCategoryMasterDetailsData.ApprovalDocumentCategoryId,
          Uniquekey: deleteApprovalDocumentCategoryMasterDetailsData.Uniquekey,
          ProjectId: Number(projectId)
        };

        const response =
          await approvalDocumentCategoryMasterService.apiCallDeleteApprovalDocumentCategoryMaster(params);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;
          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;
          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (approvalDocumentCategoryMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadApprovalDocumentCategories(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          setIsConfirmationDialogBoxOpen(false);
          setDeleteApprovalDocumentCategoryMasterDetailsData(null);
        } else {
          addToast({ type: 'error', title: response.left.message });
          setIsConfirmationDialogBoxOpen(false);
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      'Delete Approval Document Category'
    );
  };
  //#endregion

  return {
    approvalDocumentCategoryMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewApprovalDocumentCategoryMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingApprovalDocumentCategoryMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    deleteApprovalDocumentCategoryMasterDetailsData,
    isShowCustomizeApprovalDocumentCategoryMasterColumnsModal,
    showImportModal,
    canAction,
    canExport,
    approvalDocumentCategoryMasterColumns,
    visibleApprovalDocumentCategoryMasterColumns,
    selectedApprovalDocumentCategoryMasterColumnKeys,
    requiredApprovalDocumentCategoryMasterColumnKeys,
    allApprovalDocumentCategoryMasterColumnKeys,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewApprovalDocumentCategoryMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setFilters,
    setErrors,
    setEditingApprovalDocumentCategoryMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteApprovalDocumentCategoryMasterDetailsData,
    setIsShowCustomizeApprovalDocumentCategoryMasterColumnsModal,
    setShowImportModal,
    setSelectedApprovalDocumentCategoryMasterColumnKeys,

    // Actions
    fetchApprovalDocumentCategoryList,
    handlePageChange,
    handleSortColumn,
    handleViewApprovalDocumentCategoryDetails,
    handleEditApprovalDocumentCategoryMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddApprovalDocumentCategoryModal,
    handleAddUpdateApprovalDocumentCategoryMaster,
    handleDeleteApprovalDocumentCategoryMaster,
    handleExportApprovalDocumentCategoryExcel,
    handleExportApprovalDocumentCategoryPdf,
    handleDownloadExcelSampleApprovalDocumentCategoryMaster,
    uploadExcel,
    debouncedSearch,
    clearsearchApprovalDocumentCategories,
  };
};

