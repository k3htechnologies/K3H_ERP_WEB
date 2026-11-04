import { useCallback, useEffect, useMemo, useState } from "react";
import type { ClientLoanReportData, FilterWithPaginationClientLoanReport } from "@/features/clientLoanReport/models/ClientLoanReportModel";
import usePagination from "@/core/hooks/usePagination";
import useToast from "@/core/hooks/useToast";
import { type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { runApiWithLoader } from "@/core/utils";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { clientLoanReportService } from "@/features/clientLoanReport/services/ClientLoanReportService";
import * as E from "fp-ts/Either";
import { Loader } from "@/core/utils/loader";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { handleExportFile } from "@/core/utils/exportFile";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import { Modal } from "@/ui/components/Modal/Modal";
import { Input } from "@/ui/components/forms";
import { updateFilter } from "@/core/utils/filterHelper";
import { filterNumbers, filterNumbersWithDecimal } from "@/core/utils/fileValidation";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { CustomTable } from "@/ui/components/DataTable/CustomTable";
import { formatCurrency } from "@/core/utils/comman";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";

export const ClientLoanReport: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [clientLoanReportData, setClientLoanReportData] = useState<ClientLoanReportData[]>([]);
    const { pagination, setPagination } = usePagination(20);
    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [filters, setFilters] = useState<FilterInfo>({});
    const { canExport } = useMenuPermissions();
    const { addToast } = useToast();
    const { projectId } = useProject();

    useEffect(() => {
        if (!projectId) return;
        setFilters({});
        setSearchTerm("");
        setSortInfo(undefined);
        loadingClientLoanReport(1, {});
    }, [projectId]);

    const searchClientLoanReport = async (searchValue: string) => {
        setSearchTerm(searchValue);
        await loadingClientLoanReport(1, filters, sortInfo, searchValue);
    };

    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchClientLoanReport(value);
    }, 350);

    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.();
        };
    }, [debouncedSearch]);

    const loadingClientLoanReport = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
        runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationClientLoanReport = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    ProjectName: filterParams.ProjectName,
                    ApplicantName: searchtext || filterParams.ApplicantName?.trim(),
                    ApplicantMobileNumber: filterParams.ApplicantMobileNumber,
                    Wing: filterParams.Wing,
                    Flat: filterParams.Flat,
                    Floor: filterParams.Floor,
                    Configuration: filterParams.Configuration,
                    AgreementValue: Number(filterParams.AgreementValue) ?? 0,
                    BankStatusClosedActive: filterParams.BankStatusClosedActive,
                    SortBy: getSortByParam(sortInfo ?? null, clientLoanReportColumns),
                };

                const response = await clientLoanReportService.apiCallPullClientLoanReport(params);

                if (E.isRight(response)) {
                    setClientLoanReportData(response.right.Data);

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });
                } else {
                    addToast({ type: "error", title: response.left.message });

                    return response;
                }
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Loading Client Loan Report ",
        );
    };

    const clearSearchClientLoanReport = () => {
        setSearchTerm("");
        debouncedSearch.cancel?.();
        setPagination({ currentPage: 1 });
        loadingClientLoanReport(1, filters, sortInfo, "");
    };

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        loadingClientLoanReport(1, filters, sort, searchTerm);
    }, [filters, searchTerm,projectId]);

    const clientLoanReportTable = useMemo(() => clientLoanReportData, [clientLoanReportData]);

    const applyFilters = () => {
        setFilters(tempFilters);
        setPagination({ currentPage: 1 });
        loadingClientLoanReport(1, tempFilters, sortInfo, searchTerm);
        setShowFilterPopup(false);
    };

    const clearFilters = () => {
        setTempFilters({});
        setFilters({});
        setPagination({ currentPage: 1 });
        loadingClientLoanReport(1, {}, sortInfo, searchTerm);
    };

    const clientLoanReportColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: "ApplicantName",
                label: "Applicant Name",
                width: "15",
                align: "left",
                sortable: true,
                fixed: "left",
                render: (value) => value || "-",
            },
            {
                key: "ApplicantMobileNumber",
                label: "Applicant Mobile Number",
                width: "14",
                sortable: false,
                align: "left",
                render: (value, row) => (value ? `${row.ApplicantMobileNumberCountryCode || "+91"} ${value}` : "-"),
            },

            {
                key: "NewUnitGroup",
                label: "New Unit Details",
                align: "center",
                theadStyle: {
                    backgroundColor: '#F0FDF4',
                    color: '#60D669'
                },
                children: [

                    {
                        key: "BuildingNumber",
                        label: "Building Number",
                        width: "12",
                        sortable: false,
                        align: "center",
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
                        render: (value) => value || "-",
                    },

                    {
                        key: "Wing",
                        label: "Wing",
                        width: "12",
                        sortable: false,
                        align: "center",
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
                        render: (value) => value || "-",
                    },
                    {
                        key: "Floor",
                        label: "Floor",
                        width: "12",
                        sortable: false,
                        align: "center",
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
                        render: (value) => value || "-",
                    },
                    {
                        key: "Flat",
                        label: "Unit Number",
                        width: "12",
                        sortable: false,
                        align: "center",
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
                        render: (value) => value || "-",
                    },
                    {
                        key: "RERACarpetAreaSqFt",
                        label: "RERA Carpet Area (SqFt)",
                        width: "12",
                        sortable: false,
                        align: "center",
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
                        render: (value) => value || "-",
                    },
                    {
                        key: "FlatType",
                        label: "Unit Type",
                        width: "12",
                        sortable: false,
                        align: "center",
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
                        render: (value) => value || "-",
                    },
                    {
                        key: "FlatConfiguration",
                        label: "Configuration",
                        width: "12",
                        sortable: false,
                        align: "center",
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
                        render: (value) => value || "-",
                    },

                    {
                        key: "AgreementValue",
                        label: "Agreement Value (₹)",
                        width: "15",
                        align: "left",
                        sortable: false,
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
                        render: (value) => formatCurrency(value ?? 0)
                    },


                ]
            },

            {
                key: "BankLoanDetailsGroup",
                label: "Bank Loan Details",
                align: "center",
                theadStyle: {
                    backgroundColor: '#FBF5FF',
                    color: '#8A38F5'
                },
                children: [

                    {
                        key: "LoanSanctionAmount",
                        label: "Sanction Amount (₹)",
                        width: "12",
                        sortable: false,
                        align: "left",
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#FBF5FF'
                        },
                        render: (value) => formatCurrency(value ?? 0)
                    },
                    {
                        key: "LoanSanctionDate",
                        label: "Sanction Date",
                        width: "15",
                        align: "left",
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#FBF5FF'
                        },
                        render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : "-"
                    },
                    {
                        key: "BankName",
                        label: "Bank Name",
                        width: "15",
                        align: "left",
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#FBF5FF'
                        },
                        render: (value) => value || "-",
                    },
                    {
                        key: "LoanAccountNumber",
                        label: "Account Number",
                        width: "15",
                        align: "left",
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#FBF5FF'
                        },
                        render: (value) => value || "-",
                    },
                    {
                        key: "BankBranchName",
                        label: "Branch Name",
                        width: "15",
                        align: "left",
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#FBF5FF'
                        },
                        render: (value) => value || "-",
                    },
                    {
                        key: "BankStatusClosedActive",
                        label: "Status",
                        width: "15",
                        align: "left",
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#FBF5FF'
                        },
                        render: (value: string) => {

                            if (!value) return "-";

                            const isActive = value.toLowerCase() === "active";

                            return (
                                <span
                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isActive
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    <span className={`mr-2 h-2 w-2 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} />
                                    {value}
                                </span>
                            );
                        },
                    },


                    {
                        key: "Address",
                        label: "Address",
                        width: "15",
                        align: "left",
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#FBF5FF'
                        },
                        render: (value) => value || "-",
                    },

                ]
            },




        ],
        [],
    );

    const handlePageChange = useCallback(
        (page: number) => {
            loadingClientLoanReport(page, filters, sortInfo, searchTerm);
        },
        [sortInfo, filters, searchTerm],
    );

    const ClientLoanReportPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange,
        }),
        [pagination, handlePageChange],
    );

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }


    const handleExportClientLoanReport = async (exportType: "Excel" | "PDF") => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationClientLoanReport = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: Number(projectId),
                    ApplicantName: filters.ApplicantName,
                    ApplicantMobileNumber: filters.ApplicantMobileNumber,
                    ProjectName: filters.ProjectName,
                    Wing: filters.Wing,
                    Flat: filters.Flat,
                    Floor: filters.Floor,
                    Configuration: filters.Configuration,
                    AgreementValue: Number(filters.AgreementValue) ?? 0,
                    BankStatusClosedActive: filters.BankStatusClosedActive,
                    SortBy: getSortByParam(sortInfo ?? null, clientLoanReportColumns),

                    ExportType: exportType,
                };

                const response = await clientLoanReportService.apiCallPullClientLoanReport(params);

                handleExportFile(response, exportType, "Client Loan Report", addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message || "Export failed" }),
            undefined,
            "Preparing Export",
        );
    };

    const handleExportClientLoanReportExcel = () => handleExportClientLoanReport("Excel");
    const handleExportClientLoanReportPdf = () => handleExportClientLoanReport("PDF");

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}> {" "} <div></div>{" "} </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Applicant Name"
                onSearchChange={(v) => {
                    setSearchTerm(v);
                    debouncedSearch(v);
                }}
                onClearSearch={clearSearchClientLoanReport}
                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters);
                    setShowFilterPopup(true);
                }}

                isShowExportButton={canExport && clientLoanReportTable.length > 0}
                onExportExcel={handleExportClientLoanReportExcel}
                onExportPdf={handleExportClientLoanReportPdf}
                exportLoading={isLoading}
            />

            <CustomTable
                data={clientLoanReportTable}
                columns={clientLoanReportColumns}
                pagination={ClientLoanReportPaginationInfo}
                recordsPerPage={20}
                emptyMessage="No Client Loan Report Found"
                fixedHeight={true}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
                loading={isLoading}
            />

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Client Loan Report"
                onSubmit={(e) => {
                    e.preventDefault();
                    applyFilters();
                }}
                saveText="Apply "
                cancelText="Clear"
                onCancel={() => clearFilters()}
                resetText=""
                size="small-half"
            >
                <div className="space-y-6">
                    <div>
                        <Input
                            type="text"
                            label="Applicant Name"
                            value={tempFilters?.ApplicantName ?? ""}
                            onChange={(e) => handleFilterChange("ApplicantName", e.target.value)}
                            placeholder="Enter Applicant Name"
                        />

                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Applicant Mobile Number"
                            value={tempFilters?.ApplicantMobileNumber ?? ''}
                            onChange={e => handleFilterChange('ApplicantMobileNumber', filterNumbers(e.target.value))}
                            placeholder="Enter Applicant Mobile Number"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Building Number"
                            value={tempFilters?.BuildingNumber ?? ""}
                            onChange={(e) => handleFilterChange("BuildingNumber", e.target.value)}
                            placeholder="Enter Building Number"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Wing"
                            value={tempFilters?.Wing ?? ""}
                            onChange={(e) => handleFilterChange("Wing", e.target.value)}
                            placeholder="Enter Wing"
                        />
                    </div>

                    <div>
                        <Input
                            label='Floor'
                            type="text"
                            value={tempFilters.Floor || ''}
                            onChange={e => handleFilterChange('Floor', e.target.value)}
                            placeholder="Enter Floor"
                        />
                    </div>
                    <div>
                        <Input
                            label='Unit Number'
                            type="text"
                            value={tempFilters.Flat || ''}
                            onChange={e => handleFilterChange('Flat', e.target.value)}
                            placeholder="Enter Unit Number"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Unit Type"
                            value={tempFilters?.FlatType ?? ""}
                            onChange={(e) => handleFilterChange("FlatType", e.target.value)}
                            placeholder="Enter Unit Type"
                        />
                    </div>
                    <div>
                        <Input
                            label='Agreement Value'
                            value={tempFilters.AgreementValue || ''}
                            onChange={(e) => {
                                const value = filterNumbersWithDecimal(e.target.value);
                                handleFilterChange('AgreementValue', value)
                            }}

                            placeholder="Enter Agreement Value"
                            maxLength={9}
                        />
                    </div>



                    <div>
                        <SinglePageSelection
                            label="Status"
                            placeholder="Select Status"
                            value={tempFilters.BankStatusClosedActive || ""}
                            onChange={(val) =>
                                handleFilterChange("BankStatusClosedActive", String(val))
                            }
                            options={[
                                { label: "Active", value: "Active" },
                                { label: "Closed", value: "Closed" }
                            ]}
                        />
                    </div>





                </div>
            </Modal>
        </div>
    );
};

export default ClientLoanReport;
