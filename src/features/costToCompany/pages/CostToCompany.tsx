import { useCallback, useEffect, useMemo, useState } from "react";
import type { CostToCompanyData, DeleteCostToCompany, FilterWithPaginationCostToCompanyRequest } from "@/features/costToCompany/models/CostToCompanyModel";
import useToast from "@/core/hooks/useToast";
import usePagination from "@/core/hooks/usePagination";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { runApiWithLoader } from "@/core/utils";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { costToCompanyService } from "@/features/costToCompany/services/CostToCompanyService";
import * as E from "fp-ts/Either";
import { Loader } from "@/core/utils/loader";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useNavigate } from "react-router-dom";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { formatCurrency } from "@/core/utils/comman";
import { useCostToCompanyListState } from "@/features/costToCompany/context/CostToCompanyListStateContext";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import { handleExportFile } from "@/core/utils/exportFile";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { Button } from "@/ui/components/forms";
import { Trash2 } from "lucide-react";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";

export const CostToCompany: React.FC = () => {

    const [costToCompanyList, setCostToCompanyList] = useState<CostToCompanyData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const { addToast } = useToast();
    const { pagination, setPagination } = usePagination(20);
    const navigate = useNavigate();
    const { canAction, canExport } = useMenuPermissions();
    const { listState, updateListState, resetFilters, clearCostToCompanyContext } = useCostToCompanyListState();
    const { page, filters, sortInfo, searchTerm } = listState;
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [deleteCostToCompanyData, setDeleteCostToCompanyData] = useState<CostToCompanyData | null>(null);
    const [isShowCustomizeCostToCompanyColumnsModal, setIsShowCustomizeCostToCompanyColumnsModal] = useState(false);

    useEffect(() => {
        if (searchTerm && searchTerm.trim()) {

            loadCostToCompanyData(page, { EmployeeName: searchTerm.trim() }, sortInfo);
        } else {
            loadCostToCompanyData(page, filters, sortInfo);
        }
    }, [page, filters, sortInfo, searchTerm, clearCostToCompanyContext]);

    useEffect(() => {
        setPagination({ currentPage: page });
    }, [page]);

    const debouncedSearch = useDebouncedCallback((value: string, isSerach: boolean = true) => {

        let filterParams: FilterInfo = {};
        if (value.trim() === "") {

            updateListState({ searchTerm: "", filters: {}, page: 1 });
            return;
        }
        if (isSerach) {
            filterParams = { EmployeeName: value.trim() };
        }
        updateListState({ searchTerm: value, filters: filterParams, page: 1 });
    }, 350,);

    const loadCostToCompanyData = async (page: number = pagination.currentPage, filterParams: FilterInfo, sortInfo?: SortInfo, searchText?: string,) => {
        runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationCostToCompanyRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    CostToCompanyId: filterParams.CostToCompanyId ? Number(filterParams.CostToCompanyId) : undefined,
                    EmployeeName: searchText ?? filterParams.EmployeeName ?? undefined,
                    IsCheckPermission: false,
                    SortBy: getSortByParam(sortInfo ?? null, CostToCompanyColumns),
                }

                const response = await costToCompanyService.apiCallPullCostToCompany(params);

                if (E.isRight(response)) {

                    setCostToCompanyList(response.right.Data);

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
                addToast({ type: "error", title: error.message }),
            undefined,
            "Loading Cost To Company "
        )
    }

    const handleViewCostToCompany = useCallback((row: CostToCompanyData) => {
        updateListState({
            CostToCompanyId: row.CostToCompanyId ?? 0,
            EmployeeName: row.EmployeeName ?? ""
        })
        navigate("/costToCompany/view")
    }, [navigate, updateListState])

    const handleConfirmationDialogBoxOpen = useCallback((row: CostToCompanyData) => {
        setDeleteCostToCompanyData(row);
        setIsConfirmationDialogBoxOpen(true);
    }, []);

    const CostToCompanyColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'EmployeeName',
            label: 'Employee',
            width: '15',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: (value, row) => (
                <TooltipText
                    text={value || "-"}
                    maxWidth="250px"
                    tooltipThreshold={25}
                    onClick={() => handleViewCostToCompany(row)}
                />
            ),
        },
        {
            key: 'AnnualCTC',
            label: 'Annual CTC (₹)',
            width: '15',
            sortable: false,
            fixed: 'left',
            align: 'left',
            render: value => value ? formatCurrency(value) : '0'
        },
        {
            key: 'MonthlyCTC',
            label: 'Monthly CTC (₹)',
            width: '15',
            sortable: false,
            fixed: 'left',
            align: 'left',
            render: value => value ? formatCurrency(value) : '0'
        },
        {
            key: 'EffectiveFromDate',
            label: 'Effective From Date',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value?: string) =>
                value ? formatDate_dd_MonthName_yy(value) : "-",
        },
        {
            key: 'EffectiveToDate',
            label: 'Effective To Date',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value?: string) =>
                value ? formatDate_dd_MonthName_yy(value) : "-",
        },
        {
            key: 'IsProvidentFund',
            label: 'Provident Fund',
            width: '15',
            sortable: false,
            fixed: 'left',
            align: 'left',
            render: value => value === true ? "Yes" : "No"
        },
        {
            key: 'EmployeesStateInsuranceCorporation',
            label: 'Employees State Insurance Corporation',
            width: '15',
            sortable: false,
            fixed: 'left',
            align: 'left',
            render: value => value === true ? "Yes" : "No"
        },
        {
            key: "Actions",
            label: "Actions",
            width: "12",
            fixed: "right",
            align: "center",
            render: (_value, row) => (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmationDialogBoxOpen(row);
                        }}
                        color="transparent"
                        isborderRadius
                        size="sm"
                        disabled={!canAction}
                        style={{
                            color: canAction ? "red" : "#9CA3AF",
                            cursor: canAction ? "pointer" : "not-allowed",
                            opacity: canAction ? 1 : 0.5,
                        }}
                        title="Delete Cost To Company"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ], [handleConfirmationDialogBoxOpen])

    const handleAddUpdateCostToCompanyModal = () => {
        navigate("/costToCompany/add")
    }

    const searchCostToCompany = (searchValue: string) => {
        updateListState({ searchTerm: searchValue });
        debouncedSearch(searchValue, false);
    };

    const clearSearchCostToCompany = () => {
        debouncedSearch.cancel?.();
        resetFilters();
    };

    const handleExportCostToCompany = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationCostToCompanyRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    EmployeeName: filters.EmployeeName?.trim() || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, CostToCompanyColumns),
                    ExportType: exportType,
                };

                const response = await costToCompanyService.apiCallPullCostToCompany(params);

                handleExportFile(response, exportType, "Cost To Company", addToast);

                return response;
            },
            undefined,
            (error: any) =>
                addToast({ type: "error", title: error.message || "Export failed" }),
            undefined,
            "Preparing Export",
        );
    }

    const handleExportCostToCompanyExcel = () => handleExportCostToCompany("Excel");
    const handleExportCostToCompanyPdf = () => handleExportCostToCompany("PDF");

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadCostToCompanyData(page, {});
    };

    const handleSortColumn = useCallback((sort: SortInfo) => {
        updateListState({ sortInfo: sort, page: 1 });
    }, [updateListState],);

    const requiredCostToCompanyColumnKeys: string[] = ["EmployeeName", "Actions"];

    const allCostToCompanyColumnKeys: string[] = CostToCompanyColumns.map((c) => c.key);

    const [selectedCostToCompanyColumnKeys, setSelectedCostToCompanyColumnKeys] =
        useState<string[]>(() => {
            try {
                const saved = LocalStorageHelper.getCostToCompanyTableColumns?.();

                if (saved) {
                    const parsed = JSON.parse(saved) as string[];

                    const withRequired = Array.from(
                        new Set([...parsed, ...requiredCostToCompanyColumnKeys]),
                    );

                    return withRequired.filter((k) =>
                        allCostToCompanyColumnKeys.includes(k),
                    );
                }
            } catch { }
            return allCostToCompanyColumnKeys;
        });

    useEffect(() => {
        setSelectedCostToCompanyColumnKeys((prev) =>
            Array.from(new Set([...prev, ...requiredCostToCompanyColumnKeys])).filter(
                (k) => allCostToCompanyColumnKeys.includes(k),
            ),
        );
    }, [CostToCompanyColumns.length]);

    const visibleCostToCompanyColumns = useMemo(
        () =>
            CostToCompanyColumns.filter((col) =>
                selectedCostToCompanyColumnKeys.includes(col.key),
            ),

        [CostToCompanyColumns, selectedCostToCompanyColumnKeys],
    );

    const CostToCompanyPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    )
    const CostToCompanyForTable = useMemo(() => costToCompanyList, [costToCompanyList]);

    const handleDeleteCostToCompany = async () => {
        setIsConfirmationDialogBoxOpen(false);

        if (!deleteCostToCompanyData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteCostToCompany = {
                    CostToCompanyId: deleteCostToCompanyData.CostToCompanyId || 0,
                    Uniquekey: deleteCostToCompanyData.Uniquekey || "",
                };

                const response = await costToCompanyService.apiCallDeleteCostToCompany(params);

                if (E.isRight(response)) {
                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(
                        1,
                        Math.ceil(newTotalRecords / pagination.pageSize),
                    );

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    } else if (
                        costToCompanyList.length === 1 &&
                        pagination.currentPage > 1
                    ) {
                        pageToShow = pagination.currentPage - 1;
                    }

                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages,
                    });
                    await loadCostToCompanyData(pageToShow, filters, sortInfo);

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0], });

                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteCostToCompanyData(null);
                } else {
                    addToast({ type: "error", title: response.left.message });

                    setIsConfirmationDialogBoxOpen(false);
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message });
            },
            undefined,
            "Deleting Cost To Company",
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Employee Name"
                onSearchChange={searchCostToCompany}
                onClearSearch={clearSearchCostToCompany}
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddUpdateCostToCompanyModal}

                isShowExportButton={canExport && CostToCompanyForTable.length > 0}
                onExportExcel={handleExportCostToCompanyExcel}
                onExportPdf={handleExportCostToCompanyPdf}
                exportLoading={isLoading}

                isShowCustomizeButton
                onCustomize={() => setIsShowCustomizeCostToCompanyColumnsModal(true)}
            />

            <CustomizeColumnsModal
                isOpen={isShowCustomizeCostToCompanyColumnsModal}
                onClose={() => setIsShowCustomizeCostToCompanyColumnsModal(false)}
                onApply={(keys) => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredCostToCompanyColumnKeys]),
                    );
                    setSelectedCostToCompanyColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeCostToCompanyTableColumns?.(
                            JSON.stringify(withRequired),
                        );
                    } catch { }
                }}
                columns={CostToCompanyColumns}
                selectedKeys={selectedCostToCompanyColumnKeys}
                requiredKeys={requiredCostToCompanyColumnKeys}
                title="Customize Table Columns"
            />

            <DataTable
                columns={visibleCostToCompanyColumns}
                data={CostToCompanyForTable}
                pagination={CostToCompanyPaginationInfo}
                emptyMessage="No Cost To Company Data found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteCostToCompanyData(null);
                }}
                onConfirm={handleDeleteCostToCompany}
                loading={isLoading}
                pageName="Cost To Company"
            />

        </div>
    )
}
export default CostToCompany;