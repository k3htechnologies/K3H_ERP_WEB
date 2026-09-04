import React, { useCallback, useEffect, useMemo,  useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import type { FilterInfo, SortInfo, TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateDrawingDocumentCategoryMasterRequest,
  DeleteDrawingDocumentCategoryMasterRequest,
  DrawingDocumentCategoryMasterData,
  FilterWithPaginationDrawingDocumentCategoryMaster
} from '@/features/drawingDocumentCategory/models/DrawingDocumentCategoryMasterModel';
import { drawingDocumentCategoryMasterService } from '@/features/drawingDocumentCategory/services/DrawingDocumentCategoryMasterService';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { updateFilter } from '@/core/utils/filterHelper';
import type { FilterPullExcelSample } from '@/features/technical/models/TechnicalModel';
import { technicalService } from '@/features/technical/services/TechnicalService';
import { handleExportFile } from '@/core/utils/exportFile';
import { getInitialFormState, getDrawingDocumentCategoryMasterColumns, REQUIRED_COLUMN_KEYS } from '@/features/drawingDocumentCategory/constants/drawingDocumentCategoryMasterConstants';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { useProject } from '@/features/projectMaster/context/ProjectContext';

export const useDrawingDocumentCategoryMaster = () => {
  const [drawingDocumentCategoryMasterList, setDrawingDocumentCategoryMasterList] = useState<DrawingDocumentCategoryMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchDrawingDocumentCategories(value);
  }, 350);
  const [viewDrawingDocumentCategoryMasterDetailsData, setViewDrawingDocumentCategoryMasterDetailsData] = useState<DrawingDocumentCategoryMasterData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const [editingDrawingDocumentCategoryMasterData, setEditingDrawingDocumentCategoryMasterData] = useState<DrawingDocumentCategoryMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  const [formData, setFormData] = useState<AddUpdateDrawingDocumentCategoryMasterRequest>(() => getInitialFormState());

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deleteDrawingDocumentCategoryMasterDetailsData, setDeleteDrawingDocumentCategoryMasterDetailsData] = useState<DrawingDocumentCategoryMasterData | null>(null);

  const [isShowCustomizeDrawingDocumentCategoryMasterColumnsModal, setIsShowCustomizeDrawingDocumentCategoryMasterColumnsModal] = useState(false);

  const [showImportModal, setShowImportModal] = useState(false);
  
  const { canAction, canExport } = useMenuPermissions();
 
  const { projectId } = useProject();
  

  useEffect(() => {
    if (!projectId) return;
    fetchDrawingDocumentCategoryList();
  }, [projectId]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingDrawingDocumentCategoryMasterData) {
        setFormData({
          DrawingDocumentCategoryId: editingDrawingDocumentCategoryMasterData.DrawingDocumentCategoryId,
          Uniquekey: editingDrawingDocumentCategoryMasterData.Uniquekey || getInitialFormState().Uniquekey,
          ProjectId: Number(projectId),
          DrawingDocumentCategory: editingDrawingDocumentCategoryMasterData.DrawingDocumentCategoryName || '',
          OrderBy: editingDrawingDocumentCategoryMasterData.OrderBy || 0
        });
      } else {
        setFormData(getInitialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingDrawingDocumentCategoryMasterData, projectId]);
  
  const drawingDocumentCategoryMasterColumns = useMemo<TableColumn[]>(
    () => getDrawingDocumentCategoryMasterColumns(),
    []
  );
  
  const fetchDrawingDocumentCategoryList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadDrawingDocumentCategories(page, filters, sort ?? sortInfo);
  };

  const loadDrawingDocumentCategories = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationDrawingDocumentCategoryMaster = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          DrawingDocumentCategoryId: filterParams.DrawingDocumentCategoryId ? Number(filterParams.DrawingDocumentCategoryId) : 0,
          DrawingDocumentCategory: searchtext ?? filterParams.DrawingDocumentCategory?.trim() ?? undefined,
          ProjectId: Number(projectId),
          SortBy: getSortByParam(sortInfo ?? null, drawingDocumentCategoryMasterColumns)
        };

        const response = await drawingDocumentCategoryMasterService.apiCallPullDrawingDocumentCategoryMaster(params);

        if (E.isRight(response)) {
          setDrawingDocumentCategoryMasterList(response.right.Data);
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
      'Loading Drawing Document Category'
    );
  };
  
  const searchDrawingDocumentCategories = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchDrawingDocumentCategoryList();
      return;
    }

    await loadDrawingDocumentCategories(1, filters, sortInfo, searchValue);
  };
  
  const clearsearchDrawingDocumentCategories = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    loadDrawingDocumentCategories(1, { DrawingDocumentCategory: '' }, sortInfo, undefined);
  };
  
  const handleExportDrawingDocumentCategories = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationDrawingDocumentCategoryMaster = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          DrawingDocumentCategory: filters.DrawingDocumentCategory?.trim() || undefined,
          ProjectId: Number(projectId),
          SortBy: getSortByParam(sortInfo ?? null, drawingDocumentCategoryMasterColumns),
          ExportType: exportType
        };

        const response = await drawingDocumentCategoryMasterService.apiCallPullDrawingDocumentCategoryMaster(params);
        handleExportFile(response, exportType, 'Drawing Document Category Master', addToast);
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

  const handleExportDrawingDocumentCategoryExcel = () => handleExportDrawingDocumentCategories('Excel');
  const handleExportDrawingDocumentCategoryPdf = () => handleExportDrawingDocumentCategories('PDF');
  
  const handlePageChange = (page: number) => {
    fetchDrawingDocumentCategoryList(page);
  };
  
  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    loadDrawingDocumentCategories(1, filters, sort, searchTerm || undefined);
  }, [filters, searchTerm,projectId]);
  
  const requiredDrawingDocumentCategoryMasterColumnKeys: string[] = REQUIRED_COLUMN_KEYS;

  const allDrawingDocumentCategoryMasterColumnKeys: string[] = drawingDocumentCategoryMasterColumns.map(c => c.key);

  const [selectedDrawingDocumentCategoryMasterColumnKeys, setSelectedDrawingDocumentCategoryMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getDrawingDocumentCategoryMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        const withRequired = Array.from(new Set([...parsed, ...requiredDrawingDocumentCategoryMasterColumnKeys]));
        return withRequired.filter(k => allDrawingDocumentCategoryMasterColumnKeys.includes(k));
      }
    } catch { }
    return allDrawingDocumentCategoryMasterColumnKeys;
  });

  useEffect(() => {
    setSelectedDrawingDocumentCategoryMasterColumnKeys(prev =>
      Array.from(new Set([...prev, ...requiredDrawingDocumentCategoryMasterColumnKeys])).filter(k =>
        allDrawingDocumentCategoryMasterColumnKeys.includes(k)
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawingDocumentCategoryMasterColumns.length]);

  const visibleDrawingDocumentCategoryMasterColumns = useMemo(
    () =>
      drawingDocumentCategoryMasterColumns.filter(col =>
        selectedDrawingDocumentCategoryMasterColumnKeys.includes(col.key)
      ),
    [drawingDocumentCategoryMasterColumns, selectedDrawingDocumentCategoryMasterColumnKeys]
  );
  
  const handleViewDrawingDocumentCategoryDetails = useCallback((row: DrawingDocumentCategoryMasterData) => {
    setViewDrawingDocumentCategoryMasterDetailsData(row);
    setIsViewModalOpen(true);
  }, []);
  
  const handleEditDrawingDocumentCategoryMaster = useCallback((row: DrawingDocumentCategoryMasterData) => {
    setEditingDrawingDocumentCategoryMasterData({
      ...row,
      ProjectId: Number(projectId),
      DrawingDocumentCategoryName: row.DrawingDocumentCategoryName || '',
      OrderBy: row.OrderBy || 0
    });
    setIsAddUpdateModalOpen(true);
  }, [projectId]);
  
  const handleConfirmationDialogBoxOpen = useCallback((row: DrawingDocumentCategoryMasterData) => {
    setDeleteDrawingDocumentCategoryMasterDetailsData(row);
    setIsConfirmationDialogBoxOpen(true);
  }, []);
  
  const applyFilters = () => {
    setFilters(tempFilters);
    loadDrawingDocumentCategories(1, tempFilters);
    setShowFilterPopup(false);
  };
  
  const clearFilters = () => {
    setTempFilters({});
    setFilters({});
    loadDrawingDocumentCategories(1, {});
    setShowFilterPopup(false);
  };
  
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };
  
  const handleFieldChange = (field: keyof AddUpdateDrawingDocumentCategoryMasterRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddDrawingDocumentCategoryModal = () => {
    setEditingDrawingDocumentCategoryMasterData(null);
    setFormData(getInitialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  };

  const validateAddDrawingDocumentCategoryMasterForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.DrawingDocumentCategory?.trim()) {
      newErrors.drawingDocumentCategory = 'Drawing Document Category is required';
    }

    if (formData.OrderBy === 0) {
      newErrors.OrderBy = 'Sequence is required';
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };

  const PushDrawingDocumentCategoryMasterFormData = (): AddUpdateDrawingDocumentCategoryMasterRequest => {
    return {
      DrawingDocumentCategoryId: formData.DrawingDocumentCategoryId,
      Uniquekey: formData.Uniquekey,
      ProjectId: Number(projectId),
      DrawingDocumentCategory: formData.DrawingDocumentCategory,
      OrderBy: formData.OrderBy
    };
  };

  const handleAddUpdateDrawingDocumentCategoryMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});

    const validation = validateAddDrawingDocumentCategoryMasterForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushDrawingDocumentCategoryMasterFormData();

        const response =
          await drawingDocumentCategoryMasterService.apiCallAddUpdateDrawingDocumentCategoryMaster(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          const isAdd = formData.DrawingDocumentCategoryId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as DrawingDocumentCategoryMasterData;

            setDrawingDocumentCategoryMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });

            addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          } else {
            const updatedRecord = response.right.Data[0] as DrawingDocumentCategoryMasterData;

            setDrawingDocumentCategoryMasterList(prevData =>
              prevData.map(item =>
                item.DrawingDocumentCategoryId === formData.DrawingDocumentCategoryId ? updatedRecord : item
              )
            );

            addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          }

          setEditingDrawingDocumentCategoryMasterData(null);
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
      Number(formData.DrawingDocumentCategoryId) === 0 ? 'Add Drawing Document Category' : 'Update Drawing Document Category'
    );
  };
  
  const downloadExcelSampleDrawingDocumentCategoryMaster = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterPullExcelSample = {
          TableName: 'DRAWING DOCUMENT CATEGORY'
        };

        const response = await technicalService.apiCallPullExcelSample(params);

        handleExportFile(
          response,
          'Excel',
          'Drawing Document Category',
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

  const handleDownloadExcelSampleDrawingDocumentCategoryMaster = () => downloadExcelSampleDrawingDocumentCategoryMaster();

  const uploadExcel = async (file: File, mergeExisting: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const fd = new FormData();

        fd.append("ExcelFile", file);
        fd.append("IsAllDelete", mergeExisting);
        fd.append("TableName", 'DRAWING DOCUMENT CATEGORY');
        fd.append("ProjectId", String(projectId));

        const response = await technicalService.apiCallExcelImport(fd);

        if (E.isRight(response)) {
          addToast({ type: 'success', title: "Excel imported sucessfully" });
          fetchDrawingDocumentCategoryList();
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
  
  const handleDeleteDrawingDocumentCategoryMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteDrawingDocumentCategoryMasterDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteDrawingDocumentCategoryMasterRequest = {
          DrawingDocumentCategoryId: deleteDrawingDocumentCategoryMasterDetailsData.DrawingDocumentCategoryId,
          Uniquekey: deleteDrawingDocumentCategoryMasterDetailsData.Uniquekey,
          ProjectId: Number(projectId)
        };

        const response =
          await drawingDocumentCategoryMasterService.apiCallDeleteDrawingDocumentCategoryMaster(params);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;
          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;
          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (drawingDocumentCategoryMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadDrawingDocumentCategories(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          setIsConfirmationDialogBoxOpen(false);
          setDeleteDrawingDocumentCategoryMasterDetailsData(null);
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
      'Delete Drawing Document Category'
    );
  };
  
  return {
    drawingDocumentCategoryMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewDrawingDocumentCategoryMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingDrawingDocumentCategoryMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    deleteDrawingDocumentCategoryMasterDetailsData,
    isShowCustomizeDrawingDocumentCategoryMasterColumnsModal,
    showImportModal,
    canAction,
    canExport,
    drawingDocumentCategoryMasterColumns,
    visibleDrawingDocumentCategoryMasterColumns,
    selectedDrawingDocumentCategoryMasterColumnKeys,
    requiredDrawingDocumentCategoryMasterColumnKeys,
    allDrawingDocumentCategoryMasterColumnKeys,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewDrawingDocumentCategoryMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setFilters,
    setErrors,
    setEditingDrawingDocumentCategoryMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteDrawingDocumentCategoryMasterDetailsData,
    setIsShowCustomizeDrawingDocumentCategoryMasterColumnsModal,
    setShowImportModal,
    setSelectedDrawingDocumentCategoryMasterColumnKeys,

    // Actions
    fetchDrawingDocumentCategoryList,
    handlePageChange,
    handleSortColumn,
    handleViewDrawingDocumentCategoryDetails,
    handleEditDrawingDocumentCategoryMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddDrawingDocumentCategoryModal,
    handleAddUpdateDrawingDocumentCategoryMaster,
    handleDeleteDrawingDocumentCategoryMaster,
    handleExportDrawingDocumentCategoryExcel,
    handleExportDrawingDocumentCategoryPdf,
    handleDownloadExcelSampleDrawingDocumentCategoryMaster,
    uploadExcel,
    debouncedSearch,
    clearsearchDrawingDocumentCategories,
  };
};

