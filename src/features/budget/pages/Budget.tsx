import { useCallback, useEffect, useMemo, useState } from "react";
import type { AddUpdateBudget, BudgetData, FilterWithPaginationBudgetRequest } from "@/features/budget/models/BudgetModel";
import { runApiWithLoader } from "@/core/utils";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { budgetService } from "@/features/budget/services/BudgetService";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import usePagination from "@/core/hooks/usePagination";
import type { TableColumn } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { type FilterInfo, type PaginationInfo, type SortInfo } from "@/ui/components/DataTable/DataTable";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { Loader } from "@/core/utils/loader";
import { Edit, Plus } from "lucide-react";
import { Button, Input } from "@/ui/components/forms";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Modal } from "@/ui/components/Modal/Modal";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { handleExportFile } from "@/core/utils/exportFile";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { getBudgetStatusColor } from "@/features/budget/utils/Status";
import { CustomTable } from "@/ui/components/DataTable/CustomTable";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { TextArea } from "@/ui/components/forms/Textarea";
import { filterNumbersWithDecimal } from "@/core/utils/fileValidation";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchSpecificationMasterDropdown } from "@/features/specificationMaster/utils/SpecificationMasterDropDown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import { fetchPaginatedFlatsDropdown } from "../utils/PaginatedFlatsDropDown";
import { updateFilter } from "@/core/utils/filterHelper";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { BUDGET_LEVEL_TYPE } from "@/core/constants";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import { useMultiSelectDropdown } from "@/core/hooks/useMultiSelectDropdown";
import { formatCurrency } from "@/core/utils/comman";

const initialFormState = (): AddUpdateBudget => ({
    ProjectId: 0,
    BudgetId: 0,
    UniqueKey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    LevelId1: 0,
    LevelId2: 0,
    LevelId3: 0,
    OrderBy: 0,
    UomMasterId: 0,
    InventoryFlatId: "",
    Quantity: "" as any,
    LabourCost: "" as any,
    MaterialCost: "" as any,
    PMCost: "" as any,
    BudgetAmount: 0,
    Remark: ""
});

export const Budget: React.FC = () => {

    const [budgetData, setBudgetData] = useState<BudgetData[]>([]);
    const [formData, setFormData] = useState<AddUpdateBudget>(() => initialFormState());
    const [editBudgetData, setEditBudgetData] = useState<BudgetData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState('');
    const { projectId } = useProject();
    const { addToast } = useToast();
    const { pagination, setPagination } = usePagination(20);
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const { canAction, canExport } = useMenuPermissions();
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const [isShowCustomizeModal, setIsShowCustomizeModal] = useState(false);
    const [filters, setFilters] = useState<FilterInfo>({});
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [addLevel, setAddLevel] = useState<"L1" | "L2" | "L3">("L1");
    const [parentPath, setParentPath] = useState("");
    const [dropdownLabels, setDropdownLabels] = useState<{ level1Name?: string; level2Name?: string, level3Name?: string, flat?: string }>({});
    const [selectedUom, setSelectedUom] = useState("");
    const [selectFlatValues, setSelectFlatValues] = useState<string | number | null>(null);

    useEffect(() => {
        if (!projectId) return

        setPagination({ currentPage: 1 });
        loadBudgetData(1, filters, sortInfo, searchTerm)
    }, [projectId]);

    const flatDropDown = useMultiSelectDropdown({
        value: selectFlatValues,
        fetchCallback: fetchPaginatedFlatsDropdown,
        fetchParams: {
            projectId: String(projectId),
        },
        autoFetchOptions: true,
    });

    const loadBudgetData = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo, searchText?: string) => {
        runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationBudgetRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    BudgetId: filterParams.BudgetId ? Number(filterParams.BudgetId) : undefined,
                    CategoryName: searchText ?? filterParams.CategoryName ?? undefined,
                    LevelType: filterParams.LevelType ?? undefined,
                    SortBy: getSortByParam(sort ?? null, BudgetColumns),
                }

                const response = await budgetService.apiCallPullBudget(params);

                if (E.isRight(response)) {

                    setBudgetData(response.right.Data);
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
            'Loading Budget Data'
        );
    }, [projectId, pagination.currentPage, pagination.pageSize, addToast, setPagination]);

    useEffect(() => {
        if (isAddUpdateModalOpen) {
            if (editBudgetData) {

                if (editBudgetData.LevelType === "L1") {
                    setAddLevel("L1");

                } else if (editBudgetData.LevelType === "L2") {
                    setAddLevel("L2");

                } else {
                    setAddLevel("L3");
                }
                setFormData({
                    BudgetId: editBudgetData.BudgetId,
                    ProjectId: Number(projectId),
                    UniqueKey: editBudgetData.UniqueKey,
                    LevelId1: editBudgetData.LevelId1,
                    LevelId2: editBudgetData.LevelId2,
                    LevelId3: editBudgetData.LevelId3,
                    UomMasterId: editBudgetData.UomMasterId,
                    OrderBy: editBudgetData.OrderBy,
                    InventoryFlatId: editBudgetData.InventoryFlatId,
                    Quantity: editBudgetData.Quantity,
                    LabourCost: editBudgetData.LabourCost,
                    MaterialCost: editBudgetData.MaterialCost,
                    PMCost: editBudgetData.PMCost,
                    BudgetAmount: editBudgetData.BudgetAmount,
                    Remark: editBudgetData.Remark
                });
                setSelectFlatValues(editBudgetData.InventoryFlatId || null);
                setDropdownLabels({
                    level1Name: editBudgetData.Level1Name || "",
                    level2Name: editBudgetData.Level2Name || "",
                    level3Name: editBudgetData.Level3Name || "",
                    flat: editBudgetData.Flat || ""
                });
                setSelectedUom(editBudgetData.Uom ?? "");
            }
            setErrors({});
        }
    }, [editBudgetData, isAddUpdateModalOpen, projectId]);

    const ValidateUpdateBudget = (): {

        isValid: boolean;
        errors: { [key: string]: string };
    } => {

        const newErrors: { [key: string]: string } = {};

        if (addLevel === "L1" && !formData.LevelId1) {
            newErrors.LevelId1 = "Category Name is Required";
        }
        if (addLevel === "L2" && !formData.LevelId2) {
            newErrors.LevelId2 = "Category Name is Required";
        }
        if (addLevel === "L3" && !formData.LevelId3) {
            newErrors.LevelId3 = "Category Name is Required";
        }
        if (addLevel === "L1" && !formData.OrderBy) {
            newErrors.OrderBy = "Order By is Required"
        }

        if (addLevel === "L3") {

            const isEmpty = (val: any) => val === undefined || val === null || val === "";

            if (isEmpty(formData?.LabourCost)) {
                newErrors.LabourCost = "Labour Rate is Required"
            }
            if (isEmpty(formData?.MaterialCost)) {
                newErrors.MaterialCost = "Material Rate is Required"
            }
            if (isEmpty(formData?.Quantity)) {
                newErrors.Quantity = "Quantity is Required"
            }
            if (isEmpty(formData?.PMCost)) {
                newErrors.PMCost = "P&M Rate is Required"
            }
        }
        return {
            isValid: Object.keys(newErrors).length == 0,
            errors: newErrors,
        }
    }

    const totalRate = Number(formData?.LabourCost || 0) + Number(formData?.MaterialCost || 0) + Number(formData?.PMCost || 0);
    const budget = Number(formData?.Quantity || 0) * totalRate;

    const PushBudgetFormData = (): AddUpdateBudget => {
        return {
            BudgetId: formData.BudgetId,
            ProjectId: Number(projectId),
            UniqueKey: formData.UniqueKey,
            LevelId1: formData.LevelId1,
            LevelId2: formData.LevelId2,
            LevelId3: formData.LevelId3,
            OrderBy: formData.OrderBy,
            UomMasterId: formData.UomMasterId,
            InventoryFlatId: formData.InventoryFlatId,
            Quantity: Number(formData.Quantity) || 0,
            LabourCost: Number(formData.LabourCost) || 0,
            MaterialCost: Number(formData.MaterialCost) || 0,
            PMCost: Number(formData.PMCost) || 0,
            BudgetAmount: Number(budget) || 0,
            Remark: formData.Remark
        };
    };

    const handleUpdateBudget = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({});
        const validation = ValidateUpdateBudget();

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushBudgetFormData();

                const response = await budgetService.apiCallAddUpdateBudget(payload);

                if (E.isRight(response)) {

                    setBudgetData(response.right.Data);

                    setIsAddUpdateModalOpen(false);

                    setEditBudgetData(null);

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    loadBudgetData(1, filters, sortInfo, searchTerm);

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
            "update Budget Data"
        )
    };

    const handleExportBudget = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationBudgetRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: Number(projectId),
                    CategoryName: filters.CategoryName?.trim() || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, BudgetColumns),
                    ExportType: exportType
                }

                const response = await budgetService.apiCallPullBudget(params);

                handleExportFile(response, exportType, 'Budget', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportBudgetExcel = () => handleExportBudget("Excel");
    const handleExportBudgetPdf = () => handleExportBudget("PDF")

    const handleEditBudget = useCallback((row: BudgetData) => {

        const buildParentPath = (row: BudgetData) => {
            const level1 = row.Level1Name;
            const level2 = row.Level2Name;

            if (row.LevelType === "L1") return "";

            if (row.LevelType === "L2") {
                return level1 || "";
            }
            if (row.LevelType === "L3") {
                return [level1, level2]
                    .filter(Boolean)
                    .join(" > ");
            }
            return "";
        };
        setParentPath(buildParentPath(row));
        setEditBudgetData({
            ...row,
            CategoryName: row.CategoryName
        });
        setErrors({});
        setIsAddUpdateModalOpen(true);
    }, []);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        loadBudgetData(1, {}, sortInfo, value);
    }

    const handlClearSearch = () => {
        setSearchTerm("");
        setPagination({ currentPage: 1 });
        loadBudgetData(1, {}, sortInfo, "");
    }

    const getRowColor = (levelType: string) => {
        switch (levelType) {
            case "L1":
                return "#E3F7FF";
            case "L2":
                return "#FBFCFC";
            case "L3":
                return "#F2F4F8";
            default:
                return "";
        }
    };

    const BudgetColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'WBSCode',
            label: 'WBS Code',
            width: '15',
            sortable: false,
            align: 'left',
            fixed: 'left',
            render: value => value || '-',
        },
        {
            key: 'CategoryName',
            label: 'Cost Head / Description',
            width: '15',
            sortable: false,
            align: "left",
            render: (value) => (
                <TooltipText
                    text={value || ""}
                    tooltipThreshold={25}
                    maxWidth="250px"
                />
            )
        },
        {
            key: 'LevelType',
            label: 'Level',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => {
                const { bg, text } = getBudgetStatusColor(value);
                return (
                    <span
                        className="inline-block px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
                        style={{
                            backgroundColor: bg,
                            color: text,
                        }}
                    >
                        {value || "-"}
                    </span>
                );
            },
        },
        {
            key: "Uom",
            label: "Uom",
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'Flat',
            label: 'Flat',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => (
                <TooltipText
                    text={value || ""}
                    tooltipThreshold={25}
                    maxWidth="200px"
                />
            )
        },
        {
            key: 'Quantity',
            label: 'Quantity',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'LabourCost',
            label: 'Labour Rate (₹)',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value ? formatCurrency(value) : '0'
        },
        {
            key: "MaterialCost",
            label: "Material Rate (₹)",
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value ? formatCurrency(value) : '0'
        },
        {
            key: "PMCost",
            label: "P&M Rate (₹)",
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value ? formatCurrency(value) : '0'
        },
        {
            key: "TotalRate",
            label: "Total Rate (₹)",
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value ? formatCurrency(value) : '0'
        },
        {
            key: "BudgetAmount",
            label: "Budget Amount (₹)",
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value ? formatCurrency(value) : '0'
        },
        {
            key: 'Remark',
            label: 'Remark',
            width: '15',
            sortable: false,
            align: "left",
            render: (value) => (
                <TooltipText
                    text={value || ""}
                    tooltipThreshold={25}
                    maxWidth="200px"
                />
            )
        },
        {
            key: "Actions",
            label: "Actions",
            width: "20",
            fixed: "right",
            align: "center",
            render: (_value, row) => {
                const showAddButton = row.LevelType !== "L3";

                return (
                    <div className="flex justify-end ">
                        {showAddButton && (
                            <Button
                                color="transparent"
                                isborderRadius
                                size="sm"
                                title="Add Budget"
                                disabled={!canAction}
                                style={{
                                    color: canAction ? "green" : "#9CA3AF",
                                    padding: "4px 8px",
                                    cursor: canAction ? "pointer" : "not-allowed",
                                    opacity: canAction ? 1 : 0.5
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    if (row.LevelType === "L1") {
                                        setAddLevel("L2");
                                        setParentPath(row.Level1Name || "");

                                        setFormData({
                                            ...initialFormState(),
                                            ProjectId: Number(projectId),
                                            LevelId1: row.LevelId1,
                                            LevelId2: 0,
                                            LevelId3: 0,
                                        });
                                    }

                                    if (row.LevelType === "L2") {

                                        setAddLevel("L3");
                                        setFormData({
                                            ...initialFormState(),
                                            ProjectId: Number(projectId),
                                            LevelId1: row.LevelId1,
                                            LevelId2: row.LevelId2,
                                            LevelId3: 0,
                                        });
                                        setSelectFlatValues("");
                                        setParentPath(
                                            [row.Level1Name, row.Level2Name]
                                                .filter(Boolean)
                                                .join(" > ")
                                        );
                                        setIsAddUpdateModalOpen(true);
                                    }
                                    setIsAddUpdateModalOpen(true);
                                }}
                                leftIcon={<Plus className="h-4 w-4" />}
                            />
                        )}

                        <Button
                            color="transparent"
                            isborderRadius
                            size="sm"
                            disabled={!canAction}
                            style={{
                                color: canAction ? "blue" : "#9CA3AF",
                                padding: "4px 8px",
                                cursor: canAction ? "pointer" : "not-allowed",
                                opacity: canAction ? 1 : 0.5
                            }}

                            title="Edit Budget"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                const nextlevel = buildNextLevelIds(row);

                                setFormData({
                                    ...initialFormState(),
                                    ProjectId: Number(projectId),
                                    ...nextlevel
                                })
                                handleEditBudget(row);
                            }}
                            leftIcon={<Edit className="h-4 w-4" />}
                        />
                    </div>

                );
            }
        }
    ], [projectId, canAction]);

    const handleFieldChange = (field: keyof BudgetData, value: any) => {
        if (!formData) return;
        setFormData({ ...formData, [field]: value });

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const requiredBudgetColumnKeys: string[] = ["WBSCode", "Actions"];

    const allBudgetColumKeys: string[] = BudgetColumns.map(c => c.key);

    const [seletedBudgetColumnKeys, setSeletedBudgetColumnKeys] = useState<string[]>(() => {
        try {
            const saved = LocalStorageHelper.getBudgetTableColumns?.();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]

                const withRequired = Array.from(new Set([...parsed, ...requiredBudgetColumnKeys]));

                return withRequired.filter(k => allBudgetColumKeys.includes(k));
            }
        } catch { }
        return allBudgetColumKeys;
    });

    useEffect(() => {
        setSeletedBudgetColumnKeys(prev => Array.from(new Set([...prev, ...requiredBudgetColumnKeys])).filter(k => allBudgetColumKeys.includes(k)));
    }, [BudgetColumns.length])

    const visibleBudgetColumns = useMemo(
        () => BudgetColumns.filter(col => seletedBudgetColumnKeys.includes(col.key)),
        [seletedBudgetColumnKeys, BudgetColumns])

    const BudgetForTable = useMemo(() => budgetData, [budgetData]);

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page })
        loadBudgetData(page, filters, sortInfo, searchTerm);
    };

    const handleSortColumn = useCallback((sort: SortInfo) => {

        setSortInfo(sort);
        setPagination({ currentPage: 1 });
        loadBudgetData(1, {}, sort, searchTerm)
    }, [searchTerm]);

    const BudgetPaginationInfo: PaginationInfo = useMemo(() =>
    ({
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        totalRecords: pagination.totalRecords,
        pageSize: pagination.pageSize,
        onPageChange: handlePageChange
    }), [pagination, handlePageChange]);

    const handleAddUpdateModal = () => {
        setEditBudgetData(null);
        setAddLevel("L1");
        setParentPath("");

        setFormData({
            ...initialFormState(),
            ProjectId: Number(projectId),
            LevelId1: 0,
            LevelId2: 0,
            LevelId3: 0,
        });
        setIsAddUpdateModalOpen(true);
    };

    const buildNextLevelIds = (row: BudgetData) => {

        switch (row.LevelType) {
            case "L1":
                return {
                    LevelId1: row.BudgetId,
                    LevelId2: 0,
                    LevelId3: 0,
                };

            case "L2":
                return {
                    LevelId1: row.LevelId1,
                    LevelId2: row.BudgetId,
                    LevelId3: 0,
                };

            case "L3":
                return {
                    LevelId1: row.LevelId1,
                    LevelId2: row.LevelId2,
                    LevelId3: row.BudgetId
                }

            default:
                return {
                    LevelId1: 0,
                    LevelId2: 0,
                    LevelId3: 0,
                };
        }
    };

    const applyFilters = () => {

        setFilters(tempFilters);
        setPagination({ currentPage: 1 });
        loadBudgetData(1, tempFilters);
        setShowFilterPopup(false);
    };

    const clearFilters = () => {

        setTempFilters({});
        setFilters({});
        setPagination({ currentPage: 1 });
        loadBudgetData(1, {}, sortInfo, searchTerm);
    };

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                onClearSearch={handlClearSearch}
                onSearchChange={handleSearch}
                searchPlaceholder="Search By WBS Code / Cost Head / Description"
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddUpdateModal}

                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters);
                    setShowFilterPopup(true);
                }}
                isShowExportButton={canExport && BudgetColumns.length > 0}
                onExportExcel={handleExportBudgetExcel}
                onExportPdf={handleExportBudgetPdf}
                isShowCustomizeButton
                onCustomize={() => {
                    setIsShowCustomizeModal(true)
                }}
            />

            <CustomTable
                columns={visibleBudgetColumns}
                data={BudgetForTable}
                pagination={BudgetPaginationInfo}
                recordsPerPage={20}
                loading={isLoading}
                sortInfo={sortInfo}
                onSort={handleSortColumn}
                rowStyle={(row) => ({
                    backgroundColor: getRowColor(row.LevelType ?? ""),
                })}
                emptyMessage="No Budget Data Found"
                className="flex-1"
            />

            <CustomizeColumnsModal
                isOpen={isShowCustomizeModal}
                onClose={() => {
                    setIsShowCustomizeModal(false)
                }}
                onApply={keys => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredBudgetColumnKeys])
                    );
                    setSeletedBudgetColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeBudgetTableColumns?.(
                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={BudgetColumns}
                requiredKeys={requiredBudgetColumnKeys}
                selectedKeys={seletedBudgetColumnKeys}
                title='Customize Table Columns'
            />

            <Modal
                isOpen={isAddUpdateModalOpen}
                onSubmit={handleUpdateBudget}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditBudgetData(null);
                    setErrors({});
                    setParentPath("");
                    setSelectedUom("");
                    setSelectFlatValues("")
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditBudgetData(null);
                    setErrors({});
                    setParentPath("");
                    setSelectedUom("");
                    setSelectFlatValues("")
                }}
                title={editBudgetData ? "Update Budget" : "Add Budget"}
                saveText={editBudgetData ? "Update" : "Add"}
                size="small50"
                loading={isLoading}
            >
                <div className="space-y-4" >

                    {parentPath && (
                        <div className="mb-4 text-md font-medium text-gray-500">
                            {parentPath}
                        </div>
                    )}

                    <div>
                        <SingleSelectDropdownWithPagination
                            label="Category Name"
                            title="Select Category Name"
                            size="lg"
                            dataFetchCallBack={fetchSpecificationMasterDropdown(
                                addLevel,
                                addLevel === "L1"
                                    ? undefined
                                    : addLevel === "L2"
                                        ? formData.LevelId1
                                        : formData.LevelId2
                            )}
                            onSelected={(item) => {
                                if (!item) return;

                                switch (addLevel) {
                                    case "L1":
                                        handleFieldChange("LevelId1", Number(item.value));
                                        break;

                                    case "L2":
                                        handleFieldChange("LevelId2", Number(item.value));
                                        break;

                                    case "L3":
                                        handleFieldChange("LevelId3", Number(item.value));
                                        setSelectedUom(item.uom ?? "");
                                        break;
                                }
                            }}
                            initialValue={
                                addLevel === "L1"
                                    ? createDropdownInitialValue(formData.LevelId1, dropdownLabels.level1Name)
                                    : addLevel === "L2"
                                        ? createDropdownInitialValue(formData.LevelId2, dropdownLabels.level2Name)
                                        : createDropdownInitialValue(formData.LevelId3, dropdownLabels.level3Name)
                            }
                            required
                            error={addLevel === "L1" ? errors.LevelId1
                                : addLevel === "L2"
                                    ? errors.LevelId2 : errors.LevelId3
                            }
                        />
                    </div>

                    {(addLevel === "L1") && (
                        <div>
                            <Input
                                label="Order By"
                                placeholder="Enter Order By"
                                value={formData?.OrderBy}
                                onChange={(e) => handleFieldChange("OrderBy", Number(e.target.value))}
                                error={errors.OrderBy}
                                required
                            />
                        </div>
                    )}

                    {addLevel === "L3" && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Input
                                        label="UOM"
                                        value={selectedUom}
                                        disabled
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Quantity"
                                        placeholder="Enter Quantity"
                                        value={formData?.Quantity ?? ""}
                                        onChange={(e) => handleFieldChange("Quantity", filterNumbersWithDecimal(e.target.value))}
                                        error={errors.Quantity}
                                        maxLength={16}
                                        min={0}
                                        required
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Labour Rate (₹)"
                                        placeholder="Enter Labour Rate"
                                        value={formData?.LabourCost ?? ""}
                                        onChange={(e) => handleFieldChange("LabourCost", filterNumbersWithDecimal(e.target.value))}
                                        error={errors.LabourCost}
                                        maxLength={16}
                                        min={0}
                                        required
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Material Rate (₹)"
                                        placeholder="Enter Material Rate"
                                        value={formData?.MaterialCost ?? ""}
                                        onChange={(e) => handleFieldChange("MaterialCost", filterNumbersWithDecimal(e.target.value))}
                                        error={errors.MaterialCost}
                                        maxLength={16}
                                        min={0}
                                        required
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="P&M Rate (₹)"
                                        placeholder="Enter P&M Rate"
                                        value={formData?.PMCost ?? ""}
                                        onChange={(e) => handleFieldChange("PMCost", filterNumbersWithDecimal(e.target.value))}
                                        error={errors.PMCost}
                                        maxLength={16}
                                        min={0}
                                        required
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Total Rate (₹)"
                                        value={totalRate}
                                        disabled
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Budget Amount (₹)"
                                        value={budget}
                                        disabled
                                    />
                                </div>
                            </div>

                            <div>
                                <MultiSelectPagination
                                    key={projectId}
                                    label="Flat"
                                    title="Select Flat"
                                    size="lg"
                                    dataFetchCallBack={(pageNumber) => fetchPaginatedFlatsDropdown(pageNumber, { projectId: Number(projectId) })}
                                    options={flatDropDown.initialOptions}
                                    selectedValues={flatDropDown.selectedValues}
                                    onChange={(values) => {
                                        const { idsString } = flatDropDown.handleChange(values);
                                        setSelectFlatValues(idsString || null);
                                        handleFieldChange("InventoryFlatId", idsString);
                                        if (errors.InventoryFlatId) {
                                            setErrors((prev) => ({ ...prev, InventoryFlatId: "" }));
                                        }
                                    }}
                                    error={errors.InventoryFlatId}
                                />
                            </div>

                            <div>
                                <TextArea
                                    label="Remark"
                                    placeholder="Enter Remark"
                                    className='thin-scroll'
                                    value={formData?.Remark || ""}
                                    onChange={(e) => handleFieldChange("Remark", e.target.value)}
                                    rows={5}
                                    error={errors.Remark}
                                    autoResize={false}
                                />
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Budget"
                onSubmit={e => {
                    e.preventDefault();
                    applyFilters();
                }}
                saveText="Apply "
                cancelText="Clear"
                onCancel={() => clearFilters()}
                size="small-half"
            >
                <div className="space-y-4">

                    <div>
                        <SinglePageSelection
                            label='Level Type'
                            value={tempFilters.LevelType || ''}
                            placeholder="Select Level Type"
                            onChange={e => handleFilterChange('LevelType', String(e))}
                            options={BUDGET_LEVEL_TYPE.map(opt => ({
                                label: opt.name,
                                value: opt.id
                            }))}
                        />
                    </div>

                </div>
            </Modal>

        </div>
    )
}
export default Budget;