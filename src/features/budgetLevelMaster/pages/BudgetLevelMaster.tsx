import { useCallback, useEffect, useMemo, useState } from "react";
import { runApiWithLoader } from "@/core/utils";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import usePagination from "@/core/hooks/usePagination";
import { type FilterInfo } from "@/ui/components/DataTable/DataTable";
import { Loader } from "@/core/utils/loader";
import { Modal } from "@/ui/components/Modal/Modal";
import { type AddUpdateBudgetLevelMaster, type BudgetLevelMasterData, type DeleteBudgetLevelMasterRequest, type FilterWithPaginationBudgetLevelMasterRequest } from "@/features/budgetLevelMaster/models/BudgetLevelMasterModel";
import { Button, Input } from "@/ui/components/forms";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { ChevronDown, ChevronRight, Circle, Edit, Plus, Trash2 } from "lucide-react";
import { budgetLevelMasterService } from "@/features/budgetLevelMaster/services/BudgetLevelMasterService";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchUOMMasterDropdown } from "@/features/uomMaster/uomMasterDropdown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import { getBudgetStatusColor } from "@/features/budget/utils/Status";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { fetchSpecificationMasterDropdown } from "@/features/specificationMaster/utils/SpecificationMasterDropDown";

const initialFormState = (): AddUpdateBudgetLevelMaster => ({
    BudgetLevelMasterId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    ProjectId: 0,
    CategoryName: "",
    UomMasterId: 0,
    LevelId1: 0,
    LevelId2: 0,
    LevelId3: 0,
    LevelId4: 0,
    OrderBy: 0
});

export const BudgetLevelMaster: React.FC = () => {

    const [budgetLevelMasterData, setBudgetLevelMasterData] = useState<BudgetLevelMasterData[]>([]);
    const [formData, setFormData] = useState<AddUpdateBudgetLevelMaster>(() => initialFormState());
    const [editBudgetLevelMasterData, setEditBudgetLevelMasterData] = useState<BudgetLevelMasterData | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState('');
    const { projectId } = useProject();
    const { addToast } = useToast();
    const { pagination, setPagination } = usePagination(20);
    const [deleteBudgetLevelMaster, setDeleteBudgetLevelMaster] = useState<BudgetLevelMasterData | null>(null);
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const { canAction } = useMenuPermissions();
    const [dropdownLabels, setDropdownLabels] = useState<{ uom?: string; }>({});
    const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});

    useEffect(() => {
        if (!projectId) return

        setPagination({ currentPage: 1 });
        loadBudgetLevelMasterData(1, {}, searchTerm);
    }, [projectId]);

    const loadBudgetLevelMasterData = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo, searchText?: string) => {

        runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationBudgetLevelMasterRequest = {
                    PageNumber: page,
                    PageSize: 1000,
                    ProjectId: Number(projectId),
                    CategoryName: searchText ?? filterParams.CategoryName ?? undefined,
                    LevelType: filterParams.LevelType ?? undefined,
                    BudgetLevelMasterId: filterParams.BudgetLevelMasterId
                        ? Number(filterParams.BudgetLevelMasterId) : undefined,
                };

                const response = await budgetLevelMasterService.apiCallPullBudgetLevelMaster(params);

                if (E.isRight(response)) {

                    setBudgetLevelMasterData(response.right.Data);
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
            'Loading Budget Level Master'
        );
    }, [projectId, pagination.currentPage, pagination.pageSize, addToast, setPagination,]);

    useEffect(() => {
        if (isAddUpdateModalOpen) {
            if (editBudgetLevelMasterData) {
                setFormData({
                    BudgetLevelMasterId: editBudgetLevelMasterData.BudgetLevelMasterId ?? 0,
                    Uniquekey: editBudgetLevelMasterData.UniqueKey || initialFormState().Uniquekey,
                    ProjectId: Number(projectId),
                    CategoryName: editBudgetLevelMasterData.CategoryName ?? "",
                    LevelId1: editBudgetLevelMasterData.LevelId1,
                    LevelId2: editBudgetLevelMasterData.LevelId2,
                    LevelId3: editBudgetLevelMasterData.LevelId3,
                    LevelId4: editBudgetLevelMasterData.LevelId4,
                    OrderBy: editBudgetLevelMasterData.OrderBy,
                    UomMasterId: editBudgetLevelMasterData.UomMasterId
                });
                setDropdownLabels({
                    uom: editBudgetLevelMasterData.Uom || "",
                });
            }
            setErrors({});
        }
    }, [isAddUpdateModalOpen, editBudgetLevelMasterData, projectId]);

    const isL1Mode =
        formData.LevelId1 === 0 &&
        formData.LevelId2 === 0 &&
        formData.LevelId3 === 0 &&
        formData.LevelId4 === 0;

    const isL2Mode =
        formData.LevelId1 === formData.LevelId1 &&
        formData.LevelId2 === 0 &&
        formData.LevelId3 === 0 &&
        formData.LevelId4 === 0;

    const ShowUom = !isL1Mode && !isL2Mode

    const ValidateAddUpdateBudgetLevelMasterForm = (): {

        isValid: boolean;
        errors: { [key: string]: string };
    } => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.CategoryName?.trim()) {
            newErrors.CategoryName = "Category Name is required";
        }
        if (!formData.OrderBy && isL1Mode) {
            newErrors.OrderBy = "Order By is required";
        }
        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const PushBudgetLevelMasterFormData = (): AddUpdateBudgetLevelMaster => {

        return {
            BudgetLevelMasterId: formData.BudgetLevelMasterId,
            Uniquekey: formData.Uniquekey,
            CategoryName: formData.CategoryName,
            ProjectId: Number(projectId),
            LevelId1: formData.LevelId1,
            LevelId2: formData.LevelId2,
            LevelId3: formData.LevelId3,
            LevelId4: formData.LevelId4,
            UomMasterId: formData.UomMasterId,
            OrderBy: Number(formData.OrderBy),
        }
    }

    const handleAddUpdateBudgetLevelMaster = async (e: React.FormEvent) => {
        e.preventDefault()

        setErrors({});
        const validation = ValidateAddUpdateBudgetLevelMasterForm();

        if (!validation.isValid) {
            setErrors(validation.errors);
            return
        }
        runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushBudgetLevelMasterFormData();

                const response = await budgetLevelMasterService.apiCallAddUpdateBudgetLevelMaster(payload);

                if (E.isRight(response)) {

                    const isAdd = formData.BudgetLevelMasterId === 0;

                    if (isAdd) {

                        await loadBudgetLevelMasterData(pagination.currentPage, {}, searchTerm);
                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });

                        addToast({ type: 'success', title: response.right.SuccessMessage[0] });
                    } else {

                        const updatedRecord = response.right.Data[0] as BudgetLevelMasterData;

                        setBudgetLevelMasterData(prevData =>
                            prevData.map(item =>
                                item.BudgetLevelMasterId === formData.BudgetLevelMasterId
                                    ? updatedRecord
                                    : item
                            )
                        );
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }
                    setIsAddUpdateModalOpen(false);

                    setEditBudgetLevelMasterData(null);
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
            'Add Update Budget Level Master'
        )
    };

    const handleFieldChange = (field: keyof AddUpdateBudgetLevelMaster, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleAddUpdateModalOpen = () => {
        setEditBudgetLevelMasterData(null);

        setFormData({
            ...initialFormState(),
            ProjectId: Number(projectId),
            LevelId1: 0,
            LevelId2: 0,
            LevelId3: 0,
            LevelId4: 0,
        });

        setErrors({});
        setIsAddUpdateModalOpen(true);
    };

    const handleEditBudgetLevelMasterData = (row: BudgetLevelMasterData) => {
        setEditBudgetLevelMasterData({
            ...row,
            CategoryName: row.CategoryName,
            BudgetLevelMasterId: row.BudgetLevelMasterId,
        });
        setErrors({})
        setIsAddUpdateModalOpen(true);
    };

    const handleDeleteBudgetLevelMaster = async () => {
        setIsConfirmationDialogBoxOpen(false);

        if (!deleteBudgetLevelMaster) return;
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteBudgetLevelMasterRequest = {
                    BudgetLevelMasterId: deleteBudgetLevelMaster.BudgetLevelMasterId || 0,
                    ProjectId: deleteBudgetLevelMaster.ProjectId || 0,
                    UniqueKey: deleteBudgetLevelMaster.UniqueKey || ""
                };

                const response = await budgetLevelMasterService.apiCallDeleteBudgetLevelMaster(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1,
                        Math.ceil(newTotalRecords / pagination.pageSize),
                    );

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;

                    } else if (
                        budgetLevelMasterData.length === 1 &&
                        pagination.currentPage > 1
                    ) { pageToShow = pagination.currentPage - 1; }

                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages,
                    });

                    await loadBudgetLevelMasterData(pageToShow, {});

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0], });

                    setIsConfirmationDialogBoxOpen(false);

                    setEditBudgetLevelMasterData(null);

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
            "Delete Budget Level Master"
        )
    }

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        loadBudgetLevelMasterData(1, {}, value);
    }

    const handlClearSearch = () => {
        setSearchTerm("")
        setPagination({ currentPage: 1 })
        loadBudgetLevelMasterData(1, {}, "");
    }

    const handleConfirmationBoxOpen = useCallback((row: BudgetLevelMasterData) => {

        setDeleteBudgetLevelMaster(row);
        setIsConfirmationDialogBoxOpen(true);
    }, []);

    const buildNextLevelIds = (row: BudgetLevelMasterData) => {

        switch (row.LevelType) {
            case "L1":
                return {
                    LevelId1: row.BudgetLevelMasterId,
                    LevelId2: 0,
                    LevelId3: 0,
                    LevelId4: 0,
                };

            case "L2":
                return {
                    LevelId1: row.LevelId1,
                    LevelId2: row.BudgetLevelMasterId,
                    LevelId3: 0,
                    LevelId4: 0,
                };

            case "L3":
                return {
                    LevelId1: row.LevelId1,
                    LevelId2: row.LevelId2,
                    LevelId3: row.BudgetLevelMasterId,
                    LevelId4: 0,
                };

            case "L4":
                return {
                    LevelId1: row.LevelId1,
                    LevelId2: row.LevelId2,
                    LevelId3: row.LevelId3,
                    LevelId4: row.BudgetLevelMasterId,
                };

            default:
                return {
                    LevelId1: 0,
                    LevelId2: 0,
                    LevelId3: 0,
                    LevelId4: 0,
                };
        }
    };

    interface BudgetTreeNode extends BudgetLevelMasterData {
        children: BudgetTreeNode[];
    }

    const buildTree = (data: BudgetLevelMasterData[]): BudgetTreeNode[] => {
        const map = new Map<number, BudgetTreeNode>();

        data.forEach(item => {
            map.set(item.BudgetLevelMasterId, {
                ...item,
                children: [],
            });
        });

        const roots: BudgetTreeNode[] = [];

        data.forEach(item => {
            const node = map.get(item.BudgetLevelMasterId)!;

            const parentId =
                item.LevelId4 ||
                item.LevelId3 ||
                item.LevelId2 ||
                item.LevelId1;

            if (item.LevelType === "L1" || !parentId || parentId === 0) {
                roots.push(node);
                return;
            }
            const parent = map.get(parentId);

            if (parent) {
                parent.children.push(node);
            } else {
                roots.push(node);
            }
        });
        return roots;
    };

    const toggleNode = (id: number) => {
        setExpandedNodes(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    useEffect(() => {
        setExpandedNodes(prev => {
            const updated = { ...prev };

            budgetLevelMasterData.forEach(item => {
                if (!(item.BudgetLevelMasterId in updated)) {
                    updated[item.BudgetLevelMasterId] = true;
                }
            });

            return updated;
        });
    }, [budgetLevelMasterData]);

    const TreeRow = ({ node, level = 0, }: { node: BudgetTreeNode; level?: number; }) => {
        const hasChildren = node.children.length > 0;
        const expanded = expandedNodes[node.BudgetLevelMasterId];

        return (
            <>
                <div
                    className={`relative p-3 bg-white rounded-md transition-colors overflow-hidden ${node.LevelType !== "L1"
                        ? "group hover:bg-[#F2F4F8]"
                        : ""
                        }`}
                >
                    <div className="absolute left-0 top-0 h-full w-1 bg-[#00236F] opacity-0 group-hover:opacity-100 transition-opacity rounded-l-md" />

                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            {hasChildren ? (

                                <button
                                    onClick={() => toggleNode(node.BudgetLevelMasterId)}
                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-blue-200 hover:bg-blue-200 transition"
                                >
                                    {expanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </button>
                            ) : (
                                <span className="w-4"><Circle className="h-2 w-2 fill-current" /></span>
                            )}

                            <span>{node.WBSCode}</span>

                            {(() => {
                                const { bg, text } = getBudgetStatusColor(node.LevelType ?? "");
                                return (
                                    <span
                                        className="inline-block px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
                                        style={{
                                            backgroundColor: bg,
                                            color: text,
                                        }}
                                    >
                                        {node.LevelType || "-"}
                                    </span>
                                )
                            })()}

                            <span>{node.CategoryName}</span>
                        </div>

                        <div className="flex justify-end gap-1">
                            {node.LevelType !== "L5" && (
                                <Button
                                    color="transparent"
                                    size="sm"
                                    style={{ color: 'green', padding: '4px 8px' }}
                                    title="Add"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        const nextLevel = buildNextLevelIds(node);
                                        setFormData({
                                            ...initialFormState(),
                                            ProjectId: Number(projectId),
                                            ...nextLevel
                                        });
                                        setIsAddUpdateModalOpen(true);
                                    }}
                                    leftIcon={<Plus className="h-4 w-4" />}
                                />
                            )}

                            <Button
                                color="transparent"
                                isborderRadius
                                size='sm'
                                style={{
                                    color: 'blue',
                                    padding: '4px 8px'
                                }}
                                title="Edit Budget Level Master"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleEditBudgetLevelMasterData(node);
                                }}
                                leftIcon={<Edit className="h-4 w-4" />}
                            />

                            <Button
                                color="transparent"
                                isborderRadius
                                size="sm"
                                style={{
                                    color: 'red',
                                    padding: '4px 8px'
                                }}
                                title="Delete Budget Level Master"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleConfirmationBoxOpen(node);
                                }}
                                leftIcon={<Trash2 className="h-4 w-4" />}
                            />
                        </div>

                    </div>
                </div>

                {expanded && node.children.length > 0 && (
                    <div className="relative pl-9">

                        <div className="absolute left-[21px] top-0 bottom-3 w-px bg-gray-200" />
                        {node.children.map(child => (
                            <div key={child.BudgetLevelMasterId}>
                                <TreeRow node={child} level={level + 1} />
                            </div>
                        ))}
                    </div>
                )}
            </>
        );
    };

    const treeData = useMemo(
        () => buildTree(budgetLevelMasterData),
        [budgetLevelMasterData]
    );

    const currentLevel = useMemo(() => {

        if (formData.LevelId4 > 0) return "L5";
        if (formData.LevelId3 > 0) return "L4";
        if (formData.LevelId2 > 0) return "L3";
        if (formData.LevelId1 > 0) return "L2";

        return "L1";
    }, [formData]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <TableActionToolbar
                searchPlaceholder="Search By WBS Code / Category Name  "
                searchTerm={searchTerm}
                onClearSearch={handlClearSearch}
                onSearchChange={handleSearch}
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddUpdateModalOpen}
            />

            <div >
                {treeData.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full">
                        <NoDataView />
                    </div>
                ) : (
                    <div>
                        {treeData.map(node => (
                            <div
                                key={node.BudgetLevelMasterId}
                                className="relative rounded-lg shadow-sm border border-gray-300 mb-3 overflow-hidden"
                            >
                                <div className="absolute left-0 top-0 h-16 w-1 bg-[#00236F] rounded-l-md" />

                                <div className="pl-3">
                                    <TreeRow node={node} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            <Modal
                isOpen={isAddUpdateModalOpen}
                onSubmit={handleAddUpdateBudgetLevelMaster}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                    setFormData(initialFormState());
                    setEditBudgetLevelMasterData(null);
                    setErrors({});
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                    setFormData(initialFormState());
                    setEditBudgetLevelMasterData(null);
                    setErrors({});
                }}
                saveText={editBudgetLevelMasterData ? "Update " : "Add"}
                title={editBudgetLevelMasterData ? "Update " : "Add"}
                loading={isLoading}
                size="xl"
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4" >

                        {currentLevel === "L2" && (
                            <SingleSelectDropdownWithPagination
                                label="L5"
                                dataFetchCallBack={fetchSpecificationMasterDropdown("L2")}
                                onSelected={(item) =>
                                    handleFieldChange("CategoryName", item?.label ?? "")
                                }
                            />
                        )}

                        {currentLevel === "L3" && (
                            <SingleSelectDropdownWithPagination
                                label="L3"
                                dataFetchCallBack={fetchSpecificationMasterDropdown("L3")}
                                onSelected={(item) =>
                                    handleFieldChange("CategoryName", item?.label ?? "")
                                }
                            />
                        )}

                        {currentLevel === "L4" && (
                            <SingleSelectDropdownWithPagination
                                label="L4"
                                dataFetchCallBack={fetchSpecificationMasterDropdown("L4")}
                                onSelected={(item) =>
                                    handleFieldChange("CategoryName", item?.label ?? "")
                                }
                            />
                        )}

                        {currentLevel === "L5" && (
                            <SingleSelectDropdownWithPagination
                                label="L5"
                                dataFetchCallBack={fetchSpecificationMasterDropdown("L5")}
                                onSelected={(item) =>
                                    handleFieldChange("CategoryName", item?.label ?? "")
                                }
                            />
                        )}

                        {currentLevel === "L1" && (
                            <div>
                                <SingleSelectDropdownWithPagination
                                    label="Category Name"
                                    value={formData.CategoryName ?? ""}
                                    size="lg"
                                    dataFetchCallBack={fetchSpecificationMasterDropdown("L1")}
                                    onSelected={(item) => {
                                        handleFieldChange("CategoryName", item?.value ?? null);
                                    }}
                                    initialValue={createDropdownInitialValue(String(formData.CategoryName))}
                                    error={errors.CategoryName}
                                    required
                                />
                            </div>
                        )}

                        {isL1Mode && (
                            <div>
                                <Input
                                    label="Order By"
                                    value={formData?.OrderBy ?? ""}
                                    placeholder="Enter WBS Code"
                                    onChange={(e) => handleFieldChange("OrderBy", e.target.value)}
                                    error={errors.OrderBy}
                                    required
                                />
                            </div>
                        )}

                        {ShowUom && (
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
                    </div>
                </div>
            </Modal>

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteBudgetLevelMaster(null);
                }}
                onConfirm={handleDeleteBudgetLevelMaster}
                loading={isLoading}
                pageName="Budget Level Master"
            />
        </div>
    )
}
export default BudgetLevelMaster;
