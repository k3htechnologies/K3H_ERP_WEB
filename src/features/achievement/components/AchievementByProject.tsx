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
import type { FilterWithPaginationAchievementRequest, ProjectAchievementData } from "@/features/achievement/models/AchievementReportModel";
import { achievementReportService } from "@/features/achievement/services/AchievementReportService";
import useToast from "@/core/hooks/useToast";
import { CustomTable } from "@/ui/components/DataTable/CustomTable";
import { Modal } from "@/ui/components/Modal/Modal";
import AchievementByClosing from "./AchievementByClosing";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";

interface Props {
    filterType: string;
    fromDate: string | null;
    toDate: string | null;
}

export const AchievementByProject: React.FC<Props> = ({ filterType, fromDate, toDate }) => {

    const [projectAchievementList, setProjectAchievementList] = useState<ProjectAchievementData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const { canExport } = useMenuPermissions();
    const { addToast } = useToast();
    const { pagination, setPagination } = usePagination(20);
    const [selectedCell, setSelectedcell] = useState<any>(null);
    const [isShowCustomizeAchievementByProjectColumnsModal, setIsShowCustomizeAchievementByProjectColumnsModal] = useState(false);

    const loadAchievementByProjectData = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo, searchText?: string) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationAchievementRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: filterParams.ProjectId ? Number(filterParams.ProjectId) : undefined,
                    ProjectName: searchText?.trim() || undefined,
                    EmployeeName: filterParams.EmployeeName || undefined,
                    FilterType: filterType.trim() || undefined,
                    FromDate: fromDate ? fromDate || undefined : undefined,
                    ToDate: toDate ? toDate || undefined : undefined,
                    SortBy: getSortByParam(sort ?? null, AchievementByProjectColumns),
                };

                const response = await achievementReportService.apiCallPullProjectAchievementReport(params);

                if (E.isRight(response)) {

                    setProjectAchievementList(response.right.Data);

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
            'Loading Achievement By Project'
        );
    },
        [pagination.currentPage, pagination.pageSize, addToast, setPagination,]);

    useEffect(() => {

        loadAchievementByProjectData(1, {}, sortInfo, searchTerm);

    }, [filterType, fromDate, toDate]);


    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        loadAchievementByProjectData(1, {}, sortInfo, value)
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setPagination({ currentPage: 1 });
        loadAchievementByProjectData(1, {}, sortInfo, '');
    }

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadAchievementByProjectData(page, {}, sortInfo, searchTerm);
    };

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        setPagination({ currentPage: 1 });
        loadAchievementByProjectData(1, {}, sort, searchTerm);
    }, [searchTerm]);

    const handleExportAchievementByProject = async (exportType: 'Excel' | 'PDF') => {
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

                const response = await achievementReportService.apiCallPullProjectAchievementReport(params);

                handleExportFile(response, exportType, 'Achievement By Project', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportAchievementByProjectExcel = () => handleExportAchievementByProject('Excel');
    const handleExportAchievementByProjectPdf = () => handleExportAchievementByProject('PDF');

    const AchievementByProjectColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'ProjectName',
            label: 'Project Name',
            width: '15',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: (value, row) => {

                return (
                    <span
                        className="cursor-pointer text-blue-600 font-semibold hover:underline"

                        onClick={() => {
                            handleOpenModal(row)
                        }}
                    >
                        {value}
                    </span>
                );
            }


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


    const AchievementByProjectPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    )
    const AchievementByProjectForTable = useMemo(() => projectAchievementList, [projectAchievementList]);

    const requiredAchievementByProjectColumnKeys: string[] = ['Name', 'Actions'];

    const allAchievementByProjectColumnKeys: string[] = AchievementByProjectColumns.map(c => c.key);

    const [selectedAchievementByProjectColumnKeys, setSelectedAchievementByProjectColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getAchievementByProjectTableColumns?.();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]

                const withRequired = Array.from(new Set([...parsed, ...requiredAchievementByProjectColumnKeys]));

                return withRequired.filter(k => allAchievementByProjectColumnKeys.includes(k));
            }
        } catch { }
        return allAchievementByProjectColumnKeys;
    });

    useEffect(() => {
        setSelectedAchievementByProjectColumnKeys(prev => Array.from(new Set([...prev, ...requiredAchievementByProjectColumnKeys])).filter(k => allAchievementByProjectColumnKeys.includes(k)));
    }, [AchievementByProjectColumns.length])

    const visibleAchievementByProjectColumnsColumns = useMemo(
        () => AchievementByProjectColumns.filter(col => selectedAchievementByProjectColumnKeys.includes(col.key)),
        [AchievementByProjectColumns, selectedAchievementByProjectColumnKeys]
    );

    const handleOpenModal = (row: ProjectAchievementData) => {

        setSelectedcell({
            projectId: row.ProjectId,
            project: row.ProjectName
        });
    };

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
                onCustomize={() => setIsShowCustomizeAchievementByProjectColumnsModal(true)}

                // EXPORT
                isShowExportButton={canExport && AchievementByProjectForTable.length > 0}
                onExportExcel={handleExportAchievementByProjectExcel}
                onExportPdf={handleExportAchievementByProjectPdf}
                exportLoading={isLoading}
            />

            <CustomTable
                data={AchievementByProjectForTable}
                columns={visibleAchievementByProjectColumnsColumns}
                pagination={AchievementByProjectPaginationInfo}
                emptyMessage="No Achievement By Project Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />


            <CustomizeColumnsModal
                isOpen={isShowCustomizeAchievementByProjectColumnsModal}
                onClose={() => setIsShowCustomizeAchievementByProjectColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredAchievementByProjectColumnKeys])
                    );
                    setSelectedAchievementByProjectColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeAchievementByProjectTableColumns?.(
                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={AchievementByProjectColumns}
                selectedKeys={selectedAchievementByProjectColumnKeys}
                requiredKeys={requiredAchievementByProjectColumnKeys}
                title="Customize Table Columns"
            />

            {selectedCell && (
                <Modal
                    isOpen={!!selectedCell}
                    onClose={() => setSelectedcell(null)}
                    title={
                        <div className="flex flex-col">

                            <span className="font-semibold text-base">
                                {selectedCell.project || ""}
                            </span>

                        </div>
                    }
                    size="large-half"
                >
                    <AchievementByClosing filterType={filterType} fromDate={fromDate} toDate={toDate} projectId={selectedCell?.projectId} />
                </Modal>
            )}

        </div>
    );
};
export default AchievementByProject;
