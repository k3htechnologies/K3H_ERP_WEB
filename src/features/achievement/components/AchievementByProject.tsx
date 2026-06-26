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
import AchievementByClosing from "@/features/achievement/components/AchievementByClosing";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import AchievementBySourcing from "@/features/achievement/components/AchievementBySourcing";
import { Button } from "@/ui/components/forms";
import AchievementWalkinsRevisitReport from "@/features/achievement/components/AchievementWalkinsRevisitReport";
import AchievementBookingReport from "@/features/achievement/components/AchievementBookingReport";
import AchievementIbmObmReport from "@/features/achievement/components/AchievementIbmObmReport";

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
    const [selectedCellClosing, setSelectedcellClosing] = useState<any>(null);
    const [selectedCellSourcing, setSelectedcellSourcing] = useState<any>(null);

    const [selectedColumnClickWalkingRevisit, setSelectedColumnClickWalkingRevisit] = useState<any>(null);
    const [selectedColumnClickBooking, setSelectedColumnClickBooking] = useState<any>(null);
    const [selectedColumnClickIbmObm, setSelectedColumnClickIbmObm] = useState<any>(null);

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
                    PageSize: pagination.totalRecords,
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

    const handleCMClick = (row: ProjectAchievementData) => {
        setSelectedcellClosing({
            projectId: row.ProjectId,
            project: row.ProjectName
        });
    };

    const handleSMClick = (row: ProjectAchievementData) => {
        setSelectedcellSourcing({
            projectId: row.ProjectId,
            project: row.ProjectName
        });
    };

    const handleColumnClickWalkingRevisit = (row: ProjectAchievementData, tabName: string, columnKey: string,) => {
        setSelectedColumnClickWalkingRevisit({
            projectId: row.ProjectId,
            project: row.ProjectName,
            tabName: tabName,
            columnKey: columnKey
        });
    };

    const handleColumnClickBooking = (row: ProjectAchievementData, tabName: string, columnKey: string,) => {
        setSelectedColumnClickBooking({
            projectId: row.ProjectId,
            project: row.ProjectName,
            tabName: tabName,
            columnKey: columnKey
        });
    };

    const handleColumnClickIbmObm = (row: ProjectAchievementData, tabName: string, columnKey: string,) => {
        setSelectedColumnClickIbmObm({
            projectId: row.ProjectId,
            project: row.ProjectName,
            tabName: tabName,
            columnKey: columnKey
        });
    };

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
                    <div className="flex items-center justify-between w-full gap-2">

                        <span className="text-black-600 truncate">
                            {value}
                        </span>

                        <div className="flex items-center gap-2 shrink-0">
                            <Button
                                type="button"
                                size="sm"
                                color="blue"
                                variant="solid"
                                colorMode="extraLight"
                                onClick={() => handleCMClick(row)}
                            >
                                CM
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                color="primaryLight"
                                variant="solid"
                                onClick={() => handleSMClick(row)}
                            >
                                SM
                            </Button>

                        </div>

                    </div>
                );
            }
        },
        {
            key: 'WalkinsByCP',
            label: 'Walkins By CP',
            width: '15',
            sortable: false,
            align: 'center',
            theadStyle: {
                backgroundColor: '#FFF',
                color: '#64748B'
            },
            tdStyle: {
                backgroundColor: '#EEF5FF'
            },

            render: (value, row) => {

                const isClickable = (value ?? 0) > 0;

                return (
                    <span
                        className={
                            isClickable
                                ? "cursor-pointer text-blue-600 hover:underline"
                                : "text-gray-400 cursor-not-allowed"
                        }
                        onClick={() => {
                            if (!isClickable) return;
                            handleColumnClickWalkingRevisit(row, 'PROJECT', 'WALKINS BY CP')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }
        },
        {
            key: 'WalkinsDirect',
            label: 'Walkins Direct',
            width: '15',
            sortable: false,
            align: 'center',
            theadStyle: {
                backgroundColor: '#FFF',
                color: '#64748B'
            },
            tdStyle: {
                backgroundColor: '#EEF5FF'
            },
            render: (value, row) => {

                const isClickable = (value ?? 0) > 0;

                return (
                    <span
                        className={
                            isClickable
                                ? "cursor-pointer text-blue-600 hover:underline"
                                : "text-gray-400 cursor-not-allowed"
                        }
                        onClick={() => {
                            if (!isClickable) return;
                            handleColumnClickWalkingRevisit(row, 'PROJECT', 'WALKINS DIRECT')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }

        },
        {
            key: 'TotalWalkins',
            label: 'Total Walkins',
            width: '15',
            sortable: false,
            align: 'center',
            theadStyle: {
                backgroundColor: '#FFF',
                color: '#64748B'
            },
            tdStyle: {
                backgroundColor: '#EEF5FF'
            },
            render: (value, row) => {

                const isClickable = (value ?? 0) > 0;

                return (
                    <span
                        className={
                            isClickable
                                ? "cursor-pointer text-blue-600 hover:underline"
                                : "text-gray-400 cursor-not-allowed"
                        }
                        onClick={() => {
                            if (!isClickable) return;
                            handleColumnClickWalkingRevisit(row, 'PROJECT', 'TOTAL WALKINS')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }
        },
        {
            key: 'TotalFreshVisits',
            label: 'Fresh Visits',
            width: '15',
            sortable: false,
            align: 'center',
            theadStyle: {
                backgroundColor: '#FFF',
                color: '#64748B'
            },
            tdStyle: {
                backgroundColor: '#EEF5FF'
            },
            render: (value, row) => {

                const isClickable = (value ?? 0) > 0;

                return (
                    <span
                        className={
                            isClickable
                                ? "cursor-pointer text-blue-600 hover:underline"
                                : "text-gray-400 cursor-not-allowed"
                        }
                        onClick={() => {
                            if (!isClickable) return;
                            handleColumnClickWalkingRevisit(row, 'PROJECT', 'FRESH VISITS')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }
        },
        {
            key: 'Revisits',
            label: 'Revisits',
            width: '15',
            sortable: false,
            align: 'center',
            theadStyle: {
                backgroundColor: '#FFF',
                color: '#64748B'
            },
            tdStyle: {
                backgroundColor: '#EEF5FF'
            },
            render: (value, row) => {

                const isClickable = (value ?? 0) > 0;

                return (
                    <span
                        className={
                            isClickable
                                ? "cursor-pointer text-blue-600 hover:underline"
                                : "text-gray-400 cursor-not-allowed"
                        }
                        onClick={() => {
                            if (!isClickable) return;
                            handleColumnClickWalkingRevisit(row, 'PROJECT', 'REVISITS')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }
        },

        {
            key: 'BookingByCP',
            label: 'Booking By CP',
            width: '15',
            sortable: false,
            align: 'center',
            theadStyle: {
                backgroundColor: '#FFF',
                color: '#64748B'
            },
            tdStyle: {
                backgroundColor: '#FBF5FF'
            },
            render: (value, row) => {

                const isClickable = (value ?? 0) > 0;

                return (
                    <span
                        className={
                            isClickable
                                ? "cursor-pointer text-blue-600 hover:underline"
                                : "text-gray-400 cursor-not-allowed"
                        }
                        onClick={() => {
                            if (!isClickable) return;
                            handleColumnClickBooking(row, 'PROJECT', 'BOOKING BY CP')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }
        },
        {
            key: 'BookingDirect',
            label: 'Booking Direct',
            width: '15',
            sortable: false,
            align: 'center',
            theadStyle: {
                backgroundColor: '#FFF',
                color: '#64748B'
            },
            tdStyle: {
                backgroundColor: '#FBF5FF'
            },
            render: (value, row) => {

                const isClickable = (value ?? 0) > 0;

                return (
                    <span
                        className={
                            isClickable
                                ? "cursor-pointer text-blue-600 hover:underline"
                                : "text-gray-400 cursor-not-allowed"
                        }
                        onClick={() => {
                            if (!isClickable) return;
                            handleColumnClickBooking(row, 'PROJECT', 'BOOKING DIRECT')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }
        },
        {
            key: 'TotalBooking',
            label: 'Total Booking',
            width: '15',
            sortable: false,
            align: 'center',
            theadStyle: {
                backgroundColor: '#FFF',
                color: '#64748B'
            },
            tdStyle: {
                backgroundColor: '#FBF5FF'
            },
            render: (value, row) => {

                const isClickable = (value ?? 0) > 0;

                return (
                    <span
                        className={
                            isClickable
                                ? "cursor-pointer text-blue-600 hover:underline"
                                : "text-gray-400 cursor-not-allowed"
                        }
                        onClick={() => {
                            if (!isClickable) return;
                            handleColumnClickBooking(row, 'PROJECT', 'TOTAL BOOKING')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }
        },

        {
            key: 'TotalRevenue',
            label: 'Total Revenue (₹)',
            width: '15',
            sortable: false,
            align: 'center',
            theadStyle: {
                backgroundColor: '#FFF',
                color: '#64748B'
            },
            tdStyle: {
                backgroundColor: '#FBF5FF'
            },
            render: (value, row) => {

                const isClickable = (value ?? 0) > 0;

                return (
                    <span
                        className={
                            isClickable
                                ? "cursor-pointer text-blue-600 hover:underline"
                                : "text-gray-400 cursor-not-allowed"
                        }
                        onClick={() => {
                            if (!isClickable) return;
                            handleColumnClickBooking(row, 'PROJECT', 'TOTAL REVENUE')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }
        },
        {
            key: 'TotalIBM',
            label: 'IBM',
            width: '15',
            sortable: false,
            align: 'center',
            theadStyle: {
                backgroundColor: '#FFF',
                color: '#64748B'
            },
            tdStyle: {
                backgroundColor: '#F0FDF4'
            },
            render: (value, row) => {

                const isClickable = (value ?? 0) > 0;

                return (
                    <span
                        className={
                            isClickable
                                ? "cursor-pointer text-blue-600 hover:underline"
                                : "text-gray-400 cursor-not-allowed"
                        }
                        onClick={() => {
                            if (!isClickable) return;
                            handleColumnClickIbmObm(row, 'PROJECT', 'IBM')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }
        },

        {
            key: 'TotalOBM',
            label: 'OBM',
            width: '15',
            sortable: false,
            align: 'center',
            theadStyle: {
                backgroundColor: '#FFF',
                color: '#64748B'
            },
            tdStyle: {
                backgroundColor: '#F0FDF4'
            },
            render: (value, row) => {

                const isClickable = (value ?? 0) > 0;

                return (
                    <span
                        className={
                            isClickable
                                ? "cursor-pointer text-blue-600 hover:underline"
                                : "text-gray-400 cursor-not-allowed"
                        }
                        onClick={() => {
                            if (!isClickable) return;
                            handleColumnClickIbmObm(row, 'PROJECT', 'OBM')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }
        },
        {
            key: 'TotalIBMOBM',
            label: 'IBM + OBM',
            width: '15',
            sortable: false,
            align: 'center',
            theadStyle: {
                backgroundColor: '#FFF',
                color: '#64748B'
            },
            tdStyle: {
                backgroundColor: '#F0FDF4'
            },
            render: (_, row) => {

                const value = Number(row.TotalIBM || 0) + Number(row.TotalOBM || 0);
                const isClickable = (value ?? 0) > 0;

                return (
                    <span
                        className={
                            isClickable
                                ? "cursor-pointer text-blue-600 hover:underline"
                                : "text-gray-400 cursor-not-allowed"
                        }
                        onClick={() => {
                            if (!isClickable) return;
                            handleColumnClickIbmObm(row, 'PROJECT', 'IBM + OBM')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }
        },
    ], [handleCMClick, handleSMClick, handleColumnClickWalkingRevisit, handleColumnClickBooking, handleColumnClickIbmObm]);


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

    const requiredAchievementByProjectColumnKeys: string[] = ['ProjectName'];

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

            {selectedCellClosing && (
                <Modal
                    isOpen={!!selectedCellClosing}
                    onClose={() => setSelectedcellClosing(null)}
                    title={
                        <div className="flex flex-col">

                            <span className="font-semibold text-base">
                                {selectedCellClosing.project || ""}
                            </span>

                        </div>
                    }
                    size="large-half"
                >
                    <AchievementByClosing filterType={filterType} fromDate={fromDate} toDate={toDate} projectId={selectedCellClosing?.projectId} />
                </Modal>
            )}

            {selectedCellSourcing && (
                <Modal
                    isOpen={!!selectedCellSourcing}
                    onClose={() => setSelectedcellSourcing(null)}
                    title={
                        <div className="flex flex-col">

                            <span className="font-semibold text-base">
                                {selectedCellSourcing.project || ""}
                            </span>

                        </div>
                    }
                    size="large-half"
                >
                    <AchievementBySourcing filterType={filterType} fromDate={fromDate} toDate={toDate} projectId={selectedCellSourcing?.projectId} />
                </Modal>
            )}

            {selectedColumnClickWalkingRevisit && (
                <Modal
                    isOpen={!!selectedColumnClickWalkingRevisit}
                    onClose={() => setSelectedColumnClickWalkingRevisit(null)}
                    title={
                        <div className="flex flex-col">

                            <span className="font-semibold text-base">
                                {selectedColumnClickWalkingRevisit.project || ""}
                            </span>
                            <span className="text-sm text-gray-500">
                                {selectedColumnClickWalkingRevisit.tabName ? `  Tab: ${selectedColumnClickWalkingRevisit.tabName}` : ""}
                                {selectedColumnClickWalkingRevisit.columnKey ? ` | Column: ${selectedColumnClickWalkingRevisit.columnKey}` : ""}
                            </span>

                        </div>
                    }
                    size="large-half"
                >
                    <AchievementWalkinsRevisitReport filterType={filterType} fromDate={fromDate} toDate={toDate} projectId={selectedColumnClickWalkingRevisit?.projectId} tabName={selectedColumnClickWalkingRevisit?.tabName} columnKey={selectedColumnClickWalkingRevisit?.columnKey} />
                </Modal>
            )}

            {selectedColumnClickBooking && (
                <Modal
                    isOpen={!!selectedColumnClickBooking}
                    onClose={() => setSelectedColumnClickBooking(null)}
                    title={
                        <div className="flex flex-col">

                            <span className="font-semibold text-base">
                                {selectedColumnClickBooking.project || ""}
                            </span>
                            <span className="text-sm text-gray-500">
                                {selectedColumnClickBooking.tabName ? `  Tab: ${selectedColumnClickBooking.tabName}` : ""}
                                {selectedColumnClickBooking.columnKey ? ` | Column: ${selectedColumnClickBooking.columnKey}` : ""}
                            </span>

                        </div>
                    }
                    size="large-half"
                >
                    <AchievementBookingReport filterType={filterType} fromDate={fromDate} toDate={toDate} projectId={selectedColumnClickBooking?.projectId} tabName={selectedColumnClickBooking?.tabName} columnKey={selectedColumnClickBooking?.columnKey} />
                </Modal>
            )}

            {selectedColumnClickIbmObm && (
                <Modal
                    isOpen={!!selectedColumnClickIbmObm}
                    onClose={() => setSelectedColumnClickIbmObm(null)}
                    title={
                        <div className="flex flex-col">

                            <span className="font-semibold text-base">
                                {selectedColumnClickIbmObm.project || ""}
                            </span>
                            <span className="text-sm text-gray-500">
                                {selectedColumnClickIbmObm.tabName ? `  Tab: ${selectedColumnClickIbmObm.tabName}` : ""}
                                {selectedColumnClickIbmObm.columnKey ? ` | Column: ${selectedColumnClickIbmObm.columnKey}` : ""}
                            </span>

                        </div>
                    }
                    size="large-half"
                >
                    <AchievementIbmObmReport filterType={filterType} fromDate={fromDate} toDate={toDate} projectId={selectedColumnClickIbmObm?.projectId} tabName={selectedColumnClickIbmObm?.tabName} columnKey={selectedColumnClickIbmObm?.columnKey} />
                </Modal>
            )}

        </div>
    );
};
export default AchievementByProject;
