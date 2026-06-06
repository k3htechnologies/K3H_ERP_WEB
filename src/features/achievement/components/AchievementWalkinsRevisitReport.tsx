import { useCallback, useEffect, useMemo, useState } from "react";
import { runApiWithLoader } from "@/core/utils";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import {  type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import usePagination from "@/core/hooks/usePagination";
import * as E from 'fp-ts/Either';
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { Loader } from "@/core/utils/loader";
import { handleExportFile } from "@/core/utils/exportFile";
import type {  FilterWithPaginationClickAchievementRequest } from "@/features/achievement/models/AchievementReportModel";
import { achievementReportService } from "@/features/achievement/services/AchievementReportService";
import useToast from "@/core/hooks/useToast";
import { CustomTable } from "@/ui/components/DataTable/CustomTable";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import type { EnquiryData } from "@/features/enquiry/models/EnquiryModel";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { getFollowUpColor, getStatusColor } from "@/features/enquiry/pages/Status";
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

export const AchievementWalkinsRevisitReport: React.FC<Props> = ({ filterType, fromDate, toDate ,projectId,employeeId, tabName, columnKey}) => {

    const [WalkinsRevisitList, setWalkinsRevisitList] = useState<EnquiryData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const { canExport } = useMenuPermissions();
    const { addToast } = useToast();
    const { pagination, setPagination } = usePagination(20);
    const [isShowCustomizeWalkinsRevisitColumnsModal, setIsShowCustomizeWalkinsRevisitColumnsModal] = useState(false);

    const loadWalkinsRevisitData = useCallback(async (page: number = pagination.currentPage) => {

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

                const response = await achievementReportService.apiCallPullWalkinsRevisitReport(params);

                if (E.isRight(response)) {

                    setWalkinsRevisitList(response.right.Data);

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
            'Loading Report'
        );

    }, [pagination.pageSize, addToast, setPagination, filterType, fromDate, toDate]);

    useEffect(() => {

        loadWalkinsRevisitData(1);

    }, [filterType, fromDate, toDate, sortInfo]);


    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadWalkinsRevisitData(page);
    };

    const handleSortColumn = useCallback((sort: SortInfo) => {

        setSortInfo(sort);
        setPagination({ currentPage: 1 });

    }, []);

    const handleExportWalkinsRevisit = async (exportType: 'Excel' | 'PDF') => {
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

                const response = await achievementReportService.apiCallPullWalkinsRevisitReport(params);

                handleExportFile(response, exportType, 'Walkins Revisit', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportWalkinsRevisitExcel = () => handleExportWalkinsRevisit('Excel');
    const handleExportWalkinsRevisitPdf = () => handleExportWalkinsRevisit('PDF');

    const WalkinsRevisitColumns = useMemo<TableColumn[]>(() => [

        {
            key: 'SystemGeneratedCode',
            label: 'Enquiry Code',
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
            key: 'ProjectName',
            label: 'Project Name',
            width: '15',
            sortable: true,
            align: 'left',
            render: value => value || ''
        },
        {
            key: 'Name',
            label: 'Name',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },

        {
            key: 'MobileNumber',
            label: 'Mobile Number',
            width: '14',
            sortable: false,
            align: 'left',
            render: (value, row) => value ? `${row.MobileNumberCountryCode || "+91"} ${value}` : '-'

        },
        {
            key: 'EnquiryDate',
            label: 'Enquiry Date',
            width: '12',
            sortable: false,
            align: 'center',
            render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : '-'
        },
        {
            key: 'EnquiryTimeIn',
            label: 'Enquiry Time',
            width: '14',
            sortable: false,
            align: 'left',
            render: (value, row) => value + ' - ' + row.EnquiryTimeOut || '-'
        },

        {
            key: 'EnquiryFollowUpDays',
            label: 'Enquiry Follow Up Days',
            width: '14',
            sortable: false,
            align: 'left',
            render: (value) => {
                const { text } = getFollowUpColor(value);

                return (
                    <span
                        className="inline-block px-2 py-1 rounded-full whitespace-nowrap"
                        style={{
                            color: text
                        }}
                    >
                        {value || "-"}
                    </span>
                );
            }
        },
        {
            key: 'NextFollowUpDate',
            label: 'Next Follow-Up Date',
            width: '12',
            sortable: false,
            align: 'center',
            render: (value?: string) =>
                value ? formatDate_dd_MonthName_yy(value) : '-'
        },
        {
            key: 'FinalStage',
            label: 'Stage',
            width: '14',
            sortable: false,
            align: 'left',
            render: (value) => {
                const { bg, text } = getStatusColor(value);

                return (
                    <span
                        className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                        style={{
                            backgroundColor: bg,
                            color: text
                        }}
                    >
                        {value || "-"}
                    </span>
                );
            }
        },
        {
            key: 'EmailId',
            label: 'Email-Id',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'OccupationType',
            label: 'Occupation Type',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'Accommodation',
            label: 'Accommodation',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'Budget',
            label: 'Budget (In CR)',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'Requirement',
            label: 'Requirement',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'RequirementType',
            label: 'Requirement Type',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'AreaPreferred',
            label: 'Area Preferred',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'PossessionType',
            label: 'Possession Type',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'Timeline',
            label: 'Timeline Of Purchase',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'Ethnicity',
            label: 'Ethnicity',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'Source',
            label: 'Source',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'SubSource',
            label: 'Sub Source',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'SubSubSource',
            label: 'Sub Sub Source',
            width: '14',
            sortable: false,
            align: 'left',
            render: (value, row) => row?.Source === 'Channel Partner' ? '-' : value || '-'
        },
        {
            key: 'ChannelPartnerName',
            label: 'Channel Partner Name',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'ChannelPartnerCompany',
            label: 'Channel Partner Company',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'ChannelPartnerMobileNumber',
            label: 'Channel Partner Mobile No',
            width: '14',
            sortable: false,
            align: 'left',
            render: (value, row) => value ? `${row.ChannelPartnerMobileNumberCountryCode || "+91"} ${value}` : '-'
        },
        {
            key: 'CustomerClassification',
            label: 'Customer Classification',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'Nationality',
            label: 'Nationality',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'DateOfBirth',
            label: 'Date Of Birth',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value ? formatDate_dd_MonthName_yy(value) : '-'
        },
        {
            key: 'DesiredFloorBand',
            label: 'Desired Floor Band',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },

        {
            key: 'SourceOfFunding',
            label: 'Source Of Funding',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },

        {
            key: 'FinalStageDetail',
            label: 'Stage Detail',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },

        {
            key: 'SalesAdvisor',
            label: 'Sales Advisor',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'SourcingManager',
            label: 'Sourcing Manager',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
       

    ], []);

    const WalkinsRevisitPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
    )
    const WalkinsRevisitForTable = useMemo(() => WalkinsRevisitList, [WalkinsRevisitList]);

    const requiredWalkinsRevisitColumnKeys: string[] = ['EmployeeName'];

    const allWalkinsRevisitColumnKeys: string[] = WalkinsRevisitColumns.map(c => c.key);

    const [selectedWalkinsRevisitColumnKeys, setSelectedWalkinsRevisitColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getAchievementByWalkinsRevisitTableColumns?.();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]

                const withRequired = Array.from(new Set([...parsed, ...requiredWalkinsRevisitColumnKeys]));

                return withRequired.filter(k => allWalkinsRevisitColumnKeys.includes(k));
            }
        } catch { }
        return allWalkinsRevisitColumnKeys;
    });

    useEffect(() => {
        setSelectedWalkinsRevisitColumnKeys(prev => Array.from(new Set([...prev, ...requiredWalkinsRevisitColumnKeys])).filter(k => allWalkinsRevisitColumnKeys.includes(k)));
    }, [WalkinsRevisitColumns.length])

    const visibleWalkinsRevisitColumns = useMemo(
        () => WalkinsRevisitColumns.filter(col => selectedWalkinsRevisitColumnKeys.includes(col.key)),
        [WalkinsRevisitColumns, selectedWalkinsRevisitColumnKeys]
    );

    return (
        <div>

            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <TableActionToolbar
                isShowSearchBar={false}

                isShowFilterButton={false}

                isShowCustomizeButton
                onCustomize={() => setIsShowCustomizeWalkinsRevisitColumnsModal(true)}

                // EXPORT
                isShowExportButton={canExport && WalkinsRevisitForTable.length > 0}
                onExportExcel={handleExportWalkinsRevisitExcel}
                onExportPdf={handleExportWalkinsRevisitPdf}
                exportLoading={isLoading}
            />

            <CustomizeColumnsModal
                isOpen={isShowCustomizeWalkinsRevisitColumnsModal}
                onClose={() => setIsShowCustomizeWalkinsRevisitColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredWalkinsRevisitColumnKeys])
                    );
                    setSelectedWalkinsRevisitColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeAchievementByWalkinsRevisitTableColumns?.(
                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={WalkinsRevisitColumns}
                selectedKeys={selectedWalkinsRevisitColumnKeys}
                requiredKeys={requiredWalkinsRevisitColumnKeys}
                title="Customize Table Columns"
            />

            <CustomTable
                data={WalkinsRevisitForTable}
                columns={visibleWalkinsRevisitColumns}
                pagination={WalkinsRevisitPaginationInfo}
                emptyMessage="No Achievement By Walkins Revisit Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />
        </div>
    );
};
export default AchievementWalkinsRevisitReport;
