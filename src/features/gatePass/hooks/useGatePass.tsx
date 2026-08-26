import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AddUpdateGatePassRequest, DeleteGatePassRequest, FilterWithPaginationGatePassRequest, GatePassData } from "../models/GatePassModel";
import type { FilterInfo, SortInfo, TableColumn } from "@/ui/components/DataTable/DataTable";
import { runApiWithLoader } from "@/core/utils";
import usePagination from "@/core/hooks/usePagination";
import useToast from "@/core/hooks/useToast";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { getGatePassTableColumns, getInitialFormState, REQUIRED_COLUMN_KEYS } from "../constants/gatePassConstants";
import { gatePassService } from "../services/GatePassService";
import * as E from 'fp-ts/Either';
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { updateFilter } from "@/core/utils/filterHelper";
import { handleExportFile } from "@/core/utils/exportFile";
import { isValidMobile } from "@/core/utils/fileValidation";
import type { EmployeeMasterData } from "@/features/employeeMaster/models/EmployeeMasterModel";
import { fetchEmployeeMasterById } from "@/features/employeeMaster/employeeMasterDropDown";

export const useGatePass = () => {

    const [gatePassList, setGatePassList] = useState<GatePassData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { pagination, setPagination } = usePagination(20);
    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');

    const { canExport: canExportGatePass, canAction: canActionGatePass } = useMenuPermissions("/gatePass");
    const { canExport: canExportGatePassAdministrativeAccess, canAction: canActionGatePassAdministrativeAccess } = useMenuPermissions("/inwardOutwardAdministrativeAccess");


    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const [editingGatePassData, setEditingGatePassData] = useState<GatePassData | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [lastUpdatedRow, setLastUpdatedRow] = React.useState<string | number | null>(null);


    //DELETE DEPARTMENT MASTER STATES
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteGatePassDetailsData, setDeleteGatePassDetailsData] = useState<GatePassData | null>(null)

    const [employeeDetails, setEmployeeDetails] = useState<EmployeeMasterData | null>(null);
    const [formData, setFormData] = useState<AddUpdateGatePassRequest>(() => getInitialFormState());


    const [filters, setFilters] = useState<FilterInfo>({});
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});

    const hasFetchedInitialGatePasses = useRef(false);

    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchGatePass(value);
    }, 350)

    const [isShowCustomizeGatePassColumnsModal, setIsShowCustomizeGatePassColumnsModal] = useState(false);
    const [viewGatePassDetailsData, setViewGatePassDetailsData] = useState<GatePassData | null>(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    useEffect(() => {
        if (hasFetchedInitialGatePasses.current) return
        hasFetchedInitialGatePasses.current = true;
        fetchGatePassList()
    }, [])


    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.()
        }
    }, [debouncedSearch])

    useEffect(() => {
        if (isAddUpdateModalOpen) {
            if (editingGatePassData) {
                setFormData({
                    ExternalId: editingGatePassData.ExternalId,
                    Uniquekey: editingGatePassData.Uniquekey || getInitialFormState().Uniquekey,
                    MobileNumber: editingGatePassData.MobileNumber || '',
                    FullName: editingGatePassData.FullName || '',
                    Address: editingGatePassData.Address || '',
                    Purpose: editingGatePassData.Purpose || '',
                    Remark: editingGatePassData.Remark || '',
                    EmployeeId: editingGatePassData.EmployeeId || 0,
                    PassDateTime: editingGatePassData.PassDateTime || '',
                    NoOfParticipants: editingGatePassData.NoOfParticipants || 0,
                });

                if (editingGatePassData.EmployeeId) {
                    fetchEmployeeMasterById(Number(editingGatePassData.EmployeeId)).then((employee) => {
                        if (!employee) return;
                        setEmployeeDetails(employee);
                    });
                }
            } else {
                setFormData(getInitialFormState());
                setEmployeeDetails(null);
            }
            setErrors({});
        }
    }, [isAddUpdateModalOpen, editingGatePassData]);

    const handlePageChange = useCallback((page: number) => {
        loadGatePassList(page, filters, sortInfo, searchTerm || undefined);
    }, [filters, sortInfo, searchTerm]);

    const handleSortColumn = useCallback((sort: SortInfo) => {

        setSortInfo(sort);

        loadGatePassList(1, filters, sort, searchTerm || undefined);

    }, [filters, searchTerm]);


    const gatePassColumns = useMemo<TableColumn[]>(
        () => getGatePassTableColumns(),
        []
    )

    const requiredGatePassColumnKeys: string[] = REQUIRED_COLUMN_KEYS;

    const allGatePassColumnKeys: string[] = gatePassColumns.map(c => c.key);

    const [selectedGatePassColumnKeys, setSelectedGatePassColumnKeys] = useState<string[]>(() => {
        try {
            const saved = LocalStorageHelper.getGatePassTableColumns();
            if (saved) {
                const parsed = JSON.parse(saved) as string[]
                const withRequired = Array.from(new Set([...parsed, ...requiredGatePassColumnKeys]));
                return withRequired.filter(k => allGatePassColumnKeys.includes(k));
            }
        } catch { }
        return allGatePassColumnKeys
    })

    const clearSearchGatePass = () => {

        debouncedSearch.cancel?.();

        setSearchTerm('');

        loadGatePassList(1, { GatePass: '' }, sortInfo, undefined);
    };

    useEffect(() => {
        setSelectedGatePassColumnKeys(prev => Array.from(new Set([...prev, ...requiredGatePassColumnKeys])).filter(k => allGatePassColumnKeys.includes(k)));
    }, [gatePassColumns.length])

    const visibleGatePassColumns = useMemo(
        () => gatePassColumns.filter(col => selectedGatePassColumnKeys.includes(col.key)),
        [gatePassColumns, selectedGatePassColumnKeys]
    )

    const handleEditGatePass = useCallback((row: GatePassData) => {
        setEditingGatePassData({
            ...row,
            ExternalId: row.ExternalId || 0,
            FullName: row.FullName || '',
            MobileNumber: row.MobileNumber || '',
            Address: row.Address || '',
            Purpose: row.Purpose || '',
            Remark: row.Remark || '',
            EmployeeId: row.EmployeeId || 0,
            PassDateTime: row.PassDateTime || '',
            NoOfParticipants: row.NoOfParticipants || 0,
        })
        setIsAddUpdateModalOpen(true);
    }, [])


    //#region CONFIRMATION DIALOG BOX
    const handleConfirmationDialogBoxOpen = useCallback((row: GatePassData) => {
        setDeleteGatePassDetailsData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])
    //#endregion

    const applyFilters = () => {
        setFilters(tempFilters)
        loadGatePassList(1, tempFilters)
        setShowFilterPopup(false)
    }

    const clearFilters = () => {
        setTempFilters({})
        setFilters({})
        loadGatePassList(1, {})
        setShowFilterPopup(false)
    }

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    };

    const handleViewGatePassDetails = useCallback((row: GatePassData) => {
        setViewGatePassDetailsData(row);
        setIsViewModalOpen(true);
    }, [])

    const fetchGatePassList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
        return await loadGatePassList(page, filters, sort ?? sortInfo);
    }

    const loadGatePassList = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationGatePassRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    IsCheckPermission: true,
                    ExternalId: filterParams.ExternalId ? Number(filterParams.ExternalId) : 0,
                    FullName: searchtext ?? filterParams.FullName ?? undefined,
                    MobileNumber: filterParams.MobileNumber ?? undefined,
                    Address: filterParams.Address ?? undefined,
                    FromDate: filterParams.FromDate ?? undefined,
                    ToDate: filterParams.ToDate ?? undefined,
                    Purpose: filterParams.Purpose ?? undefined,
                    EmployeeName: filterParams.EmployeeName ?? undefined,
                    SortBy: getSortByParam(sortInfo ?? null, gatePassColumns)
                }

                const response = await gatePassService.apiCallPullGatePass(params);

                if (E.isRight(response)) {

                    setGatePassList(response.right.Data);

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
            'Loading Gate Pass'
        )
    }

    const searchGatePass = async (searchValue: string) => {

        setSearchTerm(searchValue);

        if (searchValue.trim() === '') {

            fetchGatePassList();

            return
        }

        await loadGatePassList(1, filters, sortInfo, searchValue)
    }

    const handleExportGatePass = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationGatePassRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    IsCheckPermission: true,
                    FullName: filters.FullName ?? undefined,
                    MobileNumber: filters.MobileNumber ?? undefined,
                    Address: filters.Address ?? undefined,
                    FromDate: filters.FromDate ?? undefined,
                    ToDate: filters.ToDate ?? undefined,
                    Purpose: filters.Purpose ?? undefined,
                    EmployeeName: filters.EmployeeName ?? undefined,
                    SortBy: getSortByParam(sortInfo ?? null, gatePassColumns),
                    ExportType: exportType
                }

                const response = await gatePassService.apiCallPullGatePass(params);
                handleExportFile(response, exportType, 'Gate Pass', addToast)
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

    const handleExportGatePassExcel = () => handleExportGatePass('Excel')
    const handleExportGatePassPdf = () => handleExportGatePass('PDF')

    const handleFieldChange = (field: keyof AddUpdateGatePassRequest, value: any) => {

        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleAddGatePassModal = () => {
        setEditingGatePassData(null);
        setFormData(getInitialFormState());
        setErrors({});
        setIsAddUpdateModalOpen(true);
    }

    const validateAddGatePassForm = (): {
        isValid: boolean
        errors: { [key: string]: string }
    } => {
        const newErrors: { [key: string]: string } = {}
        if (formData.FullName?.trim() === "") {
            newErrors.FullName = "Visitor is required"
        }
        if (formData.MobileNumber?.trim() === "") {
            newErrors.MobileNumber = "Mobile Number is required"
        } else if (!isValidMobile(formData.MobileNumber!.trim())) {
            newErrors.MobileNumber = "Enter a valid 10-Digit Mobile Number";
        }

        if (formData.Address?.trim() === "") {
            newErrors.Address = "Address is required"
        }

        if (formData.NoOfParticipants === null || formData.NoOfParticipants === undefined || formData.NoOfParticipants === 0) {
            newErrors.NoOfParticipants = "Number of Participants is required";
        } else if (formData.NoOfParticipants >= 100) {
            newErrors.NoOfParticipants = "Number of Participants should be less than 100";
        }

        const passDate = formData.PassDateTime?.split("T")[0];

        if (!passDate || passDate === "null" || passDate === "undefined") {
            newErrors.PassDateTime = "Appointment Date is required";
        }

        const passTime = formData.PassDateTime?.split("T")[1];

        if (!passTime || passTime.substring(0, 5) === "00:00") {
            newErrors.PassTime = "Appointment Time is required";
        }

        if (formData.Purpose?.trim() === "") {
            newErrors.Purpose = "Purpose is required";
        }
        if (formData.EmployeeId === 0) {
            newErrors.EmployeeId = "Appointment With is required";
        }
        if (formData.PassDateTime && formData.PassDateTime?.substring(11, 16) === "00:00") {
            newErrors.PassTime = "Appointment Time is required";
        }

        setErrors(newErrors)
        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }

    const PushGatePassFormData = (): AddUpdateGatePassRequest => {

        return {
            ExternalId: formData.ExternalId,
            Uniquekey: formData.Uniquekey,
            FullName: formData.FullName,
            MobileNumber: formData.MobileNumber,
            Address: formData.Address,
            Purpose: formData.Purpose,
            Remark: formData.Remark,
            EmployeeId: formData.EmployeeId,
            PassDateTime: formData.PassDateTime,
            NoOfParticipants: formData.NoOfParticipants,
        }
    }

    const handleAddUpdateGatePass = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({})

        const validation = validateAddGatePassForm();

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushGatePassFormData();

                const response = await gatePassService.apiCallAddUpdateGatePass(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    const isAdd = formData.ExternalId === 0;

                    if (isAdd) {

                        const newRecord = response.right.Data[0] as GatePassData

                        setGatePassList(prevData => [newRecord, ...prevData]);
                        setLastUpdatedRow(newRecord.ExternalId);
                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });

                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    } else {

                        const updatedRecord = response.right.Data[0] as GatePassData;
                        setLastUpdatedRow(updatedRecord.ExternalId);

                        setGatePassList(prevData =>
                            prevData.map(item =>
                                item.ExternalId === formData.ExternalId
                                    ? updatedRecord
                                    : item
                            )
                        )

                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }

                    setEditingGatePassData(null);
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
            Number(formData.ExternalId) === 0 ? 'Add GatePass' : 'Update GatePass'
        )

    }

    const handleDeleteGatePass = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteGatePassDetailsData) return

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: DeleteGatePassRequest = {
                    ExternalId: deleteGatePassDetailsData.ExternalId,
                    Uniquekey: deleteGatePassDetailsData.Uniquekey
                }

                const response = await gatePassService.apiCallDeleteGatePass(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    }

                    else if (gatePassList.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }

                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages
                    });

                    await loadGatePassList(pageToShow, filters, sortInfo);

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    setIsConfirmationDialogBoxOpen(false);

                    setDeleteGatePassDetailsData(null);

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
            'Delete Department'
        )
    }

    return {
        isLoading,
        loadingMessage,
        gatePassList,
        pagination,
        sortInfo,
        searchTerm,
        debouncedSearch,
        filters,
        canActionGatePass,
        canActionGatePassAdministrativeAccess,
        canExportGatePass,
        canExportGatePassAdministrativeAccess,
        lastUpdatedRow,
        visibleGatePassColumns,
        isAddUpdateModalOpen,
        formData,
        errors,
        editingGatePassData,
        isConfirmationDialogBoxOpen,
        isViewModalOpen,
        viewGatePassDetailsData,
        showFilterPopup,
        tempFilters,
        requiredGatePassColumnKeys,
        gatePassColumns,
        isShowCustomizeGatePassColumnsModal,
        clearSearchGatePass,
        employeeDetails,

        setSearchTerm,
        setIsAddUpdateModalOpen,
        setEditingGatePassData,
        setFormData,
        setErrors,
        setIsConfirmationDialogBoxOpen,
        setDeleteGatePassDetailsData,
        setShowFilterPopup,
        setTempFilters,
        setSelectedGatePassColumnKeys,
        selectedGatePassColumnKeys,
        setIsShowCustomizeGatePassColumnsModal,
        setEmployeeDetails,


        setFilters,
        fetchGatePassList,
        handlePageChange,
        handleSortColumn,
        handleViewGatePassDetails,
        handleFieldChange,
        handleAddGatePassModal,
        handleAddUpdateGatePass,
        handleConfirmationDialogBoxOpen,
        handleDeleteGatePass,
        applyFilters,
        clearFilters,
        setIsViewModalOpen,
        setViewGatePassDetailsData,
        handleEditGatePass,
        handleFilterChange,
        handleExportGatePassExcel,
        handleExportGatePassPdf,
    }
}