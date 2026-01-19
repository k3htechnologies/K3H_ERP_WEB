import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import type { FilterInfo, SortInfo, TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateProjectRERADocumentCategoryMasterRequest,
  DeleteProjectRERADocumentCategoryMasterRequest,
  ProjectRERADocumentCategoryMasterData,
  FilterWithPaginationProjectRERADocumentCategoryMaster
} from '@/features/projectRERADocumentCategory/models/ProjectRERADocumentCategoryMasterModel';
import { projectRERADocumentCategoryMasterService } from '@/features/projectRERADocumentCategory/services/ProjectRERADocumentCategoryMasterService';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { updateFilter } from '@/core/utils/filterHelper';
import type { FilterPullExcelSample } from '@/features/technical/models/TechnicalModel';
import { technicalService } from '@/features/technical/services/TechnicalService';
import { handleExportFile } from '@/core/utils/exportFile';
import { getInitialFormState, getProjectRERADocumentCategoryMasterColumns, REQUIRED_COLUMN_KEYS } from '@/features/projectRERADocumentCategory/constants/projectRERADocumentCategoryMasterConstants';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { useProject } from '@/features/projectMaster/context/ProjectContext';

export const useProjectRERADocumentCategoryMaster = () => {
  //#region STATE MANAGEMENT
  const [projectRERADocumentCategoryMasterList, setProjectRERADocumentCategoryMasterList] = useState<ProjectRERADocumentCategoryMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchProjectRERADocumentCategories(value);
  }, 350);
  const [viewProjectRERADocumentCategoryMasterDetailsData, setViewProjectRERADocumentCategoryMasterDetailsData] = useState<ProjectRERADocumentCategoryMasterData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT PROJECT RERA DOCUMENT CATEGORY MASTER
  const [editingProjectRERADocumentCategoryMasterData, setEditingProjectRERADocumentCategoryMasterData] = useState<ProjectRERADocumentCategoryMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE PROJECT RERA DOCUMENT CATEGORY MASTER
  const [formData, setFormData] = useState<AddUpdateProjectRERADocumentCategoryMasterRequest>(() => getInitialFormState());

  //DELETE PROJECT RERA DOCUMENT CATEGORY MASTER STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deleteProjectRERADocumentCategoryMasterDetailsData, setDeleteProjectRERADocumentCategoryMasterDetailsData] = useState<ProjectRERADocumentCategoryMasterData | null>(null);

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeProjectRERADocumentCategoryMasterColumnsModal, setIsShowCustomizeProjectRERADocumentCategoryMasterColumnsModal] = useState(false);
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
    fetchProjectRERADocumentCategoryList();
  }, [projectId]);

  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingProjectRERADocumentCategoryMasterData) {
        setFormData({
          ProjectRERADocumentCategoryId: editingProjectRERADocumentCategoryMasterData.ProjectRERADocumentCategoryId,
          Uniquekey: editingProjectRERADocumentCategoryMasterData.Uniquekey || getInitialFormState().Uniquekey,
          ProjectId: Number(projectId),
          ProjectRERADocumentCategory: editingProjectRERADocumentCategoryMasterData.ProjectRERADocumentCategoryName || '',
          OrderBy: editingProjectRERADocumentCategoryMasterData.OrderBy || 0
        });
      } else {
        setFormData(getInitialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingProjectRERADocumentCategoryMasterData, projectId]);
  //#endregion

  //#region TABLE COLUMN DEFINITION
  const projectRERADocumentCategoryMasterColumns = useMemo<TableColumn[]>(
    () => getProjectRERADocumentCategoryMasterColumns(),
    []
  );
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH
  const fetchProjectRERADocumentCategoryList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadProjectRERADocumentCategories(page, filters, sort ?? sortInfo);
  };

  const loadProjectRERADocumentCategories = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationProjectRERADocumentCategoryMaster = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          ProjectRERADocumentCategoryId: filterParams.ProjectRERADocumentCategoryId ? Number(filterParams.ProjectRERADocumentCategoryId) : 0,
          ProjectRERADocumentCategory: searchtext ?? filterParams.ProjectRERADocumentCategory?.trim() ?? undefined,
          ProjectId: Number(projectId),
          SortBy: getSortByParam(sortInfo ?? null, projectRERADocumentCategoryMasterColumns)
        };

        const response = await projectRERADocumentCategoryMasterService.apiCallPullProjectRERADocumentCategoryMaster(params);

        if (E.isRight(response)) {
          setProjectRERADocumentCategoryMasterList(response.right.Data);
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
      'Loading Project RERA Document Category'
    );
  };
  //#endregion

  //#region SEARCH PROJECT RERA DOCUMENT CATEGORY
  const searchProjectRERADocumentCategories = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchProjectRERADocumentCategoryList();
      return;
    }

    await loadProjectRERADocumentCategories(1, filters, sortInfo, searchValue);
  };
  //#endregion

  //#region CLEAR SEARCH PROJECT RERA DOCUMENT CATEGORY
  const clearsearchProjectRERADocumentCategories = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    loadProjectRERADocumentCategories(1, { ProjectRERADocumentCategory: '' }, sortInfo, undefined);
  };
  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportProjectRERADocumentCategories = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationProjectRERADocumentCategoryMaster = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          ProjectRERADocumentCategory: filters.ProjectRERADocumentCategory?.trim() || undefined,
          ProjectId: Number(projectId),
          SortBy: getSortByParam(sortInfo ?? null, projectRERADocumentCategoryMasterColumns),
          ExportType: exportType
        };

        const response = await projectRERADocumentCategoryMasterService.apiCallPullProjectRERADocumentCategoryMaster(params);
        handleExportFile(response, exportType, 'Project RERA Document Category Master', addToast);
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

  const handleExportProjectRERADocumentCategoryExcel = () => handleExportProjectRERADocumentCategories('Excel');
  const handleExportProjectRERADocumentCategoryPdf = () => handleExportProjectRERADocumentCategories('PDF');
  //#endregion

  //#region HANDLE PAGE CHANGE EVENT
  const handlePageChange = (page: number) => {
    fetchProjectRERADocumentCategoryList(page);
  };
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    loadProjectRERADocumentCategories(1, filters, sort, searchTerm || undefined);
  }, [filters, searchTerm]);
  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS
  const requiredProjectRERADocumentCategoryMasterColumnKeys: string[] = REQUIRED_COLUMN_KEYS;

  const allProjectRERADocumentCategoryMasterColumnKeys: string[] = projectRERADocumentCategoryMasterColumns.map(c => c.key);

  const [selectedProjectRERADocumentCategoryMasterColumnKeys, setSelectedProjectRERADocumentCategoryMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getProjectRERADocumentCategoryMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        const withRequired = Array.from(new Set([...parsed, ...requiredProjectRERADocumentCategoryMasterColumnKeys]));
        return withRequired.filter(k => allProjectRERADocumentCategoryMasterColumnKeys.includes(k));
      }
    } catch { }
    return allProjectRERADocumentCategoryMasterColumnKeys;
  });

  useEffect(() => {
    setSelectedProjectRERADocumentCategoryMasterColumnKeys(prev =>
      Array.from(new Set([...prev, ...requiredProjectRERADocumentCategoryMasterColumnKeys])).filter(k =>
        allProjectRERADocumentCategoryMasterColumnKeys.includes(k)
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectRERADocumentCategoryMasterColumns.length]);

  const visibleProjectRERADocumentCategoryMasterColumns = useMemo(
    () =>
      projectRERADocumentCategoryMasterColumns.filter(col =>
        selectedProjectRERADocumentCategoryMasterColumnKeys.includes(col.key)
      ),
    [projectRERADocumentCategoryMasterColumns, selectedProjectRERADocumentCategoryMasterColumnKeys]
  );
  //#endregion

  //#region VIEW EDIT
  const handleViewProjectRERADocumentCategoryDetails = useCallback((row: ProjectRERADocumentCategoryMasterData) => {
    setViewProjectRERADocumentCategoryMasterDetailsData(row);
    setIsViewModalOpen(true);
  }, []);
  //#endregion

  //#region EDIT PROJECT RERA DOCUMENT CATEGORY MASTER
  const handleEditProjectRERADocumentCategoryMaster = useCallback((row: ProjectRERADocumentCategoryMasterData) => {
    setEditingProjectRERADocumentCategoryMasterData({
      ...row,
      ProjectId: Number(projectId),
      ProjectRERADocumentCategoryName: row.ProjectRERADocumentCategoryName || '',
      OrderBy: row.OrderBy || 0
    });
    setIsAddUpdateModalOpen(true);
  }, [projectId]);
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: ProjectRERADocumentCategoryMasterData) => {
    setDeleteProjectRERADocumentCategoryMasterDetailsData(row);
    setIsConfirmationDialogBoxOpen(true);
  }, []);
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters);
    loadProjectRERADocumentCategories(1, tempFilters);
    setShowFilterPopup(false);
  };
  //#endregion

  //#region CLEAR FILTER
  const clearFilters = () => {
    setTempFilters({});
    setFilters({});
    loadProjectRERADocumentCategories(1, {});
    setShowFilterPopup(false);
  };
  //#endregion

  //#region HANDLE FILTER CHANGE
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };
  //#endregion

  //#region ADD UPDATE EDIT PROJECT RERA DOCUMENT CATEGORY MASTER
  const handleFieldChange = (field: keyof AddUpdateProjectRERADocumentCategoryMasterRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddProjectRERADocumentCategoryModal = () => {
    setEditingProjectRERADocumentCategoryMasterData(null);
    setFormData(getInitialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  };

  const validateAddProjectRERADocumentCategoryMasterForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.ProjectRERADocumentCategory?.trim()) {
      newErrors.ProjectRERADocumentCategory = 'Project RERA Document Category is required';
    }

    if (formData.OrderBy === 0) {
      newErrors.OrderBy = 'Sequence is required';
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };

  const PushProjectRERADocumentCategoryMasterFormData = (): AddUpdateProjectRERADocumentCategoryMasterRequest => {
    return {
      ProjectRERADocumentCategoryId: formData.ProjectRERADocumentCategoryId,
      Uniquekey: formData.Uniquekey,
      ProjectId: Number(projectId),
      ProjectRERADocumentCategory: formData.ProjectRERADocumentCategory,
      OrderBy: formData.OrderBy
    };
  };

  const handleAddUpdateProjectRERADocumentCategoryMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});

    const validation = validateAddProjectRERADocumentCategoryMasterForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushProjectRERADocumentCategoryMasterFormData();

        const response =
          await projectRERADocumentCategoryMasterService.apiCallAddUpdateProjectRERADocumentCategoryMaster(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          const isAdd = formData.ProjectRERADocumentCategoryId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ProjectRERADocumentCategoryMasterData;

            setProjectRERADocumentCategoryMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });

            addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          } else {
            const updatedRecord = response.right.Data[0] as ProjectRERADocumentCategoryMasterData;

            setProjectRERADocumentCategoryMasterList(prevData =>
              prevData.map(item =>
                item.ProjectRERADocumentCategoryId === formData.ProjectRERADocumentCategoryId ? updatedRecord : item
              )
            );

            addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          }

          setEditingProjectRERADocumentCategoryMasterData(null);
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
      Number(formData.ProjectRERADocumentCategoryId) === 0 ? 'Add Project RERA Document Category' : 'Update Project RERA Document Category'
    );
  };
  //#endregion

  //#region IMPORT EXCEL | DOWNLOAD
  const downloadExcelSampleProjectRERADocumentCategoryMaster = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterPullExcelSample = {
          TableName: 'PROJECT RERA DOCUMENT CATEGORY MASTER'
        };

        const response = await technicalService.apiCallPullExcelSample(params);

        handleExportFile(
          response,
          'Excel',
          'Project RERA Document Category Master',
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

  const handleDownloadExcelSampleProjectRERADocumentCategoryMaster = () => downloadExcelSampleProjectRERADocumentCategoryMaster();

  const excelImportProjectRERADocumentCategoryMaster = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        return null;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Import failed' });
      },
      undefined,
      'Preparing Import'
    );
  };

  const handleExcelImportProjectRERADocumentCategoryMaster = () => excelImportProjectRERADocumentCategoryMaster();
  //#endregion

  //#region DELETE PROJECT RERA DOCUMENT CATEGORY MASTER
  const handleDeleteProjectRERADocumentCategoryMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteProjectRERADocumentCategoryMasterDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteProjectRERADocumentCategoryMasterRequest = {
          ProjectRERADocumentCategoryId: deleteProjectRERADocumentCategoryMasterDetailsData.ProjectRERADocumentCategoryId,
          Uniquekey: deleteProjectRERADocumentCategoryMasterDetailsData.Uniquekey,
          ProjectId: Number(projectId)
        };

        const response =
          await projectRERADocumentCategoryMasterService.apiCallDeleteProjectRERADocumentCategoryMaster(params);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;
          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;
          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (projectRERADocumentCategoryMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadProjectRERADocumentCategories(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          setIsConfirmationDialogBoxOpen(false);
          setDeleteProjectRERADocumentCategoryMasterDetailsData(null);
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
      'Delete Project RERA Document Category'
    );
  };
  //#endregion

  return {
    projectRERADocumentCategoryMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewProjectRERADocumentCategoryMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingProjectRERADocumentCategoryMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    deleteProjectRERADocumentCategoryMasterDetailsData,
    isShowCustomizeProjectRERADocumentCategoryMasterColumnsModal,
    canAction,
    canExport,
    projectRERADocumentCategoryMasterColumns,
    visibleProjectRERADocumentCategoryMasterColumns,
    selectedProjectRERADocumentCategoryMasterColumnKeys,
    requiredProjectRERADocumentCategoryMasterColumnKeys,
    allProjectRERADocumentCategoryMasterColumnKeys,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewProjectRERADocumentCategoryMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setFilters,
    setErrors,
    setEditingProjectRERADocumentCategoryMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteProjectRERADocumentCategoryMasterDetailsData,
    setIsShowCustomizeProjectRERADocumentCategoryMasterColumnsModal,
    setSelectedProjectRERADocumentCategoryMasterColumnKeys,

    // Actions
    fetchProjectRERADocumentCategoryList,
    handlePageChange,
    handleSortColumn,
    handleViewProjectRERADocumentCategoryDetails,
    handleEditProjectRERADocumentCategoryMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddProjectRERADocumentCategoryModal,
    handleAddUpdateProjectRERADocumentCategoryMaster,
    handleDeleteProjectRERADocumentCategoryMaster,
    handleExportProjectRERADocumentCategoryExcel,
    handleExportProjectRERADocumentCategoryPdf,
    handleDownloadExcelSampleProjectRERADocumentCategoryMaster,
    handleExcelImportProjectRERADocumentCategoryMaster,
    debouncedSearch,
    clearsearchProjectRERADocumentCategories,
  };
};

