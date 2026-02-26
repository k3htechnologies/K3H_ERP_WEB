import { useCallback, useEffect, useMemo, useState } from "react";
import type { FilterWithPaginationPaymentScheduleMasterReportRequest, PaymentScheduleMasterReportData } from "@/features/paymentScheduleMaster/models/PaymentScheduleMasterModel";
import { runApiWithLoader } from "@/core/utils";
import usePagination from "@/core/hooks/usePagination";
import useToast from "@/core/hooks/useToast";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { paymentScheduleMasterService } from "@/features/paymentScheduleMaster/services/PaymentScheduleMasterService";
import { DataTable, type FilterInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import * as E from 'fp-ts/Either';
import { Loader } from "@/core/utils/loader";
import { handleExportFile } from "@/core/utils/exportFile";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useLocation } from "react-router-dom";

export const PaymentScheduleMasterReport: React.FC = () => {

    const [PaymentScheduleMasterReportList, setPaymentScheduleMasterReportList] = useState<PaymentScheduleMasterReportData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // PAGINATION
    const { pagination, setPagination } = usePagination(20);

    // TOAST
    const { addToast } = useToast();

    //#region MENU PERMISSIONS
    const { canExport } = useMenuPermissions();
    //#endregion

    //#region PROJECT SELECTION GET ID
    const { projectId } = useProject();
    //#endregion

    const location = useLocation();
    const inventoryBuildingId = location.state?.InventoryBuildingId || 0;
    const wing = location.state?.Wing || 0
    const ratePerSqFt = location.state?.ratePerSqFt || 0;

    //#region
    const loadPaymentScheduleMasterReportData = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationPaymentScheduleMasterReportRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    InventoryBuildingId: inventoryBuildingId,
                    Wing: wing,
                    Rate: ratePerSqFt,
                    FlatConfiguration: filterParams.FlatConfiguration ?? undefined,
                    SortBy: getSortByParam(sort ?? null, PaymentScheduleMasterReportColumns),
                };

                const response = await paymentScheduleMasterService.apiCallPullPaymentScheduleMasterReport(params);

                if (E.isRight(response)) {
                    setPaymentScheduleMasterReportList(response.right.Data);
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
            'Loading Data'
        );
    },
        [projectId, pagination.currentPage, pagination.pageSize, addToast, setPagination,]);
    //#endregion

    //#region INIT
    useEffect(() => {
        if (!projectId || !inventoryBuildingId || !wing) return;

        setPagination({ currentPage: 1 });
        loadPaymentScheduleMasterReportData(1, {});
    }, [projectId, inventoryBuildingId, wing]);
    //#endregion

    const dynamicHeaders = useMemo(() => {
        const map = new Map<string, number>();

        PaymentScheduleMasterReportList.forEach(item => {
            if (item.Name) {
                map.set(item.Name, item.PaymentSchedulePercentage ?? 0);
            }
        });

        return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [PaymentScheduleMasterReportList]);
    //#endregion

    //#endregion

    //#region EXPORT / IMPORT EXCEL AND PDF
    const handleExportPaymentScheduleMasterReportData = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationPaymentScheduleMasterReportRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: Number(projectId),
                    ExportType: exportType
                };

                const response = await paymentScheduleMasterService.apiCallPullCostSheetReport(params);

                handleExportFile(response, exportType, 'Payment Schedule Report', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportPaymentScheduleMasterReportDataExcel = () => handleExportPaymentScheduleMasterReportData('Excel')
    const handleExportPaymentScheduleMasterReportDataPdf = () => handleExportPaymentScheduleMasterReportData('PDF')
    //#endregion

    //#region TABLE COLUMNS
    const PaymentScheduleMasterReportColumns = useMemo<TableColumn[]>(() => {
        const baseColumn: TableColumn[] = [
            {
                key: 'CarpetArea',
                label: 'Carpet Area',
                width: '20',
                fixed: 'left',
                align: 'left'
            }
        ];

        const dynamicColumns: TableColumn[] = dynamicHeaders.map(([name, percentage]) => ({
            key: name,
            label: `${name} (${percentage}%)`,
            width: '20',
            align: 'right',
            render: (_value, row) => {
                const stage = PaymentScheduleMasterReportList.find(
                    item => item.Name === name && item.CarpetArea === row.CarpetArea
                );

                return stage?.TotalValue
                    ? Number(stage.TotalValue).toLocaleString()
                    : '-';
            }
        }));

        return [...baseColumn, ...dynamicColumns];
    }, [dynamicHeaders]);
    //#endregion

    const PaymentScheduleMasterReportForTable = useMemo(() => {
        const grouped = new Map<number, Record<string, any>>();

        PaymentScheduleMasterReportList.forEach(item => {
            if (!grouped.has(item.CarpetArea)) {
                grouped.set(item.CarpetArea, {
                    CarpetArea: item.CarpetArea
                });
            }
            if (item.Name) {
                const row = grouped.get(item.CarpetArea)!;
                row[item.Name] = item.TotalValue;
            }
        });

        return Array.from(grouped.values());
    }, [PaymentScheduleMasterReportList]);
    //#endregion

    //#region 
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <TableActionToolbar
                isShowSearchBar={false}

                // EXPORT
                isShowExportButton={canExport}
                onExportExcel={handleExportPaymentScheduleMasterReportDataExcel}
                onExportPdf={handleExportPaymentScheduleMasterReportDataPdf}
                exportLoading={isLoading}
            />

            <DataTable
                columns={PaymentScheduleMasterReportColumns}
                data={PaymentScheduleMasterReportForTable}
                emptyMessage="No Payment Schedule Report Data Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
            />
        </div>
    )
}
export default PaymentScheduleMasterReport;