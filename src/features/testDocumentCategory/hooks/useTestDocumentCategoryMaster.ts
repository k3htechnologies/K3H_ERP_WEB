import React, { useCallback, useEffect, useMemo,  useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import type { FilterInfo, SortInfo, TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateTestDocumentCategoryMasterRequest,
  DeleteTestDocumentCategoryMasterRequest,
  TestDocumentCategoryMasterData,
  FilterWithPaginationTestDocumentCategoryMaster
} from '@/features/testDocumentCategory/models/TestDocumentCategoryMasterModel';
import { testDocumentCategoryMasterService } from '@/features/testDocumentCategory/services/TestDocumentCategoryMasterService';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { updateFilter } from '@/core/utils/filterHelper';
import type { FilterPullExcelSample } from '@/features/technical/models/TechnicalModel';
import { technicalService } from '@/features/technical/services/TechnicalService';
import { handleExportFile } from '@/core/utils/exportFile';
import { getInitialFormState, getTestDocumentCategoryMasterColumns, REQUIRED_COLUMN_KEYS } from '@/features/testDocumentCategory/constants/testDocumentCategoryMasterConstants';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { useProject } from '@/features/projectMaster/context/ProjectContext';

export const useTestDocumentCategoryMaster = () => {
  
  const [testDocumentCategoryMasterList, setTestDocumentCategoryMasterList] = useState<TestDocumentCategoryMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchTestDocumentCategories(value);
  }, 350);
  const [viewTestDocumentCategoryMasterDetailsData, setViewTestDocumentCategoryMasterDetailsData] = useState<TestDocumentCategoryMasterData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  
  const [editingTestDocumentCategoryMasterData, setEditingTestDocumentCategoryMasterData] = useState<TestDocumentCategoryMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  
  const [formData, setFormData] = useState<AddUpdateTestDocumentCategoryMasterRequest>(() => getInitialFormState());

  
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deleteTestDocumentCategoryMasterDetailsData, setDeleteTestDocumentCategoryMasterDetailsData] = useState<TestDocumentCategoryMasterData | null>(null);

  
  const [isShowCustomizeTestDocumentCategoryMasterColumnsModal, setIsShowCustomizeTestDocumentCategoryMasterColumnsModal] = useState(false);

  
  const [showImportModal, setShowImportModal] = useState(false);
  

  
  const { canAction, canExport } = useMenuPermissions();
  

  
  const { projectId } = useProject();
  

  

  useEffect(() => {
    if (!projectId) return;
    fetchTestDocumentCategoryList();
  }, [projectId]);

  
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingTestDocumentCategoryMasterData) {
        setFormData({
          TestDocumentCategoryId: editingTestDocumentCategoryMasterData.TestDocumentCategoryId,
          Uniquekey: editingTestDocumentCategoryMasterData.Uniquekey || getInitialFormState().Uniquekey,
          ProjectId: Number(projectId),
          TestDocumentCategory: editingTestDocumentCategoryMasterData.TestDocumentCategoryName || '',
          OrderBy: editingTestDocumentCategoryMasterData.OrderBy || 0
        });
      } else {
        setFormData(getInitialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingTestDocumentCategoryMasterData, projectId]);
  

  
  const testDocumentCategoryMasterColumns = useMemo<TableColumn[]>(
    () => getTestDocumentCategoryMasterColumns(),
    []
  );
  

  
  const fetchTestDocumentCategoryList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadTestDocumentCategories(page, filters, sort ?? sortInfo);
  };

  const loadTestDocumentCategories = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationTestDocumentCategoryMaster = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          TestDocumentCategoryId: filterParams.TestDocumentCategoryId ? Number(filterParams.TestDocumentCategoryId) : 0,
          TestDocumentCategory: searchtext ?? filterParams.TestDocumentCategory?.trim() ?? undefined,
          ProjectId: Number(projectId),
          SortBy: getSortByParam(sortInfo ?? null, testDocumentCategoryMasterColumns)
        };

        const response = await testDocumentCategoryMasterService.apiCallPullTestDocumentCategoryMaster(params);

        if (E.isRight(response)) {
          setTestDocumentCategoryMasterList(response.right.Data);
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
      'Loading Test Document Category'
    );
  };
  

  
  const searchTestDocumentCategories = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchTestDocumentCategoryList();
      return;
    }

    await loadTestDocumentCategories(1, filters, sortInfo, searchValue);
  };
  

  
  const clearsearchTestDocumentCategories = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    loadTestDocumentCategories(1, { TestDocumentCategory: '' }, sortInfo, undefined);
  };
  

  
  const handleExportTestDocumentCategories = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationTestDocumentCategoryMaster = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          TestDocumentCategory: filters.TestDocumentCategory?.trim() || undefined,
          ProjectId: Number(projectId),
          SortBy: getSortByParam(sortInfo ?? null, testDocumentCategoryMasterColumns),
          ExportType: exportType
        };

        const response = await testDocumentCategoryMasterService.apiCallPullTestDocumentCategoryMaster(params);
        handleExportFile(response, exportType, 'Test Document Category Master', addToast);
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

  const handleExportTestDocumentCategoryExcel = () => handleExportTestDocumentCategories('Excel');
  const handleExportTestDocumentCategoryPdf = () => handleExportTestDocumentCategories('PDF');
  

  
  const handlePageChange = (page: number) => {
    fetchTestDocumentCategoryList(page);
  };
  

  
  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    loadTestDocumentCategories(1, filters, sort, searchTerm || undefined);
  }, [filters, searchTerm,projectId]);
  

  
  const requiredTestDocumentCategoryMasterColumnKeys: string[] = REQUIRED_COLUMN_KEYS;

  const allTestDocumentCategoryMasterColumnKeys: string[] = testDocumentCategoryMasterColumns.map(c => c.key);

  const [selectedTestDocumentCategoryMasterColumnKeys, setSelectedTestDocumentCategoryMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getTestDocumentCategoryMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        const withRequired = Array.from(new Set([...parsed, ...requiredTestDocumentCategoryMasterColumnKeys]));
        return withRequired.filter(k => allTestDocumentCategoryMasterColumnKeys.includes(k));
      }
    } catch { }
    return allTestDocumentCategoryMasterColumnKeys;
  });

  useEffect(() => {
    setSelectedTestDocumentCategoryMasterColumnKeys(prev =>
      Array.from(new Set([...prev, ...requiredTestDocumentCategoryMasterColumnKeys])).filter(k =>
        allTestDocumentCategoryMasterColumnKeys.includes(k)
      )
    );
    
  }, [testDocumentCategoryMasterColumns.length]);

  const visibleTestDocumentCategoryMasterColumns = useMemo(
    () =>
      testDocumentCategoryMasterColumns.filter(col =>
        selectedTestDocumentCategoryMasterColumnKeys.includes(col.key)
      ),
    [testDocumentCategoryMasterColumns, selectedTestDocumentCategoryMasterColumnKeys]
  );
  

  
  const handleViewTestDocumentCategoryDetails = useCallback((row: TestDocumentCategoryMasterData) => {
    setViewTestDocumentCategoryMasterDetailsData(row);
    setIsViewModalOpen(true);
  }, []);
  

  
  const handleEditTestDocumentCategoryMaster = useCallback((row: TestDocumentCategoryMasterData) => {
    setEditingTestDocumentCategoryMasterData({
      ...row,
      ProjectId: Number(projectId),
      TestDocumentCategoryName: row.TestDocumentCategoryName || '',
      OrderBy: row.OrderBy || 0
    });
    setIsAddUpdateModalOpen(true);
  }, [projectId]);
  

  
  const handleConfirmationDialogBoxOpen = useCallback((row: TestDocumentCategoryMasterData) => {
    setDeleteTestDocumentCategoryMasterDetailsData(row);
    setIsConfirmationDialogBoxOpen(true);
  }, []);
  

  
  const applyFilters = () => {
    setFilters(tempFilters);
    loadTestDocumentCategories(1, tempFilters);
    setShowFilterPopup(false);
  };
  

  
  const clearFilters = () => {
    setTempFilters({});
    setFilters({});
    loadTestDocumentCategories(1, {});
    setShowFilterPopup(false);
  };
  

  
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };
  

  
  const handleFieldChange = (field: keyof AddUpdateTestDocumentCategoryMasterRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddTestDocumentCategoryModal = () => {
    setEditingTestDocumentCategoryMasterData(null);
    setFormData(getInitialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  };

  const validateAddTestDocumentCategoryMasterForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.TestDocumentCategory?.trim()) {
      newErrors.TestDocumentCategory = 'Test Document Category is required';
    }

    if (formData.OrderBy === 0) {
      newErrors.OrderBy = 'Sequence is required';
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };

  const PushTestDocumentCategoryMasterFormData = (): AddUpdateTestDocumentCategoryMasterRequest => {
    return {
      TestDocumentCategoryId: formData.TestDocumentCategoryId,
      Uniquekey: formData.Uniquekey,
      ProjectId: Number(projectId),
      TestDocumentCategory: formData.TestDocumentCategory,
      OrderBy: formData.OrderBy
    };
  };

  const handleAddUpdateTestDocumentCategoryMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});

    const validation = validateAddTestDocumentCategoryMasterForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushTestDocumentCategoryMasterFormData();

        const response =
          await testDocumentCategoryMasterService.apiCallAddUpdateTestDocumentCategoryMaster(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          const isAdd = formData.TestDocumentCategoryId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as TestDocumentCategoryMasterData;

            setTestDocumentCategoryMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });

            addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          } else {
            const updatedRecord = response.right.Data[0] as TestDocumentCategoryMasterData;

            setTestDocumentCategoryMasterList(prevData =>
              prevData.map(item =>
                item.TestDocumentCategoryId === formData.TestDocumentCategoryId ? updatedRecord : item
              )
            );

            addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          }

          setEditingTestDocumentCategoryMasterData(null);
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
      Number(formData.TestDocumentCategoryId) === 0 ? 'Add Test Document Category' : 'Update Test Document Category'
    );
  };
  
  const downloadExcelSampleTestDocumentCategoryMaster = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterPullExcelSample = {
          TableName: 'TEST DOCUMENT CATEGORY'
        };

        const response = await technicalService.apiCallPullExcelSample(params);

        handleExportFile(
          response,
          'Excel',
          'Test Document Category',
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

  const handleDownloadExcelSampleTestDocumentCategoryMaster = () => downloadExcelSampleTestDocumentCategoryMaster();

  const uploadExcel = async (file: File, mergeExisting: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const fd = new FormData();

        fd.append("ExcelFile", file);
        fd.append("IsAllDelete", mergeExisting);
        fd.append("TableName", 'TEST DOCUMENT CATEGORY');
        fd.append("ProjectId", String(projectId));

        const response = await technicalService.apiCallExcelImport(fd);

        if (E.isRight(response)) {
          addToast({ type: 'success', title: "Excel imported sucessfully" });
          fetchTestDocumentCategoryList();
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

  const handleDeleteTestDocumentCategoryMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteTestDocumentCategoryMasterDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteTestDocumentCategoryMasterRequest = {
          TestDocumentCategoryId: deleteTestDocumentCategoryMasterDetailsData.TestDocumentCategoryId,
          Uniquekey: deleteTestDocumentCategoryMasterDetailsData.Uniquekey,
          ProjectId: Number(projectId)
        };

        const response =
          await testDocumentCategoryMasterService.apiCallDeleteTestDocumentCategoryMaster(params);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;
          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;
          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (testDocumentCategoryMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadTestDocumentCategories(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          setIsConfirmationDialogBoxOpen(false);
          setDeleteTestDocumentCategoryMasterDetailsData(null);
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
      'Delete Test Document Category'
    );
  };
  

  return {
    testDocumentCategoryMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewTestDocumentCategoryMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingTestDocumentCategoryMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    deleteTestDocumentCategoryMasterDetailsData,
    isShowCustomizeTestDocumentCategoryMasterColumnsModal,
    showImportModal,
    canAction,
    canExport,
    testDocumentCategoryMasterColumns,
    visibleTestDocumentCategoryMasterColumns,
    selectedTestDocumentCategoryMasterColumnKeys,
    requiredTestDocumentCategoryMasterColumnKeys,
    allTestDocumentCategoryMasterColumnKeys,

    
    setSearchTerm,
    setIsViewModalOpen,
    setViewTestDocumentCategoryMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setFilters,
    setErrors,
    setEditingTestDocumentCategoryMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteTestDocumentCategoryMasterDetailsData,
    setIsShowCustomizeTestDocumentCategoryMasterColumnsModal,
    setShowImportModal,
    setSelectedTestDocumentCategoryMasterColumnKeys,

    
    fetchTestDocumentCategoryList,
    handlePageChange,
    handleSortColumn,
    handleViewTestDocumentCategoryDetails,
    handleEditTestDocumentCategoryMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddTestDocumentCategoryModal,
    handleAddUpdateTestDocumentCategoryMaster,
    handleDeleteTestDocumentCategoryMaster,
    handleExportTestDocumentCategoryExcel,
    handleExportTestDocumentCategoryPdf,
    handleDownloadExcelSampleTestDocumentCategoryMaster,
    uploadExcel,
    debouncedSearch,
    clearsearchTestDocumentCategories,
  };
};

