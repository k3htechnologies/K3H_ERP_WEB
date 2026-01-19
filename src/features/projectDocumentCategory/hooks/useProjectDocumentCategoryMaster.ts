import React, { useCallback, useEffect, useMemo,  useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import type { FilterInfo, SortInfo, TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateProjectDocumentCategoryMasterRequest,
  DeleteProjectDocumentCategoryMasterRequest,
  ProjectDocumentCategoryMasterData,
  FilterWithPaginationProjectDocumentCategoryMaster
} from '@/features/projectDocumentCategory/models/ProjectDocumentCategoryMasterModel';
import { projectDocumentCategoryMasterService } from '@/features/projectDocumentCategory/services/ProjectDocumentCategoryMasterService';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { updateFilter } from '@/core/utils/filterHelper';
import type { FilterPullExcelSample } from '@/features/technical/models/TechnicalModel';
import { technicalService } from '@/features/technical/services/TechnicalService';
import { handleExportFile } from '@/core/utils/exportFile';
import { getInitialFormState, getProjectDocumentCategoryMasterColumns, REQUIRED_COLUMN_KEYS } from '@/features/projectDocumentCategory/constants/projectDocumentCategoryMasterConstants';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { useProject } from '@/features/projectMaster/context/ProjectContext';

export const useProjectDocumentCategoryMaster = () => {
  //#region STATE MANAGEMENT
  const [projectDocumentCategoryMasterList, setProjectDocumentCategoryMasterList] = useState<ProjectDocumentCategoryMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchProjectDocumentCategories(value);
  }, 350);
  const [viewProjectDocumentCategoryMasterDetailsData, setViewProjectDocumentCategoryMasterDetailsData] = useState<ProjectDocumentCategoryMasterData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT PROJECT DOCUMENT CATEGORY MASTER
  const [editingProjectDocumentCategoryMasterData, setEditingProjectDocumentCategoryMasterData] = useState<ProjectDocumentCategoryMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE PROJECT DOCUMENT CATEGORY MASTER
  const [formData, setFormData] = useState<AddUpdateProjectDocumentCategoryMasterRequest>(() => getInitialFormState());

  //DELETE PROJECT DOCUMENT CATEGORY MASTER STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deleteProjectDocumentCategoryMasterDetailsData, setDeleteProjectDocumentCategoryMasterDetailsData] = useState<ProjectDocumentCategoryMasterData | null>(null);

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeProjectDocumentCategoryMasterColumnsModal, setIsShowCustomizeProjectDocumentCategoryMasterColumnsModal] = useState(false);

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
    fetchProjectDocumentCategoryList();
  }, [projectId]);

  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingProjectDocumentCategoryMasterData) {
        setFormData({
          ProjectDocumentCategoryId: editingProjectDocumentCategoryMasterData.ProjectDocumentCategoryId,
          Uniquekey: editingProjectDocumentCategoryMasterData.Uniquekey || getInitialFormState().Uniquekey,
          ProjectId: Number(projectId),
          ProjectDocumentCategory: editingProjectDocumentCategoryMasterData.ProjectDocumentCategoryName || '',
          OrderBy: editingProjectDocumentCategoryMasterData.OrderBy || 0
        });
      } else {
        setFormData(getInitialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingProjectDocumentCategoryMasterData, projectId]);
  //#endregion

  //#region TABLE COLUMN DEFINITION
  const projectDocumentCategoryMasterColumns = useMemo<TableColumn[]>(
    () => getProjectDocumentCategoryMasterColumns(),
    []
  );
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH
  const fetchProjectDocumentCategoryList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadProjectDocumentCategories(page, filters, sort ?? sortInfo);
  };

  const loadProjectDocumentCategories = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationProjectDocumentCategoryMaster = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          ProjectDocumentCategoryId: filterParams.ProjectDocumentCategoryId ? Number(filterParams.ProjectDocumentCategoryId) : 0,
          ProjectDocumentCategory: searchtext ?? filterParams.ProjectDocumentCategory?.trim() ?? undefined,
          ProjectId: Number(projectId),
          SortBy: getSortByParam(sortInfo ?? null, projectDocumentCategoryMasterColumns)
        };

        const response = await projectDocumentCategoryMasterService.apiCallPullProjectDocumentCategoryMaster(params);

        if (E.isRight(response)) {
          setProjectDocumentCategoryMasterList(response.right.Data);
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
      'Loading Project Document Category'
    );
  };
  //#endregion

  //#region SEARCH PROJECT DOCUMENT CATEGORY
  const searchProjectDocumentCategories = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchProjectDocumentCategoryList();
      return;
    }

    await loadProjectDocumentCategories(1, filters, sortInfo, searchValue);
  };
  //#endregion

  //#region CLEAR SEARCH PROJECT DOCUMENT CATEGORY
  const clearsearchProjectDocumentCategories = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    loadProjectDocumentCategories(1, { ProjectDocumentCategory: '' }, sortInfo, undefined);
  };
  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportProjectDocumentCategories = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationProjectDocumentCategoryMaster = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          ProjectDocumentCategory: filters.ProjectDocumentCategory?.trim() || undefined,
          ProjectId: Number(projectId),
          SortBy: getSortByParam(sortInfo ?? null, projectDocumentCategoryMasterColumns),
          ExportType: exportType
        };

        const response = await projectDocumentCategoryMasterService.apiCallPullProjectDocumentCategoryMaster(params);
        handleExportFile(response, exportType, 'Project Document Category Master', addToast);
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

  const handleExportProjectDocumentCategoryExcel = () => handleExportProjectDocumentCategories('Excel');
  const handleExportProjectDocumentCategoryPdf = () => handleExportProjectDocumentCategories('PDF');
  //#endregion

  //#region HANDLE PAGE CHANGE EVENT
  const handlePageChange = (page: number) => {
    fetchProjectDocumentCategoryList(page);
  };
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    loadProjectDocumentCategories(1, filters, sort, searchTerm || undefined);
  }, [filters, searchTerm]);
  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS
  const requiredProjectDocumentCategoryMasterColumnKeys: string[] = REQUIRED_COLUMN_KEYS;

  const allProjectDocumentCategoryMasterColumnKeys: string[] = projectDocumentCategoryMasterColumns.map(c => c.key);

  const [selectedProjectDocumentCategoryMasterColumnKeys, setSelectedProjectDocumentCategoryMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getProjectDocumentCategoryMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        const withRequired = Array.from(new Set([...parsed, ...requiredProjectDocumentCategoryMasterColumnKeys]));
        return withRequired.filter(k => allProjectDocumentCategoryMasterColumnKeys.includes(k));
      }
    } catch { }
    return allProjectDocumentCategoryMasterColumnKeys;
  });

  useEffect(() => {
    setSelectedProjectDocumentCategoryMasterColumnKeys(prev =>
      Array.from(new Set([...prev, ...requiredProjectDocumentCategoryMasterColumnKeys])).filter(k =>
        allProjectDocumentCategoryMasterColumnKeys.includes(k)
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectDocumentCategoryMasterColumns.length]);

  const visibleProjectDocumentCategoryMasterColumns = useMemo(
    () =>
      projectDocumentCategoryMasterColumns.filter(col =>
        selectedProjectDocumentCategoryMasterColumnKeys.includes(col.key)
      ),
    [projectDocumentCategoryMasterColumns, selectedProjectDocumentCategoryMasterColumnKeys]
  );
  //#endregion

  //#region VIEW EDIT
  const handleViewProjectDocumentCategoryDetails = useCallback((row: ProjectDocumentCategoryMasterData) => {
    setViewProjectDocumentCategoryMasterDetailsData(row);
    setIsViewModalOpen(true);
  }, []);
  //#endregion

  //#region EDIT PROJECT DOCUMENT CATEGORY MASTER
  const handleEditProjectDocumentCategoryMaster = useCallback((row: ProjectDocumentCategoryMasterData) => {
    setEditingProjectDocumentCategoryMasterData({
      ...row,
      ProjectId: Number(projectId),
      ProjectDocumentCategoryName: row.ProjectDocumentCategoryName || '',
      OrderBy: row.OrderBy || 0
    });
    setIsAddUpdateModalOpen(true);
  }, [projectId]);
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: ProjectDocumentCategoryMasterData) => {
    setDeleteProjectDocumentCategoryMasterDetailsData(row);
    setIsConfirmationDialogBoxOpen(true);
  }, []);
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters);
    loadProjectDocumentCategories(1, tempFilters);
    setShowFilterPopup(false);
  };
  //#endregion

  //#region CLEAR FILTER
  const clearFilters = () => {
    setTempFilters({});
    setFilters({});
    loadProjectDocumentCategories(1, {});
    setShowFilterPopup(false);
  };
  //#endregion

  //#region HANDLE FILTER CHANGE
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };
  //#endregion

  //#region ADD UPDATE EDIT PROJECT DOCUMENT CATEGORY MASTER
  const handleFieldChange = (field: keyof AddUpdateProjectDocumentCategoryMasterRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddProjectDocumentCategoryModal = () => {
    setEditingProjectDocumentCategoryMasterData(null);
    setFormData(getInitialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  };

  const validateAddProjectDocumentCategoryMasterForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.ProjectDocumentCategory?.trim()) {
      newErrors.projectDocumentCategory = 'Project Document Category is required';
    }

    if (formData.OrderBy === 0) {
      newErrors.OrderBy = 'Sequence is required';
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };

  const PushProjectDocumentCategoryMasterFormData = (): AddUpdateProjectDocumentCategoryMasterRequest => {
    return {
      ProjectDocumentCategoryId: formData.ProjectDocumentCategoryId,
      Uniquekey: formData.Uniquekey,
      ProjectId: Number(projectId),
      ProjectDocumentCategory: formData.ProjectDocumentCategory,
      OrderBy: formData.OrderBy
    };
  };

  const handleAddUpdateProjectDocumentCategoryMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});

    const validation = validateAddProjectDocumentCategoryMasterForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushProjectDocumentCategoryMasterFormData();

        const response =
          await projectDocumentCategoryMasterService.apiCallAddUpdateProjectDocumentCategoryMaster(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          const isAdd = formData.ProjectDocumentCategoryId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ProjectDocumentCategoryMasterData;

            setProjectDocumentCategoryMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });

            addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          } else {
            const updatedRecord = response.right.Data[0] as ProjectDocumentCategoryMasterData;

            setProjectDocumentCategoryMasterList(prevData =>
              prevData.map(item =>
                item.ProjectDocumentCategoryId === formData.ProjectDocumentCategoryId ? updatedRecord : item
              )
            );

            addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          }

          setEditingProjectDocumentCategoryMasterData(null);
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
      Number(formData.ProjectDocumentCategoryId) === 0 ? 'Add Project Document Category' : 'Update Project Document Category'
    );
  };
  //#endregion

  //#region IMPORT EXCEL | DOWNLOAD
  const downloadExcelSampleProjectDocumentCategoryMaster = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterPullExcelSample = {
          TableName: 'PROJECT DOCUMENT CATEGORY'
        };

        const response = await technicalService.apiCallPullExcelSample(params);

        handleExportFile(
          response,
          'Excel',
          'Project Document Category',
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

  const handleDownloadExcelSampleProjectDocumentCategoryMaster = () => downloadExcelSampleProjectDocumentCategoryMaster();

  const uploadExcel = async (file: File, mergeExisting: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const fd = new FormData();

        fd.append("ExcelFile", file);
        fd.append("IsAllDelete", mergeExisting);
        fd.append("TableName", 'PROJECT DOCUMENT CATEGORY');
        fd.append("ProjectId", String(projectId));

        const response = await technicalService.apiCallExcelImport(fd);

        if (E.isRight(response)) {
          addToast({ type: 'success', title: "Excel imported sucessfully" });
          fetchProjectDocumentCategoryList();
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

  //#region DELETE PROJECT DOCUMENT CATEGORY MASTER
  const handleDeleteProjectDocumentCategoryMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteProjectDocumentCategoryMasterDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteProjectDocumentCategoryMasterRequest = {
          ProjectDocumentCategoryId: deleteProjectDocumentCategoryMasterDetailsData.ProjectDocumentCategoryId,
          Uniquekey: deleteProjectDocumentCategoryMasterDetailsData.Uniquekey,
          ProjectId: Number(projectId)
        };

        const response =
          await projectDocumentCategoryMasterService.apiCallDeleteProjectDocumentCategoryMaster(params);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;
          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;
          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (projectDocumentCategoryMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadProjectDocumentCategories(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          setIsConfirmationDialogBoxOpen(false);
          setDeleteProjectDocumentCategoryMasterDetailsData(null);
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
      'Delete Project Document Category'
    );
  };
  //#endregion

  return {
    projectDocumentCategoryMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewProjectDocumentCategoryMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingProjectDocumentCategoryMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    deleteProjectDocumentCategoryMasterDetailsData,
    isShowCustomizeProjectDocumentCategoryMasterColumnsModal,
    showImportModal,
    canAction,
    canExport,
    projectDocumentCategoryMasterColumns,
    visibleProjectDocumentCategoryMasterColumns,
    selectedProjectDocumentCategoryMasterColumnKeys,
    requiredProjectDocumentCategoryMasterColumnKeys,
    allProjectDocumentCategoryMasterColumnKeys,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewProjectDocumentCategoryMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setFilters,
    setErrors,
    setEditingProjectDocumentCategoryMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteProjectDocumentCategoryMasterDetailsData,
    setIsShowCustomizeProjectDocumentCategoryMasterColumnsModal,
    setShowImportModal,
    setSelectedProjectDocumentCategoryMasterColumnKeys,

    // Actions
    fetchProjectDocumentCategoryList,
    handlePageChange,
    handleSortColumn,
    handleViewProjectDocumentCategoryDetails,
    handleEditProjectDocumentCategoryMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddProjectDocumentCategoryModal,
    handleAddUpdateProjectDocumentCategoryMaster,
    handleDeleteProjectDocumentCategoryMaster,
    handleExportProjectDocumentCategoryExcel,
    handleExportProjectDocumentCategoryPdf,
    handleDownloadExcelSampleProjectDocumentCategoryMaster,
    uploadExcel,
    debouncedSearch,
    clearsearchProjectDocumentCategories,
  };
};

