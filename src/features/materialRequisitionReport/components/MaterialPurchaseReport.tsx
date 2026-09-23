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
import { Button, Input } from "@/ui/components/forms";
import { handleExportFile } from "@/core/utils/exportFile";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { FilterWithPaginationMaterialPurchaseReport, MaterialPurchaseReportData } from "../models/MaterialRequisitionReportModel";
import { materialRequisitionReportservice } from "../services/MaterialRequisitionReportService";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd } from "@/core/utils/dateFormat";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { Copy } from "lucide-react";
import { copyToClipboard } from "@/core/utils/comman";
import TooltipText from "@/ui/components/Tooltip/TooltipText";

export const MaterialPurchaseReport: React.FC = () => {

    const [materialPurchaseReportList, setMaterialPurchaseReportList] = useState<MaterialPurchaseReportData[]>([]);
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

        loadMaterialPurchaseReport(1, filters, sortInfo, searchTerm);
    }, [projectId]);

    const searchMaterialPurchaseReport = async (searchValue: string) => {
        setSearchTerm(searchValue);
        await loadMaterialPurchaseReport(1, filters, sortInfo, searchValue);
    }

    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchMaterialPurchaseReport(value)
    }, 350);

    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.()
        }
    }, [debouncedSearch]);

    const loadMaterialPurchaseReport = useCallback(async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialPurchaseReport = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    SystemGeneratedCode: searchtext || filterParams.SystemGeneratedCode?.trim() || undefined,
                    FromDate: filterParams.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) || undefined : undefined,
                    ToDate: filterParams.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) || undefined : undefined,
                    SortBy: getSortByParam(sortInfo ?? null, MaterialPurchaseReportColumns)
                }

                const response = await materialRequisitionReportservice.apiCallPullMaterialPurchaseReport(params);

                if (E.isRight(response)) {

                    setMaterialPurchaseReportList(response.right.Data);

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
            "Loading Material Purchase Report"
        )
    }, [projectId])

    const MaterialPurchaseReportColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'SystemGeneratedCode',
            label: 'MR Code',
            sortable: true,
            width: '20',
            fixed: 'left',
            align: 'left',
            render: (value) => {
                return (
                    <div className="flex items-center gap-2">

                        <TooltipText
                            text={value || '-'}
                            maxWidth="180px"
                            tooltipThreshold={30}
                            tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
                            
                        />

                        {value && (
                            <Button
                                onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const success = await copyToClipboard(value);
                                    if (success) {
                                        addToast({ type: 'success', title: `${value} Copied!` });
                                    }
                                }}
                                color="transparent"
                                size="sm"
                                style={{
                                    padding: '2px 6px',
                                    color: '#6B7280',
                                    cursor: 'pointer'
                                }}
                                title="Copy"
                            >
                                <Copy className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'FinalVendor',
            label: 'Vendor Name',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value: string, row: any) => {
                return (
                    <MultiImageViewer
                        images={parseDocumentUrls(row.PurchaseOrderURL)}
                        title={`Purchase Order - ${row.FinalVendor ?? ""}`}
                        triggerLabel={value || '-'}
                        isWrap={false}
                    />
                );
            }
        },
        {
            key: "TotalPoAmount",
            label: "Po Amount (₹)",
            width: '15',
            align: "right",
            sortable: false,
            render: value => value || "-"
        },
        {
            key: "TotalInvoiceAmount",
            label: "Invoice Amount (₹)",
            width: '15',
            align: "right",
            sortable: false,
            render: value => value || "-"
        },

        {
            key: "PaidAmount",
            label: "Paid Amount (₹)",
            width: '15',
            align: "right",
            sortable: false,
            render: value => value || "-"
        },


    ], []);

    const ClearSearchTerm = () => {
        setSearchTerm(""),
            debouncedSearch.cancel?.();
        loadMaterialPurchaseReport(1, filters, sortInfo, "");
    }

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort)
        loadMaterialPurchaseReport(1, filters, sort, searchTerm);
    }, [filters, searchTerm]);

    const handlePageChange = useCallback((page: number) => {

        loadMaterialPurchaseReport(page, filters, sortInfo, searchTerm);
    }, [sortInfo, filters, searchTerm]);

    const MaterialPurchaseReportPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    );

    const MaterialPurchaseReportForTable = useMemo(() => materialPurchaseReportList, [materialPurchaseReportList]);

    const applyFilters = () => {
        setFilters(tempFilters);
        setPagination({ currentPage: 1 });
        loadMaterialPurchaseReport(1, tempFilters, sortInfo, searchTerm);
        setShowFilterPopup(false);
    }

    const clearFilters = () => {
        setFilters({})
        setTempFilters({})
        setPagination({ currentPage: 1 });
        loadMaterialPurchaseReport(1, {}, sortInfo, searchTerm)
    }

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value))
    }

    const handleExportMaterialPurchaseReport = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialPurchaseReport = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: Number(projectId),
                    SystemGeneratedCode: filters.SystemGeneratedCode?.trim() || undefined,
                    FromDate: filters.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.FromDate) || undefined : undefined,
                    ToDate: filters.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.ToDate) || undefined : undefined,
                    SortBy: getSortByParam(sortInfo ?? null, MaterialPurchaseReportColumns),
                    ExportType: exportType
                };

                const response = await materialRequisitionReportservice.apiCallPullMaterialPurchaseReport(params);

                handleExportFile(response, exportType, "Material Purchase Report", addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        )
    }

    const handleExportMaterialPurchaseReportExcel = () => handleExportMaterialPurchaseReport("Excel");
    const handleExportMaterialPurchaseReportPdf = () => handleExportMaterialPurchaseReport("PDF");

    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}> <div></div></Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By MR Code"
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

                isShowExportButton={canExport && MaterialPurchaseReportForTable.length > 0}
                onExportExcel={handleExportMaterialPurchaseReportExcel}
                onExportPdf={handleExportMaterialPurchaseReportPdf}
                exportLoading={isLoading}
            />

            <DataTable
                columns={MaterialPurchaseReportColumns}
                data={MaterialPurchaseReportForTable}
                pagination={MaterialPurchaseReportPaginationInfo}
                recordsPerPage={20}
                emptyMessage="No Material Purchase Report Found"
                fixedHeight={true}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
                loading={isLoading}
            />

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Material Purchase Report"
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
                            label="System Generated Code"
                            value={tempFilters?.SystemGeneratedCode ?? ""}
                            onChange={e => handleFilterChange("SystemGeneratedCode", e.target.value)}
                            placeholder="Enter System Generated Code"
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
export default MaterialPurchaseReport;