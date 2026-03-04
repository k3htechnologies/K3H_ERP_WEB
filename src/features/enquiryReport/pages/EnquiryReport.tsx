import React, { useEffect, useMemo, useState } from "react";
import useToast from "@/core/hooks/useToast";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { Loader } from "@/core/utils/loader";
import { MASTER_DATA, REPORT_TYPE_OPTIONS, YEAR_OPTIONS } from "@/core/constants";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { Button } from "@/ui/components/forms/Button";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import { DataTable, type PaginationInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import usePagination from "@/core/hooks/usePagination";
import { runApiWithLoader } from "@/core/utils";
import type { FilterWithPaginationEnquiryReportRequest, ProjectWiseEmployeeList } from "@/features/enquiryReport/models/EnquiryReportModel";
import { enquiryReportService } from "@/features/enquiryReport/services/EnquiryReportService";
import * as E from "fp-ts/Either";
import { Input } from "@/ui/components/forms";


type PivotEnquiryRow = {
    EmployeeName: string;
    Stage: string;
    [key: string]: number | string;
};

const EnquiryReport: React.FC = () => {

    const { projectId } = useProject();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [reportType, setReportType] = useState<string>();
    const [year, setYear] = useState<string>();
    const [fromDate, setFromDate] = useState<string | null>(null);
    const [toDate, setToDate] = useState<string | null>(null);
    const [employeeSearch, setEmployeeSearch] = useState("");
    const { pagination, setPagination } = usePagination(20);
    const [projectWiseEmployeeList, setProjectWiseEmployeeList] = useState<ProjectWiseEmployeeList[]>([]);

    //#region  CLAER 
    useEffect(() => {

        setProjectWiseEmployeeList([]);

        setPagination({
            currentPage: 1,
            totalRecords: 0,
            totalPages: 0
        });

    }, [reportType, year, fromDate, toDate]);
    //#endregion

    const fetchEnquiryReport = async (page: number = pagination.currentPage) => {

        if (!projectId) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationEnquiryReportRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: projectId,
                    EmployeeName: employeeSearch ?? '',
                    Stage: '',
                    Year: reportType?.toUpperCase() === "YEAR" ? Number(year) : undefined,
                    FromDate: reportType?.toUpperCase() === "DATE" ? fromDate || undefined : undefined,
                    ToDate: reportType?.toUpperCase() === "DATE" ? toDate || undefined : undefined
                };

                const response = await enquiryReportService.apiCallPullEnquiryReport(params);

                if (E.isRight(response)) {

                    setProjectWiseEmployeeList(response.right.Data);

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(
                            response.right.TotalNumberOfRecord /
                            pagination.pageSize
                        )
                    });

                } else {
                    addToast({ type: "error", title: response.left.message });
                }
            },
            undefined,
            (e) =>
                addToast({ type: "error", title: e.message }),
            undefined,
            "Loading Data"
        );
    };

    const dynamicHeaders = useMemo<string[]>(() => {

        if (reportType?.toUpperCase() === "DATE") {

            const set = new Set<string>();

            projectWiseEmployeeList.forEach(emp =>
                emp.EnquiryStagesData?.forEach(item => {
                    if (item.Date)
                        set.add(formatDate_dd_mm_yyyy(item.Date));
                })
            );

            return Array.from(set).sort((a, b) => new Date(a.split('/').reverse().join('-')).getTime() - new Date(b.split('/').reverse().join('-')).getTime());
        }

        // ✅ FIX HERE
        return [...MASTER_DATA.monthsShots];

    }, [projectWiseEmployeeList, reportType]);

    const tableData = useMemo<PivotEnquiryRow[]>(() => {

        const rows: PivotEnquiryRow[] = [];

        projectWiseEmployeeList.forEach((employee) => {

            MASTER_DATA.finalStage.forEach((stage, index) => {

                const row: PivotEnquiryRow = {

                    EmployeeName: index === 0 ? employee.FullName || "" : "",

                    Stage: stage
                };

                dynamicHeaders.forEach(header => { row[header] = 0; });

                employee.EnquiryStagesData?.forEach(item => {

                    if (item.Stages === stage) {

                        const key =
                            reportType?.toUpperCase() === "DATE"
                                ? formatDate_dd_mm_yyyy(item.Date)
                                : item.MonthName;

                        if (key && row.hasOwnProperty(key)) {
                            row[key] = item.StagesCount || 0;
                        }

                    }

                });

                rows.push(row);

            });

        });

        return rows;

    }, [projectWiseEmployeeList, dynamicHeaders, reportType]);

    const columns: TableColumn[] = useMemo(() => {
        return [
            {
                key: "EmployeeName",
                label: "Employee Name",
                fixed: "left",
                width: "20",
                render: (value) => (
                    <span className="text-blue-600 font-semibold">
                        {value}
                    </span>
                )
            },
            {
                key: "Stage",
                label: "Stage",
                fixed: "left",
                width: "20"
            },
            ...dynamicHeaders.map((header) => ({
                key: header,
                label: header,
                width: "10",
                align: "center" as const,

                render: (value: number | string) => {

                    const num = Number(value || 0);

                    // greater than 10 → RED
                    if (num > 10) {
                        return (
                            <span className="text-green-600 font-bold">
                                {num}
                            </span>
                        );
                    }

                    // greater than 0 → GREEN
                    if (num > 0) {
                        return (
                            <span className="text-red-600 font-semibold">
                                {num}
                            </span>
                        );
                    }

                    // 0 → normal
                    return (
                        <span className="text-gray-500">
                            {num}
                        </span>
                    );
                }
            }))
        ];
    }, [dynamicHeaders]);

    const handlePageChange = (page: number) => {

        setPagination({ currentPage: page });

        fetchEnquiryReport(page);
    };

    const paginationInfo: PaginationInfo = {

        currentPage: pagination.currentPage,

        totalPages: pagination.totalPages,

        totalRecords: pagination.totalRecords,

        pageSize: pagination.pageSize,

        onPageChange: handlePageChange
    };

    const canSearch = useMemo(() => {

        if (!projectId) return false;

        if (!reportType) return false;

        if (reportType.toUpperCase() === "YEAR") {
            return !!year;
        }

        if (reportType.toUpperCase() === "DATE") {
            return !!fromDate && !!toDate;
        }

        return false;

    }, [projectId, reportType, year, fromDate, toDate]);

    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div />
            </Loader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <SinglePageSelection
                    label="Type"
                    placeholder="Select Type"
                    value={reportType}
                    onChange={(e) => {
                        const selected = String(e);
                        setReportType(selected);
                        setYear(undefined);
                        setFromDate(null);
                        setToDate(null);
                    }}
                    options={REPORT_TYPE_OPTIONS.map((opt) => ({
                        label: opt.name,
                        value: opt.id
                    }))}
                />

                {reportType?.toUpperCase() === "YEAR" && (
                    <SinglePageSelection
                        label="Year"
                        placeholder="Select Year"
                        value={year ?? ""}
                        onChange={(e) => setYear(String(e))}
                        options={YEAR_OPTIONS.map((opt) => ({
                            label: opt.name,
                            value: opt.id
                        }))}
                    />
                )}

                {reportType?.toUpperCase() === "DATE" && (
                    <>
                        <DatePickerInput
                            label="From Date"
                            value={formatDate_dd_mm_yyyy(fromDate)}
                            onChange={(val) => setFromDate(convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}

                        />
                        <DatePickerInput
                            label="To Date"
                            value={formatDate_dd_mm_yyyy(toDate)}
                            onChange={(val) => setToDate(convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}

                        />
                    </>
                )}
                <div className="pt-6">
                    <Input
                        type="text"
                        placeholder="Search By Employee Name"
                        value={employeeSearch}
                        onChange={(e) => setEmployeeSearch(e.target.value)}
                    /></div>



                {canSearch && (
                    <div className="pt-6">
                        <Button color="blue" size="md" onClick={() => fetchEnquiryReport(1)}>
                            Search
                        </Button>
                    </div>
                )}
            </div>

            <div className="pt-5">
                <DataTable
                    data={tableData}
                    columns={columns}
                    pagination={paginationInfo}
                    emptyMessage="No Data Found"
                    fixedHeight={true}
                    recordsPerPage={20}
                    className="flex-1"
                />
            </div>
        </div>
    );
};

export default EnquiryReport;