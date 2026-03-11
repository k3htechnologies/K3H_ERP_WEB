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
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd } from "@/core/utils/dateFormat";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { useNavigate } from "react-router-dom";
import Tabs from "@/ui/components/Tab/Tab";
import { getMonthDateRange, getWeekToDateRange, getYearToDateRange } from "@/core/utils/comman";
import { CustomTable } from "@/ui/components/DataTable/CustomTable";

export const PerformanceReport: React.FC = () => {

    // STATE
    const [PerformanceReportClosingList, setPerformanceReportClosingList] = useState<PerformanceReportClosingData[]>([]);
    const [PerformanceReportSourcingList, setPerformanceReportSourcingList] = useState<PerformanceReportSourcingData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    //FILTER STATES
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [filters, setFilters] = useState<FilterInfo>({});

    const TargetTabList = [
        { id: 'Sourcing', label: 'Sourcing Target' },
        { id: 'Closing', label: 'Closing Target' },
    ];

    const [targetActiveTab, setTargetActiveTab] = useState(TargetTabList[0].id);


    //#region MENU PERMISSIONS
    const { canExport } = useMenuPermissions();
    //#endregion

    // PAGINATION
    const { pagination, setPagination } = usePagination(20);

    //#region PROJECT SELECTION GET ID
    const { projectId } = useProject();
    //#endregion

    // USE NAVIGATE
    const navigate = useNavigate();

    // TOAST
    const { addToast } = useToast();

    const PerformanceReportTabList = [
        { id: 'WTD', label: 'WTD' },
        { id: 'MTD', label: 'MTD' },
        { id: 'YTD', label: 'YTD' },
    ];

    const [activeTab, setActiveTab] = useState(PerformanceReportTabList[0].id);
    //#endregion

    //#region DATA LOADING | FETCH |  LOAD | SEARCH

    useEffect(() => {
        if (!projectId) return;

        loadPerformanceReport(1, filters, sortInfo, searchTerm);
    }, [targetActiveTab]);

    const loadPerformanceReport = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo, searchText?: string) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationPerformanceReportRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    EmployeeName: searchText?.trim() ?? undefined,
                    FromDate: filterParams.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) || undefined : undefined,
                    ToDate: filterParams.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) || undefined : undefined,
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
    },
        [targetActiveTab, projectId, pagination.pageSize, addToast, setPagination]);
    //#endregion

    //#region INIT
    useEffect(() => {
        if (!projectId) return;

        setPagination({ currentPage: 1 });
        loadPerformanceReport(1, filters, sortInfo, searchTerm);
    }, [projectId]);
    //#endregion

    //#region SEARCH HANDLERS
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        loadPerformanceReport(1, filters, sortInfo, value);
    };
    //#endregion

    //#region CLEAR HANDLERS
    const handleClearSearch = () => {
        setSearchTerm('');
        setPagination({ currentPage: 1 });
        loadPerformanceReport(1, filters, sortInfo, '');
    };
    //#endregion

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadPerformanceReport(page, filters, sortInfo, searchTerm);
    };
    //#endregion

    //#region TABLE SORT COLUMN
    const handleSortColumn = useCallback((sort: SortInfo) => {

        setSortInfo(sort);
        setPagination({ currentPage: 1 });
        loadPerformanceReport(1, filters, sort, searchTerm);
    }, [searchTerm]);
    //#endregion

    //#region NAVIGATE TO VIEW PERFORMANCE REPORT
    const handleViewPerformanceReportDetails = useCallback((row: PerformanceReportClosingData) => {
        navigate(`/performance/view/${row.EmployeeId}`);

    }, [navigate]);
    //#endregion

    //#region EXPORT / IMPORT EXCEL AND PDF
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
                    SortBy: getSortByParam(sortInfo ?? null, targetActiveTab === "Closing" ? PerformanceReportClosingColumns : PerformanceReportSourcingColumns),
                    ExportType: exportType
                };
                const response = await performanceReportService.apiCallPullPerformanceReportClosing(params);

                handleExportFile(response, exportType, 'Performance Report', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportPerformanceReportExcel = () => handleExportPerformanceReport('Excel')
    const handleExportPerformanceReportPdf = () => handleExportPerformanceReport('PDF')
    //#endregion

    //#region PERFORMANCE REPORT TABLE COLUMNS CLOSING
    const PerformanceReportClosingColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'EmployeeName',
            label: 'Employee Name',
            width: '15',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: (value, row) => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="250px"
                    tooltipThreshold={25}
                    onClick={() => handleViewPerformanceReportDetails(row)}
                />
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

        // Walkins Direct
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

        // Fresh Visits
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

        // Revisits
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

        // Booking By CP
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

        // Booking Direct
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

    ], [handleViewPerformanceReportDetails]);
    //#endregion

    //#region PERFORMANCE REPORT TABLE COLUMNS CLOSING
    const PerformanceReportSourcingColumns = useMemo<TableColumn[]>(() => [

        {
            key: 'EmployeeName',
            label: 'Employee Name',
            width: '15',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: (value, row) => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="250px"
                    tooltipThreshold={25}
                    onClick={() => handleViewPerformanceReportDetails(row)}
                />
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

    ], [handleViewPerformanceReportDetails])
    //#endregion

    //#region FILTER MODAL HELPERS
    const applyFilters = () => {
        setFilters(tempFilters);
        setPagination({ currentPage: 1 });

        loadPerformanceReport(1, tempFilters);
        setShowFilterPopup(false);
    };
    //#endregion

    //#region Clear
    const clearFilters = () => {
        setTempFilters({});
        setFilters({});
        setPagination({ currentPage: 1 });
        loadPerformanceReport(1, {}, sortInfo, searchTerm);
    };

    //#region HANDLE FILTER CHNAGE
    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }
    //#endregion

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
            FromDate: fromDate ? fromDate.toLocaleDateString("en-GB") : "",
            ToDate: toDate ? toDate.toLocaleDateString("en-GB") : "",
        };

        setFilters(updatedFilters);
        setPagination({ currentPage: 1 });
        loadPerformanceReport(1, updatedFilters, sortInfo, searchTerm);

    };
    //#endregion

    //#region PERFORMANCE REPORT TABLE PAGINATION INFO
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
    //#endregion

    //#region
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <div className="pt-3 pb-3">

                <Tabs
                    tabs={PerformanceReportTabList}
                    defaultActive={activeTab}
                    islarge
                    onTabChange={(t) => handleTabChange(t.id)}
                />
            </div>

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

            <div className="pt-3">
                <Tabs
                    tabs={TargetTabList}
                    defaultActive={targetActiveTab}
                    isChips
                    onTabChange={(t) => {
                        setTargetActiveTab(t.id)
                        setPagination({ currentPage: 1 })
                    }}
                />
            </div>

            {/* DATA TABLE */}

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
                            label='From Date'
                            value={tempFilters.FromDate || ''}
                            onChange={(value) => handleFilterChange('FromDate', value || '')}
                        />
                    </div>

                    <div>
                        <DatePickerInput
                            label='To Date'
                            value={tempFilters.ToDate || ''}
                            onChange={(value) => handleFilterChange('ToDate', value || '')}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
export default PerformanceReport;