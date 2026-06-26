import usePagination from "@/core/hooks/usePagination";
import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import { Loader } from "@/core/utils/loader";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import type { FilterWithPaginationDailyCollectionReportModel, DailyCollectionReportData } from "@/features/dailyCollectionReport/models/DailyCollectionReportModel";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { dailyCollectionReportService } from "@/features/dailyCollectionReport/services/DailyCollectionReportService";
import * as E from 'fp-ts/Either';
import { handleExportFile } from "@/core/utils/exportFile";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";

interface Props {
    filterType: string;
    fromDate: string | null;
    toDate: string | null;
}

export const DailyCollectionReportComponent: React.FC<Props> = ({ filterType, fromDate, toDate }) => {

    const [dailyCollectionReportList, setDailyCollectionReportList] = useState<DailyCollectionReportData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isShowCustomizeDailyCollectionReportColumnsModal, setIsShowCustomizeDailyCollectionReportColumnsModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const { canExport } = useMenuPermissions();
    const { addToast } = useToast();
    const { pagination, setPagination } = usePagination(20);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        loadDailyCollectionReport(1, {}, sortInfo, value)
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setPagination({ currentPage: 1 });
        loadDailyCollectionReport(1, {}, sortInfo, '');
    }

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadDailyCollectionReport(page, {}, sortInfo, searchTerm);
    };

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        setPagination({ currentPage: 1 });
        loadDailyCollectionReport(1, {}, sort, searchTerm);
    }, [searchTerm]);

    const handleExportDailyCollectionReport = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationDailyCollectionReportModel = {

                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectName: searchTerm?.trim() || undefined,
                    FilterType: filterType.trim() || undefined,
                    FromDate: fromDate ? fromDate || undefined : undefined,
                    ToDate: toDate ? toDate || undefined : undefined,
                    ExportType: exportType
                };

                const response = await dailyCollectionReportService.apiCallPullDailyCollectionReport(params);

                handleExportFile(response, exportType, 'Daily Collection Report', addToast);
                console.log('My response', response);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Daily Collection Report'
        );
    };

    const handleExportDailyCollectionReportExcel = () => handleExportDailyCollectionReport('Excel');
    const handleExportDailyCollectionReportPdf = () => handleExportDailyCollectionReport('PDF');

    const loadDailyCollectionReport = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo, searchText?: string) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationDailyCollectionReportModel = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: filterParams.ProjectId ? Number(filterParams.ProjectId) : undefined,
                    ProjectName: searchText?.trim() || undefined,
                    FilterType: filterType.trim() || undefined,
                    FromDate: fromDate ? fromDate || undefined : undefined,
                    ToDate: toDate ? toDate || undefined : undefined,
                    SortBy: getSortByParam(sort ?? null, DailyCollectionReportColumns),
                };

                const response = await dailyCollectionReportService.apiCallPullDailyCollectionReport(params);

                if (E.isRight(response)) {

                    setDailyCollectionReportList(response.right.Data);

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
            'Loading Daily Collection Report'
        );
    }, [pagination.currentPage, pagination.pageSize, addToast, setPagination,]);

    useEffect(() => {

        loadDailyCollectionReport(1, {}, sortInfo, searchTerm);

    }, [filterType, fromDate, toDate]);


    const DailyCollectionReportColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'ProjectName',
            label: 'Project Name',
            width: '15',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: value => value || ''
        },
        {
            key: 'Target',
            label: 'Month',
            width: '15',
            sortable: false,
            fixed: 'left',
            align: 'left',
            render: value =>
                value === 0 ? '0.00' : value
        },
        {
            key: 'FTD',
            label: 'FTD',
            width: '15',
            sortable: false,
            fixed: 'left',
            align: 'left',
            render: value =>
                value === 0 ? '0.00' : value
        },
        {
            key: 'NewBooking',
            label: 'New Booking',
            width: '15',
            sortable: false,
            fixed: 'left',
            align: 'left',
            render: value =>
                value === 0 ? '0.00' : value

        },
        {
            key: 'FTM',
            label: 'FTM',
            width: '15',
            sortable: false,
            fixed: 'left',
            align: 'left',
            render: value =>
                value === 0 ? '0.00' : value

        },
        {
            key: 'RegTarget',
            label: 'Reg Target',
            width: '15',
            sortable: false,
            fixed: 'left',
            align: 'left',
            render: value =>
                value === 0 ? '0.00' : value
        },
        {
            key: 'RegDoneFTD',
            label: 'Reg Done (FTD)',
            width: '15',
            sortable: false,
            fixed: 'left',
            align: 'left',
            render: value =>
                value === 0 ? '0.00' : value

        },
        {
            key: 'RegDoneMTD',
            label: 'Reg Done (MTD)',
            width: '15',
            sortable: false,
            fixed: 'left',
            align: 'left',
            render: value =>
                value === 0 ? '0.00' : value

        },
        {
            key: 'BalanceAgainstTarget',
            label: 'Balance Against Target',
            width: '15',
            sortable: false,
            fixed: 'left',
            align: 'left',
            render: value =>
                value === 0 ? '0.00' : value
        },
    ], [])

    const DailyCollectionReportPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    )

    const DailyCollectionReportForTable = useMemo(() => dailyCollectionReportList, [dailyCollectionReportList]);

    const requiredDailyCollectionReportColumnKeys: string[] = ['ProjectName'];

    const allDailyCollectionReportColumnKeys: string[] = DailyCollectionReportColumns.map(c => c.key);

    const [selectedDailyCollectionReportColumnKeys, setSelectedDailyCollectionReportColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getDailyCollectionReportTableColumns?.();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]

                const withRequired = Array.from(new Set([...parsed, ...requiredDailyCollectionReportColumnKeys]));

                return withRequired.filter(k => allDailyCollectionReportColumnKeys.includes(k));
            }
        } catch { }
        return allDailyCollectionReportColumnKeys;
    });

    useEffect(() => {
        setSelectedDailyCollectionReportColumnKeys(prev => Array.from(new Set([...prev, ...requiredDailyCollectionReportColumnKeys])).filter(k => allDailyCollectionReportColumnKeys.includes(k)));
    }, [DailyCollectionReportColumns.length]);

    const visibleDailyCollectionReportColumns = useMemo(
        () => DailyCollectionReportColumns.filter(col => selectedDailyCollectionReportColumnKeys.includes(col.key)),
        [DailyCollectionReportColumns, selectedDailyCollectionReportColumnKeys]
    );

    return (

        <div className="pt-5">
            
            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <TableActionToolbar

                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Project Name"
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}

                isShowFilterButton={false}

                isShowCustomizeButton
                onCustomize={() => setIsShowCustomizeDailyCollectionReportColumnsModal(true)}
                isShowExportButton={canExport && dailyCollectionReportList.length > 0}
                onExportExcel={handleExportDailyCollectionReportExcel}
                onExportPdf={handleExportDailyCollectionReportPdf}
                exportLoading={isLoading}
            />

            <DataTable
                data={DailyCollectionReportForTable}
                columns={visibleDailyCollectionReportColumns}
                pagination={DailyCollectionReportPaginationInfo}
                emptyMessage="No Daily Collection Report Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            <CustomizeColumnsModal
                isOpen={isShowCustomizeDailyCollectionReportColumnsModal}
                onClose={() => setIsShowCustomizeDailyCollectionReportColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredDailyCollectionReportColumnKeys])
                    );
                    setSelectedDailyCollectionReportColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeDailyCollectionReportTableColumns?.(
                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={DailyCollectionReportColumns}
                selectedKeys={selectedDailyCollectionReportColumnKeys}
                requiredKeys={requiredDailyCollectionReportColumnKeys}
                title="Customize Table Columns"
            />
        </div>
    );
};

export default DailyCollectionReportComponent;