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
import { otherChargesService } from '@/features/otherCharges/services/OtherChargesService';
import type {
  AddUpdateOtherChargesRequest,
  DeleteOtherChargesRequest,
  FilterWithPaginationOtherChargesRequest,
  OtherChargesData
} from '@/features/otherCharges/models/OtherChargesModel';
import {
  getInitialFormState,
  getOtherChargesColumns,
} from '@/features/otherCharges/constants/otherChargesConstants';

export const useOtherCharges = () => {
  //#region STATE MANAGEMENT
  const [otherChargesList, setOtherChargesList] = useState<OtherChargesData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewOtherChargesData, setViewOtherChargesData] = useState<OtherChargesData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  // ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // ADD / EDIT OTHER CHARGES
  const [editingOtherChargesData, setEditingOtherChargesData] = useState<OtherChargesData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
  const [formData, setFormData] = useState<AddUpdateOtherChargesRequest>(() => getInitialFormState());

  // DELETE OTHER CHARGES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deleteOtherChargesData, setDeleteOtherChargesData] = useState<OtherChargesData | null>(null);

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region PROJECT
  const { projectId } = useProject();
  //#endregion

  //#region TABLE COLUMN DEFINITION
  const otherChargesColumns = useMemo<TableColumn[]>(() => getOtherChargesColumns(),[]);
  //#endregion

  //#region INITIALIZATION

  const loadOtherCharges = useCallback(
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
          const params: FilterWithPaginationOtherChargesRequest = {
            PageNumber: page,
            PageSize: pagination.pageSize,
            ProjectId: Number(projectId),
            ChargeName: filterParams.ChargeName?.toString().trim() || searchText?.trim() || undefined,
            SortBy: getSortByParam(sort ?? null, otherChargesColumns)
          };

          const response = await otherChargesService.apiCallPullOtherCharges(params);

          if (E.isRight(response)) {
            setOtherChargesList(response.right.Data);
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
    [projectId, pagination.pageSize, otherChargesColumns, addToast]
  );

  useEffect(() => {
    
    if (!projectId) return;
    loadOtherCharges(1, {}, undefined, undefined);

  }, [projectId, loadOtherCharges]);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchOtherCharges(value);
  }, 350);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingOtherChargesData) {
        setFormData({
          OtherChargesId: editingOtherChargesData.OtherChargesId || 0,
          Uniquekey: editingOtherChargesData.Uniquekey || getInitialFormState().Uniquekey,
          ChargeName: editingOtherChargesData.ChargeName || '',
          ProjectId: Number(projectId),
          CalculatedOn: editingOtherChargesData.CalculatedOn || '',
          Value: editingOtherChargesData.Value || 0,
          GSTPercentage: editingOtherChargesData.GSTPercentage || 0,
          GSTValue: editingOtherChargesData.GSTValue || 0
        });
      } else {
        setFormData({
          ...getInitialFormState(),
          ProjectId: Number(projectId)
        });
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingOtherChargesData, projectId]);
  //#endregion

  //#region SEARCH
  const searchOtherCharges = async (value: string) => {
    setSearchTerm(value);
    if (value.trim() === '') {
      await loadOtherCharges(1, filters, sortInfo, undefined);
      return;
    }
    await loadOtherCharges(1, filters, sortInfo, value);
  };

  const clearSearchOtherCharges = () => {
    debouncedSearch.cancel?.();
    setSearchTerm('');
    setPagination({ currentPage: 1 });
    loadOtherCharges(1, filters, sortInfo, '');
  };
  //#endregion

  //#region EXPORT
  const handleExportOtherCharges = useCallback(
    async (exportType: 'Excel' | 'PDF') => {
      if (!projectId) return;

      await runApiWithLoader(
        setIsLoading,
        setLoadingMessage,
        async () => {
          const params: FilterWithPaginationOtherChargesRequest = {
            PageNumber: 1,
            PageSize: pagination.totalRecords,
            ProjectId: Number(projectId),
            ChargeName: filters.ChargeName?.toString().trim() || undefined,
            SortBy: getSortByParam(sortInfo ?? null, otherChargesColumns),
            ExportType: exportType
          };

          const response = await otherChargesService.apiCallPullOtherCharges(params);
          handleExportFile(response, exportType, 'Other Charges', addToast);
          return response;
        },
        undefined,
        (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
        undefined,
        'Preparing Export'
      );
    },
    [projectId, pagination.totalRecords, filters, sortInfo, otherChargesColumns, addToast]
  );

  const handleExportOtherChargesExcel = () => handleExportOtherCharges('Excel');
  const handleExportOtherChargesPdf = () => handleExportOtherCharges('PDF');
  //#endregion

  //#region PAGE & SORT
  const handlePageChange = (page: number) => {
    setPagination({ currentPage: page });
    loadOtherCharges(page, filters, sortInfo, searchTerm);
  };

  const handleSortColumn = useCallback(
    (sort: SortInfo) => {
      setSortInfo(sort);
      setPagination({ currentPage: 1 });
      loadOtherCharges(1, filters, sort, searchTerm);
    },
    [filters, searchTerm, loadOtherCharges, setPagination]
  );
  //#endregion

  //#region VIEW / EDIT
  const handleViewOtherChargesDetails = useCallback((row: OtherChargesData) => {
    setViewOtherChargesData(row);
    setIsViewModalOpen(true);
  }, []);

  const handleEditOtherCharges = useCallback((row: OtherChargesData) => {
    setEditingOtherChargesData(row);
    setIsAddUpdateModalOpen(true);
  }, []);
  //#endregion

  //#region CONFIRMATION DIALOG
  const handleConfirmationDialogBoxOpen = useCallback((row: OtherChargesData) => {
    setDeleteOtherChargesData(row);
    setIsConfirmationDialogBoxOpen(true);
  }, []);
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters);
    setPagination({ currentPage: 1 });
    loadOtherCharges(1, tempFilters, sortInfo, searchTerm);
    setShowFilterPopup(false);
  };

  const clearFilters = () => {
    setTempFilters({});
    setFilters({});
    setPagination({ currentPage: 1 });
    loadOtherCharges(1, {}, sortInfo, searchTerm);
    setShowFilterPopup(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };
  //#endregion

  //#region ADD / UPDATE OTHER CHARGES
  const handleFieldChange = (field: keyof AddUpdateOtherChargesRequest, value: any) => {
    setFormData(prev => {
      const updatedData: AddUpdateOtherChargesRequest = {
        ...prev,
        [field]: value
      };

      const baseValue = Number(updatedData.Value) || 0;
      const gstPercent = Number(updatedData.GSTPercentage) || 0;

      if (field === 'Value' || field === 'GSTPercentage') {
        updatedData.GSTValue = Number(((baseValue * gstPercent) / 100).toFixed(2));
      }

      return updatedData;
    });

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddOtherChargesModal = () => {
    setEditingOtherChargesData(null);
    setFormData({
      ...getInitialFormState(),
      ProjectId: Number(projectId)
    });
    setErrors({});
    setIsAddUpdateModalOpen(true);
  };

  const validateAddUpdateOtherChargesForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.ChargeName || formData.ChargeName.trim() === '') {
      newErrors.ChargeName = 'Charge Name is required.';
    } else if (formData.ChargeName.trim().length < 3) {
      newErrors.ChargeName = 'Charge Name must be at least 3 characters long.';
    }

    if (!formData.Value || formData.Value === 0) {
      newErrors.Value = 'Value is required.';
    }

    if (!formData.GSTPercentage || formData.GSTPercentage < 0) {
      newErrors.GSTPercentage = 'GST Percentage is required.';
    }

    if (!formData.CalculatedOn || formData.CalculatedOn.trim() === '') {
      newErrors.CalculatedOn = 'Calculated On is required.';
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };

  const pushOtherChargesFormData = (): AddUpdateOtherChargesRequest => ({
    OtherChargesId: formData.OtherChargesId,
    Uniquekey: formData.Uniquekey,
    ProjectId: Number(projectId),
    ChargeName: formData.ChargeName,
    CalculatedOn: formData.CalculatedOn,
    Value: formData.Value,
    GSTValue: formData.GSTValue,
    GSTPercentage: formData.GSTPercentage
  });

  const handleAddUpdateOtherCharges = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = validateAddUpdateOtherChargesForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = pushOtherChargesFormData();
        const response = await otherChargesService.apiCallAddUpdateOtherCharges(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          const isAdd = formData.OtherChargesId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as OtherChargesData;
            setOtherChargesList(prevData => [newRecord, ...prevData]);
            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });
            addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          } else {
            const updatedRecord = response.right.Data[0] as OtherChargesData;
            setOtherChargesList(prevData =>
              prevData.map(item =>
                item.OtherChargesId === formData.OtherChargesId ? updatedRecord : item
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
      'Add Other Charges'
    );
  };
  //#endregion

  //#region DELETE OTHER CHARGES
  const handleDeleteOtherCharges = async () => {
    setIsConfirmationDialogBoxOpen(false);
    if (!deleteOtherChargesData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteOtherChargesRequest = {
          OtherChargesId: deleteOtherChargesData.OtherChargesId || 0,
          Uniquekey: deleteOtherChargesData.Uniquekey || '',
          ProjectId: Number(projectId)
        };

        const response = await otherChargesService.apiCallDeleteOtherCharges(params);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;
          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));
          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (otherChargesList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadOtherCharges(pageToShow, filters, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          setIsConfirmationDialogBoxOpen(false);
          setDeleteOtherChargesData(null);
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
      'Delete Other Charges'
    );
  };
  //#endregion

  return {
    // State
    otherChargesList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewOtherChargesData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingOtherChargesData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    deleteOtherChargesData,
    canAction,
    canExport,
    otherChargesColumns,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewOtherChargesData,
    setShowFilterPopup,
    setTempFilters,
    setErrors,
    setEditingOtherChargesData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteOtherChargesData,

    // Actions
    handlePageChange,
    handleSortColumn,
    handleViewOtherChargesDetails,
    handleEditOtherCharges,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddOtherChargesModal,
    handleAddUpdateOtherCharges,
    handleDeleteOtherCharges,
    handleExportOtherChargesExcel,
    handleExportOtherChargesPdf,
    debouncedSearch,
    clearSearchOtherCharges
  };
};


