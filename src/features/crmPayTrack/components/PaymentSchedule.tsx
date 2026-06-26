import { type TableColumn } from '@/ui/components/DataTable/DataTable';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { runApiWithLoader } from '@/core/utils';
import type { AddUpdatePayTrackPaymentScheduleDemandRequest, FilterWithPaginationPaymentSchedule, FilterWithPaginationPaymentScheduleDemandSummary, PaymentScheduleModelData } from '@/features/crmPayTrack/models/PaymentScheduleModel';
import { paymentScheduleService } from '@/features/crmPayTrack/services/PaymentScheduleService';
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { Loader } from '@/core/utils/loader';
import { Button } from '@/ui/components/forms';
import { usePayTrackBookingListState } from '@/features/crmPayTrack/context/PayTrackBookingListStateContext';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { formatCurrency } from '@/core/utils/comman';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { handleExportFile } from '@/core/utils/exportFile';
import DataTableExpandable, { type DataTableExpandableRef } from '@/ui/components/DataTable/DataTableExpandable';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { data } from 'react-router-dom';

export const PaymentSchedule: React.FC = () => {
    const [paymentScheduleCrmList, setPaymentScheduleCrmList] = useState<PaymentScheduleModelData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { canAction,canExport } = useMenuPermissions('/paymentSchedule');

    const dtRef = useRef<DataTableExpandableRef | null>(null);

    const { addToast } = useToast();
    const { projectId } = useProject();

    const { listState } = usePayTrackBookingListState();
    const { bookingId, bookingApprovalStatus } = listState;

    useEffect(() => {
        if (projectId && bookingId) {

            loadPaymentScheduleCrmDetails();
        }
    }, [projectId, bookingId])

    const loadPaymentScheduleCrmDetails = async (searchText?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationPaymentSchedule = {
                    ProjectId: Number(projectId),
                    BookingId: bookingId,
                    Name: searchText?.trim() || undefined,
                };

                const response = await paymentScheduleService.apiCallPullPaymentSchedule(params);

                if (E.isRight(response)) {

                    setPaymentScheduleCrmList(response.right.Data);

                } else {
                    addToast({ type: "error", title: response.left.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message });
            },
            undefined,
            "Loading Payment Schedule"
        )
    }

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);

        if (!value.trim()) {
            loadPaymentScheduleCrmDetails('');
            return;
        }
        loadPaymentScheduleCrmDetails(value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        loadPaymentScheduleCrmDetails('')
    }

    const handleExportPayTrackPaymentScheduleExcel = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationPaymentSchedule = {
                    ProjectId: Number(projectId),
                    BookingId: bookingId,
                    ExportType: exportType
                };

                const response = await paymentScheduleService.apiCallPullPaymentSchedule(params);

                handleExportFile(response, exportType, 'Payment Schedule', addToast)
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message || 'Export failed' })
            },
            undefined,
            'Preparing Export'
        )
    }

    const handleExportPayTrackPaymentScheduleExcelFile = () => handleExportPayTrackPaymentScheduleExcel('Excel');
    const handleExportPayTrackPaymentSchedulePdfFile = () => handleExportPayTrackPaymentScheduleExcel('PDF');


    // ✅ GRAND TOTAL CALCULATION
    const totals = useMemo(() => {
        return paymentScheduleCrmList.reduce((acc, row) => {

            const amount = row.PaymentScheduleAmount || 0;
            const received = row.PaymentScheduleReceivedAmount || 0;

            const gstAmount = row.PaymentScheduleGSTAmount || 0;
            const gstReceived = row.PaymentScheduleReceivedGSTAmount || 0;

            const tdsAmount = row.PaymentScheduleTDSAmount || 0;
            const tdsReceived = row.PaymentScheduleReceivedTDSAmount || 0;

            acc.PaymentScheduleAmount += amount;
            acc.PaymentScheduleReceivedAmount += received;
            acc.PaymentSchedulePendingAmount += (amount - received);

            acc.PaymentScheduleGSTAmount += gstAmount;
            acc.PaymentScheduleReceivedGSTAmount += gstReceived;
            acc.PaymentSchedulePendingGSTAmount += (gstAmount - gstReceived);

            acc.PaymentScheduleTDSAmount += tdsAmount;
            acc.PaymentScheduleReceivedTDSAmount += tdsReceived;
            acc.PaymentSchedulePendingTDSAmount += (tdsAmount - tdsReceived);

            return acc;

        }, {
            PaymentScheduleAmount: 0,
            PaymentScheduleReceivedAmount: 0,
            PaymentSchedulePendingAmount: 0,

            PaymentScheduleGSTAmount: 0,
            PaymentScheduleReceivedGSTAmount: 0,
            PaymentSchedulePendingGSTAmount: 0,

            PaymentScheduleTDSAmount: 0,
            PaymentScheduleReceivedTDSAmount: 0,
            PaymentSchedulePendingTDSAmount: 0
        });
    }, [paymentScheduleCrmList]);

    // ✅ ADD TOTAL ROW

    const filteredData = useMemo(() => {
        return paymentScheduleCrmList.filter((row) => row.Name?.trim().toLowerCase() !== "total");
    }, [paymentScheduleCrmList]);

    const dataWithTotal = useMemo(() => {
        return [
            ...filteredData,
            {
                Name: "Total",
                PaymentSchedulePercentage: "",

                PaymentScheduleAmount: totals.PaymentScheduleAmount,
                PaymentScheduleReceivedAmount: totals.PaymentScheduleReceivedAmount,
                PaymentSchedulePendingAmount: totals.PaymentSchedulePendingAmount,

                PaymentScheduleGSTAmount: totals.PaymentScheduleGSTAmount,
                PaymentScheduleReceivedGSTAmount: totals.PaymentScheduleReceivedGSTAmount,
                PaymentSchedulePendingGSTAmount: totals.PaymentSchedulePendingGSTAmount,

                PaymentScheduleTDSAmount: totals.PaymentScheduleTDSAmount,
                PaymentScheduleReceivedTDSAmount: totals.PaymentScheduleReceivedTDSAmount,
                PaymentSchedulePendingTDSAmount: totals.PaymentSchedulePendingTDSAmount,

                isTotal: true
            }
        ];
    }, [filteredData, totals,data]);

    const paymentScheduleTableColumns = useMemo<TableColumn[]>(() => {

        const boldIfTotal = (row: any) => row.isTotal ? 'font-bold text-gray-500' : '';

        return [
            {
                key: "Name",
                label: 'Stage / Milestone',
                width: '14',
                align: 'left',
                render: (_value, row) => {

                    let displayValue = row.Name || "-";

                    if (row.isTotal) displayValue = "Total";

                    if (row.Type === "Date" && row.Date) {
                        displayValue = formatDate_dd_MonthName_yy(row.Date);
                    }

                    return (
                        <span className={boldIfTotal(row)}>
                            {displayValue}
                        </span>
                    );
                },
            },
            {
                key: "PaymentSchedulePercentage",
                label: 'Percentage (%)',
                width: '14',
                align: 'center',
                render: (value, row) => (
                    <span className={boldIfTotal(row)}>
                        {value || "-"}
                    </span>
                )
            },
            {
                key: "AgreementGroup",
                label: "Agreement Amount Excluding TDS ",
                align: "center",
                children: [
                    {
                        key: "PaymentScheduleAmount",
                        label: "Total (₹)",
                        align: "right",
                        render: (v: number, row: any) => (
                            <span className={boldIfTotal(row)}>
                                {formatCurrency(v) || 0}
                            </span>
                        )
                    },
                    {
                        key: "PaymentScheduleReceivedAmount",
                        label: "Received (₹)",
                        align: "right",
                        render: (v: number, row: any) => (
                            <span className={boldIfTotal(row)}>
                                {formatCurrency(v) || 0}
                            </span>
                        )
                    },
                    {
                        key: "PaymentSchedulePendingAmount",
                        label: "Outstanding (₹)",
                        align: "right",
                        render: (_: number, row: any) => {
                            const value =
                                (row.PaymentScheduleAmount || 0) -
                                (row.PaymentScheduleReceivedAmount || 0);

                            return (
                                <span className={boldIfTotal(row)}>
                                    {formatCurrency(value) || 0}
                                </span>
                            );
                        }
                    }
                ]
            },
            {
                key: "GSTGroup",
                label: "GST Amount",
                align: "center",
                children: [
                    {
                        key: "PaymentScheduleGSTAmount",
                        label: "Total (₹)",
                        align: "right",
                        render: (v: number, row: any) => (
                            <span className={boldIfTotal(row)}>
                                {formatCurrency(v) || 0}
                            </span>
                        )
                    },
                    {
                        key: "PaymentScheduleReceivedGSTAmount",
                        label: "Received (₹)",
                        align: "right",
                        render: (v: number, row: any) => (
                            <span className={boldIfTotal(row)}>
                                {formatCurrency(v) || 0}
                            </span>
                        )
                    },
                    {
                        key: "PaymentSchedulePendingGSTAmount",
                        label: "Outstanding (₹)",
                        align: "right",
                        render: (_: number, row: any) => {
                            const value =
                                (row.PaymentScheduleGSTAmount || 0) -
                                (row.PaymentScheduleReceivedGSTAmount || 0);

                            return (
                                <span className={boldIfTotal(row)}>
                                    {formatCurrency(value) || 0}
                                </span>
                            );
                        }
                    }
                ]
            },
            {
                key: "TDSGroup",
                label: "TDS Amount",
                align: "center",
                children: [
                    {
                        key: "PaymentScheduleTDSAmount",
                        label: "Total (₹)",
                        align: "right",
                        render: (v: number, row: any) => (
                            <span className={boldIfTotal(row)}>
                                {formatCurrency(v) || 0}
                            </span>
                        )
                    },
                    {
                        key: "PaymentScheduleReceivedTDSAmount",
                        label: "Received (₹)",
                        align: "right",
                        render: (v: number, row: any) => (
                            <span className={boldIfTotal(row)}>
                                {formatCurrency(v) || 0}
                            </span>
                        )
                    },
                    {
                        key: "PaymentSchedulePendingTDSAmount",
                        label: "Outstanding (₹)",
                        align: "right",
                        render: (_: number, row: any) => {
                            const value =
                                (row.PaymentScheduleTDSAmount || 0) -
                                (row.PaymentScheduleReceivedTDSAmount || 0);

                            return (
                                <span className={boldIfTotal(row)}>
                                    {formatCurrency(value) || 0}
                                </span>
                            );
                        }
                    }
                ]
            },
            {
                key: 'Actions',
                label: 'Actions',
                width: '12',
                fixed: 'right',
                align: 'center',
                render: (_value, row) => {

                    const isLocked =
                        !(row?.BookingPaymentScheduleId > 0) ||
                        !row?.DemandType?.trim();

                    const isDisabled =
                        isLocked ||
                        bookingApprovalStatus?.toUpperCase() !== 'APPROVED';

                    if (!canAction ||isLocked) return null;

                    return (
                        <div className="flex items-center justify-center">

                            <Button
                                size="sm"
                                disabled={isDisabled}
                                color="blue"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    if (isDisabled) return;
                                    handleGenerateDemand(row)
                                }}>
                                {row.DemandType}
                            </Button>

                        </div>
                    )
                }
            },
        ];

    }, []);


    const handleGenerateDemand = async (row: PaymentScheduleModelData) => {
        if (row.BookingPaymentScheduleId === 0) {
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload: AddUpdatePayTrackPaymentScheduleDemandRequest = {
                    BookingPaymentScheduleId: row.BookingPaymentScheduleId,
                    BookingId: bookingId,
                    ProjectId: Number(projectId),
                    PaymentScheduleDemandType: row.DemandType === "Demand" ? 'Demand Letter' : row.DemandType
                };

                const response = await paymentScheduleService.apiCallAddPayTrackPaymentScheduleDemand(payload);

                if (E.isRight(response)) {

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    await loadPaymentScheduleCrmDetails(searchTerm);

                    if (dtRef.current) {
                        dtRef.current.collapseAll?.();
                    }

                    setTimeout(() => {
                        if (row.BookingPaymentScheduleId) {
                            dtRef.current?.expandRow?.(String(row.BookingPaymentScheduleId), row);
                        }
                    }, 50);

                } else {
                    addToast({ type: "error", title: response.left?.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Generate Demand'
        )
    };

    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Stage / Milestone"
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}
                // EXPORT
                isShowExportButton={canExport && dataWithTotal.length > 0}
                onExportExcel={handleExportPayTrackPaymentScheduleExcelFile}
                onExportPdf={handleExportPayTrackPaymentSchedulePdfFile}
                exportLoading={isLoading}

            />

            <DataTableExpandable
                ref={dtRef}
                key={`{${bookingId}-${searchTerm}-${dataWithTotal.length}`}
                data={dataWithTotal}
                columns={paymentScheduleTableColumns}
                emptyMessage="No Payment Schedule Found"
                loading={isLoading}
                fixedHeight
                recordsPerPage={20}
                expandable={{
                    keyField: "BookingPaymentScheduleId",
                    alwaysFetchOnOpen: true,
                    rowExpandable: (row) => row?.BookingPaymentScheduleId > 0 && !row.isTotal,
                    fetchRow: async (row) => {

                        if (!row || row.isTotal || row.BookingPaymentScheduleId === 0) {
                            return [];
                        }

                        setIsLoading(true);

                        setLoadingMessage("Loading Payment Ledger");

                        const params: FilterWithPaginationPaymentScheduleDemandSummary = {
                            ProjectId: Number(projectId),
                            BookingPaymentScheduleId: row.BookingPaymentScheduleId,
                            BookingId: bookingId,
                            IsCheckPermission: true,

                        };

                        const response = await paymentScheduleService.apiCallPullPaymentScheduleDemandSummary(params);

                        setIsLoading(false);

                        if (E.isRight(response)) {
                            return response.right.Data ?? [];
                        }
                        return [];
                    },

                    renderRow: (fetchedData) => {
                        const details = Array.isArray(fetchedData) ? fetchedData : fetchedData ? [fetchedData] : [];

                        if (!details.length) {
                            return (
                                <div className="p-1 text-xs text-gray-600 text-center">
                                    <NoDataView />
                                </div>
                            );
                        }

                        return (
                            <div className="space-y-4">
                                <div className="p-4">
                                    <div className="relative flex items-start gap-16 px-6 overflow-x-auto">

                                        <div className="absolute top-[6px] left-0 w-full h-px bg-gray-300"></div>

                                        {details.map((row, index) => (

                                            <div key={index} className="flex flex-col items-center relative z-10 min-w-[180px]">

                                                <div className="flex items-center">
                                                    <div className="w-3 h-3 rounded-full bg-blue-500 z-10"></div>

                                                    {index !== details.length - 1 && (
                                                        <div className="h-[2px] w-16"></div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col mt-2">
                                                    <FieldItem label="" value={row?.PaymentScheduleDemandType} urls={row?.PaymentScheduleDemandSummaryURL} />

                                                    <span className="text-xs text-gray-500 pt-1">
                                                        {row?.CreatedBy ?? "-"}
                                                    </span>

                                                    <span className="text-sm text-gray-500 pt-1">
                                                        {formatDate_dd_MonthName_yy_hh_mm(row?.CreatedDate ?? "-")}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    },

                    expandButton: { openText: "Hide", closeText: "Show" },
                }}
            />


        </div>
    )
}

export default PaymentSchedule
