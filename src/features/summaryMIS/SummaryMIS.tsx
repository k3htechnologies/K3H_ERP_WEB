import { useCallback, useEffect, useMemo, useState } from "react"
import type { BudgetData, FilterWithPaginationBudgetRequest } from "@/features/budget/models/BudgetModel"
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import usePagination from "@/core/hooks/usePagination";
import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import { budgetService } from "@/features/budget/services/BudgetService";
import * as E from "fp-ts/Either";
import { DataTable, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { formatCurrency } from "@/core/utils/comman";
import { Loader } from "@/core/utils/loader";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { handleExportFile } from "@/core/utils/exportFile";

export const SummaryMIS: React.FC = () => {

    const [summaryMISData, setSummaryMISData] = useState<BudgetData[]>([]);
    const { projectId } = useProject();
    const { addToast } = useToast();
    const { pagination, setPagination } = usePagination(20);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const { canExport } = useMenuPermissions();
    const [sortInfo] = useState<SortInfo>();

    useEffect(() => {
        if (!projectId) return

        loadSummaryMIS();
    }, [projectId])

    const loadSummaryMIS = useCallback(async (page: number = pagination.currentPage, sort?: SortInfo) => {

        runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationBudgetRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    LevelType: "L1",
                    SortBy: getSortByParam(sort ?? null, SummaryMISColumns),
                }

                const response = await budgetService.apiCallPullBudget(params);

                if (E.isRight(response)) {

                    setSummaryMISData(response.right.Data);
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
            'Loading Summary MIS Data'
        );
    }, [projectId, pagination.currentPage, pagination.pageSize, addToast, setPagination]);

    const SummaryMISColumns = useMemo<TableColumn[]>(() => [
        {
            key: "WBSCode",
            label: "WBS Code",
            width: "15",
            sortable: false,
            align: "left",
            render: value => value || ""
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
            key: "BudgetAmount",
            label: "Budget Amount (₹)",
            width: "15",
            sortable: false,
            align: "left",
            render: value => value ? formatCurrency(value) : "0"
        },
        {
            key: "FAC",
            label: "FAC (₹)",
            width: "15",
            sortable: false,
            align: "left",
            render: value => value ? formatCurrency(value) : "0"
        },
        {
            key: "Variance",
            label: "Variance (₹)",
            width: "20",
            sortable: false,
            align: "left",
            render: value => value ? formatCurrency(value) : "0"
        },
        {
            key: "Variance",
            label: "Variance (%)",
            width: "15",
            sortable: false,
            align: "left",
            render: value => value ? ` ${value}%` : "-"
        }
    ], [projectId])

    const handleExportSummaryMIS = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationBudgetRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: Number(projectId),
                    LevelType: "L1",
                    SortBy: getSortByParam(sortInfo ?? null, SummaryMISColumns),
                    ExportType: exportType
                }

                const response = await budgetService.apiCallPullBudget(params);

                handleExportFile(response, exportType, 'Summary MIS', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportSummaryMISExcel = () => handleExportSummaryMIS("Excel");
    const handleExportSummaryMISPdf = () => handleExportSummaryMIS("PDF")

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <TableActionToolbar
                isShowSearchBar={false}

                isShowExportButton={canExport && SummaryMISColumns.length > 0}
                onExportExcel={handleExportSummaryMISExcel}
                onExportPdf={handleExportSummaryMISPdf}
            />

            <DataTable
                data={summaryMISData}
                columns={SummaryMISColumns}
                recordsPerPage={20}
                emptyMessage="No Summary MIS Data Found"
                loading={isLoading}
                className="flex -1"
            />
        </div>
    )
}
export default SummaryMIS