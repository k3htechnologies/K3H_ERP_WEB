import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as E from 'fp-ts/Either';

import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import usePagination from "@/core/hooks/usePagination";
import useToast from "@/core/hooks/useToast";
import type { FilterInfo, SortInfo, TableColumn } from "@/ui/components/DataTable/DataTable";
import type { AddUpdateContractMasterRequest, ContractMasterData, DeleteContractMasterRequest, FilterWithPaginationContractMaster } from "../models/ContractMasterModel";
import { getContractMasterColumns, getInitialFormState, REQUIRED_COLUMN_KEYS } from "@/features/contractMaster/constants/contractMasterConstants";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { runApiWithLoader } from "@/core/utils";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { contractMasterService } from "@/features/contractMaster/services/ContractMasterService";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { updateFilter } from "@/core/utils/filterHelper";
import type { FilterPullExcelSample } from "@/features/technical/models/TechnicalModel";
import { technicalService } from "@/features/technical/services/TechnicalService";
import { handleExportFile } from "@/core/utils/exportFile";

export const useContractMaster = () => {
  const [contractMasterList, setContractMasterList] = useState<ContractMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('')
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const [viewContractMasterDetailsData, setViewContractMasterDetailsData] = useState<ContractMasterData | null>(null)
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

  const [editingContractMasterData, setEditingContractMasterData] = useState<ContractMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  const [formData, setFormData] = useState<AddUpdateContractMasterRequest>(() => getInitialFormState());

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteContractMasterDetailsData, setDeleteContractMasterDetailsData] = useState<ContractMasterData | null>(null)

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
          ContractMasterId: editingContractMasterData.ContractMasterId,
          Uniquekey: editingContractMasterData.Uniquekey || getInitialFormState().Uniquekey,
          ContractCode: editingContractMasterData.ContractCode?.toString() || '',
          ContractName: editingContractMasterData.ContractName || ''
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

        const params: FilterWithPaginationContractMaster = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          ContractMasterId: filterParams.ContractMasterId ? Number(filterParams.ContractMasterId) : 0,
          ContractName: searchtext ?? filterParams.ContractName ?? undefined,
          SortBy: getSortByParam(sortInfo ?? null, contractMasterColumns)
        }

        const response = await contractMasterService.apiCallPullContractMaster(params);

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
        const params: FilterWithPaginationContractMaster = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          ContractName: filters.ContractName?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, contractMasterColumns),
          ExportType: exportType
        }

        const response = await contractMasterService.apiCallPullContractMaster(params);
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

  const handleViewContractDetails = useCallback((row: ContractMasterData) => {
    setViewContractMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  const handleEditContractMaster = useCallback((row: ContractMasterData) => {
    setEditingContractMasterData({
      ...row,
      ContractCode: row.ContractCode || '',
      ContractName: row.ContractName || ''
    })
    setIsAddUpdateModalOpen(true);
  }, [])

  const handleConfirmationDialogBoxOpen = useCallback((row: ContractMasterData) => {
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

  const handleFieldChange = (field: keyof AddUpdateContractMasterRequest, value: any) => {
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

    if (formData.ContractName.trim() === "") {
      newErrors.ContractName = "Contract Name is required"
    }
    else if (formData.ContractName.length < 3) {
      newErrors.ContractName = "Contract Name must be at least 3 characters long"
    }

    if (formData.ContractCode.trim() === "") {
      newErrors.ContractCode = "Contract Code is required";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushContractMasterFormData = (): AddUpdateContractMasterRequest => {
    return {
      ContractMasterId: formData.ContractMasterId,
      Uniquekey: formData.Uniquekey,
      ContractCode: formData.ContractCode,
      ContractName: formData.ContractName
    };
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
        const response = await contractMasterService.apiCallToAddUpdateContractMaster(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          const isAdd = formData.ContractMasterId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ContractMasterData
            setContractMasterList(prevData => [newRecord, ...prevData]);
            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as ContractMasterData;
            setContractMasterList(prevData =>
              prevData.map(item =>
                item.ContractMasterId === formData.ContractMasterId
                  ? updatedRecord
                  : item
              )
            )
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

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
      Number(formData.ContractMasterId) === 0 ? 'Add Contract' : 'Update Contract'
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
        const params: DeleteContractMasterRequest = {
          ContractMasterId: deleteContractMasterDetailsData.ContractMasterId,
          Uniquekey: deleteContractMasterDetailsData.Uniquekey
        }

        const response = await contractMasterService.apiCallDeleteContractMaster(params);

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
      'Delete Material'
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