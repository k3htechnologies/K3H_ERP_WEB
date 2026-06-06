import React, { useEffect, useMemo, useState } from "react";
import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { MASTER_DATA, REPORT_TYPE_OPTIONS, YEAR_OPTIONS } from "@/core/constants";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import { DataTable, type FilterInfo, type PaginationInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import usePagination from "@/core/hooks/usePagination";
import { runApiWithLoader } from "@/core/utils";
import type { FilterWithPaginationIbmObmReportRequest, ProjectWiseIbmObmEmpoyeesList } from "@/features/ibmObmReport/models/IbmObmReportModel";
import * as E from "fp-ts/Either";
import { Input } from "@/ui/components/forms";
import { ibmObmReportService } from "@/features/ibmObmReport/services/IbmObmeportService";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { handleExportFile } from "@/core/utils/exportFile";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Modal } from "@/ui/components/Modal/Modal";
import { updateFilter } from "@/core/utils/filterHelper";
import DatePickerInput from "@/ui/components/forms/Datepicker";

type PivotIbmObmRow = {
    EmployeeName: string;
    DesignationName: string;
    Stage: string;
    [key: string]: number | string;
};

const IbmObmReport: React.FC = () => {
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const { pagination, setPagination } = usePagination(20);
    const [projectWiseIbmObmEmployeesList, setProjectWiseIbmObmEmployeesList] = useState<ProjectWiseIbmObmEmpoyeesList[]>([]);
    const { canExport } = useMenuPermissions();
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [filters, setFilters] = useState<FilterInfo>({});

    useEffect(() => {

        setProjectWiseIbmObmEmployeesList([]);

        setPagination({
            currentPage: 1,
            totalRecords: 0,
            totalPages: 0
        });

    }, []);

    const fetchIbmObmReport = async (page: number = pagination.currentPage, currentFilters: FilterInfo = filters, searchText?: string,) => {

        if (!currentFilters.ReportType) return;

        if (
            currentFilters.ReportType?.toUpperCase() === "YEAR" &&
            !currentFilters.Year
        ) return;

        if (
            currentFilters.ReportType?.toUpperCase() === "DATE" &&
            (!currentFilters.FromDate || !currentFilters.ToDate)
        ) return;



        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationIbmObmReportRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(currentFilters.ProjectId) || 0,
                    EmployeeName: searchText?.trim() || currentFilters.EmployeeName || '',
                    Stage: '',
                    Year: currentFilters.ReportType?.toUpperCase() === "YEAR"
                        ? Number(currentFilters.Year)
                        : undefined,
                    FromDate: currentFilters.ReportType?.toUpperCase() === "DATE"
                        ? currentFilters.FromDate || undefined
                        : undefined,
                    ToDate: currentFilters.ReportType?.toUpperCase() === "DATE"
                        ? currentFilters.ToDate || undefined
                        : undefined
                };

                const response = await ibmObmReportService.apiCallPullIbmObmReport(params);

                if (E.isRight(response)) {

                    setProjectWiseIbmObmEmployeesList(response.right.Data);

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize)
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

        if (filters.ReportType?.toUpperCase() === "DATE") {

            const set = new Set<string>();

            projectWiseIbmObmEmployeesList.forEach(emp =>
                emp.IbmObmStagesData?.forEach(item => {
                    if (item.Date)
                        set.add(formatDate_dd_mm_yyyy(item.Date));
                })
            );

            return Array.from(set).sort((a, b) => new Date(a.split('/').reverse().join('-')).getTime() - new Date(b.split('/').reverse().join('-')).getTime());
        }

        // ✅ FIX HERE
        return [...MASTER_DATA.monthsShots];

    }, [projectWiseIbmObmEmployeesList, filters.ReportType]);

    const tableData = useMemo<PivotIbmObmRow[]>(() => {

        const rows: PivotIbmObmRow[] = [];

        projectWiseIbmObmEmployeesList.forEach((employee) => {

            MASTER_DATA.ibmObmReportStage.forEach((stage, index) => {

                const row: PivotIbmObmRow = {

                    EmployeeName: index === 0 ? employee.FullName || "" : "",
                    DesignationName: index === 0 ? employee.DesignationName || "" : "",

                    Stage: stage
                };

                dynamicHeaders.forEach(header => { row[header] = 0; });

                employee.IbmObmStagesData?.forEach(item => {

                    if (item.Stages === stage) {

                        const key =
                            filters.ReportType?.toUpperCase() === "DATE"
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

    }, [projectWiseIbmObmEmployeesList, dynamicHeaders, filters.ReportType]);

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
                key: "DesignationName",
                label: "Designation",
                width: "20",
                render: value => value || ' '
            },
            {
                key: "Stage",
                label: "Stage",
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

        fetchIbmObmReport(page, filters);
    };

    const paginationInfo: PaginationInfo = {

        currentPage: pagination.currentPage,

        totalPages: pagination.totalPages,

        totalRecords: pagination.totalRecords,

        pageSize: pagination.pageSize,

        onPageChange: handlePageChange
    };

    const handleExportIbmObmReport = async (exportType: 'Excel' | 'PDF') => {

        await runApiWithLoader(

            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationIbmObmReportRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: Number(filters.ProjectId) ?? 0,
                    EmployeeName: filters.EmployeeName ?? '',
                    Stage: '',
                    Year: filters.ReportType?.toUpperCase() === "YEAR" ? Number(filters.Year) : undefined,
                    FromDate: filters.ReportType?.toUpperCase() === "DATE" ? filters.FromDate || undefined : undefined,
                    ToDate: filters.ReportType?.toUpperCase() === "DATE" ? filters.ToDate || undefined : undefined
                };

                const response = await ibmObmReportService.apiCallPullIbmObmReport(params);

                handleExportFile(response, exportType, 'Channel Partner Category', addToast);
                return response
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportIbmObmReportExcel = () => handleExportIbmObmReport('Excel')
    const handleExportIbmObmReportPdf = () => handleExportIbmObmReport('PDF')

    const handleFilterChange = (key: string, value: string | null) => {
        setTempFilters((prev) => updateFilter(prev, key, value));
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        fetchIbmObmReport(1, filters, value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setPagination({ currentPage: 1 });
        fetchIbmObmReport(1, filters, '');
    };

    const clearFilters = () => {
        setTempFilters({});
        setFilters({});

        setProjectWiseIbmObmEmployeesList([]);

        setPagination({
            currentPage: 1,
            totalRecords: 0,
            totalPages: 0
        });
    };

    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}>
                <div />
            </Loader>

            <TableActionToolbar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Employee Name"
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}
                isShowFilterButton={true}
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters);
                    setShowFilterPopup(true);
                }}

                isShowCustomizeButton={false}
                isShowAddButton={false}
                isShowImportButton={false}
                isShowExportButton={canExport && tableData.length > 0}
                onExportExcel={handleExportIbmObmReportExcel}
                onExportPdf={handleExportIbmObmReportPdf}
                exportLoading={isLoading}
            />

            <DataTable
                data={tableData}
                columns={columns}
                pagination={paginationInfo}
                emptyMessage="No Data Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
            />

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - IBM OBM Report"
                onSubmit={e => {
                    e.preventDefault();

                    setFilters({ ...tempFilters });

                    fetchIbmObmReport(1, tempFilters);
                }}
                saveText="Apply "
                cancelText="Clear"
                onCancel={() => clearFilters()}

                size="small-half">
                <div className="space-y-6">

                    <div>
                        <SinglePageSelection
                            label="Report Type"
                            placeholder="Select Report Type"
                            value={tempFilters.ReportType || ''}
                            onChange={e => handleFilterChange('ReportType', String(e))}
                            options={REPORT_TYPE_OPTIONS.map(opt => ({
                                label: opt.name,
                                value: opt.id
                            }))}
                        />

                    </div>
                    {tempFilters.ReportType?.toUpperCase() === "YEAR" && (
                        <div>
                            <SinglePageSelection
                                label="Year"
                                placeholder="Select Year"
                                value={tempFilters.Year || ''}
                                onChange={e => handleFilterChange('Year', String(e))}
                                options={YEAR_OPTIONS.map(opt => ({
                                    label: opt.name,
                                    value: opt.id
                                }))}

                            />
                        </div>
                    )}

                    {tempFilters.ReportType?.toUpperCase() === "DATE" && (
                        <>
                            <div>
                                <DatePickerInput
                                    label="From Date"
                                    value={formatDate_dd_mm_yyyy(tempFilters.FromDate)}
                                    onChange={(val) =>
                                        handleFilterChange("FromDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))
                                    }
                                />
                            </div>

                            <div>
                                <DatePickerInput
                                    label="To Date"
                                    value={formatDate_dd_mm_yyyy(tempFilters.ToDate)}
                                    onChange={(val) => handleFilterChange("ToDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))
                                    }
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <Input type="text"
                            label='Employee Name'
                            value={tempFilters?.EmployeeName ?? ''}
                            onChange={e => handleFilterChange('EmployeeName', e.target.value)}
                            placeholder="Enter Employee Name" />
                    </div>

                    <div>

                        <SinglePageSelection
                            label='Project Name'
                            options={(LocalStorageHelper.getStoredEmployeeData?.()?.ProjectData ?? []).map(opt => ({
                                label: opt.ProjectName,
                                value: opt.ProjectId
                            }))}
                            value={tempFilters.ProjectId || ""}
                            onChange={e => handleFilterChange('ProjectId', Number(e) as any)}
                            placeholder="All Project"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default IbmObmReport;