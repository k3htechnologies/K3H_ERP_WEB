import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import type { AddUpdateBudget, BudgetData, FilterWithPaginationBudgetRequest } from "@/features/budget/models/BudgetModel";
import { runApiWithLoader } from "@/core/utils";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { budgetService } from "@/features/budget/services/BudgetService";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import usePagination from "@/core/hooks/usePagination";
import type { TableColumn } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { type FilterInfo, type SortInfo } from "@/ui/components/DataTable/DataTable";
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
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal";
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import type { ModulesApprovalStatusRequest, UpdateModulesWorkflowApprovalRequest } from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel";
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService";
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import { LevelTree } from "@/ui/components/DataTable/Leveltree";

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
    const [sortInfo] = useState<SortInfo>();
    const [isShowCustomizeModal, setIsShowCustomizeModal] = useState(false);
    const [filters, setFilters] = useState<FilterInfo>({});
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [addLevel, setAddLevel] = useState<"L1" | "L2" | "L3">("L1");
    const [dropdownLabels, setDropdownLabels] = useState<{ level1Name?: string; level2Name?: string, level3Name?: string, flat?: string }>({});
    const [selectedUom, setSelectedUom] = useState("");
    const [selectFlatValues, setSelectFlatValues] = useState<string | number | null>(null);
    const [parentData, setParentData] = useState({ category: "", subCategory: "", });
    const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
    const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
    const [isApprovalActionModalOpen, setIsApprovalActionModalOpen] = useState(false);
    const [approvalActionType, setApprovalActionType] = useState<"approve" | "reject">("approve");

    useEffect(() => {
        if (!projectId) return

        setPagination({ currentPage: 1 });
        loadBudgetData(1, filters, sortInfo, searchTerm)
    }, [projectId]);

    const flatFetchParams = useMemo(() => ({
        projectId: String(projectId)
    }), [projectId]);

    const flatDropDown = useMultiSelectDropdown({
        value: selectFlatValues,
        fetchCallback: fetchPaginatedFlatsDropdown,
        fetchParams: flatFetchParams,
        autoFetchOptions: true,
    });

    const fetchFlatsForModal = useCallback(
        (pageNumber: number, params?: { value?: string }) =>
            fetchPaginatedFlatsDropdown(pageNumber, {
                projectId: Number(projectId),
                value: params?.value,
            }),
        [projectId]
    );

    useLayoutEffect(() => {

        const savedBudgetId = sessionStorage.getItem(`budgetScrollId_${projectId}`);

        if (!savedBudgetId) return;

        let retry = 0;

        const scrollToBudget = () => {

            const element = document.getElementById(`budget-${savedBudgetId}`);

            if (element) {

                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });

                sessionStorage.removeItem(`budgetScrollId_${projectId}`);
                return;
            }

            if (retry < 15) {
                retry++;
                setTimeout(scrollToBudget, 200);
            }
        };
        scrollToBudget();

        return () => {
        };
    }, [budgetData, projectId]);

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
                    Uom: filterParams.Uom ?? undefined,
                    Flat: filterParams.Flat ?? undefined,
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

    const hasRateValue =
        String(formData?.LabourCost ?? "") !== "" ||
        String(formData?.MaterialCost ?? "") !== "" ||
        String(formData?.PMCost ?? "") !== "";

    const totalRate = hasRateValue
        ? Number(formData?.LabourCost || 0) +
        Number(formData?.MaterialCost || 0) +
        Number(formData?.PMCost || 0)
        : null;

    const budget = hasRateValue
        ? Number(formData?.Quantity || 0) * (totalRate ?? 0)
        : null;

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

                    const savedBudgetId = editBudgetData?.BudgetId || formData.BudgetId || response.right.Data?.[0]?.BudgetId;

                    if (savedBudgetId) {
                        sessionStorage.setItem(`budgetScrollId_${projectId}`, String(savedBudgetId));
                    }
                    setIsAddUpdateModalOpen(false);
                    setEditBudgetData(null);

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    const targetPage = editBudgetData
                        ? pagination.currentPage
                        : Math.max(1, Math.ceil((pagination.totalRecords + 1) / pagination.pageSize
                        ));

                    await loadBudgetData(targetPage, filters, sortInfo, searchTerm);
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
        setParentData({
            category: row.Level1Name || "",
            subCategory: row.Level2Name || "",
        });
        setEditBudgetData({
            ...row,
            CategoryName: row.CategoryName,
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
            label: "UOM",
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

                const isApproved = row.ApprovalStatus === "Approved" || row.ApprovalStatus === "Partial Approved";
                const showAddButton = row.LevelType !== "L3";
                const accessToEdit = canAction && row.IsAccessToDelete === true && !isApproved;
                const canAdd = canAction && !isApproved;

                return (
                    <div className="flex justify-end ">
                        {showAddButton && (
                            <Button
                                color="transparent"
                                isborderRadius
                                size="sm"
                                title="Add Budget"
                                disabled={!canAdd}
                                style={{
                                    color: canAdd ? "green" : "#a9aeb6",
                                    padding: "4px 8px",
                                    cursor: canAdd ? "pointer" : "not-allowed",
                                    opacity: canAdd ? 1 : 0.5
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    if (row.LevelType === "L1") {
                                        setAddLevel("L2");
                                        setParentData({
                                            category: row.Level1Name || "",
                                            subCategory: "",
                                        });
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
                                        setParentData({
                                            category: row.Level1Name || "",
                                            subCategory: row.Level2Name || "",
                                        });
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
                            disabled={!accessToEdit}
                            style={{
                                color: accessToEdit ? "blue" : "#9CA3AF",
                                padding: "4px 8px",
                                cursor: accessToEdit ? "pointer" : "not-allowed",
                                opacity: accessToEdit ? 1 : 0.5
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

    const requiredBudgetColumnKeys: string[] = ["WBSCode", "CategoryName", "Actions"];

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

    const handleAddUpdateModal = () => {
        setEditBudgetData(null);
        setAddLevel("L1");
        setParentData({
            category: "",
            subCategory: "",
        })
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

    const handleApproveRejectInvoice = (approvalType: "approve" | "reject") => {
        setApprovalActionType(approvalType);
        setIsApprovalActionModalOpen(true);
    };

    const handleApprovalLog = () => {
        setApprovalLogRequest({
            Id: Number(projectId),
            SubId: 0,
            SubSubId: 0,
            SubSubSubId: 0,
            ProjectId: Number(projectId),
            ModuleName: "BUDGET APPROVAL",
        });
        setIsApprovalLogModalOpen(true);
    };

    const handleApprovalSubmit = async (remark: string) => {

        if (!budgetData) return;

        const payload: UpdateModulesWorkflowApprovalRequest = {
            ModuleName: "BUDGET APPROVAL",
            Id: Number(projectId),
            SubId: 0,
            ProjectId: Number(projectId),
            IsApproved: approvalActionType === "approve",
            Remarks: remark ?? null,
        };

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await modulesWorkflowApprovalService.apiCallupdateModulesWorkflowApproval(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsApprovalActionModalOpen(false);

                    await loadBudgetData(1, {}, sortInfo, searchTerm);

                } else {
                    addToast({ type: "error", title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message });
            },
            undefined,
            approvalActionType === "approve" ? "Approving Budget" : "Rejecting Budget"
        );
    };

    const approvalInfo = budgetData.length > 0 ? budgetData[0] : null;
    const isBudgetApproved = approvalInfo?.ApprovalStatus === "Approved" || approvalInfo?.ApprovalStatus === "Partial Approved";

    const grandTotal = budgetData
        .filter(item => item.LevelType === "L1")
        .reduce((sum, item) => sum + (Number(item.BudgetAmount) || 0), 0);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                onClearSearch={handlClearSearch}
                onSearchChange={handleSearch}
                searchPlaceholder="Search By Cost Head / Description"
                isShowAddButton={canAction && Number(projectId) > 0 && !isBudgetApproved}
                addTitle="Add"
                onAdd={handleAddUpdateModal}
                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters);
                    setShowFilterPopup(true);
                }}
                isShowExportButton={canExport && BudgetColumns.length > 0 && Number(projectId) > 0}
                onExportExcel={handleExportBudgetExcel}
                onExportPdf={handleExportBudgetPdf}
                isShowCustomizeButton
                onCustomize={() => {
                    setIsShowCustomizeModal(true)
                }}
            />

            <div className="flex justify-end mt-1 w-full border border-gray-200 shadow-sm">
                <div className="flex justify-end pb-2 gap-2 p-2">
                    <span className="text-md font-medium truncate text-gray-700">Budget Status : </span>
                    <ApprovalActions
                        approvalStatus={approvalInfo?.ApprovalStatus}
                        showApproval={approvalInfo?.IsApproval}
                        onApprove={() => handleApproveRejectInvoice("approve")}
                        onReject={() => handleApproveRejectInvoice("reject")}
                        onHistory={handleApprovalLog}
                        isIcons
                    />
                </div>
            </div>

            <LevelTree
                response={budgetData}
                config={{
                    idKey: "BudgetId",
                    codeKey: "WBSCode",
                    levels: [
                        { idKey: "LevelId1", nameKey: "Level1Name" },
                        { idKey: "LevelId2", nameKey: "Level2Name" },
                        { idKey: "LevelId3", nameKey: "Level3Name" },
                    ]
                }}
                columns={visibleBudgetColumns}
                levelRowColors={[
                    "#E3F7FF",
                    "#FBFCFC",
                    "#F2F4F8",
                ]}
                emptyMessage="No Budget Data"
                loading={isLoading}
            />

            <div className="w-full border border-gray-200 bg-gray-50 shadow-sm">
                <div className="flex items-center justify-between px-2 py-2">
                    <span className="text-md font-medium text-gray-700">
                        Grand Total Project Budget
                    </span>

                    <span className="text-md font-medium text-gray-600">
                        {formatCurrency(grandTotal)}
                    </span>
                </div>
            </div>

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
                    setParentData({
                        category: "",
                        subCategory: "",
                    });
                    setSelectedUom("");
                    setSelectFlatValues("")
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditBudgetData(null);
                    setErrors({});
                    setParentData({
                        category: "",
                        subCategory: "",
                    });
                    setSelectedUom("");
                    setSelectFlatValues("")
                }}
                title={editBudgetData ? "Update Budget" : "Add Budget"}
                saveText={editBudgetData ? "Update" : "Add"}
                size="xl"
                loading={isLoading}
            >
                <div className="space-y-4" >
                    {addLevel !== "L1" && (
                        <Input
                            label="Category"
                            value={parentData.category}
                            disabled
                        />
                    )}

                    {addLevel === "L3" && (
                        <Input
                            label="Sub Category"
                            value={parentData.subCategory}
                            disabled
                        />
                    )}

                    <div>
                        <SingleSelectDropdownWithPagination
                            label={
                                addLevel === "L1"
                                    ? "Category"
                                    : addLevel === "L2"
                                        ? "Sub Category"
                                        : "Description"
                            }
                            title={
                                addLevel === "L1"
                                    ? "Select Category"
                                    : addLevel === "L2"
                                        ? "Select Sub Category"
                                        : "Select Description"
                            }
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
                                if (!item) {
                                    switch (addLevel) {
                                        case "L1":
                                            handleFieldChange("LevelId1", 0);
                                            break;

                                        case "L2":
                                            handleFieldChange("LevelId2", 0);
                                            break;

                                        case "L3":
                                            handleFieldChange("LevelId3", 0);
                                            setSelectedUom("");
                                            break;
                                    }
                                    return;
                                }

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

                    {addLevel === "L3" && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Input
                                        label="UOM"
                                        value={selectedUom}
                                        placeholder="UOM"
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
                                        min={0}
                                        required
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Total Rate (₹)"
                                        value={totalRate !== null ? totalRate.toFixed(2) : ""}
                                        disabled
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Budget Amount (₹)"
                                        value={budget !== null ? budget.toFixed(2) : ""}
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
                                    dataFetchCallBack={fetchFlatsForModal}
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
                                    rows={3}
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

                    <div>
                        <Input
                            type="text"
                            label="Category Name"
                            value={tempFilters?.CategoryName ?? ""}
                            onChange={(e) => handleFilterChange("CategoryName", e.target.value)}
                            placeholder="Enter Category Name"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="UOM"
                            value={tempFilters?.Uom ?? ""}
                            onChange={(e) => handleFilterChange("Uom", e.target.value)}
                            placeholder="Enter UOM"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Flat"
                            value={tempFilters?.Flat ?? ""}
                            onChange={(e) => handleFilterChange("Flat", e.target.value)}
                            placeholder="Enter Flat"
                        />
                    </div>

                </div>
            </Modal>

            <ApprovalLogModal
                isOpen={isApprovalLogModalOpen}
                title='Budget'
                onClose={() => setIsApprovalLogModalOpen(false)}
                request={approvalLogRequest}
            />

            <ApprovalActionModal
                title='Budget'
                isOpen={isApprovalActionModalOpen}
                onClose={() => setIsApprovalActionModalOpen(false)}
                actionType={approvalActionType}
                onSubmit={handleApprovalSubmit}
                loading={isLoading}
            />

        </div>
    )
}
export default Budget;