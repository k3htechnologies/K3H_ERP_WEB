import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as E from 'fp-ts/Either';

import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import usePagination from "@/core/hooks/usePagination";
import useToast from "@/core/hooks/useToast";
import type { FilterInfo, SortInfo, TableColumn } from "@/ui/components/DataTable/DataTable";
import { getContractMasterColumns, getInitialFormState, REQUIRED_COLUMN_KEYS } from "@/features/contractMaster/constants/contractMasterConstants";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { runApiWithLoader } from "@/core/utils";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { updateFilter } from "@/core/utils/filterHelper";
import type { FilterPullExcelSample } from "@/features/technical/models/TechnicalModel";
import { technicalService } from "@/features/technical/services/TechnicalService";
import { handleExportFile } from "@/core/utils/exportFile";
import type { AddUpdateSpecificationMaster, DeleteSpecificationMasterRequest, filterwithPaginationSpecificationMasterRequest, SpecificationMasterData } from "@/features/specificationMaster/models/SpecificationMasterModel";
import { specificationMasterService } from "@/features/specificationMaster/services/SpecificationMasterService";

export const useContractMaster = () => {
  const [contractMasterList, setContractMasterList] = useState<SpecificationMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('')
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const [viewContractMasterDetailsData, setViewContractMasterDetailsData] = useState<SpecificationMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const { pagination, setPagination } = usePagination(20);
  const { addToast } = useToast()
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchContracts(value)
  }, 350)

  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  const [editingContractMasterData, setEditingContractMasterData] = useState<SpecificationMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  const [formData, setFormData] = useState<AddUpdateSpecificationMaster>(() => getInitialFormState());

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteContractMasterDetailsData, setDeleteContractMasterDetailsData] = useState<SpecificationMasterData | null>(null)

  const [isShowCustomizeContractMasterColumnsModal, setIsShowCustomizeContractMasterColumnsModal] = useState(false);

  const [showImportModal, setShowImportModal] = useState(false);

  const { canAction, canExport } = useMenuPermissions();

  const hasFetchedInitialContracts = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialContracts.current) return
    hasFetchedInitialContracts.current = true;
    fetchContractList()
  }, [])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingContractMasterData) {
        setFormData({
          SpecificationMasterId: editingContractMasterData.SpecificationMasterId,
          Uniquekey: editingContractMasterData.UniqueKey || getInitialFormState().Uniquekey,
          CategoryName: editingContractMasterData.CategoryName || '',
          LevelId1: editingContractMasterData.LevelId1,
          LevelId2: editingContractMasterData.LevelId2,
          LevelId3: editingContractMasterData.LevelId3,
          UomMasterId: editingContractMasterData.UomMasterId,
          Quantity: editingContractMasterData.Quantity,
          SubMaterialMasterId: editingContractMasterData.SubMaterialMasterId,
        });
      } else {
        setFormData(getInitialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingContractMasterData]);

  const contractMasterColumns = useMemo<TableColumn[]>(
    () => getContractMasterColumns(),
    []
  );

  const fetchContractList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadContracts(page, filters, sort ?? sortInfo);
  };

  const loadContracts = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: filterwithPaginationSpecificationMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          LevelType: "L1",
          CategoryName: searchtext ?? filterParams.CategoryName,
          IsSourceTypeContract: true,
          SpecificationMasterId: filterParams.SpecificationMasterId
            ? Number(filterParams.SpecificationMasterId) : undefined,
          SortBy: getSortByParam(sortInfo ?? null, contractMasterColumns),
        };

        const response = await specificationMasterService.apiCallPullSpecificationMaster(params);

        if (E.isRight(response)) {
          setContractMasterList(response.right.Data);
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
      'Loading Contracts'
    )
  }

  const searchContracts = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchContractList();
      return
    }

    await loadContracts(1, filters, sortInfo, searchValue)
  }

  const clearsearchContracts = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    loadContracts(1, { ContractName: '' }, sortInfo, undefined);
  }

  const handleExportContracts = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: filterwithPaginationSpecificationMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          LevelType: "L1",
          IsExpandChild: true,
          SortBy: getSortByParam(sortInfo ?? null, contractMasterColumns),
          ExportType: exportType
        }

        const response = await specificationMasterService.apiCallPullSpecificationMaster(params);

        handleExportFile(response, exportType, 'Contract Master', addToast)
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

  const handleExportContractExcel = () => handleExportContracts('Excel')
  const handleExportContractPdf = () => handleExportContracts('PDF')

  const handlePageChange = (page: number) => {
    fetchContractList(page);
  };

  const handleSortColumn = useCallback((sort: SortInfo) => {

    setSortInfo(sort);

    loadContracts(1, filters, sort, searchTerm || undefined);

  }, [filters, searchTerm]);

  const requiredContractMasterColumnKeys: string[] = REQUIRED_COLUMN_KEYS;

  const allContractMasterColumnKeys: string[] = contractMasterColumns.map(c => c.key)

  const [selectedContractMasterColumnKeys, setSelectedContractMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getContractMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredContractMasterColumnKeys]));
        return withRequired.filter(k => allContractMasterColumnKeys.includes(k));
      }
    } catch { }
    return allContractMasterColumnKeys
  })

  useEffect(() => {
    setSelectedContractMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredContractMasterColumnKeys])).filter(k => allContractMasterColumnKeys.includes(k)));
  }, [contractMasterColumns.length])

  const visibleContractMasterColumns = useMemo(
    () => contractMasterColumns.filter(col => selectedContractMasterColumnKeys.includes(col.key)),
    [contractMasterColumns, selectedContractMasterColumnKeys]
  )

  const handleViewContractDetails = useCallback((row: SpecificationMasterData) => {
    setViewContractMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  const handleEditContractMaster = useCallback((row: SpecificationMasterData) => {
    setEditingContractMasterData({
      ...row,
      CategoryName: row.CategoryName || ''
    })
    setIsAddUpdateModalOpen(true);
  }, [])

  const handleConfirmationDialogBoxOpen = useCallback((row: SpecificationMasterData) => {
    setDeleteContractMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])

  const applyFilters = () => {
    setFilters(tempFilters)
    loadContracts(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadContracts(1, {})
    setShowFilterPopup(false)
  }

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  const handleFieldChange = (field: keyof AddUpdateSpecificationMaster, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddContractModal = () => {
    setEditingContractMasterData(null);
    setFormData(getInitialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  const validateAddContractMasterForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.CategoryName?.trim()) {
      newErrors.CategoryName = "Category Name is required"
    }
    else if (formData.CategoryName.length < 3) {
      newErrors.ContractName = "Category Name must be at least 3 characters long"
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushContractMasterFormData = (): AddUpdateSpecificationMaster => {
    return {
      SpecificationMasterId: formData.SpecificationMasterId,
      Uniquekey: formData.Uniquekey,
      CategoryName: formData.CategoryName,
      LevelId1: formData.LevelId1,
      LevelId2: formData.LevelId2,
      LevelId3: formData.LevelId3,
      UomMasterId: formData.UomMasterId,
      Quantity: formData.Quantity,
      SubMaterialMasterId: formData.SubMaterialMasterId,
      IsSourceTypeContract: true
    }
  };

  const handleAddUpdateContractMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddContractMasterForm()

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushContractMasterFormData();
        const response = await specificationMasterService.apiCallAddUpdateSpecificationMaster(payload);


        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          await loadContracts(pagination.currentPage, {}, sortInfo, searchTerm);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setEditingContractMasterData(null);
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
      Number(formData.SpecificationMasterId) === 0 ? 'Add Contract' : 'Update Contract'
    )
  };

  const downloadExcelSampleContractMaster = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterPullExcelSample = {
          TableName: 'Contract MASTER'
        }

        const response = await technicalService.apiCallPullExcelSample(params);
        handleExportFile(response, 'Excel', 'Contract Master', addToast, 'Sample file download successfully')
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

  const handleDownloadExcelSampleContractMaster = () => downloadExcelSampleContractMaster()

  const uploadExcel = async (file: File, mergeExisting: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const fd = new FormData();
        fd.append("ExcelFile", file);
        fd.append("IsAllDelete", mergeExisting);
        fd.append("TableName", 'Contract MASTER');

        const response = await technicalService.apiCallExcelImport(fd);

        if (E.isRight(response)) {
          addToast({ type: 'success', title: "Excel imported sucessfully" })
          fetchContractList();
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

  const handleDeleteContractMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteContractMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteSpecificationMasterRequest = {
          SpecificationMasterId: deleteContractMasterDetailsData.SpecificationMasterId,
          UniqueKey: deleteContractMasterDetailsData.UniqueKey
        }

        const response = await specificationMasterService.apiCallDeleteSpecificationMaster(params);

        if (E.isRight(response)) {

          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          }

          else if (contractMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadContracts(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteContractMasterDetailsData(null);

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
      'Delete Contract'
    )
  }

  return {
    contractMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewContractMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingContractMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    deleteContractMasterDetailsData,
    isShowCustomizeContractMasterColumnsModal,
    showImportModal,
    canAction,
    canExport,
    contractMasterColumns,
    visibleContractMasterColumns,
    selectedContractMasterColumnKeys,
    requiredContractMasterColumnKeys,
    allContractMasterColumnKeys,

    setSearchTerm,
    setIsViewModalOpen,
    setViewContractMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setFilters,
    setErrors,
    setEditingContractMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteContractMasterDetailsData,
    setIsShowCustomizeContractMasterColumnsModal,
    setShowImportModal,
    setSelectedContractMasterColumnKeys,

    fetchContractList,
    handlePageChange,
    handleSortColumn,
    handleViewContractDetails,
    handleEditContractMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddContractModal,
    handleAddUpdateContractMaster,
    handleDeleteContractMaster,
    handleExportContractExcel,
    handleExportContractPdf,
    handleDownloadExcelSampleContractMaster,
    uploadExcel,
    debouncedSearch,
    clearsearchContracts,
  }
}