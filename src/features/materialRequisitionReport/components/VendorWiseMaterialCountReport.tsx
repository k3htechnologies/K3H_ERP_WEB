import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import usePagination from "@/core/hooks/usePagination";
import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { runApiWithLoader } from "@/core/utils";
import { type FilterInfo, type PaginationInfo, type SortInfo } from "@/ui/components/DataTable/DataTable";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { DataTableWithOutBorder, type TableColumn } from "@/ui/components/DataTable/DataTableWithoutBorder";
import * as E from 'fp-ts/Either';
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import { updateFilter } from "@/core/utils/filterHelper";
import { Modal } from "@/ui/components/Modal/Modal";
import { Input } from "@/ui/components/forms";
import { handleExportFile } from "@/core/utils/exportFile";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { FilterWithPaginationMaterialAndVendorReport, FilterWithPaginationVendorWiseMaterialCountReport, MaterialAndVendorReportData, VendorWiseMaterialCountReportData } from "../models/MaterialRequisitionReportModel";
import { materialRequisitionReportservice } from "../services/MaterialRequisitionReportService";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd } from "@/core/utils/dateFormat";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { DataTableExpandable, type DataTableExpandableRef } from "@/ui/components/DataTable/DataTableExpandable";
import NoDataView from "@/ui/components/NoDataView/NoDataView";

export const VendorWiseMaterialCountReport: React.FC = () => {

    const [vendorWiseMaterialCountReportList, setVendorWiseMaterialCountReportList] = useState<VendorWiseMaterialCountReportData[]>([]);
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

    const dtRef = useRef<DataTableExpandableRef | null>(null);

    useEffect(() => {
        if (!projectId) return

        loadVendorWiseMaterialCountReport(1, filters, sortInfo, searchTerm);
    }, [projectId]);

    const searchVendorWiseMaterialCountReport = async (searchValue: string) => {
        setSearchTerm(searchValue);
        await loadVendorWiseMaterialCountReport(1, filters, sortInfo, searchValue);
    }

    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchVendorWiseMaterialCountReport(value)
    }, 350);

    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.()
        }
    }, [debouncedSearch]);

    const loadVendorWiseMaterialCountReport = useCallback(async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationVendorWiseMaterialCountReport = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    VendorName: searchtext || filterParams.VendorName?.trim() || undefined,
                    FromDate: filterParams.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) || undefined : undefined,
                    ToDate: filterParams.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) || undefined : undefined,
                    SortBy: getSortByParam(sortInfo ?? null, VendorWiseMaterialCountReportColumns)
                }

                const response = await materialRequisitionReportservice.apiCallPullVendorWiseMaterialCountReport(params);

                if (E.isRight(response)) {

                    setVendorWiseMaterialCountReportList(response.right.Data);

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
            "Loading Vendor Wise Material Count Report"
        )
    }, [projectId])

    const VendorWiseMaterialCountReportColumns = useMemo<TableColumn[]>(() => [
        {
            key: "VendorName",
            label: "Vendor Name",
            width: "15",
            align: "left",
            sortable: true,
            render: value => value || ""
        },
        {
            key: "MobileNumber",
            label: "Mobile Number",
            width: '15',
            align: "left",
            sortable: false,
            render: value => value || ""
        },
        {
            key: "NoOfMaterial",
            label: "No Of Material",
            width: '15',
            align: "left",
            sortable: false,
            render: value => value || "-"
        },
    ], []);

    const ClearSearchTerm = () => {
        setSearchTerm(""),
            debouncedSearch.cancel?.();
        loadVendorWiseMaterialCountReport(1, filters, sortInfo, "");
    }

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort)
        loadVendorWiseMaterialCountReport(1, filters, sort, searchTerm);
    }, [filters, searchTerm]);

    const handlePageChange = useCallback((page: number) => {

        loadVendorWiseMaterialCountReport(page, filters, sortInfo, searchTerm);
    }, [sortInfo, filters, searchTerm]);

    const VendorWiseMaterialCountReportPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    );

    const VendorWiseMaterialCountReportForTable = useMemo(() => vendorWiseMaterialCountReportList, [vendorWiseMaterialCountReportList]);

    const applyFilters = () => {
        setFilters(tempFilters);
        setPagination({ currentPage: 1 });
        loadVendorWiseMaterialCountReport(1, tempFilters, sortInfo, searchTerm);
        setShowFilterPopup(false);
    }

    const clearFilters = () => {
        setFilters({})
        setTempFilters({})
        setPagination({ currentPage: 1 });
        loadVendorWiseMaterialCountReport(1, {}, sortInfo, searchTerm)
    }

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value))
    }

    const handleExportVendorWiseMaterialCountReport = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationVendorWiseMaterialCountReport = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: Number(projectId),
                    VendorName: filters.VendorName?.trim() || undefined,
                    FromDate: filters.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.FromDate) || undefined : undefined,
                    ToDate: filters.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.ToDate) || undefined : undefined,
                    SortBy: getSortByParam(sortInfo ?? null, VendorWiseMaterialCountReportColumns),
                    ExportType: exportType
                };

                const response = await materialRequisitionReportservice.apiCallPullVendorWiseMaterialCountReport(params);

                handleExportFile(response, exportType, "Vendor Wise Material Count Report", addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        )
    }

    const handleExportVendorWiseMaterialCountReportExcel = () => handleExportVendorWiseMaterialCountReport("Excel");
    const handleExportVendorWiseMaterialCountReportPdf = () => handleExportVendorWiseMaterialCountReport("PDF");

    const MaterialAndVendorReportColumns = useMemo<TableColumn[]>(() => [
        {
            key: "MaterialName",
            label: "Material Name",
            width: "15",
            align: "left",
            sortable: false,
            fixed: "left",
            render: value => value || ""
        },
        {
            key: "SubMaterialName",
            label: "Sub Material Name",
            width: '15',
            align: "left",
            sortable: false,
            render: value => value || "-"
        },
        {
            key: "MaterialCode",
            label: "Material Code",
            width: '15',
            align: "left",
            sortable: false,
            render: value => value || "-"
        },
        {
            key: "UomCode",
            label: "Uom",
            width: '15',
            align: "left",
            sortable: false,
            render: value => value || "-"
        },
        {
            key: "MaterialQuantityReceived",
            label: "Material Quantity Received",
            width: '15',
            align: "left",
            sortable: false,
            render: value => value || "-"
        },
        {
            key: "MaterialQuantityRequested",
            label: "Material Quantity Requested",
            width: '15',
            align: "left",
            sortable: false,
            render: value => value || "-"
        },
    ], []);

    return (
        <div>
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
                    setTempFilters(filters);
                    setShowFilterPopup(true);
                }}

                isShowExportButton={canExport && VendorWiseMaterialCountReportForTable.length > 0}
                onExportExcel={handleExportVendorWiseMaterialCountReportExcel}
                onExportPdf={handleExportVendorWiseMaterialCountReportPdf}
                exportLoading={isLoading}
            />

            <DataTableExpandable
                ref={dtRef}
                columns={VendorWiseMaterialCountReportColumns}
                data={VendorWiseMaterialCountReportForTable}
                emptyMessage="No Vendor Wise Material Count Report Found"
                pagination={VendorWiseMaterialCountReportPaginationInfo}
                recordsPerPage={20}
                fixedHeight={true}
                sortInfo={sortInfo}
                onSort={handleSortColumn}
                loading={isLoading}
                expandable={{
                    keyField: "VendorId",
                    alwaysFetchOnOpen: true,

                    fetchRow: async (row) => {

                        const params: FilterWithPaginationMaterialAndVendorReport = {
                            PageNumber: 1,
                            PageSize: 1000,
                            ProjectId: Number(projectId),
                            VendorId: row.VendorId,
                        };

                        const response = await materialRequisitionReportservice.apiCallPullMaterialAndVendorReport(params);

                        if (E.isRight(response)) {
                            return response.right.Data ?? [];
                        }
                        return [];
                    },

                    renderRow: (fetchedData) => {
                        const details: MaterialAndVendorReportData[] = Array.isArray(fetchedData) ? fetchedData : fetchedData ? [fetchedData] : [];
                        if (!details || details.length === 0) {
                            return <div className="p-1 text-xs text-gray-600 text-center"><NoDataView /></div>;
                        }
                        return (
                            <DataTableWithOutBorder
                                data={details}
                                columns={MaterialAndVendorReportColumns}
                                emptyMessage="No Material And Vendor Report Data Found"
                                fixedHeight={true}
                                className="flex-1"
                                loading={isLoading}
                            />
                        );
                    },
                    expandButton: { openText: "Hide", closeText: "Show" },
                }}
            />

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Vendor Wise Material Count Report"
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
export default VendorWiseMaterialCountReport;