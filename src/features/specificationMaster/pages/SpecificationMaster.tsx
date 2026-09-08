import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import usePagination from "@/core/hooks/usePagination";
import { DataTableWithOutBorder, type TableColumn } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { type FilterInfo, type PaginationInfo, type SortInfo } from "@/ui/components/DataTable/DataTable";
import { Loader } from "@/core/utils/loader";
import { Modal } from "@/ui/components/Modal/Modal";
import { Button, Input } from "@/ui/components/forms";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Edit, Plus, Trash2 } from "lucide-react";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import Tabs from "@/ui/components/Tab/Tab";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchUOMMasterDropdown } from "@/features/uomMaster/uomMasterDropdown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import DataTableExpandable, { type DataTableExpandableRef } from "@/ui/components/DataTable/DataTableExpandable";
import type { AddUpdateSpecificationMaster, DeleteSpecificationMasterRequest, filterwithPaginationSpecificationMasterRequest, SpecificationMasterData } from "@/features/specificationMaster/models/SpecificationMasterModel";
import { specificationMasterService } from "@/features/specificationMaster/services/SpecificationMasterService";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { handleExportFile } from "@/core/utils/exportFile";
import { filterNumbersWithDecimal } from "@/core/utils/fileValidation";
import { fetchSubMaterialMasterById, fetchSubMaterialMasterDropdown } from "@/features/subMaterialMaster/subMaterialMasterDropdown";
import type { SubMaterialMasterData } from "@/features/subMaterialMaster/models/SubMaterialMasterModel";
import { FieldItem } from "@/ui/components/forms/FieldItem";

const initialFormState = (): AddUpdateSpecificationMaster => ({
    SpecificationMasterId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    CategoryName: "",
    UomMasterId: 0,
    LevelId1: 0,
    LevelId2: 0,
    LevelId3: 0,
    SubMaterialMasterId: 0,
    Quantity: 0
});

export const SpecificationMaster: React.FC = () => {

    const [specificationMasterlist, setSpecificationMasterlist] = useState<SpecificationMasterData[]>([]);
    const [formData, setFormData] = useState<AddUpdateSpecificationMaster>(() => initialFormState());
    const [editSpecificationMasterData, setEditSpecificationMasterData] = useState<SpecificationMasterData | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState('');
    const { addToast } = useToast();
    const { pagination, setPagination } = usePagination(20);
    const [deleteSpecificationMaster, setDeleteSpecificationMaster] = useState<SpecificationMasterData | null>(null);
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const { canAction, canExport } = useMenuPermissions();
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const [dropdownLabels, setDropdownLabels] = useState<{ uom?: string; LevelId3?: string }>({});
    const dtRef = useRef<DataTableExpandableRef | null>(null);
    const [expandedParentRow, setExpandedParentRow] = useState<any>(null);
    const [expandedParentId, setExpandedParentId] = useState<number | null>(null);
    const [childRefreshKey, setChildRefreshKey] = useState(0);
    const [isExpandedEdit, setIsExpandedEdit] = useState(false);
    const [parentNames, setParentNames] = useState({ categoryName: "", subCategoryName: "", description: "" });

    const SpecificationMasterTabsList = [
        { id: "L1", label: "L1" },
        { id: "L2", label: "L2" },
        { id: "L3", label: "L3" },
        { id: "L4", label: "L4" },
    ];

    const [activeTab, setActiveTab] = useState<string>(SpecificationMasterTabsList[0].id);
    const [subMaterialDetails, setSubMaterialDetails] = useState<SubMaterialMasterData | null>(null);

    useEffect(() => {

        setPagination({ currentPage: 1 });
        loadSpecificationMasterData(1, {}, sortInfo, searchTerm);
    }, [activeTab]);

    const loadSpecificationMasterData = async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo, searchText?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: filterwithPaginationSpecificationMasterRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    LevelType: activeTab,
                    CategoryName: searchText ?? filterParams.CategoryName,
                    SpecificationMasterId: filterParams.SpecificationMasterId ? Number(filterParams.SpecificationMasterId) : undefined,
                    SortBy: getSortByParam(sort ?? null, SpecificationMasterColumns),
                };

                const response = await specificationMasterService.apiCallPullSpecificationMaster(params);

                if (E.isRight(response)) {

                    setSpecificationMasterlist(response.right.Data);
                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }
            },
            undefined,
            (error: any) =>
                addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Specification Master'
        );
    };

    useEffect(() => {
        if (isAddUpdateModalOpen) {
            if (editSpecificationMasterData) {
                setFormData({
                    SpecificationMasterId: editSpecificationMasterData.SpecificationMasterId ?? 0,
                    Uniquekey: editSpecificationMasterData.UniqueKey || initialFormState().Uniquekey,
                    CategoryName: editSpecificationMasterData.CategoryName ?? "",
                    LevelId1: editSpecificationMasterData.LevelId1,
                    LevelId2: editSpecificationMasterData.LevelId2,
                    LevelId3: editSpecificationMasterData.LevelId3 || 0,
                    UomMasterId: editSpecificationMasterData.UomMasterId,
                    Quantity: editSpecificationMasterData.Quantity || 0,
                    SubMaterialMasterId: editSpecificationMasterData.SubMaterialMasterId || 0,
                });
                setDropdownLabels({
                    uom: editSpecificationMasterData.UomCode || "",
                    LevelId3: editSpecificationMasterData.SubMaterialName || "",
                });

                if (editSpecificationMasterData.SubMaterialMasterId) {
                    fetchSubMaterialMasterById(editSpecificationMasterData.SubMaterialMasterId).then((subMaterial) => {
                        if (!subMaterial) return;
                        setSubMaterialDetails(subMaterial);
                    });
                }
            }
            setErrors({});
        }
    }, [isAddUpdateModalOpen, editSpecificationMasterData]);

    const ValidateAddUpdateSpecificationMasterForm = (): {
        isValid: boolean;
        errors: { [key: string]: string };
    } => {
        const newErrors: { [key: string]: string } = {};

        const fieldName = modalLabel;

        if (activeTab !== "L4") {

            if (!formData.CategoryName?.trim()) {
                newErrors.CategoryName = `${fieldName} is required`;

            } else if (formData.CategoryName.length > 100) {
                newErrors.CategoryName = "Category Name can't be greater than 100 characters.";
            }
        } else {

            if (!formData.Quantity) {
                newErrors.Quantity = "Quantity is required";
            }

            if (!formData.SubMaterialMasterId) {
                newErrors.SubMaterialMasterId = "Sub Material is required";
            }

        }
        
        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const PushSpecificationMasterFormData = (): AddUpdateSpecificationMaster => {
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
        }
    }

    const handleAddUpdateSpecificationMaster = async (e: React.FormEvent) => {
        e.preventDefault()

        setErrors({});
        const validation = ValidateAddUpdateSpecificationMasterForm();

        if (!validation.isValid) {
            setErrors(validation.errors);
            return
        }

        runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushSpecificationMasterFormData();

                const response = await specificationMasterService.apiCallAddUpdateSpecificationMaster(payload);

                if (E.isRight(response)) {

                    const isAdd = formData.SpecificationMasterId === 0;

                    if (isAdd) {
                        await loadSpecificationMasterData(pagination.currentPage, {}, sortInfo, searchTerm);
                        setChildRefreshKey(prev => prev + 1);

                        const parentId = expandedParentId;

                        addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                        if (dtRef.current) {
                            dtRef.current.collapseAll?.();
                        }
                        setTimeout(() => {
                            if (parentId) {
                                dtRef.current?.expandRow?.(String(parentId), expandedParentRow);
                            }
                        }, 50);

                    } else {
                        const parentId = expandedParentId;

                        await loadSpecificationMasterData(pagination.currentPage, {}, sortInfo, searchTerm);

                        setChildRefreshKey(prev => prev + 1);

                        addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                        if (parentId) {
                            setTimeout(() => {
                                dtRef.current?.expandRow?.(String(parentId), expandedParentRow);
                            }, 50);
                        }
                    }
                    setIsAddUpdateModalOpen(false);

                    setEditSpecificationMasterData(null);
                } else {
                    addToast({ type: "error", title: response.left?.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Add Update Specification Master'
        )
    };

    const handleFieldChange = (field: keyof AddUpdateSpecificationMaster, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleAddUpdateModalOpen = () => {
        setEditSpecificationMasterData(null);
        setFormData({
            ...initialFormState(),
        });
        setErrors({});
        setExpandedParentId(null);
        setExpandedParentRow(null);
        setIsAddUpdateModalOpen(true);
    }

    const handleEditSpecificationMasterData = (row: SpecificationMasterData) => {
        setParentNames({
            categoryName: row.Level1Name || "",
            subCategoryName: row.Level2Name || "",
            description: row.Level3Name || "",
        });

        setEditSpecificationMasterData({
            ...row,
            CategoryName: row.CategoryName,
        });
        setIsAddUpdateModalOpen(true);
    };

    const handleDeleteSpecificationMaster = async () => {
        setIsConfirmationDialogBoxOpen(false);

        if (!deleteSpecificationMaster) return;
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteSpecificationMasterRequest = {
                    SpecificationMasterId: deleteSpecificationMaster.SpecificationMasterId || 0,
                    UniqueKey: deleteSpecificationMaster.UniqueKey || ""
                };

                const response = await specificationMasterService.apiCallDeleteSpecificationMaster(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1,
                        Math.ceil(newTotalRecords / pagination.pageSize),
                    );

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;

                    } else if (
                        specificationMasterlist.length === 1 &&
                        pagination.currentPage > 1
                    ) { pageToShow = pagination.currentPage - 1; }

                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages,
                    });
                    const parentId = expandedParentId;

                    await loadSpecificationMasterData(pageToShow, {});

                    if (dtRef.current) {
                        dtRef.current.collapseAll?.();
                    }

                    setTimeout(() => {
                        if (parentId) {
                            dtRef.current?.expandRow?.(String(parentId), expandedParentRow);
                        }
                    }, 50);
                    addToast({ type: "success", title: response.right.SuccessMessage?.[0], });

                    setIsConfirmationDialogBoxOpen(false);

                    setEditSpecificationMasterData(null);

                } else {
                    addToast({ type: "error", title: response.left.message });

                    setIsConfirmationDialogBoxOpen(false);
                }
                return response
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message })
            },
            undefined,
            "Delete Specification Master"
        )
    }

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        loadSpecificationMasterData(1, {}, sortInfo, value);
    }

    const handlClearSearch = () => {
        setSearchTerm("")
        setPagination({ currentPage: 1 })
        loadSpecificationMasterData(1, {}, sortInfo, "");
    }

    const handleConfirmationBoxOpen = useCallback((row: SpecificationMasterData) => {

        setDeleteSpecificationMaster(row);
        setIsConfirmationDialogBoxOpen(true);
    }, []);

    const buildNextLevelIds = (row: SpecificationMasterData) => {
        switch (activeTab) {

            case "L1":
                return {
                    LevelId1: row.SpecificationMasterId,
                    LevelId2: 0,
                };

            case "L2":
                return {
                    LevelId1: row.SpecificationMasterId,
                    LevelId2: 0,
                };

            case "L3":
                return {
                    LevelId1: row.LevelId1,
                    LevelId2: row.SpecificationMasterId,
                };

            case "L4":
                return {
                    LevelId1: row.LevelId1,
                    LevelId2: row.LevelId2,
                    LevelId3: row.SpecificationMasterId,
                };
        }
    };

    const isExpandable = activeTab !== "L1";
    const showUom = activeTab === "L3" && (formData.LevelId2 > 0 || (editSpecificationMasterData?.LevelId2 ?? 0) > 0);
    const showUomColumn = activeTab === "L3";
    const showL4 = activeTab === "L4";

    const SpecificationMasterColumns = useMemo<TableColumn[]>(() => [
        ...(isExpandable ? [{
            key: 'LevelType',
            label: 'Level',
            width: '15',
            sortable: false,
            align: "left" as const,
            render: (value: any) => value || "-"
        }] : []),
        {
            key: 'CategoryName',
            label: 'Category Name',
            width: '50',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: "Actions",
            label: "Actions",
            width: "20",
            fixed: "right",
            align: "center",
            render: (_value, row) => {
                return (
                    <div className="flex items-center justify-end ml-2 gap-1">

                        <div className="flex-shrink-0 ml-3">
                            {activeTab !== "L1" && (
                                <Button
                                    color="transparent"
                                    size="sm"
                                    style={{
                                        color: canAction ? "green" : "#9CA3AF",
                                        cursor: canAction ? "pointer" : "not-allowed",
                                        opacity: canAction ? 1 : 0.5
                                    }}
                                    disabled={!canAction}
                                    title="Add Specification"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSubMaterialDetails(null);

                                        const nextLevel = buildNextLevelIds(row);

                                        if (activeTab === "L2") {
                                            setParentNames({
                                                categoryName: row.CategoryName || "",
                                                subCategoryName: "",
                                                description: "",
                                            });
                                        }

                                        if (activeTab === "L3") {
                                            setParentNames({
                                                categoryName: row.Level1Name || "",
                                                subCategoryName: row.CategoryName || "",
                                                description: "",
                                            });
                                        }

                                        if (activeTab === "L4") {
                                            setParentNames({
                                                categoryName: row.Level1Name || "",
                                                subCategoryName: row.Level2Name || "",
                                                description: row.CategoryName || "",
                                            });
                                        }

                                        setExpandedParentId(row.SpecificationMasterId);
                                        setExpandedParentRow(row);

                                        setFormData({
                                            ...initialFormState(),
                                            ...nextLevel,

                                            CategoryName: "",
                                        });

                                        setEditSpecificationMasterData(null);
                                        setIsAddUpdateModalOpen(true);
                                    }}
                                    leftIcon={<Plus className="h-4 w-4" />}
                                />
                            )}
                        </div>

                        {activeTab === "L1" && (
                            <Button
                                color="transparent"
                                isborderRadius
                                size='sm'
                                style={{
                                    color: canAction ? "blue" : "#9CA3AF",
                                    cursor: canAction ? "pointer" : "not-allowed",
                                    opacity: canAction ? 1 : 0.5
                                }}
                                disabled={!canAction}
                                title="Edit Specification"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setIsExpandedEdit(false);
                                    handleEditSpecificationMasterData(row);
                                }}
                                leftIcon={<Edit className="h-4 w-4" />}
                            />
                        )}

                        {activeTab === "L1" && (
                            <Button
                                color="transparent"
                                isborderRadius
                                size="sm"
                                style={{
                                    color: canAction ? "red" : "#9CA3AF",
                                    cursor: canAction ? "pointer" : "not-allowed",
                                    opacity: canAction ? 1 : 0.5
                                }}
                                disabled={!canAction}
                                title="Delete Specification "
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleConfirmationBoxOpen(row);
                                }}
                                leftIcon={<Trash2 className="h-4 w-4" />}
                            />
                        )}
                    </div>
                );
            }
        }
    ], [activeTab]);

    const ExpandSpecificationMasterColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'LevelType',
            label: 'Level',
            width: '50',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        ...(showL4
            ? [{
                key: "MaterialName",
                label: "Material Name",
                width: "25",
                sortable: false,
                align: "left" as const,
                render: (value: any) => value || "-"
            }]
            : []),
        {
            key: 'CategoryName',
            label: showL4 ? 'Sub Material Name' : showUomColumn ? 'Description' : 'Sub Category Name ',
            width: '25',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        ...(showL4
            ? [
                {
                    key: "Quantity",
                    label: "Quantity",
                    width: "25",
                    sortable: false,
                    align: "left" as const,
                    render: (_value: any, row: any) =>
                        row.Quantity ? `${row.Quantity} ${row.SubMaterialUomCode || ""}` : "0"
                },
                {
                    key: "LeadTimeInDays",
                    label: "Lead Time (Days)",
                    width: "25",
                    sortable: false,
                    align: "left" as const,
                    render: (value: any) => value ? `${value} days` : "-"
                },
                {
                    key: "IsTolerant",
                    label: "Is Tolerant",
                    width: "25",
                    sortable: false,
                    align: "left" as const,
                    render: (value: any) => value == 1 ? 'Yes' : 'No'
                }]
            : []),
        ...(showUomColumn
            ? [{
                key: "UomCode",
                label: "UOM",
                width: "25",
                sortable: false,
                align: "left" as const,
                render: (value: any) => value || "-"
            }]
            : []),
        {
            key: "Actions",
            label: "Actions",
            width: "20",
            fixed: "right",
            align: "center",
            render: (_value, row) => {
                return (
                    <div className="flex items-center justify-end ml-2 gap-1">
                        <Button
                            color="transparent"
                            isborderRadius
                            size='sm'
                            style={{
                                color: canAction ? "blue" : "#9CA3AF",
                                cursor: canAction ? "pointer" : "not-allowed",
                                opacity: canAction ? 1 : 0.5
                            }}
                            disabled={!canAction}
                            title="Edit Specification"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setIsExpandedEdit(true);
                                handleEditSpecificationMasterData(row);
                            }}
                            leftIcon={<Edit className="h-4 w-4" />}
                        />

                        <Button
                            color="transparent"
                            isborderRadius
                            size="sm"
                            style={{
                                color: canAction ? "red" : "#9CA3AF",
                                cursor: canAction ? "pointer" : "not-allowed",
                                opacity: canAction ? 1 : 0.5
                            }}
                            disabled={!canAction}
                            title="Delete Specification"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleConfirmationBoxOpen(row);
                            }}
                            leftIcon={<Trash2 className="h-4 w-4" />}
                        />
                    </div>
                );
            }
        }
    ], [showUomColumn, canAction, handleConfirmationBoxOpen, showL4]);

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadSpecificationMasterData(page, {}, sortInfo, searchTerm);
    };

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        setPagination({ currentPage: 1 });
        loadSpecificationMasterData(1, {}, sort, searchTerm);
    }, [searchTerm]);

    const specificationMasterPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]);

    const SpecificationmasterForTable = useMemo(() => specificationMasterlist, [specificationMasterlist]);

    const handleExportSpecificationMaster = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: filterwithPaginationSpecificationMasterRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    LevelType: activeTab,
                    IsExpandChild: true,
                    SortBy: getSortByParam(sortInfo ?? null, SpecificationMasterColumns),
                    ExportType: exportType
                }

                const response = await specificationMasterService.apiCallPullSpecificationMaster(params);

                handleExportFile(response, exportType, "Specification Master", addToast);

                return response
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const modalTitle =
        editSpecificationMasterData
            ? isExpandedEdit
                ? activeTab === "L2"
                    ? "Update Sub Category Name"
                    : activeTab === "L3"
                        ? "Update Description"
                        : activeTab === "L4"
                            ? "Update Sub Material"
                            : "Update Description"
                : activeTab === "L1"
                    ? "Update Category Name"
                    : activeTab === "L2"
                        ? "Update Sub Category Name"
                        : activeTab === "L3"
                            ? "Update Description"
                            : "Update Sub Material"
            : activeTab === "L1"
                ? "Add Category Name"
                : activeTab === "L2"
                    ? "Add Sub Category Name"
                    : activeTab === "L3"
                        ? "Add Description"
                        : "Add Sub Material";


    const modalLabel =
        activeTab === "L1"
            ? "Category Name"
            : activeTab === "L2"
                ? (
                    isExpandedEdit
                        ? "Sub Category Name"
                        : editSpecificationMasterData
                            ? "Category Name"
                            : "Sub Category Name"
                )
                : activeTab === "L3"
                    ? (
                        isExpandedEdit
                            ? "Description"
                            : editSpecificationMasterData
                                ? "Sub Category Name"
                                : "Description"
                    )
                    : "Sub Material";

    const deletePageName =
        activeTab === "L1"
            ? "Category"
            : activeTab === "L2"
                ? "Sub Category"
                : activeTab === "L3"
                    ? "Description"
                    : "Sub Material";

    const handleExportSpecificationmasterExcel = () => handleExportSpecificationMaster("Excel");
    const habndleExportSpecificationmasterPdf = () => handleExportSpecificationMaster("PDF");

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <TableActionToolbar
                searchPlaceholder="Search By Category Name "
                searchTerm={searchTerm}
                onClearSearch={handlClearSearch}
                onSearchChange={handleSearch}

                isShowExportButton={canExport && SpecificationMasterColumns.length > 0}
                onExportExcel={handleExportSpecificationmasterExcel}
                onExportPdf={habndleExportSpecificationmasterPdf}
                isShowAddButton={canAction && activeTab === "L1"}
                addTitle="Add"
                onAdd={handleAddUpdateModalOpen}
            />

            <div className="pb-4">
                <Tabs
                    tabs={SpecificationMasterTabsList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => {
                        setActiveTab(t.id)
                        setIsExpandedEdit(false);
                        setEditSpecificationMasterData(null);
                        setParentNames({
                            categoryName: "",
                            subCategoryName: "",
                            description: ""
                        });
                        setExpandedParentId(null);
                        setExpandedParentRow(null);
                    }}
                />
            </div>

            <DataTableExpandable
                ref={dtRef}
                key={childRefreshKey}
                columns={SpecificationMasterColumns}
                data={SpecificationmasterForTable}
                emptyMessage="No Specification Data Found"
                pagination={specificationMasterPaginationInfo}
                recordsPerPage={20}
                fixedHeight={true}
                sortInfo={sortInfo}
                onSort={handleSortColumn}
                loading={isLoading}
                expandable={isExpandable ? {
                    keyField: "SpecificationMasterId",
                    alwaysFetchOnOpen: true,
                    fetchRow: async (row) => {
                        setExpandedParentRow(row);
                        setExpandedParentId(row.SpecificationMasterId);

                        const params: filterwithPaginationSpecificationMasterRequest = {
                            PageNumber: 1,
                            PageSize: 1000,
                            SpecificationMasterId: row.SpecificationMasterId,
                            IsExpandChild: true,
                            IsCheckPermission: true,
                            LevelType: activeTab,
                        };

                        const response = await specificationMasterService.apiCallPullSpecificationMaster(params);

                        if (E.isRight(response)) {
                            return response.right.Data ?? [];
                        }
                        return [];
                    },

                    renderRow: (fetchedData) => {
                        const details: SpecificationMasterData[] = Array.isArray(fetchedData) ? fetchedData : fetchedData ? [fetchedData] : [];
                        if (!details || details.length === 0) {
                            return <div className="p-1 text-xs text-gray-600 text-center"><NoDataView /></div>;
                        }
                        return (
                            <DataTableWithOutBorder
                                data={details}
                                columns={ExpandSpecificationMasterColumns}
                                emptyMessage="No Specification Data Found"
                                fixedHeight={true}
                                className="flex-1"
                                loading={isLoading}
                            />
                        );
                    },
                    expandButton: { openText: "Hide", closeText: "Show" },
                } : undefined}
            />

            <Modal
                isOpen={isAddUpdateModalOpen}
                onSubmit={handleAddUpdateSpecificationMaster}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                    setFormData(initialFormState());
                    setEditSpecificationMasterData(null);
                    setSubMaterialDetails(null);
                    setErrors({});
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                    setFormData(initialFormState());
                    setEditSpecificationMasterData(null);
                    setSubMaterialDetails(null);
                    setErrors({});
                }}
                saveText={editSpecificationMasterData ? "Update " : "Add"}
                title={modalTitle}
                loading={isLoading}
                size="xl"
            >
                <div className="space-y-10 p-6 bg-blue-100">

                    <div className="space-y-4" >
                        {activeTab !== "L1" && (
                            <Input label="Category Name"
                                value={parentNames.categoryName}
                                disabled
                            />
                        )}

                        {(activeTab === "L3" || activeTab === "L4") && (
                            <Input
                                label="Sub Category Name"
                                value={parentNames.subCategoryName}
                                disabled
                            />
                        )}

                        <div>
                            {activeTab === "L4" ? (
                                <Input
                                    label="Description"
                                    value={parentNames.description ?? ""}
                                    disabled
                                />
                            ) : (
                                <Input
                                    label={modalLabel}
                                    value={formData.CategoryName ?? ""}
                                    placeholder={`Enter ${modalLabel}`}
                                    onChange={(e) =>
                                        handleFieldChange("CategoryName", e.target.value)
                                    }
                                    error={errors.CategoryName}
                                    maxLength={100}
                                    required
                                />
                            )}
                        </div>

                        {showUom && (
                            <div>
                                <SingleSelectDropdownWithPagination
                                    label="UOM"
                                    title="Select UOM"
                                    size="lg"
                                    dataFetchCallBack={fetchUOMMasterDropdown}
                                    onSelected={(item) => {
                                        if (!item) {
                                            handleFieldChange("UomMasterId", null);
                                            return;
                                        }
                                        handleFieldChange("UomMasterId", Number(item.value));
                                    }}
                                    initialValue={createDropdownInitialValue(formData.UomMasterId, dropdownLabels.uom)}
                                />
                            </div>
                        )}

                        {activeTab === "L4" && (
                            <div>
                                <div>
                                    <SingleSelectDropdownWithPagination
                                        label="Sub Material"
                                        required
                                        title="Sub Material"
                                        size="lg"
                                        dataFetchCallBack={fetchSubMaterialMasterDropdown}
                                        onSelected={(item) => {
                                            if (!item) {
                                                handleFieldChange("SubMaterialMasterId", null);
                                                setSubMaterialDetails(null);
                                                return;
                                            }

                                            setSubMaterialDetails(item as unknown as SubMaterialMasterData);

                                            handleFieldChange("SubMaterialMasterId", Number(item.value));
                                        }}

                                        error={errors.SubMaterialMasterId}
                                        initialValue={createDropdownInitialValue(formData.SubMaterialMasterId, dropdownLabels.LevelId3)}
                                    />

                                </div>

                                {subMaterialDetails && (
                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                                            <FieldItem label="Material Name" value={subMaterialDetails.MaterialName} isRow withBorder={true} />
                                            <FieldItem label="Sub Material Name" value={subMaterialDetails.SubMaterialName} isRow withBorder={true} className='font-medium text-blue-900 ' />
                                            <FieldItem label="UOM" value={`${subMaterialDetails.Uom || "-"} (${subMaterialDetails.UomCode || "-"})`} isRow withBorder={true} />
                                            <FieldItem label="Lead Time (Days)" value={subMaterialDetails.LeadTimeInDays} isRow withBorder={true} />
                                            <FieldItem label="Is Tolerant" value={subMaterialDetails.IsTolerant ? "YES" : "NO"} isRow />

                                        </div>
                                    </div>
                                )}

                                <div className="mt-5">
                                    <Input
                                        label="Quantity"
                                        value={formData.Quantity ?? ""}
                                        placeholder="Enter Quantity"
                                        onChange={(e) => handleFieldChange("Quantity", filterNumbersWithDecimal(e.target.value))}
                                        error={errors.Quantity}
                                        maxLength={5}
                                        required
                                    />

                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteSpecificationMaster(null);
                }}
                onConfirm={handleDeleteSpecificationMaster}
                loading={isLoading}
                pageName={deletePageName}
            />
        </div>
    )
}
export default SpecificationMaster;