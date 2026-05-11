import { useCallback, useEffect, useMemo, useState } from "react";
import { runApiWithLoader } from "@/core/utils";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import usePagination from "@/core/hooks/usePagination";
import * as E from 'fp-ts/Either';
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { Loader } from "@/core/utils/loader";
import { handleExportFile } from "@/core/utils/exportFile";
import type { AchievementClosingData, FilterWithPaginationAchievementRequest } from "@/features/achievement/models/AchievementReportModel";
import { achievementReportService } from "@/features/achievement/services/AchievementReportService";
import useToast from "@/core/hooks/useToast";
import { CustomTable } from "@/ui/components/DataTable/CustomTable";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { CustomizeColumnsModal } from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";

interface Props {
    filterType: string;
    fromDate: string | null;
    toDate: string | null;
    projectId?: number;
}

export const AchievementByClosing: React.FC<Props> = ({ filterType, fromDate, toDate, projectId }) => {

    const [closingAchievementList, setClosingAchievementList] = useState<AchievementClosingData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const { canExport } = useMenuPermissions();
    const { addToast } = useToast();
    const { pagination, setPagination } = usePagination(20);
    const [isShowCustomizeAchievementByClosingColumnsModal, setIsShowCustomizeAchievementByClosingColumnsModal] = useState(false);

    const loadAchievementByClosingData = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo, searchText?: string) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationAchievementRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId) || 0,
                    EmployeeName: searchText?.trim() || undefined,
                    ProjectName: filterParams.EmployeeName || undefined,
                    FilterType: filterType.trim() || undefined,
                    FromDate: fromDate ? fromDate || undefined : undefined,
                    ToDate: toDate ? toDate || undefined : undefined,
                    SortBy: getSortByParam(sort ?? null, AchievementByClosingColumns),
                };

                const response = await achievementReportService.apiCallPullAchievementReportClosing(params);

                if (E.isRight(response)) {

                    setClosingAchievementList(response.right.Data);

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
            'Loading Achievement By Closing'
        );
    },
        [pagination.currentPage, pagination.pageSize, addToast, setPagination,]);

    useEffect(() => {

        loadAchievementByClosingData(1, {}, sortInfo, searchTerm);

    }, [filterType, fromDate, toDate]);


    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        loadAchievementByClosingData(1, {}, sortInfo, value)
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setPagination({ currentPage: 1 });
        loadAchievementByClosingData(1, {}, sortInfo, '');
    }

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadAchievementByClosingData(page, {}, sortInfo, searchTerm);
    };

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        setPagination({ currentPage: 1 });
        loadAchievementByClosingData(1, {}, sort, searchTerm);
    }, [searchTerm]);

    const handleExportAchievementByClosing = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationAchievementRequest = {

                    PageNumber: 1,
                    PageSize: pagination.pageSize,
                    ProjectName: searchTerm?.trim() || undefined,
                    FilterType: filterType.trim() || undefined,
                    FromDate: fromDate ? fromDate || undefined : undefined,
                    ToDate: toDate ? toDate || undefined : undefined,
                    ExportType: exportType
                };

                const response = await achievementReportService.apiCallPullAchievementReportClosing(params);

                handleExportFile(response, exportType, 'Achievement By Closing', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportAchievementByClosingExcel = () => handleExportAchievementByClosing('Excel');
    const handleExportAchievementByClosingPdf = () => handleExportAchievementByClosing('PDF');

    const AchievementByClosingColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'EmployeeName',
            label: 'Employee Name',
            width: '15',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: (value) => (
                <span className="text-blue-600 font-semibold">
                    {value}
                </span>
            )
        },
        {
            key: 'DesignationName',
            label: 'Designation',
            width: '15',
            sortable: true,
            align: 'left',
            render: value => value || ''
        },

        {
            key: 'WalkinsByCP',
            label: 'Walkins By CP',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '0'
        },
        {
            key: 'WalkinsDirect',
            label: 'Walkins Direct',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '0'
        },
        {
            key: 'TotalWalkins',
            label: 'Total Walkins',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '0'
        },


        {
            key: 'Revisits',
            label: 'Revisits',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '0'
        },
        {
            key: 'TotalFreshVisits',
            label: 'Total Fresh Visits',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '0'
        },
        {
            key: 'BookingByCP',
            label: 'Booking By CP',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '0'
        },
        {
            key: 'BookingDirect',
            label: 'Booking Direct',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '0'
        },
        {
            key: 'TotalBooking',
            label: 'Total Booking',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '0'
        },

        {
            key: 'TotalRevenue',
            label: 'Total Revenue (₹)',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '0'
        },


    ], []);


    const AchievementByClosingPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    )
    const AchievementByClosingForTable = useMemo(() => closingAchievementList, [closingAchievementList]);

    const requiredAchievementByClosingColumnKeys: string[] = ['Name', 'Actions'];

    const allAchievementByClosingColumnKeys: string[] = AchievementByClosingColumns.map(c => c.key);

    const [selectedAchievementByClosingColumnKeys, setSelectedAchievementByClosingColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getAchievementByClosingTableColumns?.();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]

                const withRequired = Array.from(new Set([...parsed, ...requiredAchievementByClosingColumnKeys]));

                return withRequired.filter(k => allAchievementByClosingColumnKeys.includes(k));
            }
        } catch { }
        return allAchievementByClosingColumnKeys;
    });

    useEffect(() => {
        setSelectedAchievementByClosingColumnKeys(prev => Array.from(new Set([...prev, ...requiredAchievementByClosingColumnKeys])).filter(k => allAchievementByClosingColumnKeys.includes(k)));
    }, [AchievementByClosingColumns.length])

    const visibleAchievementByClosingColumns = useMemo(
        () => AchievementByClosingColumns.filter(col => selectedAchievementByClosingColumnKeys.includes(col.key)),
        [AchievementByClosingColumns, selectedAchievementByClosingColumnKeys]
    );

    return (
        <div className="pt-5">

            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Employee Name"
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}

                isShowFilterButton={false}

                isShowCustomizeButton
                onCustomize={() => setIsShowCustomizeAchievementByClosingColumnsModal(true)}

                // EXPORT
                isShowExportButton={canExport && AchievementByClosingForTable.length > 0}
                onExportExcel={handleExportAchievementByClosingExcel}
                onExportPdf={handleExportAchievementByClosingPdf}
                exportLoading={isLoading}
            />

            <CustomizeColumnsModal
                isOpen={isShowCustomizeAchievementByClosingColumnsModal}
                onClose={() => setIsShowCustomizeAchievementByClosingColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredAchievementByClosingColumnKeys])
                    );
                    setSelectedAchievementByClosingColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeAchievementByClosingTableColumns?.(
                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={AchievementByClosingColumns}
                selectedKeys={selectedAchievementByClosingColumnKeys}
                requiredKeys={requiredAchievementByClosingColumnKeys}
                title="Customize Table Columns"
            />

            <CustomTable
                data={AchievementByClosingForTable}
                columns={visibleAchievementByClosingColumns}
                pagination={AchievementByClosingPaginationInfo}
                emptyMessage="No Achievement By Closing Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />



        </div>
    );
};
export default AchievementByClosing;
