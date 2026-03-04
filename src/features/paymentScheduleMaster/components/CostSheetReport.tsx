import { useCallback, useEffect, useMemo, useState } from "react";
import type { CostSheetReportData, FilterWithPaginationCostSheetReportRequest } from "@/features/paymentScheduleMaster/models/PaymentScheduleMasterModel";
import usePagination from "@/core/hooks/usePagination";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { paymentScheduleMasterService } from "@/features/paymentScheduleMaster/services/PaymentScheduleMasterService";
import * as E from 'fp-ts/Either';
import { DataTable, type FilterInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { Loader } from "@/core/utils/loader";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { handleExportFile } from "@/core/utils/exportFile";
import { useLocation } from "react-router-dom";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";

export const CostSheetReport: React.FC = () => {
    const [CostSheetReportList, setCostSheetReportList] = useState<CostSheetReportData[]>([]);
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // PAGINATION
    const { pagination, setPagination } = usePagination(20);

    //#region PROJECT SELECTION GET ID
    const { projectId } = useProject();
    //#endregion

    const location = useLocation();
    const ratePerSqFt = location.state?.ratePerSqFt || 0;
    const inventoryBuildingId = location.state?.InventoryBuildingId || 0;
    const wing = location.state?.Wing || ''

    // TOAST
    const { addToast } = useToast();

    //#region MENU PERMISSIONS
    const { canExport } = useMenuPermissions();
    //#endregion

    const loadCostSheetReport = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationCostSheetReportRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    Wing: wing,
                    InventoryBuildingId: inventoryBuildingId,
                    Rate: ratePerSqFt,
                    FlatConfiguration: filterParams.FlatConfiguration?.trim() || undefined,
                    SortBy: getSortByParam(sort ?? null, CostSheetColumns),
                };

                const response = await paymentScheduleMasterService.apiCallPullCostSheetReport(params);

                if (E.isRight(response)) {
                    setCostSheetReportList(response.right.Data);
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
            'Loading Data '
        );
    },
        [projectId, pagination.currentPage, pagination.pageSize, addToast, setPagination,]);
    //#endregion

    //#region INIT
    useEffect(() => {
        if (!projectId) return;

        setPagination({ currentPage: 1 });
        loadCostSheetReport(1, {});
    }, [projectId]);
    //#endregion

    //#region TABLE SORT COLUMN
    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        setPagination({ currentPage: 1 });

        loadCostSheetReport(1, {}, sort,);
    }, []);
    //#endregion

    //#region EXPORT / IMPORT EXCEL AND PDF
    const handleExportCostSheetReportData = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationCostSheetReportRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: Number(projectId),
                    SortBy: getSortByParam(sortInfo ?? null, CostSheetColumns),
                    ExportType: exportType
                };

                const response = await paymentScheduleMasterService.apiCallPullCostSheetReport(params);

                handleExportFile(response, exportType, 'Cost Sheet Report', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportCostSheetReportDataExcel = () => handleExportCostSheetReportData('Excel')
    const handleExportCostSheetReportDataPdf = () => handleExportCostSheetReportData('PDF')
    //#endregion

    //#region TABLE COLUMNS
    const CostSheetColumns = useMemo<TableColumn[]>(() => [
         {
            key: 'FlatConfiguration',
            label: 'Flat Configuration',
            width: '25',
            sortable: false,
            align: 'center',
            render: value => value || 0
        },
        {
            key: 'CarpetArea',
            label: 'Carpet Area',
            width: '25',
            sortable: false,
            align: 'center',
            render: value => value || 0
        },
        {
            key: 'Rate',
            label: 'Rate Per Sq.ft',
            width: '25',
            sortable: false,
            fixed: 'left',
            align: 'center',
            render: () => ratePerSqFt || 0
        },
        {
            key: 'TotalValue',
            label: 'Total Base Value',
            width: '25',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        }
    ], [ratePerSqFt]);
    //#endregion

    const CostSheetReportForTable = useMemo(() => CostSheetReportList,[CostSheetReportList]);
    //#endregion

    //#region
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <TableActionToolbar
                isShowSearchBar={false}

                // EXPORT
                isShowExportButton={canExport}
                onExportExcel={handleExportCostSheetReportDataExcel}
                onExportPdf={handleExportCostSheetReportDataPdf}
                exportLoading={isLoading}
            />

            <DataTable
                columns={CostSheetColumns}
                data={CostSheetReportForTable}
                emptyMessage="No Cost Sheet Data Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />
        </div>
    )
}
export default CostSheetReport;