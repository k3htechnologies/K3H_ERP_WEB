import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import usePagination from "@/core/hooks/usePagination";
import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import type { FilterWithPaginationAttendanceRequest } from "@/features/attendanceCalendar/models/AttendanceModel";
import { attendanceService } from "@/features/attendanceCalendar/services/AttendanceService";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as E from 'fp-ts/Either';
import { Loader } from "@/core/utils/loader";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { MapLink } from "@/features/payrollReport/components/columnComponents";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { handleExportFile } from "@/core/utils/exportFile";
import { Modal } from "@/ui/components/Modal/Modal";
import { updateFilter } from "@/core/utils/filterHelper";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { getAttendanceStatusStyle } from "../utills/AttendanceStatusStyle";
import { format24To12Hour, formatWorkingHours, getWeekToDateRange } from "@/core/utils/comman";
import { Input } from "@/ui/components/forms";

export const AttendanceReport: React.FC = () => {

    const [attendanceReportList, setAttendanceReportList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { addToast } = useToast();
    const { pagination, setPagination } = usePagination(20);
    const { canExport } = useMenuPermissions("/payrollReport");
    const [sortInfo] = useState<SortInfo | undefined>();

    const getDefaultWeekFilters = (): FilterInfo => {

        const { fromDate, toDate } = getWeekToDateRange();

        const formatDate = (date: Date) => {

            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();

            return `${day}-${month}-${year}`;
        };

        return {
            StartDate: formatDate(fromDate),
            EndDate: formatDate(toDate),
        };
    };

    const [filters, setFilters] = useState<FilterInfo>(getDefaultWeekFilters);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setPagination({ currentPage: 1 });
        loadAttendanceReport(1, filters, sortInfo, searchTerm)
    }, []);

    const loadAttendanceReport = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationAttendanceRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    AttendanceId: filterParams.AttendanceId ? Number(filterParams.AttendanceId) : undefined,
                    EmployeeName: searchtext ?? filterParams.EmployeeName?.trim() ?? undefined,
                    DepartmentName: filterParams.DepartmentName?.trim() || undefined,
                    CompanyName: filterParams.CompanyName?.trim() || undefined,
                    StartDate: filterParams.StartDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.StartDate) : undefined,
                    EndDate: filterParams.EndDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.EndDate) : undefined,
                    IsReport: true,
                    SortBy: getSortByParam(sortInfo ?? null, AttendanceReportColumns)
                };

                const response = await attendanceService.apiCallPullAttendance(params);

                if (E.isLeft(response)) {
                    addToast({ type: "error", title: response.left.message });
                    return;
                }

                const data = response.right.Data;

                const employeeMap = new Map<number, typeof data>();

                data.forEach((item) => {
                    if (!employeeMap.has(item.EmployeeId)) {
                        employeeMap.set(item.EmployeeId, []);
                    }

                    employeeMap.get(item.EmployeeId)!.push(item);
                });

                const formattedData = Array.from(employeeMap.values()).map((records) => {
                    const firstRecord = records[0];
                    const row: any = {
                        id: firstRecord.EmployeeId,
                        EmployeeId: firstRecord.EmployeeId,
                        FullName: firstRecord.FullName,
                        EmployeeCode: firstRecord.EmployeeCode,
                        Department: firstRecord.Department,
                        Designation: firstRecord.Designation
                    };

                    records.forEach((item) => {
                        const dateKey = item.AttendanceDate.split("T")[0];
                        row[dateKey] = item;
                    });

                    return row;
                });

                setAttendanceReportList(formattedData);
                setPagination({
                    currentPage: page,
                    totalRecords: response.right.TotalNumberOfRecord,
                    totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                });
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Attendance Report'
        );
    };

    const dateColumns = useMemo<TableColumn[]>(() => {

        if (!filters.StartDate || !filters.EndDate) return [];

        const start = convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.StartDate);
        const end = convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.EndDate);

        if (!start || !end || start > end) return [];

        const columns: TableColumn[] = [];
        const current = new Date(start);
        const lastDate = new Date(end);

        while (current <= lastDate) {
            const date = current.toISOString().split("T")[0];
            const dayName = current.toLocaleDateString("en-US", { weekday: "long" });

            columns.push({
                key: date,
                label: `${formatDate_dd_mm_yyyy(date)}\n${dayName}`,
                width: "24",
                sortable: false,
                align: "left",
                render: (value) => {

                    if (!value) {
                        return <div className="h-full w-full" />;
                    }

                    const attendance = value;
                    const rawStatus = (attendance.AttendanceStatus || "").trim();
                    const hasStatus = rawStatus !== "";
                    const status = hasStatus ? rawStatus : "-";
                    const normalizedStatus = rawStatus.toLowerCase();
                    const holiday = normalizedStatus === "holiday";
                    const isWeeklyOff = normalizedStatus === "week off" || normalizedStatus === "week-off";
                    const isAbsent = normalizedStatus === "absent";
                    const isLateIn = normalizedStatus === "late in";
                    const checkoutmissing = normalizedStatus === "checkout missing";

                    const statusStyle = getAttendanceStatusStyle(rawStatus);

                    const renderLocation = (label: string, address?: string) => (
                        <div className="col-span-2 min-w-0">
                            <div className="text-sm font-medium text-[#1D1D1D80]">
                                {label}
                            </div>

                            <div className="mt-1 min-w-0 break-words [overflow-wrap:anywhere] text-sm font-medium leading-5 text-[#1D1D1D] line-clamp-2">
                                <TooltipText
                                    maxWidth="150px"
                                    tooltipThreshold={20}
                                    text={address || "-"}
                                />
                            </div>
                        </div>
                    );

                    return (
                        <div className="flex h-[320px] w-[240px] items-start justify-start mt-2 mb-2">
                            <div className={`box-border flex h-[320px] w-[240px] min-w-[240px] max-w-[240px] flex-col overflow-hidden rounded-2xl border border-slate-200 p-3 shadow-sm ${statusStyle.card}`}>

                                <div className="mb-3 flex min-h-6 items-start">
                                    {!hasStatus ? null : (
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusStyle.badge}`}>
                                            {isWeeklyOff ? "Weekly Off" : status}
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                                    <FieldItem
                                        label="In Time"
                                        value={isWeeklyOff ? "-"
                                            : attendance.PunchIn
                                                ? format24To12Hour(
                                                    attendance.PunchIn.split("T")[1].split(":")[0],
                                                    attendance.PunchIn.split("T")[1].split(":")[1]
                                                ) : "-"
                                        }
                                    />
                                    <FieldItem
                                        label="Out Time"
                                        value={isWeeklyOff ? "-"
                                            : attendance.PunchOut
                                                ? format24To12Hour(
                                                    attendance.PunchOut.split("T")[1].split(":")[0],
                                                    attendance.PunchOut.split("T")[1].split(":")[1]
                                                ) : "-"
                                        }
                                    />
                                    <FieldItem label="Working Hrs" value={isWeeklyOff ? "-" : formatWorkingHours(attendance.WorkingHours)} />

                                    <div>
                                        <div className="truncate text-sm font-medium text-[#1D1D1D80]">
                                            Is Late
                                        </div>

                                        <div className="mt-1 min-h-6">
                                            {!hasStatus || isAbsent || isWeeklyOff || holiday ? (
                                                <span>-</span>
                                            ) : (
                                                <span
                                                    className={`inline-flex rounded-full border px-2 py-0.5 font-semibold ${isLateIn
                                                        ? "border-red-400 bg-red-50 text-red-500"
                                                        : "border-emerald-400 bg-emerald-50 text-emerald-700"
                                                        }`}
                                                >
                                                    {isLateIn ? "Yes" : "No"}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-span-2 border-t border-[#F8FAFC] pt-3">
                                        {renderLocation("In Location",
                                            isWeeklyOff ? "-" : attendance.PunchInAddress
                                        )}
                                    </div>

                                    {renderLocation("Out Location",
                                        isWeeklyOff ? "-" : attendance.PunchOutAddress
                                    )}

                                    {hasStatus && !isWeeklyOff && !isAbsent && !holiday && !checkoutmissing && (
                                        <div className="col-span-2">
                                            <MapLink
                                                value={attendance.Polyline}
                                                punchInLat={attendance.StartLatitude}
                                                punchInLng={attendance.StartLongitude}
                                                punchOutLat={attendance.EndLatitude}
                                                punchOutLng={attendance.EndLongitude}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                },

            });

            current.setDate(current.getDate() + 1);
        }
        return columns;
    }, [filters.StartDate, filters.EndDate]);

    const AttendanceReportColumns = useMemo<TableColumn[]>(() => [
        {
            key: "FullName",
            label: "Employee Name",
            width: "20",
            sortable: false,
            fixed: "left",
            align: "left",
            render: (_value, row) => {
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">
                            {row.FullName || "-"}
                        </span>

                        <span className="text-sm text-gray-500">
                            {row.EmployeeCode || "-"}
                        </span>

                        <span className="text-sm text-gray-500">
                            {row.Department || "-"} - {row.Designation || "-"}
                        </span>

                        <span className="text-sm text-gray-500">
                            {row.Company || "-"}
                        </span>
                    </div>
                );
            },
        },
        ...dateColumns,
    ], [dateColumns]);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        loadAttendanceReport(1, filters, sortInfo, value);
    };

    const handlClearSearch = () => {
        setSearchTerm("");
        setPagination({ currentPage: 1 });
        loadAttendanceReport(1, filters, sortInfo, "");
    };

    const handlePageChange = useCallback((page: number) => {
        loadAttendanceReport(page, filters, sortInfo, searchTerm);
    }, [filters, sortInfo, searchTerm]);

    const applyFilters = () => {
        setFilters(tempFilters);
        setPagination({ currentPage: 1 });
        loadAttendanceReport(1, tempFilters);
        setShowFilterPopup(false);
    };

    const clearFilters = () => {
        setTempFilters({});
        setFilters({});
        setPagination({ currentPage: 1 });
        loadAttendanceReport(1, {}, sortInfo, searchTerm);
    };

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }

    const AttendanceReportDataPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange])

    const AttendanceReportDataForTable = useMemo(() => attendanceReportList, [attendanceReportList]);

    const handleExportAttendanceReport = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationAttendanceRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    IsReport: true,
                    StartDate: filters.StartDate || undefined,
                    EndDate: filters.EndDate || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, AttendanceReportColumns),
                    ExportType: exportType,
                };

                const response = await attendanceService.apiCallPullAttendance(params);

                handleExportFile(response, exportType, 'Attendance Report', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportAttendanceReportExcel = () => handleExportAttendanceReport("Excel");
    const handleExportAttendanceReportPdf = () => handleExportAttendanceReport("PDF")

    return (
        <div className="pt-6" >
            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                onClearSearch={handlClearSearch}
                onSearchChange={handleSearch}

                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters);
                    setShowFilterPopup(true);
                }}

                searchPlaceholder="Search By Employee Name"
                isShowExportButton={canExport && attendanceReportList.length > 0}
                onExportExcel={handleExportAttendanceReportExcel}
                onExportPdf={handleExportAttendanceReportPdf}
            />

            <DataTable
                data={AttendanceReportDataForTable}
                columns={AttendanceReportColumns}
                pagination={AttendanceReportDataPaginationInfo}
                emptyMessage="No Attendance Report Data Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
            />

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Attendance Report"
                onSubmit={e => {
                    e.preventDefault();
                    applyFilters();
                }}
                saveText="Apply "
                cancelText="Clear"
                onCancel={() => clearFilters()}
                size="small-half"
            >
                <div className="space-y-4">
                    <div>
                        <DatePickerInput
                            label='Start Date'
                            value={tempFilters.StartDate || ''}
                            onChange={value => handleFilterChange('StartDate', value || '')}
                            placeholder="Select Start Date"
                        />
                    </div>

                    <div>
                        <DatePickerInput
                            label='End Date'
                            value={tempFilters.EndDate || ''}
                            onChange={value => handleFilterChange('EndDate', value || '')}
                            placeholder="Select End Date"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Department Name"
                            value={tempFilters?.DepartmentName ?? ""}
                            onChange={(e) => handleFilterChange("DepartmentName", e.target.value)}
                            placeholder="Enter Department Name"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Employee Name"
                            value={tempFilters?.EmployeeName ?? ""}
                            onChange={(e) => handleFilterChange("EmployeeName", e.target.value)}
                            placeholder="Enter Employee Name"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Company Name"
                            value={tempFilters?.CompanyName ?? ""}
                            onChange={(e) => handleFilterChange("CompanyName", e.target.value)}
                            placeholder="Enter Company Name"
                        />
                    </div>

                </div>
            </Modal>

        </div>
    )
}
export default AttendanceReport;