import { useCallback, useEffect, useMemo, useState } from "react";
import { runApiWithLoader } from "@/core/utils";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import usePagination from "@/core/hooks/usePagination";
import * as E from 'fp-ts/Either';
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { Loader } from "@/core/utils/loader";
import { handleExportFile } from "@/core/utils/exportFile";
import useToast from "@/core/hooks/useToast";
import { CustomTable } from "@/ui/components/DataTable/CustomTable";
import { Modal } from "@/ui/components/Modal/Modal";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import AchievementWalkinsRevisitReport from "@/features/aopAchievement/components/AchievementWalkinsRevisitReport";
import AchievementBookingReport from "@/features/aopAchievement/components/AchievementBookingReport";
import AchievementIbmObmReport from "@/features/aopAchievement/components/AchievementIbmObmReport";
import type { ChannelPartnerAOPAchievementData, FilterWithPaginationAopAchievementRequest } from "../models/AopAchievementReportModel";
import { aopAchievementReportService } from "../services/AopAchievementReportService";
import { Button } from "@/ui/components/forms";
import { copyToClipboard } from "@/core/utils/comman";
import { Copy } from "lucide-react";
import TooltipText from "@/ui/components/Tooltip/TooltipText";

interface Props {
    filterType: string;
    fromDate: string | null;
    toDate: string | null;
}

export const AchievementByChannelPartner: React.FC<Props> = ({ filterType, fromDate, toDate }) => {

    const [channelPartnerAOPAchievementList, setChannelPartnerAOPAchievementList] = useState<ChannelPartnerAOPAchievementData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const { canExport } = useMenuPermissions();
    const { addToast } = useToast();
    const { pagination, setPagination } = usePagination(20);

    const [selectedColumnClickWalkingRevisit, setSelectedColumnClickWalkingRevisit] = useState<any>(null);
    const [selectedColumnClickBooking, setSelectedColumnClickBooking] = useState<any>(null);
    const [selectedColumnClickIbmObm, setSelectedColumnClickIbmObm] = useState<any>(null);

    const [isShowCustomizeAchievementByChannelPartnerColumnsModal, setIsShowCustomizeAchievementByChannelPartnerColumnsModal] = useState(false);

    const loadAopAchievementByChannelPartnerData = useCallback(async (page: number = pagination.currentPage, sort?: SortInfo, searchText?: string) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationAopAchievementRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    Name: searchText?.trim() || undefined,
                    FilterType: filterType.trim() || undefined,
                    FromDate: fromDate ? fromDate || undefined : undefined,
                    ToDate: toDate ? toDate || undefined : undefined,
                    SortBy: getSortByParam(sort ?? null, AopAchievementByChannelPartnerColumns),
                };

                const response = await aopAchievementReportService.apiCallPullAOPAchievementReport(params);

                if (E.isRight(response)) {

                    setChannelPartnerAOPAchievementList(response.right.Data);

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
            'Loading Achievement By Channel Partner'
        );
    },
        [pagination.currentPage, pagination.pageSize, addToast, setPagination,]);

    useEffect(() => {

        loadAopAchievementByChannelPartnerData(1, sortInfo, searchTerm);

    }, [filterType, fromDate, toDate]);


    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        loadAopAchievementByChannelPartnerData(1, sortInfo, value)
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setPagination({ currentPage: 1 });
        loadAopAchievementByChannelPartnerData(1, sortInfo, '');
    }

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadAopAchievementByChannelPartnerData(page, sortInfo, searchTerm);
    };

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        setPagination({ currentPage: 1 });
        loadAopAchievementByChannelPartnerData(1, sort, searchTerm);
    }, [searchTerm]);

    const handleExportAchievementByChannelPartner = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationAopAchievementRequest = {

                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    Name: searchTerm?.trim() || undefined,
                    FilterType: filterType.trim() || undefined,
                    FromDate: fromDate ? fromDate || undefined : undefined,
                    ToDate: toDate ? toDate || undefined : undefined,
                    ExportType: exportType
                };

                const response = await aopAchievementReportService.apiCallPullAOPAchievementReport(params);

                handleExportFile(response, exportType, 'AOP Achievement By Channel Partner', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportAchievementByChannelPartnerExcel = () => handleExportAchievementByChannelPartner('Excel');
    const handleExportAchievementByChannelPartnerPdf = () => handleExportAchievementByChannelPartner('PDF');


    const handleColumnClickWalkingRevisit = (row: ChannelPartnerAOPAchievementData, tabName: string, columnKey: string,) => {
        setSelectedColumnClickWalkingRevisit({
            channelPartnerId: row.ChannelPartnerId,
            channelPartnerName: row.Name,
            tabName: tabName,
            columnKey: columnKey
        });
    };

    const handleColumnClickBooking = (row: ChannelPartnerAOPAchievementData, tabName: string, columnKey: string,) => {
        setSelectedColumnClickBooking({
            channelPartnerId: row.ChannelPartnerId,
            channelPartnerName: row.Name,
            tabName: tabName,
            columnKey: columnKey
        });
    };

    const handleColumnClickIbmObm = (row: ChannelPartnerAOPAchievementData, tabName: string, columnKey: string,) => {
        setSelectedColumnClickIbmObm({
            channelPartnerId: row.ChannelPartnerId,
            channelPartnerName: row.Name,
            tabName: tabName,
            columnKey: columnKey
        });
    };

    const AopAchievementByChannelPartnerColumns = useMemo<TableColumn[]>(() => [

        {
            key: 'Name',
            label: 'Name',
            width: '15',
            sortable: true,
            fixed: 'left',
            align: 'left',

            render: (value) => {

                return (
                    <div className="flex items-center justify-between w-full gap-2">

                        <span className="text-black-600 truncate">
                            {value}
                        </span>

                    </div>
                );
            }
        },
        {
            key: 'SystemGeneratedCode',
            label: 'CP Code',
            sortable: false,
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
            key: 'Type',
            label: 'Type',
            width: '25',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'WalkinsByCP',
            label: 'Walkins By CP',
            width: '15',
            sortable: false,
            align: 'center',
            theadStyle: {
                backgroundColor: '#FFF',
                color: '#64748B'
            },
            tdStyle: {
                backgroundColor: '#EEF5FF'
            },

            render: (value, row) => {

                const isClickable = (value ?? 0) > 0;

                return (
                    <span
                        className={
                            isClickable
                                ? "cursor-pointer text-blue-600 hover:underline"
                                : "text-gray-400 cursor-not-allowed"
                        }
                        onClick={() => {
                            if (!isClickable) return;
                            handleColumnClickWalkingRevisit(row, 'PROJECT', 'WALKINS BY CP')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }
        },

        {
            key: 'TotalFreshVisits',
            label: 'Fresh Visits',
            width: '15',
            sortable: false,
            align: 'center',
            theadStyle: {
                backgroundColor: '#FFF',
                color: '#64748B'
            },
            tdStyle: {
                backgroundColor: '#EEF5FF'
            },
            render: (value, row) => {

                const isClickable = (value ?? 0) > 0;

                return (
                    <span
                        className={
                            isClickable
                                ? "cursor-pointer text-blue-600 hover:underline"
                                : "text-gray-400 cursor-not-allowed"
                        }
                        onClick={() => {
                            if (!isClickable) return;
                            handleColumnClickWalkingRevisit(row, 'PROJECT', 'FRESH VISITS')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }
        },
        {
            key: 'Revisits',
            label: 'Revisits',
            width: '15',
            sortable: false,
            align: 'center',
            theadStyle: {
                backgroundColor: '#FFF',
                color: '#64748B'
            },
            tdStyle: {
                backgroundColor: '#EEF5FF'
            },
            render: (value, row) => {

                const isClickable = (value ?? 0) > 0;

                return (
                    <span
                        className={
                            isClickable
                                ? "cursor-pointer text-blue-600 hover:underline"
                                : "text-gray-400 cursor-not-allowed"
                        }
                        onClick={() => {
                            if (!isClickable) return;
                            handleColumnClickWalkingRevisit(row, 'PROJECT', 'REVISITS')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }
        },

        {
            key: 'BookingByCP',
            label: 'Booking By CP',
            width: '15',
            sortable: false,
            align: 'center',
            theadStyle: {
                backgroundColor: '#FFF',
                color: '#64748B'
            },
            tdStyle: {
                backgroundColor: '#FBF5FF'
            },
            render: (value, row) => {

                const isClickable = (value ?? 0) > 0;

                return (
                    <span
                        className={
                            isClickable
                                ? "cursor-pointer text-blue-600 hover:underline"
                                : "text-gray-400 cursor-not-allowed"
                        }
                        onClick={() => {
                            if (!isClickable) return;
                            handleColumnClickBooking(row, 'PROJECT', 'BOOKING BY CP')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }
        },

        {
            key: 'TotalRevenue',
            label: 'Total Revenue (₹)',
            width: '15',
            sortable: false,
            align: 'center',
            theadStyle: {
                backgroundColor: '#FFF',
                color: '#64748B'
            },
            tdStyle: {
                backgroundColor: '#FBF5FF'
            },
            render: (value, row) => {

                const isClickable = (value ?? 0) > 0;

                return (
                    <span
                        className={
                            isClickable
                                ? "cursor-pointer text-blue-600 hover:underline"
                                : "text-gray-400 cursor-not-allowed"
                        }
                        onClick={() => {
                            if (!isClickable) return;
                            handleColumnClickBooking(row, 'PROJECT', 'TOTAL REVENUE')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }
        },
        {
            key: "IBMGroup",
            label: "Number Of IBM",
            align: "center",
            theadStyle: {
                backgroundColor: '#F0FDF4',
                color: '#60D669'
            },
            children: [
                {
                    key: 'TotalIBM',
                    label: 'IBM',
                    width: '15',
                    sortable: false,
                    align: 'center',
                    theadStyle: {
                        backgroundColor: '#FFF',
                        color: '#64748B'
                    },
                    tdStyle: {
                        backgroundColor: '#F0FDF4'
                    },
                    render: (value, row) => {

                        const isClickable = (value ?? 0) > 0;

                        return (
                            <span
                                className={
                                    isClickable
                                        ? "cursor-pointer text-blue-600 hover:underline"
                                        : "text-gray-400 cursor-not-allowed"
                                }
                                onClick={() => {
                                    if (!isClickable) return;
                                    handleColumnClickIbmObm(row, 'PROJECT', 'IBM')
                                }}
                            >
                                {value ?? "0"}
                            </span>
                        );
                    }
                },

                {
                    key: 'IPC_IBM',
                    label: 'IPC',
                    width: '15',
                    sortable: false,
                    align: 'center',
                    theadStyle: {
                        backgroundColor: '#FFF',
                        color: '#64748B'
                    },
                    tdStyle: {
                        backgroundColor: '#F0FDF4'
                    },
                    render: (value, row) => {

                        const isClickable = (value ?? 0) > 0;

                        return (
                            <span
                                className={
                                    isClickable
                                        ? "cursor-pointer text-blue-600 hover:underline"
                                        : "text-gray-400 cursor-not-allowed"
                                }
                                onClick={() => {
                                    if (!isClickable) return;
                                    handleColumnClickIbmObm(row, 'PROJECT', 'IPC IBM')
                                }}
                            >
                                {value ?? "0"}
                            </span>
                        );
                    }
                },

                {
                    key: 'ICP_IBM',
                    label: 'ICP',
                    width: '15',
                    sortable: false,
                    align: 'center',
                    theadStyle: {
                        backgroundColor: '#FFF',
                        color: '#64748B'
                    },
                    tdStyle: {
                        backgroundColor: '#F0FDF4'
                    },
                    render: (value, row) => {

                        const isClickable = (value ?? 0) > 0;

                        return (
                            <span
                                className={
                                    isClickable
                                        ? "cursor-pointer text-blue-600 hover:underline"
                                        : "text-gray-400 cursor-not-allowed"
                                }
                                onClick={() => {
                                    if (!isClickable) return;
                                    handleColumnClickIbmObm(row, 'PROJECT', 'ICP IBM')
                                }}
                            >
                                {value ?? "0"}
                            </span>
                        );
                    }
                },

                {
                    key: 'RCP_IBM',
                    label: 'RCP',
                    width: '15',
                    sortable: false,
                    align: 'center',
                    theadStyle: {
                        backgroundColor: '#FFF',
                        color: '#64748B'
                    },
                    tdStyle: {
                        backgroundColor: '#F0FDF4'
                    },
                    render: (value, row) => {

                        const isClickable = (value ?? 0) > 0;

                        return (
                            <span
                                className={
                                    isClickable
                                        ? "cursor-pointer text-blue-600 hover:underline"
                                        : "text-gray-400 cursor-not-allowed"
                                }
                                onClick={() => {
                                    if (!isClickable) return;
                                    handleColumnClickIbmObm(row, 'PROJECT', 'RCP IBM')
                                }}
                            >
                                {value ?? "0"}
                            </span>
                        );
                    }
                },
            ]
        },
        {
            key: "OBMGroup",
            label: "Number Of OBM",
            align: "center",
            theadStyle: {
                backgroundColor: '#F0FDF4',
                color: '#60D669'
            },
            children: [

                {
                    key: 'TotalOBM',
                    label: 'OBM',
                    width: '15',
                    sortable: false,
                    align: 'center',
                    theadStyle: {
                        backgroundColor: '#FFF',
                        color: '#64748B'
                    },
                    tdStyle: {
                        backgroundColor: '#F0FDF4'
                    },
                    render: (value, row) => {

                        const isClickable = (value ?? 0) > 0;

                        return (
                            <span
                                className={
                                    isClickable
                                        ? "cursor-pointer text-blue-600 hover:underline"
                                        : "text-gray-400 cursor-not-allowed"
                                }
                                onClick={() => {
                                    if (!isClickable) return;
                                    handleColumnClickIbmObm(row, 'PROJECT', 'OBM')
                                }}
                            >
                                {value ?? "0"}
                            </span>
                        );
                    }
                },
                {
                    key: 'IPC_OBM',
                    label: 'IPC',
                    width: '15',
                    sortable: false,
                    align: 'center',
                    theadStyle: {
                        backgroundColor: '#FFF',
                        color: '#64748B'
                    },
                    tdStyle: {
                        backgroundColor: '#F0FDF4'
                    },
                    render: (value, row) => {

                        const isClickable = (value ?? 0) > 0;

                        return (
                            <span
                                className={
                                    isClickable
                                        ? "cursor-pointer text-blue-600 hover:underline"
                                        : "text-gray-400 cursor-not-allowed"
                                }
                                onClick={() => {
                                    if (!isClickable) return;
                                    handleColumnClickIbmObm(row, 'PROJECT', 'IPC IBM')
                                }}
                            >
                                {value ?? "0"}
                            </span>
                        );
                    }
                },
                {
                    key: 'ICP_OBM',
                    label: 'ICP',
                    width: '15',
                    sortable: false,
                    align: 'center',
                    theadStyle: {
                        backgroundColor: '#FFF',
                        color: '#64748B'
                    },
                    tdStyle: {
                        backgroundColor: '#F0FDF4'
                    },
                    render: (value, row) => {

                        const isClickable = (value ?? 0) > 0;

                        return (
                            <span
                                className={
                                    isClickable
                                        ? "cursor-pointer text-blue-600 hover:underline"
                                        : "text-gray-400 cursor-not-allowed"
                                }
                                onClick={() => {
                                    if (!isClickable) return;
                                    handleColumnClickIbmObm(row, 'PROJECT', 'ICP OBM')
                                }}
                            >
                                {value ?? "0"}
                            </span>
                        );
                    }
                },
                {
                    key: 'RCP_OBM',
                    label: 'RCP',
                    width: '15',
                    sortable: false,
                    align: 'center',
                    theadStyle: {
                        backgroundColor: '#FFF',
                        color: '#64748B'
                    },
                    tdStyle: {
                        backgroundColor: '#F0FDF4'
                    },
                    render: (value, row) => {

                        const isClickable = (value ?? 0) > 0;

                        return (
                            <span
                                className={
                                    isClickable
                                        ? "cursor-pointer text-blue-600 hover:underline"
                                        : "text-gray-400 cursor-not-allowed"
                                }
                                onClick={() => {
                                    if (!isClickable) return;
                                    handleColumnClickIbmObm(row, 'PROJECT', 'RCP OBM')
                                }}
                            >
                                {value ?? "0"}
                            </span>
                        );
                    }
                },
            ]
        },

        {
            key: 'TotalIBMOBM',
            label: 'IBM + OBM',
            width: '15',
            sortable: false,
            align: 'center',
            theadStyle: {
                backgroundColor: '#FFF',
                color: '#64748B'
            },
            tdStyle: {
                backgroundColor: '#F0FDF4'
            },
            render: (_, row) => {

                const value = Number(row.TotalIBM || 0) + Number(row.TotalOBM || 0);
                const isClickable = (value ?? 0) > 0;

                return (
                    <span
                        className={
                            isClickable
                                ? "cursor-pointer text-blue-600 hover:underline"
                                : "text-gray-400 cursor-not-allowed"
                        }
                        onClick={() => {
                            if (!isClickable) return;
                            handleColumnClickIbmObm(row, 'PROJECT', 'IBM + OBM')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }
        },
    ], [handleColumnClickWalkingRevisit, handleColumnClickBooking, handleColumnClickIbmObm]);


    const AchievementByChannelPartnerPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    )
    const AchievementByChannelPartnerForTable = useMemo(() => channelPartnerAOPAchievementList, [channelPartnerAOPAchievementList]);

    const requiredAchievementByChannelPartnerColumnKeys: string[] = ['Name'];

    const allAchievementByChannelPartnerColumnKeys: string[] = AopAchievementByChannelPartnerColumns.map(c => c.key);

    const [selectedAchievementByChannelPartnerColumnKeys, setSelectedAchievementByChannelPartnerColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getAchievementByChannelPartnerTableColumns?.();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]

                const withRequired = Array.from(new Set([...parsed, ...requiredAchievementByChannelPartnerColumnKeys]));

                return withRequired.filter(k => allAchievementByChannelPartnerColumnKeys.includes(k));
            }
        } catch { }
        return allAchievementByChannelPartnerColumnKeys;
    });

    useEffect(() => {
        setSelectedAchievementByChannelPartnerColumnKeys(prev => Array.from(new Set([...prev, ...requiredAchievementByChannelPartnerColumnKeys])).filter(k => allAchievementByChannelPartnerColumnKeys.includes(k)));
    }, [AopAchievementByChannelPartnerColumns.length])

    const visibleAchievementByChannelPartnerColumns = useMemo(
        () => AopAchievementByChannelPartnerColumns.filter(col => selectedAchievementByChannelPartnerColumnKeys.includes(col.key)),
        [AopAchievementByChannelPartnerColumns, selectedAchievementByChannelPartnerColumnKeys]
    );



    return (
        <div className="pt-5">

            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Channel Partner Name"
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}

                isShowFilterButton={false}

                isShowCustomizeButton
                onCustomize={() => setIsShowCustomizeAchievementByChannelPartnerColumnsModal(true)}

                // EXPORT
                isShowExportButton={canExport && AchievementByChannelPartnerForTable.length > 0}
                onExportExcel={handleExportAchievementByChannelPartnerExcel}
                onExportPdf={handleExportAchievementByChannelPartnerPdf}
                exportLoading={isLoading}
            />

            <CustomTable
                data={AchievementByChannelPartnerForTable}
                columns={visibleAchievementByChannelPartnerColumns}
                pagination={AchievementByChannelPartnerPaginationInfo}
                emptyMessage="No Achievement By Channel Partner Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            <CustomizeColumnsModal
                isOpen={isShowCustomizeAchievementByChannelPartnerColumnsModal}
                onClose={() => setIsShowCustomizeAchievementByChannelPartnerColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredAchievementByChannelPartnerColumnKeys])
                    );
                    setSelectedAchievementByChannelPartnerColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeAchievementByChannelPartnerTableColumns?.(
                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={AopAchievementByChannelPartnerColumns}
                selectedKeys={selectedAchievementByChannelPartnerColumnKeys}
                requiredKeys={requiredAchievementByChannelPartnerColumnKeys}
                title="Customize Table Columns"
            />

            {selectedColumnClickWalkingRevisit && (
                <Modal
                    isOpen={!!selectedColumnClickWalkingRevisit}
                    onClose={() => setSelectedColumnClickWalkingRevisit(null)}
                    title={
                        <div className="flex flex-col">

                            <span className="font-semibold text-base">
                                {selectedColumnClickWalkingRevisit.channelPartnerName || ""}
                            </span>
                            <span className="text-sm text-gray-500">
                                Column: {selectedColumnClickWalkingRevisit.columnKey}
                            </span>

                        </div>
                    }
                    size="large-half"
                >
                    <AchievementWalkinsRevisitReport filterType={filterType} fromDate={fromDate} toDate={toDate} channelPartnerId={selectedColumnClickWalkingRevisit?.channelPartnerId} tabName={selectedColumnClickWalkingRevisit?.tabName} columnKey={selectedColumnClickWalkingRevisit?.columnKey} />
                </Modal>
            )}

            {selectedColumnClickBooking && (
                <Modal
                    isOpen={!!selectedColumnClickBooking}
                    onClose={() => setSelectedColumnClickBooking(null)}
                    title={
                        <div className="flex flex-col">

                            <span className="font-semibold text-base">
                                {selectedColumnClickBooking.channelPartnerName || ""}
                            </span>
                            <span className="text-sm text-gray-500">
                                Column: {selectedColumnClickBooking.columnKey}
                            </span>

                        </div>
                    }
                    size="large-half"
                >
                    <AchievementBookingReport filterType={filterType} fromDate={fromDate} toDate={toDate} channelPartnerId={selectedColumnClickBooking?.channelPartnerId} tabName={selectedColumnClickBooking?.tabName} columnKey={selectedColumnClickBooking?.columnKey} />
                </Modal>
            )}

            {selectedColumnClickIbmObm && (
                <Modal
                    isOpen={!!selectedColumnClickIbmObm}
                    onClose={() => setSelectedColumnClickIbmObm(null)}
                    title={
                        <div className="flex flex-col">

                            <span className="font-semibold text-base">
                                {selectedColumnClickIbmObm.channelPartnerName || ""}
                            </span>
                            <span className="text-sm text-gray-500">
                                Column: {selectedColumnClickIbmObm.columnKey}
                            </span>

                        </div>
                    }
                    size="large-half"
                >
                    <AchievementIbmObmReport filterType={filterType} fromDate={fromDate} toDate={toDate} channelPartnerId={selectedColumnClickIbmObm?.channelPartnerId} tabName={selectedColumnClickIbmObm?.tabName} columnKey={selectedColumnClickIbmObm?.columnKey} />
                </Modal>
            )}

        </div>
    );
};
export default AchievementByChannelPartner;
