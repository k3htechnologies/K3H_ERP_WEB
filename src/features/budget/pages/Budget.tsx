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
import { ChevronRight, Edit, Plus } from "lucide-react";
import { Button, Input } from "@/ui/components/forms";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Modal } from "@/ui/components/Modal/Modal";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { handleExportFile } from "@/core/utils/exportFile";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import Tabs from "@/ui/components/Tab/Tab";
import { getBudgetStatusColor } from "@/features/budget/utils/Status";
import { CustomTable } from "@/ui/components/DataTable/CustomTable";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { TextArea } from "@/ui/components/forms/Textarea";
import { filterNumbersWithDecimal } from "@/core/utils/fileValidation";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchSpecificationMasterDropdown } from "@/features/specificationMaster/utils/SpecificationMasterDropDown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import { fetchUOMMasterDropdown } from "@/features/uomMaster/uomMasterDropdown";

const initialFormState = (): AddUpdateBudget => ({
    "BudgetLevelMasterId": 0,
    "ProjectId": 0,
    "BudgetId": 0,
    "Uniquekey": "",
    "Quantity": 0,
    "LabourCost": 0,
    "MaterialCost": 0,
    "PMCost": 0,
    "Remark": ""
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
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const { canAction, canExport } = useMenuPermissions();
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const [isShowCustomizeModal, setIsShowCustomizeModal] = useState(false);
    const [filters,] = useState<FilterInfo>({});
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const BudgetTabList = [
        { id: "Concept Budget", label: "Concept Budget" },
        { id: "Schematic Budget", label: "Schematic Budget" },
        { id: "Detailed Budget", label: "Detailed Budget" }
    ];

    const [activeTab, setActiveTab] = useState<string>(BudgetTabList[0].id);

    useEffect(() => {
        if (!projectId) return

        setPagination({ currentPage: 1 });
        loadBudgetData(1, filters, sortInfo, searchTerm)
    }, [projectId, activeTab]);

    const loadBudgetData = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo, searchText?: string) => {

        runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationBudgetRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    CategoryName: searchText ?? filterParams.CategoryName ?? undefined,
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
    }, [projectId, pagination.currentPage, pagination.pageSize, addToast, setPagination, activeTab]);

    useEffect(() => {
        if (isUpdateModalOpen) {
            if (editBudgetData) {
                setFormData({
                    BudgetId: editBudgetData.BudgetId,
                    BudgetLevelMasterId: editBudgetData.BudgetLevelMasterId,
                    ProjectId: Number(projectId),
                    Uniquekey: editBudgetData.UniqueKey,
                    Quantity: editBudgetData.Quantity,
                    LabourCost: editBudgetData.LabourCost,
                    MaterialCost: editBudgetData.MaterialCost,
                    PMCost: editBudgetData.PMCost,
                    Remark: editBudgetData.Remark
                })
            }
            setErrors({})
        }
    }, [editBudgetData, isUpdateModalOpen, projectId]);

    const ValidateUpdateBudget = (): {

        isValid: boolean;
        errors: { [key: string]: string };
    } => {

        const newErrors: { [key: string]: string } = {};

        if (!formData?.LabourCost) {
            newErrors.LabourCost = "Labour Cost is Required"
        }
        if (!formData?.MaterialCost) {
            newErrors.MaterialCost = "Material Cost is Required"
        }
        if (!formData?.Quantity) {
            newErrors.Quantity = "Quantity is Required"
        }
        if (!formData?.PMCost) {
            newErrors.PMCost = "PM Cost is Required"
        }
        if (!formData?.Remark) {
            newErrors.Remark = "Remark is Required"
        }
        return {
            isValid: Object.keys(newErrors).length == 0,
            errors: newErrors,
        }
    }

    const PushBudgetFormData = (): AddUpdateBudget => {
        return {
            BudgetId: formData.BudgetId,
            BudgetLevelMasterId: formData.BudgetLevelMasterId,
            ProjectId: Number(projectId),
            Uniquekey: formData.Uniquekey,
            Quantity: formData.Quantity,
            LabourCost: formData.LabourCost,
            MaterialCost: formData.MaterialCost,
            PMCost: formData.PMCost,
            Remark: formData.Remark

        }
    }

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

                    setIsUpdateModalOpen(false);

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
        setEditBudgetData({
            ...row,
            CategoryName: row.CategoryName
        })
        setErrors({})
        setIsUpdateModalOpen(true)
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
            case "L4":
                return "#E5E5E6";
            case "L5":
                return "#F0F0F0";
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
            align: "center",
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
            render: value => value ? `₹ ${value}` : '-'
        },
        {
            key: "MaterialCost",
            label: "Material Rate (₹)",
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value ? `₹ ${value}` : '-'
        },
        {
            key: "PMCost",
            label: "P&M Rate (₹)",
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value ? `₹ ${value}` : '-'
        },
        {
            key: "TotalRate",
            label: "Total Rate (₹)",
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value ? `₹ ${value}` : '-'
        },
        {
            key: "BudgetAmount",
            label: "Budget Amount (₹)",
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value ? `₹ ${value}` : '-'
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

                const isDisabled = row.LevelType === "L1" || row.LevelType === "L2";
                return (
                    <div className="flex justify-between">
                        <Button
                            color="transparent"
                            isborderRadius
                            size="sm"
                            style={{
                                color: canAction ? "green" : "#9CA3AF",
                                cursor: canAction ? "pointer" : "not-allowed",
                                opacity: canAction ? 1 : 0.5
                            }}
                            disabled={!canAction}
                            title="Add Category Name"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                const nextLevel = buildNextLevelIds(row);

                                setFormData({
                                    ...initialFormState(),
                                    ProjectId: Number(projectId),
                                    ...nextLevel
                                })
                                setIsAddModalOpen(true)
                            }}
                            leftIcon={<Plus className="h-4 w-4" />}
                        />

                        <Button
                            color="transparent"
                            isborderRadius
                            size="sm"
                            disabled={isDisabled}
                            style={{
                                color: isDisabled ? "#9CA3AF" : "blue",
                                padding: "4px 8px",
                                cursor: canAction ? "pointer" : "not-allowed",
                                opacity: canAction ? 1 : 0.5
                            }}
                            title="Edit Budget"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (isDisabled) return;
                                handleEditBudget(row);
                            }}
                            leftIcon={<Edit className="h-4 w-4" />}
                        />
                    </div>

                );
            }
        }
    ], [projectId, activeTab, canAction]);

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
        [seletedBudgetColumnKeys, BudgetColumns]
    )

    const BudgetForTable = useMemo(() => budgetData, [budgetData]);

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page })
        loadBudgetData(page, {}, sortInfo, searchTerm);
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
    }),
        [pagination, handlePageChange]);

    const handleAddUpdatemodal = () => {
        setIsAddModalOpen(true)
    }
    
    const buildNextLevelIds = (row: BudgetData) => {

        switch (row.LevelType) {

            case "L1":
                return {
                    LevelId1: row.BudgetLevelMasterId,
                    LevelId2: 0,
                    LevelId3: 0,
                    LevelId4: 0
                }

            case "L2":
                return {
                    LevelId1: row.LevelId1,
                    LevelId2: row.BudgetLevelMasterId,
                    LevelId3: 0,
                    LevelId4: 0
                }

            case "L3":
                return {
                    LevelId1: row.LevelId1,
                    LevelId2: row.LevelId2,
                    LevelId3: row.BudgetLevelMasterId,
                    LevelId4: 0
                }

            case "L4":
                return {
                    LevelId1: row.LevelId1,
                    LevelId2: row.LevelId2,
                    LevelId3: row.LevelId3,
                    LevelId4: row.BudgetLevelMasterId
                }

            default:
                return {
                    LevelId1: 0,
                    LevelId2: 0,
                    LevelId3: 0,
                    LevelId4: 0

                }
        }
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
                isShowAddButton={activeTab == "Detailed Budget"}
                addTitle="Add"
                onAdd={handleAddUpdatemodal}
                isShowExportButton={canExport && BudgetColumns.length > 0}
                onExportExcel={handleExportBudgetExcel}
                onExportPdf={handleExportBudgetPdf}
                isShowCustomizeButton
                onCustomize={() => {
                    setIsShowCustomizeModal(true)
                }}
            />

            <div className="pb-4">
                <Tabs
                    tabs={BudgetTabList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => {
                        setActiveTab(t.id);
                    }}
                />
            </div>

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
                isOpen={isUpdateModalOpen}
                onSubmit={handleUpdateBudget}
                onClose={() => {
                    setIsUpdateModalOpen(false)
                    setEditBudgetData(null)
                    setErrors({})
                }}
                onCancel={() => {
                    setIsUpdateModalOpen(false)
                    setEditBudgetData(null)
                    setErrors({})
                }}
                title="Update Budget"
                saveText="Update"
                size="xl"
                loading={isLoading}
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4" >

                        <span className="text-md font-semibold text-[#00000080] flex items-center gap-2">
                            {editBudgetData?.WBSCode}

                            <ChevronRight className="h-5 w-5 text-gray-800" />

                            {editBudgetData?.CategoryName}

                            <ChevronRight className="h-5 w-5 text-gray-800" />

                            {editBudgetData?.LevelType}
                        </span>

                        <div>
                            <Input
                                label="Quantity (₹)"
                                placeholder="Enter Quantity"
                                value={formData?.Quantity || ""}
                                onChange={(e) => handleFieldChange("Quantity", filterNumbersWithDecimal(e.target.value))}
                                error={errors.Quantity}
                                maxLength={8}
                                required
                            />
                        </div>

                        <div>
                            <Input
                                label="Labour Cost (₹)"
                                placeholder="Enter Labour Cost"
                                value={formData?.LabourCost || ""}
                                onChange={(e) => handleFieldChange("LabourCost", filterNumbersWithDecimal(e.target.value))}
                                error={errors.LabourCost}
                                maxLength={8}
                                required
                            />
                        </div>

                        <div>
                            <Input
                                label="Material Cost (₹)"
                                placeholder="Enter Material Cost"
                                value={formData?.MaterialCost || ""}
                                onChange={(e) => handleFieldChange("MaterialCost", filterNumbersWithDecimal(e.target.value))}
                                error={errors.MaterialCost}
                                maxLength={8}
                                required
                            />
                        </div>

                        <div>
                            <Input
                                label="PM Cost (₹)"
                                placeholder="Enter PM Cost"
                                value={formData?.PMCost || ""}
                                onChange={(e) => handleFieldChange("PMCost", filterNumbersWithDecimal(e.target.value))}
                                error={errors.PMCost}
                                maxLength={8}
                                required
                            />
                        </div>

                        <div>
                            <TextArea
                                label="Remark"
                                placeholder="Enter Remark"
                                className='thin-scroll'
                                value={formData?.Remark || ""}
                                onChange={(e) => handleFieldChange("Remark", e.target.value)}
                                error={errors.Remark}
                                rows={5}
                                autoResize={false}
                                required
                            />
                        </div>

                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                }}
                onCancel={() => {
                    setIsAddModalOpen(false)
                }}
                onSubmit={handleAddUpdatemodal}
                title="Add"
                saveText="Save"
                size="xl"
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4" >

                        <div>
                            <SingleSelectDropdownWithPagination
                                label="Category Name"
                                title="Select Category Name"
                                size="lg"
                                dataFetchCallBack={fetchSpecificationMasterDropdown("L1")}
                                onSelected={() => {
                                }}
                                initialValue={createDropdownInitialValue(formData.BudgetLevelMasterId)}
                                required
                            />
                        </div>

                        <div>
                            <Input
                                label="Order By"
                                placeholder="Enter Order By"
                                required
                            />
                        </div>

                        <div>
                            <SingleSelectDropdownWithPagination
                                label="UOM"
                                title="UOM"
                                size="lg"
                                dataFetchCallBack={fetchUOMMasterDropdown}
                                onSelected={() => {
                                }}
                            />
                        </div>

                    </div>
                </div>
            </Modal>

        </div>
    )
}
export default Budget;