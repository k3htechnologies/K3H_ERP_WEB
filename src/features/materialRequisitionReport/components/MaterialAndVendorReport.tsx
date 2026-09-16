import { useCallback, useEffect, useMemo, useState } from "react";
import usePagination from "@/core/hooks/usePagination";
import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { runApiWithLoader } from "@/core/utils";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo } from "@/ui/components/DataTable/DataTable";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import type { TableColumn } from "@/ui/components/DataTable/DataTableWithoutBorder";
import * as E from 'fp-ts/Either';
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import { updateFilter } from "@/core/utils/filterHelper";
import { Modal } from "@/ui/components/Modal/Modal";
import { Input } from "@/ui/components/forms";
import { handleExportFile } from "@/core/utils/exportFile";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { FilterWithPaginationMaterialAndVendorReport, MaterialAndVendorReportData } from "../models/MaterialRequisitionReportModel";
import { materialRequisitionReportservice } from "../services/MaterialRequisitionReportService";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd } from "@/core/utils/dateFormat";

export const MaterialAndVendorReport: React.FC = () => {

    const [materialAndVendorReportList, setMaterialAndVendorReportList] = useState<MaterialAndVendorReportData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { pagination, setPagination } = usePagination(20);
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [filters, setFilters] = useState<FilterInfo>({});
    const { canExport } = useMenuPermissions();
    const { projectId } = useProject();

    useEffect(() => {
        if (!projectId) return

        loadMaterialAndVendorReport(1, filters, sortInfo, searchTerm);
    }, [projectId]);

    const searchMaterialAndVendorReport = async (searchValue: string) => {
        setSearchTerm(searchValue);
        await loadMaterialAndVendorReport(1, filters, sortInfo, searchValue);
    }

    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchMaterialAndVendorReport(value)
    }, 350);

    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.()
        }
    }, [debouncedSearch]);

    const loadMaterialAndVendorReport = useCallback(async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialAndVendorReport = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    VendorId: filterParams.VendorId ? Number(filterParams.VendorId) : undefined,
                    MaterialName: searchtext || filterParams.MaterialName?.trim() || undefined,
                    SubMaterialName: filterParams.SubMaterialName ?? undefined,
                    FromDate: filterParams.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) || undefined : undefined,
                    ToDate: filterParams.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) || undefined : undefined,
                    SortBy: getSortByParam(sortInfo ?? null, MaterialAndVendorReportColumns)
                }

                const response = await materialRequisitionReportservice.apiCallPullMaterialAndVendorReport(params);

                if (E.isRight(response)) {

                    setMaterialAndVendorReportList(response.right.Data);

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
            "Loading Material And Vendor Report"
        )
    }, [projectId])

    const MaterialAndVendorReportColumns = useMemo<TableColumn[]>(() => [
        {
            key: "MaterialName",
            label: "Material Name",
            width: "15",
            align: "left",
            sortable: true,
            render: value => value || ""
        },
        {
            key: "SubMaterialName",
            label: "Sub Material Name",
            width: '15',
            align: "left",
            sortable: true,
            render: value => value || "-"
        },
        {
            key: "FromDate",
            label: "From Date",
            width: '15',
            align: "left",
            sortable: false,
            render: value => value || "-"
        },
        {
            key: "ToDate",
            label: "To Date",
            width: '15',
            align: "left",
            sortable: false,
            render: value => value || "-"
        },
    ], []);

    const ClearSearchTerm = () => {
        setSearchTerm(""),
            debouncedSearch.cancel?.();
        loadMaterialAndVendorReport(1, filters, sortInfo, "");
    }

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort)
        loadMaterialAndVendorReport(1, filters, sort, searchTerm);
    }, [filters, searchTerm]);

    const handlePageChange = useCallback((page: number) => {

        loadMaterialAndVendorReport(page, filters, sortInfo, searchTerm);
    }, [sortInfo, filters, searchTerm]);

    const MaterialAndVendorReportPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    );

    const MaterialAndVendorReportForTable = useMemo(() => materialAndVendorReportList, [materialAndVendorReportList]);

    const applyFilters = () => {
        setFilters(tempFilters);
        setPagination({ currentPage: 1 });
        loadMaterialAndVendorReport(1, tempFilters, sortInfo, searchTerm);
        setShowFilterPopup(false);
    }

    const clearFilters = () => {
        setFilters({})
        setTempFilters({})
        setPagination({ currentPage: 1 });
        loadMaterialAndVendorReport(1, filters, sortInfo, searchTerm)
    }

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value))
    }

    const handleExportMaterialAndVendorReport = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialAndVendorReport = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    MaterialName: filters.MaterialName?.trim() || undefined,
                    SubMaterialName: filters.SubMaterialName?.trim() || undefined,
                    FromDate: filters.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.FromDate) || undefined : undefined,
                    ToDate: filters.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.ToDate) || undefined : undefined,
                    SortBy: getSortByParam(sortInfo ?? null, MaterialAndVendorReportColumns),
                    ExportType: exportType
                };

                const response = await materialRequisitionReportservice.apiCallPullMaterialAndVendorReport(params);

                handleExportFile(response, exportType, "Material And Vendor Report", addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        )
    }

    const handleExportMaterialAndVendorReportExcel = () => handleExportMaterialAndVendorReport("Excel");
    const handleExportMaterialAndVendorReportPdf = () => handleExportMaterialAndVendorReport("PDF");

    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}> <div></div></Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Material Name"
                onSearchChange={(v) => {
                    setSearchTerm(v);
                    debouncedSearch(v);
                }}
                onClearSearch={ClearSearchTerm}

                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setFilters(filters);
                    setShowFilterPopup(true);
                }}

                isShowExportButton={canExport && MaterialAndVendorReportForTable.length > 0}
                onExportExcel={handleExportMaterialAndVendorReportExcel}
                onExportPdf={handleExportMaterialAndVendorReportPdf}
                exportLoading={isLoading}
            />

            <DataTable
                columns={MaterialAndVendorReportColumns}
                data={MaterialAndVendorReportForTable}
                pagination={MaterialAndVendorReportPaginationInfo}
                recordsPerPage={20}
                emptyMessage="No Material And Vendor Report Found"
                fixedHeight={true}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
                loading={isLoading}
            />

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Material And Vendor Report"
                onSubmit={e => {
                    e.preventDefault();
                    applyFilters();
                }}
                saveText="Apply"
                cancelText="Clear"
                onCancel={() => clearFilters()}
                resetText=""
                size="small-half"
            >

                <div className="space-y-6">

                    <div>
                        <Input
                            type="text"
                            label="Material Name"
                            value={tempFilters?.MaterialName ?? ""}
                            onChange={e => handleFilterChange("MaterialName", e.target.value)}
                            placeholder="Enter Material Name"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Sub Material Name"
                            value={tempFilters?.SubMaterialName ?? ""}
                            onChange={e => handleFilterChange("SubMaterialName", e.target.value)}
                            placeholder="Enter Sub Material Name"
                        />
                    </div>

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
    )
}
export default MaterialAndVendorReport;