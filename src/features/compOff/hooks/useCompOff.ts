import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import type { FilterInfo, SortInfo, TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
    CompOffData,
    FilterWithPaginationCompOff,
    AddUpdateCompOff,
    DeleteCompOffRequest,
} from '@/features/compOff/models/compOff';
import { compOffService } from '@/features/compOff/services/CompOffServices';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { updateFilter } from '@/core/utils/filterHelper';
import { handleExportFile } from '@/core/utils/exportFile';
import { getInitialFormState, getCompOffColumns, REQUIRED_COLUMN_KEYS } from '@/features/compOff/constants/compOffConstants';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';

export const useCompOff = () => {

    //#region STATE MANAGEMENT
    const [compOffList, setCompOffList] = useState<CompOffData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { pagination, setPagination } = usePagination(20);
    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
    const { addToast } = useToast();

    const [viewCompOffDetailsData, setViewCompOffDetailsData] = useState<CompOffData | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    //FILTER STATES
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [filters, setFilters] = useState<FilterInfo>({});
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});

    //ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    // EDIT COMP OFF
    const [editingCompOffData, setEditingCompOffData] = useState<CompOffData | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

    //ADD UPDATE COMP OFF
    const [formData, setFormData] = useState<AddUpdateCompOff>(() => getInitialFormState());
    const [modalKey, setModalKey] = useState(0);

    //DELETE COMP OFF STATES
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [deleteCompOffDetailsData, setDeleteCompOffDetailsData] = useState<CompOffData | null>(null);

    //CUSTOMIZE COLUMN MODAL
    const [isShowCustomizeCompOffColumnsModal, setIsShowCustomizeCompOffColumnsModal] = useState(false);

    //#endregion

    //#region MENU PERMISSIONS
    const { canAction, canExport } = useMenuPermissions();
    //#endregion

    //#region INITIALIZATION

    const hasFetchedInitialCompOff = useRef(false);

    useEffect(() => {
        if (isAddUpdateModalOpen) {
            if (editingCompOffData) {
                setFormData({
                    CompOffId: editingCompOffData.CompOffId || 0,
                    Uniquekey: editingCompOffData.Uniquekey && editingCompOffData.Uniquekey.trim() !== ''
                        ? editingCompOffData.Uniquekey.trim()
                        : '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                    CompOffDate: editingCompOffData.CompOffDate || null,
                    WorkingDate: editingCompOffData.WorkingDate || null,
                    Reason: editingCompOffData.Reason || null,
                });
            } else {
                setFormData(getInitialFormState());
            }
            setErrors({});
        }
    }, [isAddUpdateModalOpen, editingCompOffData]);

    //#endregion

    //#region TABLE COLUMN DEFINITION (moved earlier for use in loadCompOff)

    const handleViewCompOffDetails = useCallback((row: CompOffData) => {
        setViewCompOffDetailsData(row);
        setIsViewModalOpen(true);
    }, []);

    const compOffColumns = useMemo<TableColumn[]>(
        () => getCompOffColumns(handleViewCompOffDetails),
        [handleViewCompOffDetails]
    );
    //#endregion

    //#region DATA LOADING | FETCH | LOAD

    const loadCompOff = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationCompOff = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    CompOffId: filterParams.CompOffId ? Number(filterParams.CompOffId) : 0,
                    StartDate: filterParams.StartDate || undefined,
                    EndDate: filterParams.EndDate || undefined,
                    Reason: filterParams.Reason?.trim() || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, compOffColumns),
                    IsReport: false,
                    CanApprove: false,
                };

                const response = await compOffService.apiCallPullCompOff(params);

                if (E.isRight(response)) {
                    setCompOffList(response.right.Data);
                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
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
            'Loading Comp Off Data'
        );
    };

    const fetchCompOffList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
        return await loadCompOff(page, filters, sort ?? sortInfo);
    };

    useEffect(() => {
        if (hasFetchedInitialCompOff.current) return;
        hasFetchedInitialCompOff.current = true;
        fetchCompOffList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    //#endregion


    //#region EXPORT EXCEL | PDF

    const handleExportCompOff = useCallback(async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationCompOff = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    CompOffId: filters.CompOffId ? Number(filters.CompOffId) : 0,
                    StartDate: filters.StartDate || undefined,
                    EndDate: filters.EndDate || undefined,
                    Reason: filters.Reason?.trim() || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, compOffColumns),
                    IsReport: false,
                    CanApprove: false,
                    ExportType: exportType,
                };

                const response = await compOffService.apiCallPullCompOff(params);
                handleExportFile(response, exportType, 'Comp Off', addToast);
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message || 'Export failed' });
            },
            undefined,
            'Preparing Export...'
        );
    }, [compOffColumns, sortInfo, filters, pagination.totalRecords, addToast]);

    const handleExportCompOffExcel = useCallback(() => handleExportCompOff('Excel'), [handleExportCompOff]);
    const handleExportCompOffPdf = useCallback(() => handleExportCompOff('PDF'), [handleExportCompOff]);
    //#endregion

    //#region HANDLE PAGE CHANGE EVENT
    const handlePageChange = (page: number) => {
        fetchCompOffList(page);
    };
    //#endregion

    //#region TABLE SORT COLUMN
    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        loadCompOff(1, filters, sort);
    }, [filters]);
    //#endregion

    //#region CUSTOMIZE TABLE COLUMNS
    const requiredCompOffColumnKeys: string[] = REQUIRED_COLUMN_KEYS;

    const allCompOffColumnKeys = useMemo<string[]>(() => compOffColumns.map(c => c.key), [compOffColumns]);

    const [selectedCompOffColumnKeys, setSelectedCompOffColumnKeys] = useState<string[]>(() => {
        try {
            const saved = LocalStorageHelper.getCompOffTableColumns();
            if (saved) {
                const parsed = JSON.parse(saved) as string[];
                const allKeys = compOffColumns.map(c => c.key);
                const withRequired = Array.from(new Set([...parsed, ...requiredCompOffColumnKeys]));
                return withRequired.filter(k => allKeys.includes(k));
            }
        } catch { }
        return compOffColumns.map(c => c.key);
    });

    useEffect(() => {
        // Only update if the selected keys don't already include all required keys and valid keys
        setSelectedCompOffColumnKeys(prev => {
            const newKeys = Array.from(new Set([...prev, ...requiredCompOffColumnKeys])).filter(k => allCompOffColumnKeys.includes(k));
            // Only update if something actually changed to prevent infinite loop
            if (newKeys.length === prev.length && newKeys.every((key, idx) => prev[idx] === key)) {
                return prev;
            }
            return newKeys;
        });
    }, [allCompOffColumnKeys, requiredCompOffColumnKeys]);

    const visibleCompOffColumns = useMemo(() => {
        const filtered = compOffColumns.filter(col => selectedCompOffColumnKeys.includes(col.key));
        const hasActions = filtered.some(col => col.key === 'Actions');
        if (!hasActions) {
            const actionsColumn = compOffColumns.find(col => col.key === 'Actions');
            if (actionsColumn) {
                return [...filtered, actionsColumn];
            }
        }
        return filtered;
    }, [compOffColumns, selectedCompOffColumnKeys]);
    //#endregion

    //#region EDIT COMP OFF
    const handleEditCompOff = useCallback((row: CompOffData) => {
        setEditingCompOffData(row);
        setIsAddUpdateModalOpen(true);
    }, []);
    //#endregion

    //#region CONFIRMATION DIALOG BOX
    const handleConfirmationDialogBoxOpen = useCallback((row: CompOffData) => {
        setDeleteCompOffDetailsData(row);
        setIsConfirmationDialogBoxOpen(true);
    }, []);
    //#endregion

    //#region FILTER MODAL HELPERS
    const applyFilters = () => {
        setFilters(tempFilters);
        loadCompOff(1, tempFilters);
        setShowFilterPopup(false);
    };
    //#endregion

    //#region CLEAR FILTERS
    const clearFilters = () => {
        setTempFilters({});
        setFilters({});
        loadCompOff(1, {});
        setShowFilterPopup(false);
    };
    //#endregion

    //#region HANDLE FILTER CHANGE
    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    };
    //#endregion

    //#region ADD UPDATE EDIT COMP OFF

    const handleFieldChange = (field: keyof AddUpdateCompOff, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleAddCompOffModal = () => {
        setEditingCompOffData(null);
        setFormData(getInitialFormState());
        setErrors({});
        setIsAddUpdateModalOpen(true);
    };

    const validateAddCompOffForm = (data: AddUpdateCompOff): {
        isValid: boolean;
        errors: { [key: string]: string };
    } => {
        const newErrors: { [key: string]: string } = {};

        const hasCompOffDate = data.CompOffDate && String(data.CompOffDate).trim();
        const hasWorkingDate = data.WorkingDate && String(data.WorkingDate).trim();

        if (!hasCompOffDate && !hasWorkingDate) {
            newErrors.CompOffDate = 'At least one date (Comp Off Date or Working Date) is required';
            newErrors.WorkingDate = 'At least one date (Comp Off Date or Working Date) is required';
        }

        if (!data.Reason || !String(data.Reason).trim()) {
            newErrors.Reason = 'Reason is required';
        } else if (String(data.Reason).trim().length > 500) {
            newErrors.Reason = 'Reason must be at most 500 characters';
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const handleResetCompOff = useCallback(() => {
        setFormData(getInitialFormState());
        setErrors({});
        setModalKey(prev => prev + 1);
    }, [setFormData, setErrors, setModalKey]);

    const handleAddUpdateCompOff = async (startDate: string | null, endDate: string | null) => {
        setErrors({});

        const updatedFormData: AddUpdateCompOff = {
            ...formData,
            WorkingDate: startDate !== null ? startDate : formData.WorkingDate,
            CompOffDate: endDate !== null ? endDate : formData.CompOffDate,
            Reason: formData.Reason,
        };

        const validation = validateAddCompOffForm(updatedFormData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setFormData(updatedFormData);

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const payload: AddUpdateCompOff = {
                    CompOffId: updatedFormData.CompOffId || null,
                    Uniquekey: updatedFormData.Uniquekey && updatedFormData.Uniquekey.trim() !== ''
                        ? updatedFormData.Uniquekey.trim()
                        : '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                    CompOffDate: updatedFormData.CompOffDate?.trim() || null,
                    WorkingDate: updatedFormData.WorkingDate?.trim() || null,
                    Reason: updatedFormData.Reason?.trim() || null,
                };

                const response = await compOffService.apiCallAddUpdateCompOff(payload);

                if (E.isRight(response)) {
                    setIsAddUpdateModalOpen(false);

                    const isAdd = updatedFormData.CompOffId === 0;

                    if (isAdd) {
                        const newRecord = response.right.Data[0] as CompOffData;
                        setCompOffList(prevData => [newRecord, ...prevData]);
                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize),
                        });
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] });
                    } else {
                        const updatedRecord = response.right.Data[0] as CompOffData;
                        setCompOffList(prevData =>
                            prevData.map(item =>
                                item.CompOffId === updatedFormData.CompOffId
                                    ? updatedRecord
                                    : item
                            )
                        );
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] });
                    }

                    setEditingCompOffData(null);
                    setFormData(getInitialFormState());
                    setErrors({});
                    setModalKey(prev => prev + 1);
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
            updatedFormData.CompOffId === 0 ? 'Adding Comp Off...' : 'Updating Comp Off...'
        );
    };
    //#endregion

    //#region DELETE COMP OFF
    const handleDeleteCompOff = async () => {
        setIsConfirmationDialogBoxOpen(false);

        if (!deleteCompOffDetailsData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const deleteRequest: DeleteCompOffRequest = {
                    CompOffId: deleteCompOffDetailsData.CompOffId,
                    Uniquekey: deleteCompOffDetailsData.Uniquekey
                };

                const response = await compOffService.apiCallDeleteCompOff(deleteRequest);

                if (E.isRight(response)) {
                    const newTotalRecords = pagination.totalRecords - 1;
                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));
                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    } else if (compOffList.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }

                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages,
                    });

                    await loadCompOff(pageToShow, filters, sortInfo);

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });
                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteCompOffDetailsData(null);
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
            'Deleting Comp Off...'
        );
    };
    //#endregion

    return {
        compOffList,
        isLoading,
        loadingMessage,
        pagination,
        sortInfo,
        viewCompOffDetailsData,
        isViewModalOpen,
        showFilterPopup,
        filters,
        tempFilters,
        errors,
        editingCompOffData,
        isAddUpdateModalOpen,
        formData,
        isConfirmationDialogBoxOpen,
        deleteCompOffDetailsData,
        isShowCustomizeCompOffColumnsModal,
        modalKey,
        canAction,
        canExport,
        compOffColumns,
        visibleCompOffColumns,
        selectedCompOffColumnKeys,
        requiredCompOffColumnKeys,
        allCompOffColumnKeys,

        // Setters
        setIsViewModalOpen,
        setViewCompOffDetailsData,
        setShowFilterPopup,
        setTempFilters,
        setFilters,
        setErrors,
        setEditingCompOffData,
        setIsAddUpdateModalOpen,
        setFormData,
        setIsConfirmationDialogBoxOpen,
        setDeleteCompOffDetailsData,
        setIsShowCustomizeCompOffColumnsModal,
        setSelectedCompOffColumnKeys,
        setModalKey,

        // Actions
        fetchCompOffList,
        handlePageChange,
        handleSortColumn,
        handleViewCompOffDetails,
        handleEditCompOff,
        handleConfirmationDialogBoxOpen,
        applyFilters,
        clearFilters,
        handleFilterChange,
        handleFieldChange,
        handleAddCompOffModal,
        handleAddUpdateCompOff,
        handleDeleteCompOff,
        handleExportCompOffExcel,
        handleExportCompOffPdf,
        handleResetCompOff,
        loadCompOff,
    };
};

