import { useCallback, useEffect, useMemo, useState } from "react";
import type { AddUpdateStockManagementRequest, FilterWithPaginationStockManagementRequest, StockManagementRequestData } from "@/features/stockManagement/models/StockManagementModel";
import { runApiWithLoader } from "@/core/utils";
import usePagination from "@/core/hooks/usePagination";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo } from "@/ui/components/DataTable/DataTable";
import { stockManagementService } from "@/features/stockManagement/services/StockManagementService";
import * as E from 'fp-ts/Either';
import useToast from "@/core/hooks/useToast";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { Loader } from "@/core/utils/loader";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import type { TableColumn } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Modal } from "@/ui/components/Modal/Modal";
import { Button, Input } from "@/ui/components/forms";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { updateFilter } from "@/core/utils/filterHelper";
import { handleExportFile } from "@/core/utils/exportFile";
import { Minus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStockManagementListState } from "@/features/stockManagement/context/StockManagementListStateContext";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { TextArea } from "@/ui/components/forms/Textarea";
import { filterNumbersWithDecimal } from "@/core/utils/fileValidation";

const initialFormState = (): AddUpdateStockManagementRequest => ({
    SubMaterialMasterId: 0,
    ProjectId: 0,
    Reason: "",
    InwardOutwardType: "",
    MaterialQuantityInwardOutward: 0,
    SenderName: "",
    ReceiverName: ""
})

export const StockManagement: React.FC = () => {
    const [stockManagementList, setStockManagementList] = useState<StockManagementRequestData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { pagination, setPagination } = usePagination(20);
    const { addToast } = useToast();
    const { projectId } = useProject();
    const { canAction, canExport } = useMenuPermissions();
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const navigate = useNavigate();
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [formData, setFormData] = useState<AddUpdateStockManagementRequest>(() => initialFormState());
    const [selectedRow, setSelectedRow] = useState<StockManagementRequestData | null>(null);
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const { listState, updateListState, resetFilters, clearStockManagementContext } = useStockManagementListState();
    const { page, filters, sortInfo, searchTerm } = listState;
    const [isShowCustomizeStockManagementColumnsModal, setIsShowCustomizeStockManagementColumnsModal] = useState(false);
    const isInward = formData.InwardOutwardType === "INWARD";

    useEffect(() => {
        if (!projectId) return;

        if (searchTerm && searchTerm.trim()) {
            loadStockManagementData(page, { MaterialName: searchTerm.trim() }, sortInfo);
        } else {
            loadStockManagementData(page, filters, sortInfo);
        }
    }, [projectId, page, filters, sortInfo, searchTerm, clearStockManagementContext]);

    useEffect(() => {
        setPagination({ currentPage: page });
    }, [page]);

    useEffect(() => {
        setTempFilters(filters);
    }, [filters]);

    const debouncedSearch = useDebouncedCallback(
        (value: string, isSerach: boolean = true) => {
            let filterParams: FilterInfo = {};

            if (value.trim() === "") {
                updateListState({ searchTerm: "", filters: {}, page: 1 });
                return;
            }
            if (isSerach) {
                filterParams = { MaterialName: value.trim() }
            }
            updateListState({ searchTerm: value, filters: filterParams, page: 1 });
        },
    );

    const loadStockManagementData = async (page: number = pagination.currentPage, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string,) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationStockManagementRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    MaterialName: searchtext ? searchtext.trim() : filterParams.MaterialName?.trim() || undefined,
                    SubMaterialName: filterParams.SubMaterialName ? (filterParams.SubMaterialName) : undefined,
                    SortBy: getSortByParam(sortInfo ?? null, StockManagementColumn)
                };

                const response = await stockManagementService.apiCallPullStockManagement(params);

                if (E.isRight(response)) {

                    setStockManagementList(response.right.Data);
                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });
                } else {
                    addToast({ type: 'error', title: response.left.message });
                    return response;
                }
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Stock Management'
        );
    }

    const handlePageChange = useCallback(
        (newPage: number) => {
            updateListState({ page: newPage });
        },
        [updateListState],
    );

    const handleSearchChange = (searchValue: string) => {
        updateListState({ searchTerm: searchValue });
        debouncedSearch(searchValue, false);
    };

    const handleClearSearch = () => {
        debouncedSearch.cancel?.();
        resetFilters();
        setTempFilters({});
    };

    const handleSortColumn = useCallback(
        (sort: SortInfo) => {
            updateListState({ sortInfo: sort, page: 1 });
        },
        [updateListState],
    );

    const ViewStockManagementDetails = useCallback((row: StockManagementRequestData) => {
        updateListState({
            SubMaterialMasterId: row.SubMaterialMasterId ?? 0,
            MaterialName: row.MaterialName ?? "",
            SubMaterialName: row.SubMaterialName ?? ""
        });
        navigate("/stock/view");
    }, [navigate, updateListState]);

    const StockManagementPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange,
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize],
    );

    const StockManagementForTable = useMemo(() => stockManagementList, [stockManagementList]);

    const StockManagementColumn = useMemo<TableColumn[]>(
        () => [
            {
                key: "MaterialName",
                label: 'Material Name',
                width: "20",
                sortable: true,
                fixed: "left",
                align: "left",
                render: (value, row) => (
                    <TooltipText
                        text={value || "-"}
                        maxWidth="250px"
                        tooltipThreshold={25}
                        onClick={() => ViewStockManagementDetails(row)}
                    />
                ),
            },
            {
                key: "SubMaterialName",
                label: 'Sub Material',
                width: "20",
                sortable: true,
                align: "left",
                render: (value) => (
                    <TooltipText
                        text={value || "-"}
                        maxWidth="250px"
                        tooltipThreshold={25}
                    />
                ),
            },
            {
                key: "UomCode",
                label: 'Uom Code',
                width: "20",
                sortable: false,
                align: "left",
                render: (value) => value || "-"
            },
            {
                key: "TotalMaterialQuantityInStock",
                label: 'Total Quantity',
                width: "20",
                sortable: false,
                align: "left",
                render: (value) => value || "-"
            },
            {
                key: "AvailableMaterialQuantityInStock",
                label: 'Available Quantity',
                width: "20",
                sortable: false,
                align: "left",
                render: (value) => value || "-"
            },
            {
                key: 'Actions',
                label: 'Actions',
                width: "20",
                fixed: "left",
                align: "center",
                render: (_value, row) => {
                    if (!canAction) return null;

                    return (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedRow(row);
                                    setFormData({
                                        ...initialFormState(),
                                        SubMaterialMasterId: row.SubMaterialMasterId,
                                        InwardOutwardType: "INWARD"
                                    });

                                    setErrors({});
                                    setIsAddUpdateModalOpen(true);
                                }}
                                color="blue"
                                variant="solid"
                                colorMode="extraLight"
                                style={{ width: "30px", height: "30px" }}
                                centerIcon={<Plus className="h-4 w-4" />}
                                title="Add Stocks"
                            >
                            </Button>

                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedRow(row);
                                    setFormData({
                                        ...initialFormState(),
                                        SubMaterialMasterId: row.SubMaterialMasterId,
                                        InwardOutwardType: "OUTWARD"
                                    });

                                    setErrors({});
                                    setIsAddUpdateModalOpen(true);
                                }}
                                color="red"
                                variant="solid"
                                colorMode="extraLight"
                                style={{ width: "30px", height: "30px" }}
                                centerIcon={<Minus className="h-4 w-4" />}
                                title="Remove Stocks"
                            >
                            </Button>
                        </div>
                    )
                }
            },
        ], [ViewStockManagementDetails])

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }

    const handleExportStockManagement = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationStockManagementRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    MaterialName: filters.MaterialName?.trim() || undefined,
                    SubMaterialName: filters.SubMaterialName ?? undefined,
                    ProjectId: Number(projectId),
                    SortBy: getSortByParam(sortInfo ?? null, StockManagementColumn),
                    ExportType: exportType,
                };

                const response = await stockManagementService.apiCallPullStockManagement(params);

                handleExportFile(response, exportType, "Stock Management", addToast);

                return response;
            },
            undefined,
            (error: any) =>
                addToast({ type: "error", title: error.message || "Export failed" }),
            undefined,
            "Preparing Export",
        );
    }

    const handleExportStockManagementExcel = () => handleExportStockManagement("Excel");
    const handleExportStockManagementPdf = () => handleExportStockManagement("PDF")

    const handleFieldChange = (field: keyof AddUpdateStockManagementRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validateAddRemoveStock = (): {
        isValid: boolean
        errors: { [key: string]: string }
    } => {

        const newErrors: { [key: string]: string } = {}

        if (!formData.Reason?.trim()) {
            newErrors.Reason = "Remark is required.";
        }
        if (!formData.MaterialQuantityInwardOutward) {
            newErrors.MaterialQuantityInwardOutward = "Quantity is required.";
        }
        if (formData.InwardOutwardType === "OUTWARD" && selectedRow && formData.MaterialQuantityInwardOutward > Number(selectedRow.TotalMaterialQuantityInStock ?? 0)
        ) {
            newErrors.MaterialQuantityInwardOutward = "You Cannot remove stock more than available stock.";
        }

        // if (formData.InwardOutwardType === "INWARD" && !formData.SenderName?.trim()) {
        //     newErrors.SenderName = "Sender Name is required.";
        // }

        // if (formData.InwardOutwardType === "OUTWARD" && !formData.ReceiverName?.trim()) {
        //     newErrors.ReceiverName = "Receiver Name is required.";
        // }
        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }

    const PushStocks = (): AddUpdateStockManagementRequest => {
        return {
            SubMaterialMasterId: formData.SubMaterialMasterId,
            Reason: formData.Reason,
            InwardOutwardType: formData.InwardOutwardType,
            ProjectId: Number(projectId),
            MaterialQuantityInwardOutward: formData.MaterialQuantityInwardOutward,
            SenderName: formData.SenderName,
            ReceiverName: formData.ReceiverName
        };
    };

    const handleAddRemoveStocks = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({})
        const validation = validateAddRemoveStock()

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushStocks();

                const response = await stockManagementService.apiCallAddUpdateStockManagement(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    await loadStockManagementData(1, {})

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] })

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
            'Add Remove Stocks'
        )
    };

    const requiredStockManagementColumnKeys: string[] = ["MaterialName", "Actions"];

    const allStockManagementColumnKeys: string[] = StockManagementColumn.map((c) => c.key);

    const [selectedStockManagementColumnKeys, setSelectedStockManagementColumnKeys] =
        useState<string[]>(() => {
            try {
                const saved = LocalStorageHelper.getStockManagementTableColumns?.();

                if (saved) {
                    const parsed = JSON.parse(saved) as string[];

                    const withRequired = Array.from(
                        new Set([...parsed, ...requiredStockManagementColumnKeys]),
                    );

                    return withRequired.filter((k) =>
                        allStockManagementColumnKeys.includes(k),
                    );
                }
            } catch { }
            return allStockManagementColumnKeys;
        });

    useEffect(() => {
        setSelectedStockManagementColumnKeys((prev) =>
            Array.from(new Set([...prev, ...requiredStockManagementColumnKeys])).filter(
                (k) => allStockManagementColumnKeys.includes(k),
            ),
        );
    }, [StockManagementColumn.length]);

    const visibleStockManagementColumns = useMemo(
        () =>
            StockManagementColumn.filter((col) =>
                selectedStockManagementColumnKeys.includes(col.key),
            ),

        [StockManagementColumn, selectedStockManagementColumnKeys],
    );

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}> {" "} <div></div>{" "}</Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Material Name"
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}
                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters)
                    setShowFilterPopup(true)
                }}

                isShowCustomizeButton
                onCustomize={() => setIsShowCustomizeStockManagementColumnsModal(true)}
                isShowExportButton={canExport && StockManagementForTable.length > 0}
                onExportExcel={handleExportStockManagementExcel}
                onExportPdf={handleExportStockManagementPdf}
                exportLoading={isLoading}
            />

            <DataTable
                data={StockManagementForTable}
                columns={visibleStockManagementColumns}
                pagination={StockManagementPaginationInfo}
                emptyMessage="No Stock Management Data found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            <CustomizeColumnsModal
                isOpen={isShowCustomizeStockManagementColumnsModal}
                onClose={() => setIsShowCustomizeStockManagementColumnsModal(false)}
                onApply={(keys) => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredStockManagementColumnKeys]),
                    );
                    setSelectedStockManagementColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeStockManagementTableColumns?.(
                            JSON.stringify(withRequired),
                        );
                    } catch { }
                }}
                columns={StockManagementColumn}
                selectedKeys={selectedStockManagementColumnKeys}
                requiredKeys={requiredStockManagementColumnKeys}
                title="Customize Table Columns"
            />

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Stock Management "
                onSubmit={(e) => {
                    e.preventDefault();
                    updateListState({ filters: tempFilters, page: 1 });
                    setShowFilterPopup(false);
                }}
                saveText="Apply"
                cancelText="Clear"
                onCancel={() => {
                    setTempFilters({});
                    resetFilters();
                }}
                size="small-half"
            >
                <div className="space-y-4">
                    <div>
                        <Input
                            type="text"
                            label="Material Name"
                            value={tempFilters.MaterialName || ""}
                            onChange={(e) => handleFilterChange("MaterialName", e.target.value)}
                            placeholder="Enter Material Name"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Sub Material Name"
                            value={tempFilters.SubMaterialName || ""}
                            onChange={(e) => handleFilterChange("SubMaterialName", e.target.value)}
                            placeholder="Enter Sub Material Name"
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                    setFormData(initialFormState());
                    setErrors({});
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                    setFormData(initialFormState());
                    setErrors({});
                }}
                title={isInward ? 'Add Stock' : 'Remove Stocks'}
                onSubmit={handleAddRemoveStocks}
                saveText={isInward ? 'Add Stock' : 'Remove Stocks'}
                loading={isLoading}
                cancelText="Cancel"
                size="xl"
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4" >

                        <div>
                            <Input
                                label='Material Name'
                                type="text"
                                required
                                value={selectedRow?.MaterialName ?? ''}
                                disabled
                            />
                        </div>

                        <div>
                            <Input
                                label='Sub Material Name'
                                required
                                value={selectedRow?.SubMaterialName ?? ''}
                                disabled
                            />
                        </div>

                        <div>
                            <Input
                                label={isInward ? "Sender Name" : "Receiver Name"}
                                required
                                type="text"
                                value={isInward ? formData.SenderName ?? '' : formData.ReceiverName ?? ''}
                                onChange={(e) =>
                                    handleFieldChange(
                                        isInward ? "SenderName" : "ReceiverName",
                                        e.target.value
                                    )
                                }
                                error={isInward ? errors.SenderName : errors.ReceiverName}
                                maxLength={250}
                                placeholder={isInward ? "Enter Sender Name" : "Enter Receiver Name"}
                            />
                        </div>

                        <div>
                            <Input
                                label='Quantity'
                                required
                                type="text"
                                value={formData.MaterialQuantityInwardOutward ?? ''}
                                onChange={(e) => handleFieldChange("MaterialQuantityInwardOutward", filterNumbersWithDecimal(e.target.value))}
                                error={errors.MaterialQuantityInwardOutward}
                                maxLength={250}
                                placeholder="Enter Quantity"
                            />
                        </div>

                        <div>
                            <TextArea
                                label='Remark'
                                required
                                value={formData.Reason || ''}
                                onChange={(e) => handleFieldChange("Reason", e.target.value)}
                                error={errors.Reason}
                                maxLength={255}
                                placeholder="Enter Remark"
                                rows={4}
                            />
                        </div>

                    </div>
                </div>
            </Modal>

        </div>
    )
}

export default StockManagement;