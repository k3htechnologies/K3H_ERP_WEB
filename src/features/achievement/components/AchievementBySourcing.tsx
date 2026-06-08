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
import type { AchievementSourcingData, FilterWithPaginationAchievementRequest } from "@/features/achievement/models/AchievementReportModel";
import { achievementReportService } from "@/features/achievement/services/AchievementReportService";
import useToast from "@/core/hooks/useToast";
import { CustomTable } from "@/ui/components/DataTable/CustomTable";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { Modal } from "@/ui/components/Modal/Modal";
import AchievementWalkinsRevisitReport from "@/features/achievement/components/AchievementWalkinsRevisitReport";
import { AchievementBookingReport } from "@/features/achievement/components/AchievementBookingReport";
import AchievementIbmObmReport from "./AchievementIbmObmReport";

interface Props {
    filterType: string;
    fromDate: string | null;
    toDate: string | null;
    projectId?: number;
}

export const AchievementBySourcing: React.FC<Props> = ({ filterType, fromDate, toDate, projectId }) => {

    const [sourcingAchievementList, setSourcingAchievementList] = useState<AchievementSourcingData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const { canExport } = useMenuPermissions();
    const { addToast } = useToast();
    const { pagination, setPagination } = usePagination(20);
    const [isShowCustomizeAchievementSourcingByColumnsModal, setIsShowCustomizeAchievementBySourcingColumnsModal] = useState(false);

    const [selectedColumnClickWalkingRevisit, setSelectedColumnClickWalkingRevisit] = useState<any>(null);
    const [selectedColumnClickBooking, setSelectedColumnClickBooking] = useState<any>(null);
    const [selectedColumnClickIbmObm, setSelectedColumnClickIbmObm] = useState<any>(null);


    const loadAchievementBySourcingData = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo, searchText?: string) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationAchievementRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId) || 0,
                    EmployeeName: searchText?.trim() || undefined,
                    ProjectName: filterParams.ProjectName || undefined,
                    FilterType: filterType.trim() || undefined,
                    FromDate: fromDate ? fromDate || undefined : undefined,
                    ToDate: toDate ? toDate || undefined : undefined,
                    SortBy: getSortByParam(sort ?? null, AchievementBySourcingColumns),
                };

                const response = await achievementReportService.apiCallPullAchievementReportSourcing(params);

                if (E.isRight(response)) {

                    setSourcingAchievementList(response.right.Data);

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
            'Loading Achievement By Sourcing'
        );

    }, [pagination.pageSize, addToast, setPagination, filterType, fromDate, toDate]);

    useEffect(() => {

        loadAchievementBySourcingData(1, {}, sortInfo, searchTerm);

    }, [filterType, fromDate, toDate, sortInfo]);


    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        loadAchievementBySourcingData(1, {}, sortInfo, value)
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setPagination({ currentPage: 1 });
        loadAchievementBySourcingData(1, {}, sortInfo, '');
    }

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadAchievementBySourcingData(page, {}, sortInfo, searchTerm);
    };

    const handleSortColumn = useCallback((sort: SortInfo) => {

        setSortInfo(sort);
        setPagination({ currentPage: 1 });

    }, [searchTerm]);

    const handleExportAchievementBySourcing = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationAchievementRequest = {

                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: Number(projectId) || 0,
                    ProjectName: searchTerm?.trim() || undefined,
                    FilterType: filterType.trim() || undefined,
                    FromDate: fromDate ? fromDate || undefined : undefined,
                    ToDate: toDate ? toDate || undefined : undefined,
                    ExportType: exportType
                };

                const response = await achievementReportService.apiCallPullAchievementReportSourcing(params);

                handleExportFile(response, exportType, 'Achievement By Sourcing', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportAchievementBySourcingExcel = () => handleExportAchievementBySourcing('Excel');
    const handleExportAchievementBySourcingPdf = () => handleExportAchievementBySourcing('PDF');

    const handleColumnClickWalkingRevisit = (row: AchievementSourcingData, tabName: string, columnKey: string,) => {
        setSelectedColumnClickWalkingRevisit({
            employeeId: row.EmployeeId,
            employeeName: row.EmployeeName,
            tabName: tabName,
            columnKey: columnKey
        });
    };

    const handleColumnClickBooking = (row: AchievementSourcingData, tabName: string, columnKey: string,) => {
        setSelectedColumnClickBooking({
            employeeId: row.EmployeeId,
            employeeName: row.EmployeeName,
            tabName: tabName,
            columnKey: columnKey
        });
    };

    const handleColumnClickIbmObm = (row: AchievementSourcingData, tabName: string, columnKey: string,) => {
        setSelectedColumnClickIbmObm({
            employeeId: row.EmployeeId,
            employeeName: row.EmployeeName,
            tabName: tabName,
            columnKey: columnKey
        });
    };

    const AchievementBySourcingColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'EmployeeName',
            label: 'Employee Name',
            width: '15',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: (value) => (
                <span className="text-black-400">
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
                            handleColumnClickWalkingRevisit(row, 'SOURCING', 'WALKINS BY CP')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }
        },
        {
            key: 'FreshVisits',
            label: 'Walkins Fresh Visits',
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
                            handleColumnClickWalkingRevisit(row, 'SOURCING', 'FRESH VISITS')
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
                            handleColumnClickWalkingRevisit(row, 'SOURCING', 'REVISITS')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }
        },

        {
            key: 'Bookings',
            label: 'Bookings',
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
                            handleColumnClickBooking(row, 'SOURCING', 'TOTAL BOOKING')
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
                            handleColumnClickBooking(row, 'SOURCING', 'TOTAL REVENUE')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }
        },
        {
            key: 'TotalOBMFreshVisits',
            label: 'OBM (Fresh Visits)',
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
                            handleColumnClickIbmObm(row, 'SOURCING', 'TOTAL OBM FRESH VISITS')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }

        },
        {
            key: 'TotalOBMRevisits',
            label: 'OBM (Revisits)',
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
                            handleColumnClickIbmObm(row, 'SOURCING', 'TOTAL OBM REVISITS')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }

        },
        {
            key: 'TotalMeetings',
            label: 'Total Meetings',
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
                            handleColumnClickIbmObm(row, 'SOURCING', 'TOTAL MEETING')
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
                backgroundColor: '#f8ecdd'
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
                            handleColumnClickIbmObm(row, 'SOURCING', 'IBM')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }

        },

    ], [handleColumnClickWalkingRevisit, handleColumnClickBooking, handleColumnClickIbmObm]);

    const AchievementBySourcingPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
    )
    const AchievementBySourcingForTable = useMemo(() => sourcingAchievementList, [sourcingAchievementList]);

    const requiredAchievementBySourcingColumnKeys: string[] = ['EmployeeName'];

    const allAchievementBySourcingColumnKeys: string[] = AchievementBySourcingColumns.map(c => c.key);

    const [selectedAchievementBySourcingColumnKeys, setSelectedAchievementBySourcingColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getAchievementBySourcingTableColumns?.();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]

                const withRequired = Array.from(new Set([...parsed, ...requiredAchievementBySourcingColumnKeys]));

                return withRequired.filter(k => allAchievementBySourcingColumnKeys.includes(k));
            }
        } catch { }
        return allAchievementBySourcingColumnKeys;
    });

    useEffect(() => {
        setSelectedAchievementBySourcingColumnKeys(prev => Array.from(new Set([...prev, ...requiredAchievementBySourcingColumnKeys])).filter(k => allAchievementBySourcingColumnKeys.includes(k)));
    }, [AchievementBySourcingColumns.length])

    const visibleAchievementBySourcingColumns = useMemo(
        () => AchievementBySourcingColumns.filter(col => selectedAchievementBySourcingColumnKeys.includes(col.key)),
        [AchievementBySourcingColumns, selectedAchievementBySourcingColumnKeys]
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
                onCustomize={() => setIsShowCustomizeAchievementBySourcingColumnsModal(true)}

                // EXPORT
                isShowExportButton={canExport && AchievementBySourcingForTable.length > 0}
                onExportExcel={handleExportAchievementBySourcingExcel}
                onExportPdf={handleExportAchievementBySourcingPdf}
                exportLoading={isLoading}
            />

            <CustomizeColumnsModal
                isOpen={isShowCustomizeAchievementSourcingByColumnsModal}
                onClose={() => setIsShowCustomizeAchievementBySourcingColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredAchievementBySourcingColumnKeys])
                    );
                    setSelectedAchievementBySourcingColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeAchievementBySourcingTableColumns?.(
                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={AchievementBySourcingColumns}
                selectedKeys={selectedAchievementBySourcingColumnKeys}
                requiredKeys={requiredAchievementBySourcingColumnKeys}
                title="Customize Table Columns"
            />

            <CustomTable
                data={AchievementBySourcingForTable}
                columns={visibleAchievementBySourcingColumns}
                pagination={AchievementBySourcingPaginationInfo}
                emptyMessage="No Achievement By Sourcing Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            {selectedColumnClickWalkingRevisit && (
                <Modal
                    isOpen={!!selectedColumnClickWalkingRevisit}
                    onClose={() => setSelectedColumnClickWalkingRevisit(null)}
                    title={
                        <div className="flex flex-col">

                            <span className="font-semibold text-base">
                                {selectedColumnClickWalkingRevisit.employeeName || ""}
                            </span>
                            <span className="text-sm text-gray-500">
                                {selectedColumnClickWalkingRevisit.tabName ? `  Tab: ${selectedColumnClickWalkingRevisit.tabName}` : ""}
                                {selectedColumnClickWalkingRevisit.columnKey ? ` | Column: ${selectedColumnClickWalkingRevisit.columnKey}` : ""}
                            </span>

                        </div>
                    }
                    size="large-half"
                >
                    <AchievementWalkinsRevisitReport filterType={filterType} fromDate={fromDate} toDate={toDate} projectId={projectId} employeeId={selectedColumnClickWalkingRevisit?.employeeId} tabName={selectedColumnClickWalkingRevisit?.tabName} columnKey={selectedColumnClickWalkingRevisit?.columnKey} />
                </Modal>
            )}

            {selectedColumnClickBooking && (
                <Modal
                    isOpen={!!selectedColumnClickBooking}
                    onClose={() => setSelectedColumnClickBooking(null)}
                    title={
                        <div className="flex flex-col">

                            <span className="font-semibold text-base">
                                {selectedColumnClickBooking.employeeName || ""}
                            </span>
                            <span className="text-sm text-gray-500">
                                {selectedColumnClickBooking.tabName ? `  Tab: ${selectedColumnClickBooking.tabName}` : ""}
                                {selectedColumnClickBooking.columnKey ? ` | Column: ${selectedColumnClickBooking.columnKey}` : ""}
                            </span>

                        </div>
                    }
                    size="large-half"
                >
                    <AchievementBookingReport filterType={filterType} fromDate={fromDate} toDate={toDate} projectId={projectId} employeeId={selectedColumnClickBooking?.employeeId} tabName={selectedColumnClickBooking?.tabName} columnKey={selectedColumnClickBooking?.columnKey} />
                </Modal>
            )}


            {selectedColumnClickIbmObm && (
                <Modal
                    isOpen={!!selectedColumnClickIbmObm}
                    onClose={() => setSelectedColumnClickIbmObm(null)}
                    title={
                        <div className="flex flex-col">

                            <span className="font-semibold text-base">
                                {selectedColumnClickIbmObm.employeeName || ""}
                            </span>
                            <span className="text-sm text-gray-500">
                                {selectedColumnClickIbmObm.tabName ? `  Tab: ${selectedColumnClickIbmObm.tabName}` : ""}
                                {selectedColumnClickIbmObm.columnKey ? ` | Column: ${selectedColumnClickIbmObm.columnKey}` : ""}
                            </span>

                        </div>
                    }
                    size="large-half"
                >
                    <AchievementIbmObmReport filterType={filterType} fromDate={fromDate} toDate={toDate} projectId={projectId} employeeId={selectedColumnClickIbmObm?.employeeId} tabName={selectedColumnClickIbmObm?.tabName} columnKey={selectedColumnClickIbmObm?.columnKey} />
                </Modal>
            )}

        </div>
    );
};
export default AchievementBySourcing;
