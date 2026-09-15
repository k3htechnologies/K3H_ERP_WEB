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

    useEffect(() => {
        loadMaterialRequisitionReport(1, filters, sortInfo, searchTerm);
    }, []);

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

    const loadMaterialRequisitionReport = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisitionReport = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    VendorName: searchtext || filterParams.VendorName?.trim() || undefined,
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
    }

    const MaterialRequisitionReportColumns = useMemo<TableColumn[]>(() => [
        {
            key: "VendorCode",
            label: "Vendor Code",
            width: '15',
            align: "left",
            sortable: true,
            render: value => value || "-"
        },
        {
            key: "VendorName",
            label: "Vendor Name",
            width: "15",
            align: "right",
            sortable: true,
            render: value => value || ""
        }
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
        loadMaterialRequisitionReport(1, filters, sortInfo, searchTerm)
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}> <div></div></Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Vendor Name"
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
                            label="Vendor Name"
                            value={tempFilters?.VendorName ?? ""}
                            onChange={e => handleFilterChange("VendorName", e.target.value)}
                            placeholder="Enter Vendor Name"
                        />
                    </div>

                </div>
            </Modal>

        </div>
    )
}
export default MaterialRequisitionReport;