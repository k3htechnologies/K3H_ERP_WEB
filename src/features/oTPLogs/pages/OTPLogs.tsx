import { runApiWithLoader } from "@/core/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type FilterWithPaginationOTPLogsRequest, type OTPLogsData } from "@/features/oTPLogs/models/OTPLogsModel";
import { oTPLogsService } from "@/features/oTPLogs/services/OTPLogsService";
import * as E from 'fp-ts/Either';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { Loader } from "@/core/utils/loader";
import usePagination from "@/core/hooks/usePagination";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import useToast from "@/core/hooks/useToast";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd } from "@/core/utils/dateFormat";
import { updateFilter } from "@/core/utils/filterHelper";
import { Button, Input } from "@/ui/components/forms";
import { filterNumbers } from "@/core/utils/fileValidation";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { Modal } from "@/ui/components/Modal/Modal";
import { handleExportFile } from "@/core/utils/exportFile";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Copy } from "lucide-react";
import { copyToClipboard } from "@/core/utils/comman";
import TooltipText from "@/ui/components/Tooltip/TooltipText";

export const OTPLogs: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [oTPLogsDataList, setOTPLogsList] = useState<OTPLogsData[]>([]);
    const { pagination, setPagination } = usePagination(20);
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [filters, setFilters] = useState<FilterInfo>({});
    const { canExport } = useMenuPermissions();

    useEffect(() => {

        loadingOTPLogs(1, filters, sortInfo, searchTerm);
    }, []);

    const searchOTPLogs = async (searchValue: string) => {
        setSearchTerm(searchValue);
        await loadingOTPLogs(1, filters, sortInfo, searchValue);
    };

    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchOTPLogs(value)
    }, 350);

    useEffect(() => {
        return () => {

            debouncedSearch.cancel?.()
        }
    }, [debouncedSearch])

    const loadingOTPLogs = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
        runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationOTPLogsRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    MobileNumber: searchtext || filterParams.MobileNumber?.trim() || undefined,
                    Module: filterParams.Module?.trim() || undefined,
                    FromDate: filterParams.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) || undefined : undefined,
                    ToDate: filterParams.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) || undefined : undefined,
                    SortBy: getSortByParam(sortInfo ?? null, OTPLogsColumns)
                }

                const response = await oTPLogsService.apiCallPullOTPLogs(params);

                if (E.isRight(response)) {

                    setOTPLogsList(response.right.Data);

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
            'Loading OTP Logs '
        )
    }

    const clearSearchOTPLogs = () => {
        setSearchTerm('');
        debouncedSearch.cancel?.();
        setPagination({ currentPage: 1 });
        loadingOTPLogs(1, filters, sortInfo, '');
    };

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        loadingOTPLogs(1, filters, sort, searchTerm);
    }, [searchTerm]);

    const OTPLogsColumns = useMemo<TableColumn[]>(() => [
        {
            key: "Module",
            label: "Module",
            width: '15',
            align: "left",
            sortable: true,
            render: value => value || "-"
        },
        {
            key: "MobileNumber",
            label: "Mobile Number",
            width: '15',
            align: "left",
            sortable: false,
            render: value => `+91 ${value}` || "-"
        },
        {
            key: "OTP",
            label: "OTP",
            width: '15',
            align: 'left',
            sortable: false,
            render: (value) => {
                return (
                    <div className="flex items-center gap-2">

                        <TooltipText
                            text={value || '-'}
                            maxWidth="150px"
                            tooltipThreshold={20}
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
    ], []);

    const handlePageChange = useCallback((page: number) => {
        loadingOTPLogs(page, filters, sortInfo, searchTerm);
    }, [sortInfo, searchTerm]);

    const OTPLogsPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    );

    const OTPLogsForTable = useMemo(() => oTPLogsDataList, [oTPLogsDataList]);

    const applyFilters = () => {
        setFilters(tempFilters);
        setPagination({ currentPage: 1 });

        loadingOTPLogs(1, tempFilters, sortInfo, searchTerm);
        setShowFilterPopup(false);
    };

    const clearFilters = () => {
        setTempFilters({});
        setFilters({});
        setPagination({ currentPage: 1 });
        loadingOTPLogs(1, {}, sortInfo, searchTerm);
    };

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }

    const handleExportOTPLogs = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationOTPLogsRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    MobileNumber: filters.MobileNumber?.trim() || undefined,
                    FromDate: filters.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.FromDate) || undefined : undefined,
                    ToDate: filters.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.ToDate) || undefined : undefined,
                    SortBy: getSortByParam(sortInfo ?? null, OTPLogsColumns),
                    ExportType: exportType
                };

                const response = await oTPLogsService.apiCallPullOTPLogs(params);

                handleExportFile(response, exportType, 'OTP Logs', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportOTPLogsExcel = () => handleExportOTPLogs('Excel')
    const handleExportOTPLogsPdf = () => handleExportOTPLogs('PDF')

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Mobile Number"
                onSearchChange={v => {
                    setSearchTerm(v);
                    debouncedSearch(v);
                }}
                onClearSearch={clearSearchOTPLogs}

                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters);
                    setShowFilterPopup(true);
                }}

                isShowExportButton={canExport && OTPLogsForTable.length > 0}
                onExportExcel={handleExportOTPLogsExcel}
                onExportPdf={handleExportOTPLogsPdf}
                exportLoading={isLoading}
            />

            <DataTable
                data={OTPLogsForTable}
                columns={OTPLogsColumns}
                pagination={OTPLogsPaginationInfo}
                recordsPerPage={20}
                emptyMessage="No OTP Logs Data Found"
                fixedHeight={true}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
                loading={isLoading}
            />

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - OTP Logs"
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
                            label="Module Name"
                            value={tempFilters?.Module ?? ''}
                            onChange={e => handleFilterChange('Module', e.target.value)}
                            placeholder="Enter Module Name"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Mobile Number"
                            value={tempFilters?.MobileNumber ?? ''}
                            onChange={e => handleFilterChange('MobileNumber', filterNumbers(e.target.value))}
                            placeholder="Enter Mobile Number"
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
export default OTPLogs;