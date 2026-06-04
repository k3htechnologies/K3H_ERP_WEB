import { useCallback, useEffect, useMemo, useState } from "react";
import { runApiWithLoader } from "@/core/utils";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import usePagination from "@/core/hooks/usePagination";
import * as E from 'fp-ts/Either';
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { Loader } from "@/core/utils/loader";
import { handleExportFile } from "@/core/utils/exportFile";
import type { FilterWithPaginationClickAchievementRequest, IBMOBMReportData } from "@/features/achievement/models/AchievementReportModel";
import { achievementReportService } from "@/features/achievement/services/AchievementReportService";
import useToast from "@/core/hooks/useToast";
import { CustomTable } from "@/ui/components/DataTable/CustomTable";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { Copy } from "lucide-react";
import { Button } from "@/ui/components/forms";
import { copyToClipboard } from "@/core/utils/comman";
import TooltipText from "@/ui/components/Tooltip/TooltipText";

interface Props {
    filterType: string;
    fromDate: string | null;
    toDate: string | null;
    projectId?: number;
    employeeId?: number;
    tabName?: string;
    columnKey?: string;
}

export const AchievementIbmObmReport: React.FC<Props> = ({ filterType, fromDate, toDate, projectId,employeeId, tabName, columnKey }) => {

    const [bookingList, setIbmObmList] = useState<IBMOBMReportData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const { canExport } = useMenuPermissions();
    const { addToast } = useToast();
    const { pagination, setPagination } = usePagination(20);
    const [isShowCustomizeIbmObmColumnsModal, setIsShowCustomizeIbmObmColumnsModal] = useState(false);

    const loadIbmObmData = useCallback(async (page: number = pagination.currentPage) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationClickAchievementRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId) || 0,
                    EmployeeId: Number(employeeId) || 0,
                    FilterType: filterType.trim() || undefined,
                    FromDate: fromDate ? fromDate || undefined : undefined,
                    ToDate: toDate ? toDate || undefined : undefined,
                    TabName: tabName,
                    ColumnName: columnKey
                };

                const response = await achievementReportService.apiCallPullIBMOBMReport(params);

                if (E.isRight(response)) {

                    setIbmObmList(response.right.Data);

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });

                } else {

                    addToast({ type: 'error', title: response.left.message });

                }
            },
            undefined,
            (error: any) =>
                addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Achievement By Sourcing'
        );

    }, [pagination.pageSize, addToast, setPagination, filterType, fromDate, toDate]);

    useEffect(() => {

        loadIbmObmData(1);

    }, [filterType, fromDate, toDate, sortInfo]);


    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadIbmObmData(page);
    };

    const handleSortColumn = useCallback((sort: SortInfo) => {

        setSortInfo(sort);
        setPagination({ currentPage: 1 });

    }, []);

    const handleExportIbmObm = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationClickAchievementRequest = {

                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: Number(projectId) || 0,
                    EmployeeId: Number(employeeId) || 0,
                    FilterType: filterType.trim() || undefined,
                    FromDate: fromDate ? fromDate || undefined : undefined,
                    ToDate: toDate ? toDate || undefined : undefined,
                    TabName: tabName,
                    ColumnName: columnKey,
                    ExportType: exportType
                };

                const response = await achievementReportService.apiCallPullIBMOBMReport(params);

                handleExportFile(response, exportType, 'IBM-OBM', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportIbmObmExcel = () => handleExportIbmObm('Excel');
    const handleExportIbmObmPdf = () => handleExportIbmObm('PDF');

    const ibmObmColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: 'SystemGeneratedCode',
                label: 'CP Code',
                width: '20',
                sortable: false,
                fixed: 'left',
                align: 'left',
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

            {
                key: 'Name',
                label: 'Name',
                width: '20',
                sortable: true,
                align: 'left',
                render: value => value || '-'
            },
            {
                key: 'FirmsType',
                label: 'Firm Type',
                width: '15',
                sortable: false,
                align: 'left',
                render: (value) => value || '-'
            },
            {
                key: 'Type',
                label: 'Type',
                width: '15',
                sortable: false,
                align: 'left',
                render: (value) => value || '-'
            },
            {
                key: 'Designation',
                label: 'Designation',
                width: '15',
                sortable: false,
                align: 'left',
                render: (value) => value || '-'
            },
            {
                key: 'RERANumber',
                label: 'RERA Number',
                width: '12',
                sortable: false,
                align: 'left',
                render: (value) => value || '-'
            },
            {
                key: 'GSTNumber',
                label: 'GST Number',
                width: '15',
                sortable: false,
                align: 'left',
                render: (value) => value || '-'
            },
            {
                key: 'Speciality',
                label: 'Speciality',
                width: '15',
                sortable: false,
                align: 'left',
                render: (value) => value || '-'
            },
            {
                key: 'OfficeAddress',
                label: 'Office Address',
                width: '12',
                sortable: false,
                align: 'left',
                render: (value) => value || '-'
            },
            {
                key: 'IBM_OBM',
                label: 'IBM OBM',
                width: '12',
                sortable: false,
                align: 'left',
                render: (value) => value || '-'
            },
            {
                key: 'SourcingRemark',
                label: 'Sourcing Remark',
                width: '12',
                sortable: false,
                align: 'left',
                render: (value) => value || '-'
            },

            {
                key: 'Support',
                label: 'Support',
                width: '12',
                sortable: false,
                align: 'left',
                render: (value) => value || '-'
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
            {
                key: 'ModifiedDate',
                label: 'Modified Date',
                width: '12',
                sortable: false,
                align: 'center',
                render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : '-'
            },
            {
                key: 'ModifiedBy',
                label: 'Modified By',
                width: '10',
                sortable: false,
                align: 'left',
                render: value => value || '-'
            },

        ],
        []
    );

    const IbmObmPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
    )
    const IbmObmForTable = useMemo(() => bookingList, [bookingList]);

    const requiredIbmObmColumnKeys: string[] = ['EmployeeName'];

    const allIbmObmColumnKeys: string[] = ibmObmColumns.map(c => c.key);

    const [selectedIbmObmColumnKeys, setSelectedIbmObmColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getAchievementByIbmObmTableColumns?.();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]

                const withRequired = Array.from(new Set([...parsed, ...requiredIbmObmColumnKeys]));

                return withRequired.filter(k => allIbmObmColumnKeys.includes(k));
            }
        } catch { }
        return allIbmObmColumnKeys;
    });

    useEffect(() => {
        setSelectedIbmObmColumnKeys(prev => Array.from(new Set([...prev, ...requiredIbmObmColumnKeys])).filter(k => allIbmObmColumnKeys.includes(k)));
    }, [ibmObmColumns.length])

    const visibleIbmObmColumns = useMemo(
        () => ibmObmColumns.filter(col => selectedIbmObmColumnKeys.includes(col.key)),
        [ibmObmColumns, selectedIbmObmColumnKeys]
    );

    return (
        <div>

            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <TableActionToolbar
                isShowSearchBar={false}

                isShowFilterButton={false}

                isShowCustomizeButton
                onCustomize={() => setIsShowCustomizeIbmObmColumnsModal(true)}

                // EXPORT
                isShowExportButton={canExport && IbmObmForTable.length > 0}
                onExportExcel={handleExportIbmObmExcel}
                onExportPdf={handleExportIbmObmPdf}
                exportLoading={isLoading}
            />

            <CustomizeColumnsModal
                isOpen={isShowCustomizeIbmObmColumnsModal}
                onClose={() => setIsShowCustomizeIbmObmColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredIbmObmColumnKeys])
                    );
                    setSelectedIbmObmColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeAchievementByIbmObmTableColumns?.(
                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={ibmObmColumns}
                selectedKeys={selectedIbmObmColumnKeys}
                requiredKeys={requiredIbmObmColumnKeys}
                title="Customize Table Columns"
            />

            <CustomTable
                data={IbmObmForTable}
                columns={visibleIbmObmColumns}
                pagination={IbmObmPaginationInfo}
                emptyMessage="No Data Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />
        </div>
    );
};
export default AchievementIbmObmReport;
