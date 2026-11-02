import { useCallback, useEffect, useMemo, useState } from "react";
import { getInitialFormState, getDarAllocationColumns } from "@/features/darAllocation/constants/darAllocationConstants";
import type { FilterInfo, SortInfo, TableColumn } from "@/ui/components/DataTable/DataTable";
import type { AddUpdateDarAllocationRequest, DarAllocationData, DarEmployeeDetails, DeleteDarAllocationRequest, FilterWithPaginationDarAllocationRequest } from "@/features/darAllocation/models/DarAllocationModel";
import type { DropdownItem } from "@/core/types/DropdownItem";
import { runApiWithLoader } from "@/core/utils";
import usePagination from "@/core/hooks/usePagination";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import * as E from 'fp-ts/Either';
import { darAllocationService } from "@/features/darAllocation/services/DarAllocationService";
import useToast from "@/core/hooks/useToast";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useMultiSelectDropdown } from "@/core/hooks/useMultiSelectDropdown";
import { fetchVillageDropdown } from "@/features/technical/villageDropDown";
import { fetchEmployeeMasterDropdown, fetchEmployeeMasterById } from "@/features/employeeMaster/employeeMasterDropDown";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import { handleExportFile } from "@/core/utils/exportFile";

export const useDarAllocations = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [darAllocationList, setDarAllocationList] = useState<DarAllocationData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const { pagination, setPagination } = usePagination(20);
    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchDarAllocations(value);
    }, 350)

    //ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const [filters, setFilters] = useState<FilterInfo>({});
    const [showFilterPopup, setShowFilterPopup] = useState(false);

    // EDIT DAR ALLOCATION
    const [editingDarAllocationData, setEditingDarAllocationData] = useState<DarAllocationData | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

    //ADD UPDATE DAR ALLOCATION
    const [formData, setFormData] = useState<AddUpdateDarAllocationRequest>(() => getInitialFormState());
    const [viewDarAllocationsDetailsData, setViewDarAllocationsDetailsData] = useState<DarAllocationData | null>(null);

    // SELECTED EMPLOYEE DETAILS (shown read-only in the form modal)
    const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState<DarEmployeeDetails | null>(null);

    const [villageValue, setVillageValue] = useState<string | number | null>(null);
    const [dropdownResetKey, setDropdownResetKey] = useState(0);

    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteDarAllocationDetailsData, setDeleteDarAllocationDetailsData] = useState<DarAllocationData | null>(null)

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    //#region MENU PERMISSIONS
    const { canAction, canExport } = useMenuPermissions();
    //#endregion

    const { addToast } = useToast();

    const darAllocationColumns = useMemo<TableColumn[]>(() => getDarAllocationColumns(), []);

    //#region FETCH VILLAGE DROPDOWN
    const villageDropdown = useMultiSelectDropdown({
        value: villageValue,
        fetchCallback: fetchVillageDropdown,
        autoFetchOptions: true,
    });

    const loadDarAllocations = useCallback(
        async (
            page: number,
            filterParams: FilterInfo,
            sort?: SortInfo,
            searchText?: string
        ) => {

            await runApiWithLoader(
                setIsLoading,
                setLoadingMessage,
                async () => {
                    const params: FilterWithPaginationDarAllocationRequest = {
                        PageNumber: page,
                        PageSize: pagination.pageSize,
                        IsCheckPermission: true,
                        Location: filterParams.Location?.trim() || "",
                        EmployeeName: searchText ?? filterParams.EmployeeName ?? undefined,
                        SortBy: getSortByParam(sort ?? null, darAllocationColumns)
                    };

                    const response = await darAllocationService.apiCallPullDarAllocation(params);

                    if (E.isRight(response)) {
                        setDarAllocationList(response.right.Data);
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
                'Loading Dar Allocations'
            );
        },
        [pagination.pageSize, darAllocationColumns, addToast]
    );

    const searchDarAllocations = async (searchValue: string) => {

        setSearchTerm(searchValue);

        if (searchValue.trim() === '') {

            loadDarAllocations(1, {}, sortInfo, searchValue);

            return
        }

        await loadDarAllocations(1, {}, sortInfo, searchValue)
    }

    const clearSearchDarAllocations = () => {

        debouncedSearch.cancel?.();

        setSearchTerm('');

        loadDarAllocations(1, {}, sortInfo, undefined);
    };

    useEffect(() => {

        loadDarAllocations(1, {}, undefined, undefined);

    }, [loadDarAllocations]);

    useEffect(() => {
        if (isAddUpdateModalOpen) {
            if (editingDarAllocationData) {
                setVillageValue(
                    editingDarAllocationData.VillageMasterId || ""
                );
            } else {
                setFormData(getInitialFormState());
                setVillageValue("");
                setDropdownResetKey(prev => prev + 1);
            }

            setErrors({});
        }
    }, [isAddUpdateModalOpen, editingDarAllocationData]);

    //#region EMPLOYEE DETAILS
    const mapEmployeeDetails = (d: any): DarEmployeeDetails => ({
        Department: d?.Department,
        Designation: d?.Designation,
        Branch: d?.Branch,
        ReportPersonName: d?.ReportPersonName,
        EmailId: d?.EmailId,
        PersonalMobileNumber: d?.PersonalMobileNumber,
        JoiningDate: d?.JoiningDate,
    });

    // When an employee is picked from the dropdown, the item already carries the details
    const handleEmployeeSelected = (item: DropdownItem | null) => {
        handleFieldChange("EmployeeId", item ? Number(item.value) : 0);
        setSelectedEmployeeDetails(item ? mapEmployeeDetails(item) : null);
    };

    // In edit mode there is no dropdown item yet, so load the employee by id
    useEffect(() => {
        if (!isAddUpdateModalOpen || !editingDarAllocationData?.EmployeeId) {
            setSelectedEmployeeDetails(null);
            return;
        }

        let cancelled = false;

        fetchEmployeeMasterById(editingDarAllocationData.EmployeeId).then(employee => {
            if (!cancelled) setSelectedEmployeeDetails(employee ? mapEmployeeDetails(employee) : null);
        });

        return () => { cancelled = true; };
    }, [isAddUpdateModalOpen, editingDarAllocationData]);
    //#endregion

    const handleExportDarAllocation = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationDarAllocationRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    IsCheckPermission: true,
                    EmployeeName: filters.EmployeeName ?? undefined,
                    Location: filters.Location ?? undefined,
                    SortBy: getSortByParam(sortInfo ?? null, darAllocationColumns),
                    ExportType: exportType
                }

                const response = await darAllocationService.apiCallPullDarAllocation(params);
                handleExportFile(response, exportType, 'Dar Allocation', addToast)
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

    const handleExportDarAllocationExcel = () => handleExportDarAllocation('Excel')
    const handleExportDarAllocationPdf = () => handleExportDarAllocation('PDF')

    //#region PAGE & SORT
    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadDarAllocations(page, filters, sortInfo, searchTerm);
    };

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        setPagination({ currentPage: 1 });
        loadDarAllocations(1, {}, sort, searchTerm);
    },
        [loadDarAllocations, setPagination, searchTerm]
    );
    //#endregion

    const fetchEmployeeDropdown = useCallback(
        async (pageNumber: number, params?: { value?: string }) => {
            return fetchEmployeeMasterDropdown(pageNumber, {
                value: params?.value || "",
                departmentName: "Sales"
            });
        },
        []
    );

    const handleAddDarAllocationModal = () => {
        setEditingDarAllocationData(null);
        setFormData(getInitialFormState());
        setErrors({});
        setVillageValue(null);
        setDropdownResetKey(prev => prev + 1);
        setIsAddUpdateModalOpen(true);
    }

    const PushDarAllocationFormData = (): AddUpdateDarAllocationRequest => {
        const villageIdsString = villageDropdown.selectedValues.length > 0 ? villageDropdown.selectedValues.join(",") : "";

        return {
            DarAllocationId: formData.DarAllocationId || 0,
            Uniquekey: formData.Uniquekey,
            EmployeeId: formData.EmployeeId || 0,
            VillageMasterId: villageIdsString,
        };
    };

    //#region ADD UPDATE EDIT CLASSIFICATION PARAMETER
    const handleFieldChange = (field: keyof AddUpdateDarAllocationRequest, value: any) => {

        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    //#region VIEW EDIT
    const handleViewDarAllocationDetails = useCallback((row: DarAllocationData) => {

        setViewDarAllocationsDetailsData(row);

        setIsViewModalOpen(true);

    }, [])
    //#endregion

    //#region EDIT CLASSIFICATION PARAMETER
    const handleEditDarAllocationDetails = useCallback((row: DarAllocationData) => {
        setEditingDarAllocationData({
            ...row,
        });

        setVillageValue(row.VillageMasterId ?? "");

        setFormData({
            DarAllocationId: row.DarAllocationId ?? 0,
            Uniquekey: row.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            EmployeeId: row.EmployeeId,
            VillageMasterId: row.VillageMasterId,
        });

        setIsAddUpdateModalOpen(true);

    }, [])
    //#endregion

    //#region CONFIRMATION DIALOG BOX
    const handleConfirmationDialogBoxOpen = useCallback((row: DarAllocationData) => {
        setDeleteDarAllocationDetailsData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])
    //#endregion

    const validateAddUpdateDarAllocationForm = (): {
        isValid: boolean
        errors: { [key: string]: string }
    } => {
        const newErrors: { [key: string]: string } = {}

        if (!formData.VillageMasterId || formData.VillageMasterId.trim() === "") {
            newErrors.VillageMasterId = "Location is required";
        }
        if (!formData.EmployeeId) {
            newErrors.EmployeeId = "Employee Name is required";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }

    const handleAddUpdateDarAllocation = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({})

        const validation = validateAddUpdateDarAllocationForm()

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushDarAllocationFormData();

                const response = await darAllocationService.apiCallAddUpdateDarAllocation(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    const isAdd = formData.DarAllocationId === 0;

                    if (isAdd) {

                        const newRecord = response.right.Data[0] as DarAllocationData

                        setDarAllocationList(prevData => [newRecord, ...prevData]);

                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });

                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    } else {

                        const updatedRecord = response.right.Data[0] as DarAllocationData;

                        setDarAllocationList(prevData =>
                            prevData.map(item =>
                                item.DarAllocationId === formData.DarAllocationId
                                    ? updatedRecord
                                    : item
                            )
                        )

                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }

                    setEditingDarAllocationData(null);
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
            Number(formData.DarAllocationId) === 0 ? 'Add Dar Allocation' : 'Update Dar Allocation'
        )
    }

    //#region DELETE DAR ALLOCATION
    const handleDeleteDarAllocation = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteDarAllocationDetailsData) return

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: DeleteDarAllocationRequest =
                {

                    DarAllocationId: deleteDarAllocationDetailsData.DarAllocationId || 0,
                    Uniquekey: deleteDarAllocationDetailsData.Uniquekey,

                }

                const response = await darAllocationService.apiCallDeleteDarAllocation(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    }

                    else if (darAllocationList.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }

                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages
                    });

                    await loadDarAllocations(pageToShow, {}, sortInfo);

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    setIsConfirmationDialogBoxOpen(false);

                    setDeleteDarAllocationDetailsData(null);

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
            'Delete Classification Parameter'
        )
    }
    //#endregion

    return {
        // state
        darAllocationList,
        isLoading,
        loadingMessage,
        darAllocationColumns,
        pagination,
        canAction,
        canExport,
        isAddUpdateModalOpen,
        formData,
        errors,
        editingDarAllocationData,
        villageDropdown,
        dropdownResetKey,
        isViewModalOpen,
        viewDarAllocationsDetailsData,
        isConfirmationDialogBoxOpen,
        deleteDarAllocationDetailsData,
        searchTerm,
        sortInfo,
        debouncedSearch,
        showFilterPopup,
        selectedEmployeeDetails,
        handleEmployeeSelected,
        clearSearchDarAllocations,

        // setters
        setVillageValue,
        setDropdownResetKey,
        setErrors,
        setFormData,
        setIsAddUpdateModalOpen,
        setEditingDarAllocationData,
        setIsViewModalOpen,
        setViewDarAllocationsDetailsData,
        setIsConfirmationDialogBoxOpen,
        setDeleteDarAllocationDetailsData,
        setSearchTerm,
        setFilters,
        setShowFilterPopup,

        // actions
        handlePageChange,
        handleSortColumn,
        handleAddDarAllocationModal,
        fetchEmployeeDropdown,
        handleAddUpdateDarAllocation,
        handleFieldChange,
        handleEditDarAllocationDetails,
        handleConfirmationDialogBoxOpen,
        handleViewDarAllocationDetails,
        handleDeleteDarAllocation,
        handleExportDarAllocationExcel,
        handleExportDarAllocationPdf

    }
}