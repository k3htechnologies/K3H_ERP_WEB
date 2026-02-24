import { useCallback, useEffect, useMemo, useState } from "react";
import type { FilterWithPaginationPaymentScheduleMasterReportRequest, PaymentScheduleMasterReportData } from "@/features/paymentScheduleMaster/models/PaymentScheduleMasterModel";
import { runApiWithLoader } from "@/core/utils";
import usePagination from "@/core/hooks/usePagination";
import useToast from "@/core/hooks/useToast";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { paymentScheduleMasterService } from "@/features/paymentScheduleMaster/services/PaymentScheduleMasterService";
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import * as E from 'fp-ts/Either';
import { Loader } from "@/core/utils/loader";
import { handleExportFile } from "@/core/utils/exportFile";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";

export const PaymentScheduleMasterReport: React.FC = () => {

    const [PaymentScheduleMasterReportList, setPaymentScheduleMasterReportList] = useState<PaymentScheduleMasterReportData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo>();

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

    //#region
    const loadPaymentScheduleMasterReportData = useCallback(async (page: number = pagination.currentPage, sort?: SortInfo) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationPaymentScheduleMasterReportRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
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
            'Loading '
        );
    },
        [projectId, pagination.currentPage, pagination.pageSize, addToast, setPagination,]);
    //#endregion

    //#region INIT
    useEffect(() => {
        if (!projectId) return;

        setPagination({ currentPage: 1 });
        loadPaymentScheduleMasterReportData(1, sortInfo,);
    }, [projectId]);
    //#endregion

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadPaymentScheduleMasterReportData(page, sortInfo,);
    };
    //#endregion

    //#region TABLE SORT COLUMN
    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        setPagination({ currentPage: 1 });

        loadPaymentScheduleMasterReportData(1, sort,);
    }, []);
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
                    SortBy: getSortByParam(sortInfo ?? null, PaymentScheduleMasterReportColumns),
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
    const PaymentScheduleMasterReportColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'CarpetArea',
            label: 'Carpet Area',
            width: '25',
            sortable: false,
            fixed: 'left',
            align: 'left',
            render: value => value || 0

        },
        {
            key: 'Name',
            label: 'Name',
            width: '25',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'PaymentSchedulePercentage',
            label: 'Percentage',
            width: '25',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
         {
            key: 'TotalValue',
            label: 'Total Value',
            width: '25',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
    ], [])
    //#endregion

    //#region PAYMENT SCHEDULE REPORT TABLE PAGINATION INFO
    const PaymentScheduleMasterReportPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    )
    const PaymentScheduleMasterReportForTable = useMemo(() => PaymentScheduleMasterReportList, [PaymentScheduleMasterReportList]);
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
                pagination={PaymentScheduleMasterReportPaginationInfo}
                emptyMessage="No Payment Schedule Report Data Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

        </div>
    )
}
export default PaymentScheduleMasterReport;