import { runApiWithLoader } from "@/core/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as E from 'fp-ts/Either';
import { type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { Loader } from "@/core/utils/loader";
import usePagination from "@/core/hooks/usePagination";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import useToast from "@/core/hooks/useToast";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { updateFilter } from "@/core/utils/filterHelper";
import { Input } from "@/ui/components/forms";
import { Modal } from "@/ui/components/Modal/Modal";
import { handleExportFile } from "@/core/utils/exportFile";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { formatCurrency } from "@/core/utils/comman";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import type { FilterWithPaginationTermSheetReportRequest, TermSheetReportData } from "@/features/termSheetReport/models/TermSheetReportModel";
import type { FilterWithPaginationTermSheetRequest } from "@/features/termSheet/models/TermSheetModel";
import { termSheetReportService } from "@/features/termSheetReport/services/TermSheetReportService";
import { TERM_SHEET_APPROVAL_OPTIONS } from "@/core/constants";
import { CustomTable } from "@/ui/components/DataTable/CustomTable";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";

export const TermSheetReport: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [termSheetReportList, setTermSheetReportList] = useState<TermSheetReportData[]>([]);
    const { pagination, setPagination } = usePagination(20);
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [filters, setFilters] = useState<FilterInfo>({});
    const { canExport } = useMenuPermissions();

    useEffect(() => {
        loadingTermSheetReport(1, filters, sortInfo, searchTerm);
    }, []);

    const searchTermSheetReport = async (searchValue: string) => {
        setSearchTerm(searchValue);
        await loadingTermSheetReport(1, filters, sortInfo, searchValue);
    };

    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchTermSheetReport(value)
    }, 350);

    useEffect(() => {
        return () => {

            debouncedSearch.cancel?.()
        }
    }, [debouncedSearch])

    const loadingTermSheetReport = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
        runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationTermSheetRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    TermSheetId: filterParams.TermSheetId ? Number(filterParams.TermSheetId) : undefined,
                    NameOfInstitutionBankNBFC: filterParams.NameOfInstitutionBankNBFC ?? undefined,
                    ApprovalStatus: filterParams.ApprovalStatus ?? undefined,
                    ProjectName: searchtext || filterParams.ProjectName || undefined,
                    CompanyName: filterParams.CompanyName ?? undefined,
                    SortBy: getSortByParam(sortInfo ?? null, TermSheetReportColumns)
                };

                const response = await termSheetReportService.apiCallPullTermSheetReport(params);

                if (E.isRight(response)) {

                    setTermSheetReportList(response.right.Data);

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });
                } else {

                    addToast({ type: 'error', title: response.left.message });

                    return response;
                }
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Term Sheet Report'
        )
    }

    const clearSearchTermSheetReport = () => {
        setSearchTerm('');
        debouncedSearch.cancel?.();
        setPagination({ currentPage: 1 });
        loadingTermSheetReport(1, filters, sortInfo, '');
    };

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        loadingTermSheetReport(1, filters, sort, searchTerm);
    }, [searchTerm]);

    const TermSheetReportColumns = useMemo<TableColumn[]>(() => [

        {
            key: "CompanyName",
            label: "Company Name",
            width: "16",
            sortable: false,
            align: "left",
            fixed: "left",
            render: (value) => value || "-",
        },
        {
            key: "NameOfInstitutionBankNBFC",
            label: "Name Of Institution / Bank / NBFC",
            width: "20",
            sortable: true,
            align: "left",
            render: (value: string, row: any) => {
                return (
                    <MultiImageViewer
                        images={parseDocumentUrls(row.TermSheetURL)}
                        title={`Term Sheet - ${row.NameOfInstitutionBankNBFC ?? ""}`}
                        triggerLabel={value || '-'}
                        isWrap={false}
                    />
                );
            }
        },
        {
            key: "ProjectName",
            label: "Project Name",
            width: "16",
            sortable: false,
            align: "left",
            render: (value) => value || "-",
        },
        {
            key: "LoanTakenBy",
            label: "Loan Taken By",
            width: "16",
            sortable: false,
            align: "left",
            render: (value) => value || "-",
        },
        {
            key: "Type",
            label: "Type",
            width: "15",
            sortable: false,
            align: "left",
            render: (value) => value || "-",
        },
        {
            key: "SanctionDate",
            label: "Sanction Date",
            width: "12",
            sortable: false,
            align: "center",
            render: (value?: string) =>
                value ? formatDate_dd_MonthName_yy(value) : "-",
        },
        {
            key: "AmountGroup",
            label: "Amount (₹)",
            align: "center",
            theadStyle: {
                backgroundColor: '#EEF5FF',
                color: '#135BEC'
            },
            children: [

                {
                    key: 'FacilityAmount',
                    label: 'Sanction',
                    width: '15',
                    sortable: false,
                    align: 'right',
                    theadStyle: {
                        backgroundColor: '#FFF',
                        color: '#64748B'
                    },
                    tdStyle: {
                        backgroundColor: '#EEF5FF'
                    },
                    render: (value) => formatCurrency(value ?? 0)
                },
                {
                    key: 'TotalDisbursedAmount',
                    label: 'Disbursed',
                    width: '15',
                    sortable: false,
                    align: 'right',
                    theadStyle: {
                        backgroundColor: '#FFF',
                        color: '#64748B'
                    },
                    tdStyle: {
                        backgroundColor: '#EEF5FF'
                    },
                    render: (value) => formatCurrency(value ?? 0)
                },
                {
                    key: 'BalanceDisbursementAmount',
                    label: 'Balance Disbursement',
                    width: '15',
                    sortable: false,
                    align: 'right',
                    theadStyle: {
                        backgroundColor: '#FFF',
                        color: '#64748B'
                    },
                    tdStyle: {
                        backgroundColor: '#EEF5FF'
                    },
                    render: (value) => formatCurrency(value ?? 0)
                },
                {
                    key: 'TotalRepayLedgerAmount',
                    label: 'Repayment',
                    width: '15',
                    sortable: false,
                    align: 'right',
                    theadStyle: {
                        backgroundColor: '#FFF',
                        color: '#64748B'
                    },
                    tdStyle: {
                        backgroundColor: '#EEF5FF'
                    },
                    render: (value) => formatCurrency(value ?? 0)
                },
                {
                    key: 'BalanceAsOnDateAmount',
                    label: 'Balance as on Date',
                    width: '15',
                    sortable: false,
                    align: 'right',
                    theadStyle: {
                        backgroundColor: '#FFF',
                        color: '#64748B'
                    },
                    tdStyle: {
                        backgroundColor: '#EEF5FF'
                    },
                    render: (value) => formatCurrency(value ?? 0)
                },


            ]
        },

        {
            key: 'RateOfInterestInPercentage',
            label: 'Rate Of Interest (%)',
            width: '15',
            sortable: false,
            align: 'right',
            render: (value) => value ? `${value} %` : '-'
        },
        {
            key: "ApprovalStatus",
            label: "Approval Status",
            width: "18",
            sortable: false,
            align: "center",
            render: (value, row) => (

                <ApprovalActions
                    approvalStatus={value || "-"}
                    showApproval={row.IsApproval}
                    isIcons={true}
                />

            )
        },
        {
            key: "ClosingDate",
            label: "Closing Date",
            width: "12",
            sortable: false,
            align: "center",
            render: (value?: string) =>
                value ? formatDate_dd_MonthName_yy(value) : "-",
        },


    ], []);

    const handlePageChange = useCallback((page: number) => {
        loadingTermSheetReport(page, filters, sortInfo, searchTerm);
    }, [sortInfo, searchTerm]);

    const TermSheetReportPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    );

    const TermSheetReportForTable = useMemo(() => termSheetReportList, [termSheetReportList]);

    const applyFilters = () => {
        setFilters(tempFilters);
        setPagination({ currentPage: 1 });

        loadingTermSheetReport(1, tempFilters, sortInfo, searchTerm);
        setShowFilterPopup(false);
    };

    const clearFilters = () => {
        setTempFilters({});
        setFilters({});
        setPagination({ currentPage: 1 });
        loadingTermSheetReport(1, {}, sortInfo, searchTerm);
    };

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }

    const handleExportTermSheetReport = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationTermSheetReportRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    NameOfInstitutionBankNBFC: filters.NameOfInstitutionBankNBFC?.trim() || undefined,
                    ApprovalStatus: filters.ApprovalStatus ?? undefined,
                    ProjectName: filters.ProjectName ?? undefined,
                    CompanyName: filters.CompanyName ?? undefined,
                    SortBy: getSortByParam(sortInfo ?? null, TermSheetReportColumns),
                    ExportType: exportType,
                };

                const response = await termSheetReportService.apiCallPullTermSheetReport(params);

                handleExportFile(response, exportType, 'Term Sheet Report', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportTermSheetReportExcel = () => handleExportTermSheetReport('Excel')
    const handleExportTermSheetReportPdf = () => handleExportTermSheetReport('PDF')

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Project Name"
                onSearchChange={v => {
                    setSearchTerm(v);
                    debouncedSearch(v);
                }}
                onClearSearch={clearSearchTermSheetReport}

                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters);
                    setShowFilterPopup(true);
                }}

                isShowExportButton={canExport && TermSheetReportForTable.length > 0}
                onExportExcel={handleExportTermSheetReportExcel}
                onExportPdf={handleExportTermSheetReportPdf}
                exportLoading={isLoading}
            />

            <CustomTable
                data={TermSheetReportForTable}
                columns={TermSheetReportColumns}
                pagination={TermSheetReportPaginationInfo}
                recordsPerPage={20}
                emptyMessage="No Data Found"
                fixedHeight={true}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
                loading={isLoading}
            />

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Term Sheet Report"
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
                <div className="space-y-6">

                    <div>
                        <Input
                            type="text"
                            label="Project Name"
                            value={tempFilters?.ProjectName ?? ""}
                            onChange={(e) => handleFilterChange("ProjectName", e.target.value)}
                            placeholder="Enter Project Name"
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
                    <div>
                        <SinglePageSelection
                            label="Status"
                            placeholder="Select Status"
                            value={tempFilters.ApprovalStatus || ''}
                            onChange={e => handleFilterChange('ApprovalStatus', String(e))}
                            options={TERM_SHEET_APPROVAL_OPTIONS.map(opt => ({
                                label: opt.name,
                                value: opt.id
                            }))}
                        />

                    </div>
                    <div>
                        <Input
                            type="text"
                            label="Name of Institution / Bank / NBFC"
                            value={tempFilters?.NameOfInstitutionBankNBFC ?? ""}
                            onChange={(e) => handleFilterChange("NameOfInstitutionBankNBFC", e.target.value)}
                            placeholder="Enter Name of Institution / Bank / NBFC"
                        />
                    </div>

                </div>
            </Modal>
        </div>
    )
}
export default TermSheetReport;