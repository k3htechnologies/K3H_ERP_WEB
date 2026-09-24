import { useCallback, useEffect, useMemo, useState } from "react";
import type { FilterWithPaginationMaterialRequisitionReport, MaterialRequisitionReportData } from "@/features/materialRequisitionReport/models/MaterialRequisitionReportModel";
import usePagination from "@/core/hooks/usePagination";
import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { runApiWithLoader } from "@/core/utils";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo } from "@/ui/components/DataTable/DataTable";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { materialRequisitionReportservice } from "@/features/materialRequisitionReport/services/MaterialRequisitionReportService";
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
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd } from "@/core/utils/dateFormat";
import DatePickerInput from "@/ui/components/forms/Datepicker";

export const MaterialRequisitionReport: React.FC = () => {

    const [materialRequisitionReportList, setMaterialRequisitionReportList] = useState<MaterialRequisitionReportData[]>([]);
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

        loadMaterialRequisitionReport(1, filters, sortInfo, searchTerm);
    }, [projectId]);

    const searchMaterialRequisitionReport = async (searchValue: string) => {
        setSearchTerm(searchValue);
        await loadMaterialRequisitionReport(1, filters, sortInfo, searchValue);
    }

    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchMaterialRequisitionReport(value)
    }, 350);

    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.()
        }
    }, [debouncedSearch]);

    const loadMaterialRequisitionReport = useCallback(async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisitionReport = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    MaterialName: searchtext || filterParams.MaterialName?.trim() || undefined,
                    SubMaterialName: filterParams.SubMaterialName ?? undefined,
                    FromDate: filterParams.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) || undefined : undefined,
                    ToDate: filterParams.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) || undefined : undefined,
                    SortBy: getSortByParam(sortInfo ?? null, MaterialRequisitionReportColumns)
                }

                const response = await materialRequisitionReportservice.apiCallPullMaterialRequisitionReport(params);

                if (E.isRight(response)) {

                    setMaterialRequisitionReportList(response.right.Data);

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
            "Loading Material Requisition Report"
        )
    }, [projectId])

    const MaterialRequisitionReportColumns = useMemo<TableColumn[]>(() => [
        {
            key: "MaterialName",
            label: "Material Name",
            width: "15",
            align: "left",
            sortable: true,
            fixed:"left",
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
            key: "MaterialQuantityRequested",
            label: "Requested Quantity",
            width: '15',
            align: "left",
            sortable: false,
            render: (value, row) =>   value != null && value !== "" ? `${value} ${row?.UomCode ?? ""}` : "-"
        },
        {
            key: "MaterialQuantityReceived",
            label: "Received Quantity",
            width: '15',
            align: "left",
            sortable: false,
            render: (value, row) =>   value != null && value !== "" ? `${value} ${row?.UomCode ?? ""}` : "-"
        },
        {
            key: "TotalInvoiceAmount",
            label: "Total Invoice Amount (₹)",
            width: '15',
            align: "left",
            sortable: false,
            render: value => value || "-"
        },
    ], []);

    const ClearSearchTerm = () => {
        setSearchTerm(""),
            debouncedSearch.cancel?.();
        loadMaterialRequisitionReport(1, filters, sortInfo, "");
    }

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort)
        loadMaterialRequisitionReport(1, filters, sort, searchTerm);
    }, [filters, searchTerm]);

    const handlePageChange = useCallback((page: number) => {

        loadMaterialRequisitionReport(page, filters, sortInfo, searchTerm);
    }, [sortInfo, filters, searchTerm]);

    const MaterialRequisitionReportPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    );

    const MaterialRequisitionReportForTable = useMemo(() => materialRequisitionReportList, [materialRequisitionReportList]);

    const applyFilters = () => {
        setFilters(tempFilters);
        setPagination({ currentPage: 1 });
        loadMaterialRequisitionReport(1, tempFilters, sortInfo, searchTerm);
        setShowFilterPopup(false);
    }

    const clearFilters = () => {
        setFilters({})
        setTempFilters({})
        setPagination({ currentPage: 1 });
        loadMaterialRequisitionReport(1, {}, sortInfo, searchTerm)
    }

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value))
    }

    const handleExportMaterialRequisitionReport = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisitionReport = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: Number(projectId),
                    MaterialName: filters.MaterialName?.trim() || undefined,
                    SubMaterialName: filters.SubMaterialName?.trim() || undefined,
                    FromDate: filters.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.FromDate) || undefined : undefined,
                    ToDate: filters.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.ToDate) || undefined : undefined,
                    SortBy: getSortByParam(sortInfo ?? null, MaterialRequisitionReportColumns),
                    ExportType: exportType
                };

                const response = await materialRequisitionReportservice.apiCallPullMaterialRequisitionReport(params);

                handleExportFile(response, exportType, "Material Requisition Report", addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        )
    }

    const handleExportMaterialRequisitionReportExcel = () => handleExportMaterialRequisitionReport("Excel");
    const handleExportMaterialRequisitionReportPdf = () => handleExportMaterialRequisitionReport("PDF");

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
                    setTempFilters(filters);
                    setShowFilterPopup(true);
                }}

                isShowExportButton={canExport && MaterialRequisitionReportForTable.length > 0}
                onExportExcel={handleExportMaterialRequisitionReportExcel}
                onExportPdf={handleExportMaterialRequisitionReportPdf}
                exportLoading={isLoading}
            />

            <DataTable
                columns={MaterialRequisitionReportColumns}
                data={MaterialRequisitionReportForTable}
                pagination={MaterialRequisitionReportPaginationInfo}
                recordsPerPage={20}
                emptyMessage="No Material Requisition Report Found"
                fixedHeight={true}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
                loading={isLoading}
            />

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Material Requisition Report"
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
export default MaterialRequisitionReport;