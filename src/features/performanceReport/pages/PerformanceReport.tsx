import { runApiWithLoader } from "@/core/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FilterWithPaginationPerformanceReportRequest, PerformanceReportClosingData, PerformanceReportSourcingData } from "@/features/performanceReport/models/PerformanceReportModel";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import usePagination from "@/core/hooks/usePagination";
import { type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import useToast from "@/core/hooks/useToast";
import { handleExportFile } from "@/core/utils/exportFile";
import { updateFilter } from "@/core/utils/filterHelper";
import { Modal } from "@/ui/components/Modal/Modal";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { Loader } from "@/core/utils/loader";
import { performanceReportService } from "@/features/performanceReport/services/PerformanceReportService";
import * as E from 'fp-ts/Either';
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import Tabs from "@/ui/components/Tab/Tab";
import { getMonthDateRange, getWeekToDateRange, getYearToDateRange } from "@/core/utils/comman";
import { CustomTable } from "@/ui/components/DataTable/CustomTable";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";

export const PerformanceReport: React.FC = () => {

    const [PerformanceReportClosingList, setPerformanceReportClosingList] = useState<PerformanceReportClosingData[]>([]);
    const [PerformanceReportSourcingList, setPerformanceReportSourcingList] = useState<PerformanceReportSourcingData[]>([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [filters, setFilters] = useState<FilterInfo>({});

    const TargetTabList = [
        { id: 'Sourcing', label: 'Sourcing Target' },
        { id: 'Closing', label: 'Closing Target' },
    ];

    const [targetActiveTab, setTargetActiveTab] = useState(TargetTabList[0].id);

    const { canExport } = useMenuPermissions();

    const { pagination, setPagination } = usePagination(20);

    const { projectId } = useProject();

    const { addToast } = useToast();

    const PerformanceReportTabList = [
        { id: 'WTD', label: 'WTD' },
        { id: 'MTD', label: 'MTD' },
        { id: 'YTD', label: 'YTD' },
    ];

    const [activeTab, setActiveTab] = useState(PerformanceReportTabList[0].id);

    useEffect(() => {
        if (!projectId) return;

        const range = getWeekToDateRange();

        const defaultFilters = {
            FromDate: formatDate(range.fromDate),
            ToDate: formatDate(range.toDate),
        };

        setFilters(defaultFilters);
        setTempFilters(defaultFilters);

        loadPerformanceReport(1, defaultFilters, sortInfo, searchTerm,"WTD");
    }, [projectId]);
    

    const loadPerformanceReport = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo, searchText?: string, periodType?: string) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationPerformanceReportRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    EmployeeName: searchText?.trim() ?? undefined,
                    FromDate: filterParams.FromDate || undefined,
                    ToDate: filterParams.ToDate || undefined,
                    PeriodType: periodType || "WTD",
                    ReportType: targetActiveTab,
                    SortBy: getSortByParam(sort ?? null, targetActiveTab === "Closing" ? PerformanceReportClosingColumns : PerformanceReportSourcingColumns),
                };

                if (targetActiveTab === "Closing") {

                    const response = await performanceReportService.apiCallPullPerformanceReportClosing(params);
                    if (E.isRight(response)) {
                        setPerformanceReportClosingList(response.right.Data);
                        setPagination({
                            currentPage: page,
                            totalRecords: response.right.TotalNumberOfRecord,
                            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                        });
                    } else {
                        addToast({ type: 'error', title: response.left.message });
                    }

                }
                else if (targetActiveTab === "Sourcing") {

                    const response = await performanceReportService.apiCallPullPerformanceReportSourcing(params);

                    if (E.isRight(response)) {

                        setPerformanceReportSourcingList(response.right.Data);

                        setPagination({
                            currentPage: page,
                            totalRecords: response.right.TotalNumberOfRecord,
                            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                        });
                    } else {
                        addToast({ type: 'error', title: response.left.message });
                    }

                }
            },
            undefined,
            (error: any) =>
                addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Performance Report'
        );
    }, [targetActiveTab, projectId, pagination.pageSize, addToast, setPagination, sortInfo, searchTerm]);

    useEffect(() => {
        if (!projectId) return;

        setPagination({ currentPage: 1 });
        loadPerformanceReport(1, filters, sortInfo, searchTerm);
    }, [projectId]);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        loadPerformanceReport(1, filters, sortInfo, value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setPagination({ currentPage: 1 });
        loadPerformanceReport(1, filters, sortInfo, '');
    };

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadPerformanceReport(page, filters, sortInfo, searchTerm);
    };

    const handleSortColumn = useCallback((sort: SortInfo) => {

        setSortInfo(sort);
        setPagination({ currentPage: 1 });
        loadPerformanceReport(1, filters, sort, searchTerm);
    }, [searchTerm]);

    const handleExportPerformanceReport = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationPerformanceReportRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: Number(projectId),
                    EmployeeName: filters.EmployeeName?.trim() || undefined,
                    FromDate: filters.FromDate || undefined,
                    ToDate: filters.ToDate || undefined,
                    ReportType: targetActiveTab,
                    SortBy: getSortByParam(sortInfo ?? null, targetActiveTab === "Closing" ? PerformanceReportClosingColumns : PerformanceReportSourcingColumns),
                    ExportType: exportType
                };

                if (targetActiveTab === "Closing") {

                    const response = await performanceReportService.apiCallPullPerformanceReportClosing(params);

                    handleExportFile(response, exportType, 'Closing Performance Report', addToast);

                    return response;

                } else if (targetActiveTab === "Sourcing") {

                    const response = await performanceReportService.apiCallPullPerformanceReportSourcing(params);

                    handleExportFile(response, exportType, 'Sourcing Performance Report', addToast);

                    return response;

                }
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportPerformanceReportExcel = () => handleExportPerformanceReport('Excel')
    const handleExportPerformanceReportPdf = () => handleExportPerformanceReport('PDF')


    const PerformanceReportClosingColumns = useMemo<TableColumn[]>(() => [
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
            label: 'Designation Name',
            width: '25',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },

        // Walkins By CP
        {
            key: "WalkinsByCPGroup",
            label: "Walkins By CP",
            align: "center",
            children: [
                { key: "WalkinsByCP", label: "T", align: "center", render: (v: number) => v || 0 },
                { key: "ActualWalkinsByCP", label: "A", align: "center", render: (v: number) => v || 0 },
                { key: "PerformanceWalkinsByCP", label: "P", align: "center", render: (v: number) => `${v}%` || "0%" }
            ]
        },
        {
            key: "WalkinsDirectGroup",
            label: "Walkins Direct",
            align: "center",
            children: [
                { key: "WalkinsDirect", label: "T", align: "center", render: (v: number) => v || 0 },
                { key: "ActualWalkinsDirect", label: "A", align: "center", render: (v: number) => v || 0 },
                { key: "PerformanceWalkinsDirect", label: "P", align: "center", render: (v: number) => `${v}%` || "0%" }
            ]
        },
        {
            key: "FreshVisitsGroup",
            label: "Fresh Visits",
            align: "center",
            children: [
                { key: "FreshVisits", label: "T", align: "center", render: (v: number) => v || 0 },
                { key: "ActualFreshVisits", label: "A", align: "center", render: (v: number) => v || 0 },
                { key: "PerformanceFreshVisits", label: "P", align: "center", render: (v: number) => `${v}%` || "0%" }
            ]
        },

        {
            key: "RevisitsGroup",
            label: "Revisits",
            align: "center",
            children: [
                { key: "Revisits", label: "T", align: "center", render: (v: number) => v || 0 },
                { key: "ActualRevisits", label: "A", align: "center", render: (v: number) => v || 0 },
                { key: "PerformanceRevisits", label: "P", align: "center", render: (v: number) => `${v}%` || "0%" }
            ]
        },
        {
            key: "BookingByCPGroup",
            label: "Booking By CP",
            align: "center",
            children: [
                { key: "BookingByCP", label: "T", align: "center", render: (v: number) => v || 0 },
                { key: "ActualBookingByCP", label: "A", align: "center", render: (v: number) => v || 0 },
                { key: "PerformanceBookingByCP", label: "P", align: "center", render: (v: number) => `${v}%` || "0%" }
            ]
        },
        {
            key: "BookingDirectGroup",
            label: "Booking Direct",
            align: "center",
            children: [
                { key: "BookingDirect", label: "T", align: "center", render: (v: number) => v || 0 },
                { key: "ActualBookingDirect", label: "A", align: "center", render: (v: number) => v || 0 },
                { key: "PerformanceBookingDirect", label: "P", align: "center", render: (v: number) => `${v}%` || "0%" }
            ]
        }

    ], []);

    const PerformanceReportSourcingColumns = useMemo<TableColumn[]>(() => [

        {
            key: 'EmployeeName',
            label: 'Employee Name',
            sortable: true,
            width: '15',
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
            label: 'Designation Name',
            sortable: false,
            width: '25',
            align: 'center',
            render: value => value || '-'
        },

        {
            key: "WalkinsByCPGroup",
            label: "Walkins By CP",
            align: "center",
            children: [
                { key: "WalkinsByCP", label: "T", align: "center", render: (v: number) => v || 0 },
                { key: "ActualWalkinsByCP", label: "A", align: "center", render: (v: number) => v || 0 },
                { key: "PerformanceWalkinsByCP", label: "P", align: "center", render: (v: number) => `${v}%` }
            ]
        },
        {
            key: "FreshVisitsGroup",
            label: "Fresh Visits",
            align: "center",
            children: [
                { key: "FreshVisits", label: "T", align: "center", render: (v: number) => v || 0 },
                { key: "ActualFreshVisits", label: "A", align: "center", render: (v: number) => v || 0 },
                { key: "PerformanceFreshVisits", label: "P", align: "center", render: (v: number) => `${v}%` }
            ]
        },
        {
            key: "RevisitsGroup",
            label: "Revisits",
            align: "center",
            children: [
                { key: "Revisits", label: "T", align: "center", render: (v: number) => v || 0 },
                { key: "ActualRevisits", label: "A", align: "center", render: (v: number) => v || 0 },
                { key: "PerformanceRevisits", label: "P", align: "center", render: (v: number) => `${v}%` }
            ]
        },

        {
            key: "BookingsGroup",
            label: "Bookings",
            align: "center",
            children: [
                { key: "Bookings", label: "T", align: "center", render: (v: number) => v || 0 },
                { key: "ActualBookings", label: "A", align: "center", render: (v: number) => v || 0 },
                { key: "PerformanceBookings", label: "P", align: "center", render: (v: number) => `${v}%` }
            ]
        },
        {
            key: "TotalMeetingsGroup",
            label: "Total Meetings",
            align: "center",
            children: [
                { key: "TotalMeetings", label: "T", align: "center", render: (v: number) => v || 0 },
                { key: "ActualTotalMeetings", label: "A", align: "center", render: (v: number) => v || 0 },
                { key: "PerformanceTotalMeetings", label: "P", align: "center", render: (v: number) => `${v}%` }
            ]
        },

        {
            key: "TotalOBMGroup",
            label: "Total OBM",
            align: "center",
            children: [
                { key: "TotalOBM", label: "T", align: "center", render: (v: number) => v || 0 },
                { key: "ActualTotalOBM", label: "A", align: "center", render: (v: number) => v || 0 },
                { key: "PerformanceTotalOBM", label: "P", align: "center", render: (v: number) => `${v}%` }
            ]
        },

        {
            key: "TotalOBMFreshVisitsGroup",
            label: "OBM Fresh Visits",
            align: "center",
            children: [
                { key: "TotalOBMFreshVisits", label: "T", align: "center", render: (v: number) => v || 0 },
                { key: "ActualTotalOBMFreshVisits", label: "A", align: "center", render: (v: number) => v || 0 },
                { key: "PerformanceTotalOBMFreshVisits", label: "P", align: "center", render: (v: number) => `${v}%` }
            ]
        },

        {
            key: "TotalOBMRevisitsGroup",
            label: "OBM Revisits",
            align: "center",
            children: [
                { key: "TotalOBMRevisits", label: "T", align: "center", render: (v: number) => v || 0 },
                { key: "ActualTotalOBMRevisits", label: "A", align: "center", render: (v: number) => v || 0 },
                { key: "PerformanceTotalOBMRevisits", label: "P", align: "center", render: (v: number) => `${v}%` }
            ]
        },

        {
            key: "TotalIBMGroup",
            label: "Total IBM",
            align: "center",
            children: [
                { key: "TotalIBM", label: "T", align: "center", render: (v: number) => v || 0 },
                { key: "ActualTotalIBM", label: "A", align: "center", render: (v: number) => v || 0 },
                { key: "PerformanceTotalIBM", label: "P", align: "center", render: (v: number) => `${v}%` }
            ]
        },

        {
            key: "UniqueCPGroup",
            label: "Unique CPs",
            align: "center",
            children: [
                { key: "UniqueCPs", label: "T", align: "center", render: (v: number) => v || 0 },
                { key: "ActualUniqueCPs", label: "A", align: "center", render: (v: number) => v || 0 },
                { key: "PerformanceUniqueCPs", label: "P", align: "center", render: (v: number) => `${v}%` }
            ]
        },
        {
            key: "ActiveCPGroup",
            label: "Active CP",
            align: "center",
            children: [
                { key: "ActiveCP", label: "T", align: "center", render: (v: number) => v || 0 },
                { key: "ActualActiveCP", label: "A", align: "center", render: (v: number) => v || 0 },
                { key: "PerformanceActiveCP", label: "P", align: "center", render: (v: number) => `${v}%` }
            ]
        },
        {
            key: "NewCPGroup",
            label: "New CP",
            align: "center",
            children: [
                { key: "NewCP", label: "T", align: "center", render: (v: number) => v || 0 },
                { key: "ActualNewCP", label: "A", align: "center", render: (v: number) => v || 0 },
                { key: "PerformanceNewCP", label: "P", align: "center", render: (v: number) => `${v}%` }
            ]
        }

    ], [])

    const applyFilters = () => {
        setFilters(tempFilters);
        setPagination({ currentPage: 1 });

        loadPerformanceReport(1, tempFilters);
        setShowFilterPopup(false);
    };

    const clearFilters = () => {
        setTempFilters({});
        setFilters({});
        setPagination({ currentPage: 1 });
        loadPerformanceReport(1, {}, sortInfo, searchTerm);
    };

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }

    const formatDate = (date?: Date) => {
        if (!date) return '';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const handleTabChange = (tabId: string) => {

        setActiveTab(tabId);

        let fromDate: Date | undefined;
        let toDate: Date | undefined;

        const today = new Date();

        if (tabId === "WTD") {
            const range = getWeekToDateRange();
            fromDate = range.fromDate;
            toDate = range.toDate;
        }

        if (tabId === "MTD") {
            const range = getMonthDateRange(today);
            fromDate = range.fromDate;
            toDate = range.toDate;
        }

        if (tabId === "YTD") {
            const range = getYearToDateRange();
            fromDate = range.fromDate;
            toDate = range.toDate;
        }


        const updatedFilters: FilterInfo = {
            ...filters,
            FromDate: formatDate(fromDate),
            ToDate: formatDate(toDate),
        };

        setFilters(updatedFilters);
        setTempFilters(updatedFilters);

        setPagination({ currentPage: 1 });

        loadPerformanceReport(1, updatedFilters, sortInfo, searchTerm, tabId);
    };

    const PerformanceReportPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    )

    const PerformanceReportForTable = useMemo(() => {
        return targetActiveTab === "Closing"
            ? PerformanceReportClosingList
            : PerformanceReportSourcingList;
    }, [targetActiveTab, PerformanceReportClosingList, PerformanceReportSourcingList]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <div>

                <Tabs
                    tabs={PerformanceReportTabList}
                    defaultActive={activeTab}
                    islarge
                    onTabChange={(t) => handleTabChange(t.id)}
                />
            </div>

            <div className="pt-5">
                <TableActionToolbar
                    isShowSearchBar
                    searchTerm={searchTerm}
                    searchPlaceholder="Search By Name"
                    onSearchChange={handleSearchChange}
                    onClearSearch={handleClearSearch}

                    isShowFilterButton
                    filters={filters}
                    onOpenFilter={() => {
                        setTempFilters(filters);
                        setShowFilterPopup(true);
                    }}

                    // EXPORT
                    isShowExportButton={canExport && PerformanceReportForTable.length > 0}
                    onExportExcel={handleExportPerformanceReportExcel}
                    onExportPdf={handleExportPerformanceReportPdf}
                    exportLoading={isLoading}
                />
            </div>

            <div className="flex items-center justify-between">
                <Tabs
                    tabs={TargetTabList}
                    defaultActive={targetActiveTab}
                    isChips
                    onTabChange={(t) => {
                        setTargetActiveTab(t.id)
                        setPagination({ currentPage: 1 })
                    }}
                />
                <div className="flex items-center gap-2 text-xs text-gray-600 whitespace-nowrap">
                    <span className="px-2 py-1 bg-gray-100 rounded">T : Target</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">A : Actual</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">P : Performance</span>
                </div>
            </div>

            {/* DATA TABLE */}
            <div className="pt-5">
                <CustomTable
                    data={PerformanceReportForTable}
                    columns={targetActiveTab === "Closing" ? PerformanceReportClosingColumns : PerformanceReportSourcingColumns}
                    pagination={PerformanceReportPaginationInfo}
                    emptyMessage="No Performance Report Data Found"
                    fixedHeight={true}
                    recordsPerPage={20}
                    className="flex-1"
                    sortInfo={sortInfo}
                    onSort={handleSortColumn}
                />
            </div>
            {/* FILTER MODAL FOR PERFORMANCE REPORT */}

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Performance Report"
                onSubmit={e => {
                    e.preventDefault();
                    applyFilters();
                }}
                saveText="Apply "
                cancelText="Clear"
                onCancel={() => clearFilters()}
                resetText=""
                size="small-half"
            >
                <div className="space-y-4">

                    <div>
                        <DatePickerInput
                            label="From Date"
                            value={formatDate_dd_mm_yyyy(tempFilters.FromDate)}
                            onChange={(val) => handleFilterChange('FromDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val) || "")}
                        />
                    </div>

                    <div>
                        <DatePickerInput
                            label="To Date"
                            value={formatDate_dd_mm_yyyy(tempFilters.ToDate)}
                            onChange={(val) => handleFilterChange('ToDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val) || "")}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
export default PerformanceReport;