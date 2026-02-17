import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import type { FilterInfo, SortInfo, TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { updateFilter } from '@/core/utils/filterHelper';
import { handleExportFile } from '@/core/utils/exportFile';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { PaymentScheduleMasterService } from '@/features/paymentScheduleMaster/services/PaymentScheduleMasterService';
import type {
  AddUpdatePaymentScheduleMasterRequest,
  DeletePaymentScheduleMasterRequest,
  FilterWithPaginationPaymentScheduleMasterRequest,
  PaymentScheduleMasterData
} from '@/features/paymentScheduleMaster/models/PaymentScheduleMasterModel';
import {
  getInitialFormState,
  getPaymentScheduleMasterColumns,
  REQUIRED_COLUMN_KEYS,
} from '@/features/paymentScheduleMaster/constants/PaymentScheduleMasterConstant';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';

export const usePaymentScheduleMaster = () => {
  //#region STATE MANAGEMENT
  const [PaymentScheduleMasterList, setPaymentScheduleMasterList] = useState<PaymentScheduleMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewPaymentScheduleMasterData, setViewPaymentScheduleMasterData] = useState<PaymentScheduleMasterData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [paymentScheduleType, setPaymentScheduleType] = useState<'Date' | 'Stage'>('Date');

  // FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  // ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // ADD / EDIT PAYMENT SCHEDULE MASTER
  const [editingPaymentScheduleMasterData, setEditingPaymentScheduleMasterData] = useState<PaymentScheduleMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
  const [formData, setFormData] = useState<AddUpdatePaymentScheduleMasterRequest>(() => getInitialFormState());

  // DELETE PAYMENT SCHEDULE MASTER
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deletePaymentScheduleMasterData, setDeletePaymentScheduleMasterData] = useState<PaymentScheduleMasterData | null>(null);
  //#endregion

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizePaymentScheduleMasterColumnsModal, setIsShowCustomizePaymentScheduleMasterColumnsModal] = useState(false);

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region PROJECT
  const { projectId } = useProject();
  //#endregion

  //#region DROP DOWN LABELS
  const [dropdownLabels, setDropdownLabels] = useState<{
    stageName?: string
  }>({});

  //#region TABLE COLUMN DEFINITION
  const PaymentScheduleMasterColumns = useMemo<TableColumn[]>(() => getPaymentScheduleMasterColumns(), []);
  //#endregion

  //#region INITIALIZATION

  const loadPaymentScheduleMaster = useCallback(
    async (
      page: number,
      filterParams: FilterInfo,
      sort?: SortInfo,
      searchText?: string
    ) => {
      if (!projectId) return;

      await runApiWithLoader(
        setIsLoading,
        setLoadingMessage,
        async () => {
          const params: FilterWithPaginationPaymentScheduleMasterRequest = {
            PageNumber: page,
            PageSize: pagination.pageSize,
            ProjectId: Number(projectId),
            Type: filterParams.Type?.toString().trim() || searchText?.trim() || undefined,
            SortBy: getSortByParam(sort ?? null, PaymentScheduleMasterColumns)
          };

          const response = await PaymentScheduleMasterService.apiCallPullPaymentScheduleMaster(params);

          if (E.isRight(response)) {
            setPaymentScheduleMasterList(response.right.Data);
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
        (error: any) => addToast({ type: 'error', title: error.message }),
        undefined,
        'Loading Other Charges'
      );
    },
    [projectId, pagination.pageSize, PaymentScheduleMasterColumns, addToast]
  );

  useEffect(() => {

    if (!projectId) return;
    loadPaymentScheduleMaster(1, {}, undefined, undefined);

  }, [projectId, loadPaymentScheduleMaster]);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchPaymentScheduleMaster(value);
  }, 350);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingPaymentScheduleMasterData) {
        setFormData({
          PaymentScheduleMasterId: editingPaymentScheduleMasterData.PaymentScheduleMasterId || 0,
          StageId: editingPaymentScheduleMasterData.StageId || 0,
          Uniquekey: editingPaymentScheduleMasterData.Uniquekey || getInitialFormState().Uniquekey,
          ProjectId: Number(projectId),
          Date: editingPaymentScheduleMasterData.Date || '',
          Name: editingPaymentScheduleMasterData.Name || '',
          Percentage: editingPaymentScheduleMasterData.Percentage || 0,
          Type: editingPaymentScheduleMasterData.StageId && editingPaymentScheduleMasterData.StageId > 0 ? 'Stage' : 'Date'
        });
        setDropdownLabels({
          stageName: editingPaymentScheduleMasterData.Name || "",
        });
      } else {
        setFormData({
          ...getInitialFormState(),
          ProjectId: Number(projectId)
        });
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingPaymentScheduleMasterData, projectId]);
  //#endregion

  //#region SEARCH
  const searchPaymentScheduleMaster = async (value: string) => {
    setSearchTerm(value);
    if (value.trim() === '') {
      await loadPaymentScheduleMaster(1, filters, sortInfo, undefined);
      return;
    }
    await loadPaymentScheduleMaster(1, filters, sortInfo, value);
  };

  const clearSearchPaymentScheduleMaster = () => {
    debouncedSearch.cancel?.();
    setSearchTerm('');
    setPagination({ currentPage: 1 });
    loadPaymentScheduleMaster(1, filters, sortInfo, '');
  };
  //#endregion

  //#region EXPORT
  const handleExportPaymentScheduleMaster = useCallback(
    async (exportType: 'Excel' | 'PDF') => {
      if (!projectId) return;

      await runApiWithLoader(
        setIsLoading,
        setLoadingMessage,
        async () => {
          const params: FilterWithPaginationPaymentScheduleMasterRequest = {
            PageNumber: 1,
            PageSize: pagination.totalRecords,
            ProjectId: Number(projectId),
            Type: filters.Type?.toString().trim() || undefined,
            SortBy: getSortByParam(sortInfo ?? null, PaymentScheduleMasterColumns),
            ExportType: exportType
          };

          const response = await PaymentScheduleMasterService.apiCallPullPaymentScheduleMaster(params);
          handleExportFile(response, exportType, 'Other Charges', addToast);
          return response;
        },
        undefined,
        (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
        undefined,
        'Preparing Export'
      );
    },
    [projectId, pagination.totalRecords, filters, sortInfo, PaymentScheduleMasterColumns, addToast]
  );

  const handleExportPaymentScheduleMasterExcel = () => handleExportPaymentScheduleMaster('Excel');
  const handleExportPaymentScheduleMasterPdf = () => handleExportPaymentScheduleMaster('PDF');
  //#endregion

  //#region PAGE & SORT
  const handlePageChange = (page: number) => {
    setPagination({ currentPage: page });
    loadPaymentScheduleMaster(page, filters, sortInfo, searchTerm);
  };

  const handleSortColumn = useCallback(
    (sort: SortInfo) => {
      setSortInfo(sort);
      setPagination({ currentPage: 1 });
      loadPaymentScheduleMaster(1, filters, sort, searchTerm);
    },
    [filters, searchTerm, loadPaymentScheduleMaster, setPagination]
  );
  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS
  const requiredPaymentScheduleMasterColumnKeys: string[] = REQUIRED_COLUMN_KEYS;

  const allPaymentScheduleMasterColumnKeys: string[] = PaymentScheduleMasterColumns.map(c => c.key)

  const [selectedPaymentScheduleMasterColumnKeys, setSelectedPaymentScheduleMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getPaymentScheduleMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredPaymentScheduleMasterColumnKeys]));
        return withRequired.filter(k => allPaymentScheduleMasterColumnKeys.includes(k));
      }
    } catch (e) { }
    return allPaymentScheduleMasterColumnKeys
  })

  useEffect(() => {

    setSelectedPaymentScheduleMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredPaymentScheduleMasterColumnKeys])).filter(k => allPaymentScheduleMasterColumnKeys.includes(k)));

  }, [PaymentScheduleMasterColumns.length])

  const visiblePaymentScheduleMasterColumns = useMemo(
    () => PaymentScheduleMasterColumns.filter(col => selectedPaymentScheduleMasterColumnKeys.includes(col.key)),
    [PaymentScheduleMasterColumns, selectedPaymentScheduleMasterColumnKeys]
  )
  //#endregion

  //#region VIEW / EDIT
  const handleViewPaymentScheduleMasterDetails = useCallback((row: PaymentScheduleMasterData) => {
    setViewPaymentScheduleMasterData(row);
    setIsViewModalOpen(true);
  }, []);

  const handleEditPaymentScheduleMaster = useCallback((row: PaymentScheduleMasterData) => {
    setEditingPaymentScheduleMasterData(row);
    setIsAddUpdateModalOpen(true);
  }, []);
  //#endregion

  //#region CONFIRMATION DIALOG
  const handleConfirmationDialogBoxOpen = useCallback((row: PaymentScheduleMasterData) => {
    setDeletePaymentScheduleMasterData(row);
    setIsConfirmationDialogBoxOpen(true);
  }, []);
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters);
    setPagination({ currentPage: 1 });
    loadPaymentScheduleMaster(1, tempFilters, sortInfo, searchTerm);
    setShowFilterPopup(false);
  };

  const clearFilters = () => {
    setTempFilters({});
    setFilters({});
    setPagination({ currentPage: 1 });
    loadPaymentScheduleMaster(1, {}, sortInfo, searchTerm);
    setShowFilterPopup(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };
  //#endregion

  //#region ADD / UPDATE PAYMENT SCHEDULE MASTER
  const handleFieldChange = (field: keyof AddUpdatePaymentScheduleMasterRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddPaymentScheduleMasterModal = () => {
    setEditingPaymentScheduleMasterData(null);
    setFormData({
      ...getInitialFormState(),
      ProjectId: Number(projectId)
    });
    setErrors({});
    setIsAddUpdateModalOpen(true);
  };

  const validateAddUpdatePaymentScheduleMasterForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.Date || formData.Date.trim() === '') {
      newErrors.Date = 'Date is required.';
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };

  const pushPaymentScheduleMasterFormData = (): AddUpdatePaymentScheduleMasterRequest => ({
    PaymentScheduleMasterId: formData.PaymentScheduleMasterId,
    Uniquekey: formData.Uniquekey,
    ProjectId: Number(projectId),
    Date: formData.Date,
    Percentage: formData.Percentage,
    StageId: formData.StageId,
    Type: formData.Type,
    Name: formData.Name
  });

  const handleAddUpdatePaymentScheduleMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = validateAddUpdatePaymentScheduleMasterForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = pushPaymentScheduleMasterFormData();
        const response = await PaymentScheduleMasterService.apiCallAddUpdatePaymentScheduleMaster(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          const isAdd = formData.PaymentScheduleMasterId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as PaymentScheduleMasterData;
            setPaymentScheduleMasterList(prevData => [newRecord, ...prevData]);
            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });
            addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          } else {
            const updatedRecord = response.right.Data[0] as PaymentScheduleMasterData;
            setPaymentScheduleMasterList(prevData =>
              prevData.map(item =>
                item.PaymentScheduleMasterId === formData.PaymentScheduleMasterId ? updatedRecord : item
              )
            );
            addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          }
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
      'Add Payment Schedule Master'
    );
  };
  //#endregion

  //#region DELETE PAYMENT SCHEDULE MASTER
  const handleDeletePaymentScheduleMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);
    if (!deletePaymentScheduleMasterData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeletePaymentScheduleMasterRequest = {
          PaymentScheduleMasterId: deletePaymentScheduleMasterData.PaymentScheduleMasterId || 0,
          Uniquekey: deletePaymentScheduleMasterData.Uniquekey || '',
          ProjectId: Number(projectId)
        };

        const response = await PaymentScheduleMasterService.apiCallDeletePaymentScheduleMaster(params);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;
          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));
          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (PaymentScheduleMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadPaymentScheduleMaster(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          setIsConfirmationDialogBoxOpen(false);
          setDeletePaymentScheduleMasterData(null);
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
      'Delete Payment Schedule Master'
    );
  };
  //#endregion

  return {
    // State
    PaymentScheduleMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewPaymentScheduleMasterData,
    paymentScheduleType,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingPaymentScheduleMasterData,
    isAddUpdateModalOpen,
    formData,
    dropdownLabels,
    isConfirmationDialogBoxOpen,
    deletePaymentScheduleMasterData,
    isShowCustomizePaymentScheduleMasterColumnsModal,
    canAction,
    canExport,
    PaymentScheduleMasterColumns,
    visiblePaymentScheduleMasterColumns,
    selectedPaymentScheduleMasterColumnKeys,
    requiredPaymentScheduleMasterColumnKeys,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewPaymentScheduleMasterData,
    setPaymentScheduleType,
    setShowFilterPopup,
    setTempFilters,
    setErrors,
    setEditingPaymentScheduleMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setDropdownLabels,
    setIsConfirmationDialogBoxOpen,
    setDeletePaymentScheduleMasterData,
    setIsShowCustomizePaymentScheduleMasterColumnsModal,
    setSelectedPaymentScheduleMasterColumnKeys,

    // Actions
    handlePageChange,
    handleSortColumn,
    handleViewPaymentScheduleMasterDetails,
    handleEditPaymentScheduleMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddPaymentScheduleMasterModal,
    handleAddUpdatePaymentScheduleMaster,
    handleDeletePaymentScheduleMaster,
    handleExportPaymentScheduleMasterExcel,
    handleExportPaymentScheduleMasterPdf,
    debouncedSearch,
    clearSearchPaymentScheduleMaster
  };
};


