import { type TableColumn } from '@/ui/components/DataTable/DataTable';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { runApiWithLoader } from '@/core/utils';
import type { FilterWithPaginationPaymentSchedule, FilterWithPaginationPaymentScheduleDemandSummary, PaymentScheduleModelData } from '@/features/crmPayTrack/models/PaymentScheduleModel';
import { paymentScheduleService } from '@/features/crmPayTrack/services/PaymentScheduleService';
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { Loader } from '@/core/utils/loader';
import { Button, Input } from '@/ui/components/forms';
import { Modal } from '@/ui/components/Modal/Modal';
import { usePayTrackBookingListState } from '@/features/crmPayTrack/context/PayTrackBookingListStateContext';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { formatCurrency } from '@/core/utils/comman';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { handleExportFile } from '@/core/utils/exportFile';
import DataTableExpandable, { type DataTableExpandableRef } from '@/ui/components/DataTable/DataTableExpandable';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import { FieldItem } from '@/ui/components/forms/FieldItem';

export const PaymentSchedule: React.FC = () => {
    const [paymentScheduleCrmList, setPaymentScheduleCrmList] = useState<PaymentScheduleModelData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isAddDemandLetterModalOpen, setIsAddDemandLetterModalOpen] = useState(false);
    const [demandLetterDocumentName, setDemandLetterDocumentName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const dtRef = useRef<DataTableExpandableRef | null>(null);

    const [, setExpandedParentRow] = useState<any>(null);

    const [, setExpandedParentId] = useState<number>(0);

    const { addToast } = useToast();
    const { projectId } = useProject();

    const { listState } = usePayTrackBookingListState();
    const { bookingId } = listState;

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
        loadPaymentScheduleCrmDetails(value)
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
    }, [filteredData, totals]);

    const paymentScheduleTableColumns = useMemo<TableColumn[]>(() => {

        const boldIfTotal = (row: any) => row.isTotal ? 'font-bold text-gray-500' : '';

        return [
            {
                key: "Name",
                label: 'Name',
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
                label: "Agreement Amount",
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
                        label: "Pending (₹)",
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
                        label: "Pending (₹)",
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
                        label: "Pending (₹)",
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

                    const isLocked = !row?.BookingPaymentScheduleId;

                    if (isLocked) return null;

                    return (
                        <div className="flex items-center justify-center">

                            <Button
                                size="sm"
                                disabled={isLocked}
                                color="blue"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    if (isLocked) return;
                                }}>{row.DemandType}</Button>

                        </div>
                    )
                }
            },
        ];

    }, []);


    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Name"
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}
                // EXPORT
                isShowExportButton={dataWithTotal.length > 0}
                onExportExcel={handleExportPayTrackPaymentScheduleExcelFile}
                onExportPdf={handleExportPayTrackPaymentSchedulePdfFile}
                exportLoading={isLoading}

            />

            <DataTableExpandable
                ref={dtRef}
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
                        setExpandedParentRow(row);
                        setExpandedParentId(row.BookingPaymentScheduleId);

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
                                {details.map((row, index) => {
                                    return (
                                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                            <div className="flex justify-between items-center">
                                                <div className="text-sm text-gray-700">
                                                    <FieldItem
                                                        label="Demand Type"
                                                        value={row.PaymentScheduleDemandType}
                                                        urls={row.PaymentScheduleDemandSummaryURL}
                                                        isRow
                                                        isIcon={true}
                                                    />
                                                </div>

                                                <div className="flex items-center gap-2">

                                                    <Button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();

                                                        }}
                                                        color="transparent"
                                                        isborderRadius

                                                        title="Edit"
                                                    >

                                                    </Button>

                                                </div>
                                            </div>

                                            <h3 className="font-semibold pt-5 mb-2">Action Details</h3>

                                            <div className="grid grid-cols-3 gap-6 text-sm  space-y-3">


                                                <FieldItem label="Created By" value={row?.CreatedBy ?? "-"} />

                                                <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy_hh_mm(row?.CreatedDate ?? "-")} />
                                                <FieldItem label="Modified By" value={row?.ModifiedBy ?? "-"} />
                                                <FieldItem label="Modified Date" value={formatDate_dd_MonthName_yy_hh_mm(row?.ModifiedDate ?? "-")} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    },

                    expandButton: { openText: "Hide", closeText: "Show" },
                }}
            />

            <Modal
                isOpen={isAddDemandLetterModalOpen}
                onClose={() => setIsAddDemandLetterModalOpen(false)}
                title="Demand Letter"

            >
                <div>
                    <Input
                        label=" Document Name"
                        placeholder="Document Name"
                        type="text"
                        value={demandLetterDocumentName ?? ''}
                        onChange={(e) => setDemandLetterDocumentName(e.target.value)}
                        required
                    />

                </div>


                {/* 
                <div>
                    <Button
                        onClick={() => { generateDemandLetter(); }}
                        color='blue'
                        isborderRadius
                        size='sm'
                        style={{
                            color: 'white',
                            padding: '4px 8px'
                        }}
                        title="Generate Demand Letter">
                        Generate Demand Letter
                    </Button>
                </div> */}
            </Modal>


        </div>
    )
}

export default PaymentSchedule
