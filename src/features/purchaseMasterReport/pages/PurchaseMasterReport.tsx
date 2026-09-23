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
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { updateFilter } from "@/core/utils/filterHelper";
import { Button, Input } from "@/ui/components/forms";
import { Modal } from "@/ui/components/Modal/Modal";
import { handleExportFile } from "@/core/utils/exportFile";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { copyToClipboard } from "@/core/utils/comman";
import { CustomTable } from "@/ui/components/DataTable/CustomTable";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import type { FilterWithPaginationPurchaseMasterReport, PurchaseMasterReportData } from "@/features/purchaseMasterReport/models/PurchaseMasterReportModel";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { purchaseMasterReportService } from "@/features/purchaseMasterReport/services/PurchaseMasterReportService";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { Copy } from "lucide-react";

export const PurchaseMasterReport: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [purchaseMasterReportList, setPurchaseMasterReportList] = useState<PurchaseMasterReportData[]>([]);
    const { pagination, setPagination } = usePagination(20);
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [filters, setFilters] = useState<FilterInfo>({});
    const { canExport } = useMenuPermissions();

    useEffect(() => {
        loadingPurchaseMasterReport(1, filters, sortInfo, searchTerm);
    }, []);

    const searchPurchaseMasterReport = async (searchValue: string) => {
        setSearchTerm(searchValue);
        await loadingPurchaseMasterReport(1, filters, sortInfo, searchValue);
    };

    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchPurchaseMasterReport(value)
    }, 350);

    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.()
        }
    }, [debouncedSearch])

    const loadingPurchaseMasterReport = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
        runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationPurchaseMasterReport = {

                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectName: searchtext?.trim() || filterParams?.ProjectName?.trim() || undefined,
                    SystemGeneratedCode: filterParams?.SystemGeneratedCode ?? undefined,
                    VendorName: filterParams.VendorName?.trim() ?? undefined,
                    MaterialName: filterParams.MaterialName?.trim() ?? undefined,
                    SubMaterialName: filterParams.SubMaterialName?.trim() ?? undefined,
                    FromDate: filterParams?.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) || undefined : undefined,
                    ToDate: filterParams?.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) || undefined : undefined,
                    SortBy: getSortByParam(sortInfo ?? null, PurchaseMasterReportColumns)

                };

                const response = await purchaseMasterReportService.apiCallPullPurchaseMasterReport(params);

                if (E.isRight(response)) {

                    setPurchaseMasterReportList(response.right.Data);

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
            'Loading Purchase Master Report'
        )
    }

    const clearSearchPurchaseMasterReport = () => {
        setSearchTerm('');
        debouncedSearch.cancel?.();
        setPagination({ currentPage: 1 });
        loadingPurchaseMasterReport(1, filters, sortInfo, '');
    };

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        loadingPurchaseMasterReport(1, filters, sort, searchTerm);
    }, [searchTerm]);

    const PurchaseMasterReportColumns = useMemo<TableColumn[]>(() => [

        {
            key: "ProjectName",
            label: "Project Name",
            width: "16",
            sortable: false,
            align: "left",
            fixed: "left",
            render: (value) => value || "-",
        },
        {
            key: 'SystemGeneratedCode',
            label: 'MR Code',
            sortable: false,
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
            key: 'PurchaseCreatedDate',
            label: 'PO Created Date',
            width: '14',
            sortable: false,
            align: 'center',
            render: value => (value ? formatDate_dd_MonthName_yy(value) : '-')
        },
        {
            key: "MaterialCode",
            label: "Material Code",
            width: "15",
            sortable: false,
            align: "left",
            render: (value) => value || "-",
        },

        {
            key: "MaterialName",
            label: "Material Name",
            width: "15",
            sortable: false,
            align: "left",
            render: (value) => value || "-",
        },

        {
            key: "SubMaterialName",
            label: "Sub Material Name",
            width: "15",
            sortable: false,
            align: "left",
            render: (value) => value || "-",
        },

        {
            key: "UomCode",
            label: "Uom",
            width: "15",
            sortable: false,
            align: "left",
            render: (_, row) => row?.UomCode ? `${row.UomCode} (${row?.Uom || "-"})` : "-",
        },

        {
            key: 'RequiredDate',
            label: 'Required Date',
            width: '14',
            sortable: false,
            align: 'center',
            render: value => (value ? formatDate_dd_MonthName_yy(value) : '-')
        },
        {
            key: "MaterialQuantity",
            label: "Quantity",
            align: "right",
            width: "30",
            render: (value, row) => {
                return `${value ?? 0} ${row.UomCode ?? ""}`.trim();
            }
        },
        {
            key: "MaterialReceivedQuantityTillDate",
            label: "Received Quantity",
            align: "right",
            width: "30",
            render: (value, row) => {
                return `${value ?? 0} ${row.UomCode ?? ""}`.trim();
            }
        },


        {
            key: 'Amount',
            label: 'Amount (₹)',
            width: '15',
            sortable: false,
            align: 'right',
            render: (value) => value ? `${value} ₹` : '-'
        },
        {
            key: 'CreatedDate',
            label: 'Created Date',
            width: '12',
            sortable: false,
            align: 'center',
            render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : '-'
        },
        {
            key: 'CreatedBy',
            label: 'Created By',
            width: '10',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },


    ], []);

    const handlePageChange = useCallback((page: number) => {
        loadingPurchaseMasterReport(page, filters, sortInfo, searchTerm);
    }, [sortInfo, searchTerm]);

    const PurchaseMasterReportPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    );

    const PurchaseMasterReportForTable = useMemo(() => purchaseMasterReportList, [purchaseMasterReportList]);

    const applyFilters = () => {
        setFilters(tempFilters);
        setPagination({ currentPage: 1 });

        loadingPurchaseMasterReport(1, tempFilters, sortInfo, searchTerm);
        setShowFilterPopup(false);
    };

    const clearFilters = () => {
        setTempFilters({});
        setFilters({});
        setPagination({ currentPage: 1 });
        loadingPurchaseMasterReport(1, {}, sortInfo, searchTerm);
    };

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }

    const handleExportPurchaseMasterReport = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationPurchaseMasterReport = {

                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectName: searchTerm?.trim() || filters?.ProjectName?.trim() || undefined,
                    SystemGeneratedCode: filters?.SystemGeneratedCode ?? undefined,
                    VendorName: filters.VendorName?.trim() ?? undefined,
                    MaterialName: filters.MaterialName?.trim() ?? undefined,
                    SubMaterialName: filters.SubMaterialName?.trim() ?? undefined,
                    FromDate: filters?.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.FromDate) || undefined : undefined,
                    ToDate: filters?.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.ToDate) || undefined : undefined,
                    SortBy: getSortByParam(sortInfo ?? null, PurchaseMasterReportColumns),
                    ExportType: exportType,

                };

                const response = await purchaseMasterReportService.apiCallPullPurchaseMasterReport(params);

                handleExportFile(response, exportType, 'Purchase Master Report', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportPurchaseMasterReportExcel = () => handleExportPurchaseMasterReport('Excel')
    const handleExportPurchaseMasterReportPdf = () => handleExportPurchaseMasterReport('PDF')

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
                onClearSearch={clearSearchPurchaseMasterReport}

                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters);
                    setShowFilterPopup(true);
                }}

                isShowExportButton={canExport && PurchaseMasterReportForTable.length > 0}
                onExportExcel={handleExportPurchaseMasterReportExcel}
                onExportPdf={handleExportPurchaseMasterReportPdf}
                exportLoading={isLoading}
            />

            <CustomTable
                data={PurchaseMasterReportForTable}
                columns={PurchaseMasterReportColumns}
                pagination={PurchaseMasterReportPaginationInfo}
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
                title="Filter - Purchase Master Report"
                onSubmit={e => {
                    e.preventDefault();
                    applyFilters();
                }}
                saveText="Apply"
                cancelText="Clear"
                onCancel={() => clearFilters()}
                size="small-half"
            >
                <div className="space-y-4">
                    <div>
                        <Input type="text"
                            label='Project Name'
                            value={tempFilters?.ProjectName ?? ''}
                            onChange={e => handleFilterChange('ProjectName', e.target.value)}
                            placeholder="Enter Project Name" />
                    </div>
                    <div>

                        <Input type="text"
                            label='MR Code'
                            value={tempFilters?.SystemGeneratedCode ?? ''}
                            onChange={e => handleFilterChange('SystemGeneratedCode', e.target.value)}
                            placeholder="Enter MR Code" />
                    </div>
                    <div>
                        <Input type="text"
                            label='Material Name'
                            value={tempFilters?.MaterialName ?? ''}
                            onChange={e => handleFilterChange('MaterialName', e.target.value)}
                            placeholder="Enter Material Name" />
                    </div>
                    <div>
                        <Input type="text"
                            label='Sub Material Name'
                            value={tempFilters?.SubMaterialName ?? ''}
                            onChange={e => handleFilterChange('SubMaterialName', e.target.value)}
                            placeholder="Enter Sub Material Name" />
                    </div>
                    
                    <div>
                        <Input type="text"
                            label='Vendor Name'
                            value={tempFilters?.VendorName ?? ''}
                            onChange={e => handleFilterChange('VendorName', e.target.value)}
                            placeholder="Enter Vendor Name" />
                    </div>


                    <div>
                        <DatePickerInput
                            label='From Date'
                            value={tempFilters.FromDate || ''}
                            onChange={value => handleFilterChange('FromDate', value || '')}
                            placeholder="Select From Date"
                        />
                    </div>

                    <div>
                        <DatePickerInput
                            label='To Date'
                            value={tempFilters.ToDate || ''}
                            onChange={value => handleFilterChange('ToDate', value || '')}
                            placeholder="Select To Date"
                        />
                    </div>



                </div>
            </Modal>
        </div>
    )
}
export default PurchaseMasterReport;