import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import usePagination from "@/core/hooks/usePagination";
import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import type { FilterInfo, SortInfo, TableColumn } from "@/ui/components/DataTable/DataTable";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AddUpdateNoticeSectionMasterRequest, DeleteNoticeSectionMasterRequest, FilterWithPaginationNoticeSectionMasterRequest } from "@/features/noticeSectionMaster/models/NoticeSectionMasterModel";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { getInitialFormState, getNoticeSectionMasterColumns, REQUIRED_COLUMN_KEYS } from "@/features/noticeSectionMaster/constants/noticeSectionMasterConstants";
import { noticeSectionMasterService } from "@/features/noticeSectionMaster/services/NoticeSectionMasterService";
import * as E from 'fp-ts/Either';
import type { NoticeSectionMasterData } from '@/features/noticeSectionMaster/models/NoticeSectionMasterModel';
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { handleExportFile } from "@/core/utils/exportFile";
import { updateFilter } from "@/core/utils/filterHelper";

export const useNoticeSectionMaster = () => {

    const [noticeSectionMasterList, setNoticeSectionMasterList] = useState<NoticeSectionMasterData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { pagination, setPagination } = usePagination(20);
    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');

    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchNoticeSectionMaster(value);
    }, 350)

    const [editingNoticeSectionMasterData, setEditingNoticeSectionMasterData] = useState<NoticeSectionMasterData | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [lastUpdatedRow, setLastUpdatedRow] = React.useState<string | number | null>(null);

    const [formData, setFormData] = useState<AddUpdateNoticeSectionMasterRequest>(() => getInitialFormState());

    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteNoticeSectionMasterDetailsData, setDeleteNoticeSectionMasterDetailsData] = useState<NoticeSectionMasterData | null>(null)

    const [isShowCustomizeNoticeSectionMasterColumnsModal, setIsShowCustomizeNoticeSectionMasterColumnsModal] = useState(false);
    const [viewNoticeSectionMasterDetailsData, setViewNoticeSectionMasterDetailsData] = useState<NoticeSectionMasterData | null>(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const [filters, setFilters] = useState<FilterInfo>({});
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});

    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const { canAction, canExport } = useMenuPermissions();

    const hasFetchedInitialNoticeSections = useRef(false)

    useEffect(() => {
        if (hasFetchedInitialNoticeSections.current) return
        hasFetchedInitialNoticeSections.current = true;
        fetchNoticeSectionList()
    }, [])

    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.()
        }
    }, [debouncedSearch])

    useEffect(() => {
        if (isAddUpdateModalOpen) {
            if (editingNoticeSectionMasterData) {
                setFormData({
                    NoticeSectionMasterId: editingNoticeSectionMasterData.NoticeSectionMasterId,
                    Uniquekey: editingNoticeSectionMasterData.Uniquekey || getInitialFormState().Uniquekey,
                    NoticeSection: editingNoticeSectionMasterData.NoticeSection || '',
                    GovernmentCompliance: editingNoticeSectionMasterData.GovernmentCompliance || ''
                });
            } else {
                setFormData(getInitialFormState());
            }
            setErrors({});
        }
    }, [isAddUpdateModalOpen, editingNoticeSectionMasterData]);


    const noticeSectionMasterColumns = useMemo<TableColumn[]>(
        () => getNoticeSectionMasterColumns(),
        []
    )

    const fetchNoticeSectionList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
        return await loadNoticeSections(page, filters, sort ?? sortInfo);
    }

    const loadNoticeSections = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationNoticeSectionMasterRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    IsCheckPermission: true,
                    NoticeSectionMasterId: filterParams.NoticeSectionMasterId ? Number(filterParams.NoticeSectionMasterId) : 0,
                    GovernmentCompliance: filterParams.GovernmentCompliance ?? undefined,
                    NoticeSection: searchtext ?? filterParams.NoticeSection ?? undefined,
                    SortBy: getSortByParam(sortInfo ?? null, noticeSectionMasterColumns)
                }

                const response = await noticeSectionMasterService.apiCallPullNoticeSectionMaster(params);

                if (E.isRight(response)) {

                    setNoticeSectionMasterList(response.right.Data);

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
            'Loading Notice Sections'
        )
    }

    const searchNoticeSectionMaster = async (searchValue: string) => {

        setSearchTerm(searchValue);

        if (searchValue.trim() === '') {

            fetchNoticeSectionList();

            return
        }

        await loadNoticeSections(1, filters, sortInfo, searchValue)
    }

    const clearSearchNoticeSectionMaster = () => {

        debouncedSearch.cancel?.();

        setSearchTerm('');

        loadNoticeSections(1, { NoticeSection: '' }, sortInfo, undefined);
    };

    const handleExportNoticeSectionMaster = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationNoticeSectionMasterRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    IsCheckPermission: true,
                    NoticeSectionMasterId: filters.NoticeSectionMasterId ? Number(filters.NoticeSectionMasterId) : 0,
                    GovernmentCompliance: filters.GovernmentCompliance ?? undefined,
                    NoticeSection: filters.NoticeSection ?? undefined,
                    SortBy: getSortByParam(sortInfo ?? null, noticeSectionMasterColumns),
                    ExportType: exportType
                }

                const response = await noticeSectionMasterService.apiCallPullNoticeSectionMaster(params);
                handleExportFile(response, exportType, 'Notice Section Master', addToast)
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

    const handleExportNoticeSectionMasterExcel = () => handleExportNoticeSectionMaster('Excel')
    const handleExportNoticeSectionMasterPdf = () => handleExportNoticeSectionMaster('PDF')


    const handlePageChange = useCallback((page: number) => {
        loadNoticeSections(page, filters, sortInfo, searchTerm || undefined);
    }, [filters, sortInfo, searchTerm]);

    const handleSortColumn = useCallback((sort: SortInfo) => {

        setSortInfo(sort);

        loadNoticeSections(1, filters, sort, searchTerm || undefined);

    }, [filters, searchTerm]);


    const requiredNoticeSectionMasterMasterColumnKeys: string[] = REQUIRED_COLUMN_KEYS;

    const allNoticeSectionMasterColumnKeys: string[] = noticeSectionMasterColumns.map(c => c.key)

    const [selectedNoticeSectionMasterColumnKeys, setSelectedNoticeSectionMasterColumnKeys] = useState<string[]>(() => {
        try {
            const saved = LocalStorageHelper.getNoticeSectionMasterTableColumns();
            if (saved) {
                const parsed = JSON.parse(saved) as string[]
                const withRequired = Array.from(new Set([...parsed, ...requiredNoticeSectionMasterMasterColumnKeys]));
                return withRequired.filter(k => allNoticeSectionMasterColumnKeys.includes(k));
            }
        } catch { }
        return allNoticeSectionMasterColumnKeys
    })

    useEffect(() => {

        setSelectedNoticeSectionMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredNoticeSectionMasterMasterColumnKeys])).filter(k => allNoticeSectionMasterColumnKeys.includes(k)));

    }, [noticeSectionMasterColumns.length])

    const visibleNoticeSectionMasterColumns = useMemo(
        () => noticeSectionMasterColumns.filter(col => selectedNoticeSectionMasterColumnKeys.includes(col.key)),
        [noticeSectionMasterColumns, selectedNoticeSectionMasterColumnKeys]
    )

    const handleViewNoticeSectionMasterDetails = useCallback((row: NoticeSectionMasterData) => {
        setViewNoticeSectionMasterDetailsData(row);
        setIsViewModalOpen(true);
    }, [])

    const handleEditNoticeSectionMaster = useCallback((row: NoticeSectionMasterData) => {
        setEditingNoticeSectionMasterData({
            ...row,
            GovernmentCompliance: row.GovernmentCompliance || '',
            NoticeSection: row.NoticeSection || ''
        })
        setIsAddUpdateModalOpen(true);
    }, [])

    const handleConfirmationDialogBoxOpen = useCallback((row: NoticeSectionMasterData) => {
        setDeleteNoticeSectionMasterDetailsData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])

    const applyFilters = () => {
        setFilters(tempFilters)
        loadNoticeSections(1, tempFilters)
        setShowFilterPopup(false)
    }

    const clearFilters = () => {
        setTempFilters({})
        setFilters({})
        loadNoticeSections(1, {})
        setShowFilterPopup(false)
    }

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    };

    const validateAddNoticeSectionMasterForm = (): {
        isValid: boolean
        errors: { [key: string]: string }
    } => {
        const newErrors: { [key: string]: string } = {}

        if (formData.NoticeSection.trim() === "") {
            newErrors.NoticeSection = "Notice Section is required";
        }

        if (formData.GovernmentCompliance.trim() === "") {
            newErrors.GovernmentCompliance = "Government Compliance is required"
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }

    const PushNoticeSectionMasterFormData = (): AddUpdateNoticeSectionMasterRequest => {
        return {
            NoticeSectionMasterId: formData.NoticeSectionMasterId,
            Uniquekey: formData.Uniquekey,
            GovernmentCompliance: formData.GovernmentCompliance,
            NoticeSection: formData.NoticeSection
        };
    };

    const handleFieldChange = (field: keyof AddUpdateNoticeSectionMasterRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleAddUpdateNoticeSectionMaster = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({})

        const validation = validateAddNoticeSectionMasterForm()

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushNoticeSectionMasterFormData();

                const response = await noticeSectionMasterService.apiCallAddUpdateNoticeSectionMaster(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    const isAdd = formData.NoticeSectionMasterId === 0;

                    if (isAdd) {

                        const newRecord = response.right.Data[0] as NoticeSectionMasterData

                        setNoticeSectionMasterList(prevData => [newRecord, ...prevData]);
                        setLastUpdatedRow(newRecord.NoticeSectionMasterId);
                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });

                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    } else {

                        const updatedRecord = response.right.Data[0] as NoticeSectionMasterData;
                        setLastUpdatedRow(updatedRecord.NoticeSectionMasterId);

                        setNoticeSectionMasterList(prevData =>
                            prevData.map(item =>
                                item.NoticeSectionMasterId === formData.NoticeSectionMasterId
                                    ? updatedRecord
                                    : item
                            )
                        )

                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }

                    setEditingNoticeSectionMasterData(null);
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
            Number(formData.NoticeSectionMasterId) === 0 ? 'Add Notice Section' : 'Update Notice Section'
        )
    };


    const handleAddNoticeSectionModal = () => {
        setEditingNoticeSectionMasterData(null);
        setFormData({
            ...getInitialFormState(),
        });
        setErrors({});
        setIsAddUpdateModalOpen(true);
    }

    const handleDeleteNoticeSectionMaster = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteNoticeSectionMasterDetailsData) return

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: DeleteNoticeSectionMasterRequest = {
                    NoticeSectionMasterId: deleteNoticeSectionMasterDetailsData.NoticeSectionMasterId,
                    Uniquekey: deleteNoticeSectionMasterDetailsData.Uniquekey
                }

                const response = await noticeSectionMasterService.apiCallDeleteNoticeSectionMaster(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    }

                    else if (noticeSectionMasterList.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }

                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages
                    });

                    await loadNoticeSections(pageToShow, filters, sortInfo);

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    setIsConfirmationDialogBoxOpen(false);

                    setDeleteNoticeSectionMasterDetailsData(null);

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
            'Delete Notice Section'
        )
    }

    return {
        noticeSectionMasterList,
        isLoading,
        loadingMessage,
        pagination,
        sortInfo,
        searchTerm,
        canAction,
        canExport,
        debouncedSearch,
        noticeSectionMasterColumns,
        visibleNoticeSectionMasterColumns,
        lastUpdatedRow,
        isShowCustomizeNoticeSectionMasterColumnsModal,
        requiredNoticeSectionMasterMasterColumnKeys,
        selectedNoticeSectionMasterColumnKeys,
        isAddUpdateModalOpen,
        formData,
        errors,
        editingNoticeSectionMasterData,
        isConfirmationDialogBoxOpen,
        deleteNoticeSectionMasterDetailsData,
        isViewModalOpen,
        filters,
        showFilterPopup,
        tempFilters,
        viewNoticeSectionMasterDetailsData,

        //Setters
        setSearchTerm,
        setPagination,
        setSortInfo,
        setFilters,
        setIsShowCustomizeNoticeSectionMasterColumnsModal,
        setSelectedNoticeSectionMasterColumnKeys,
        setEditingNoticeSectionMasterData,
        setFormData,
        setErrors,
        setIsAddUpdateModalOpen,
        setIsConfirmationDialogBoxOpen,
        setDeleteNoticeSectionMasterDetailsData,
        setIsViewModalOpen,
        setViewNoticeSectionMasterDetailsData,
        setShowFilterPopup,
        setTempFilters,

        //Actions
        fetchNoticeSectionList,
        handleSortColumn,
        handlePageChange,
        handleEditNoticeSectionMaster,
        handleViewNoticeSectionMasterDetails,
        handleConfirmationDialogBoxOpen,
        applyFilters,
        clearFilters,
        handleExportNoticeSectionMasterExcel,
        handleExportNoticeSectionMasterPdf,
        clearSearchNoticeSectionMaster,
        searchNoticeSectionMaster,
        handleAddNoticeSectionModal,
        handleAddUpdateNoticeSectionMaster,
        handleFieldChange,
        handleDeleteNoticeSectionMaster,
        handleFilterChange,
    }
}