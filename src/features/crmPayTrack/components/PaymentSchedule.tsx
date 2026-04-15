import { type TableColumn } from '@/ui/components/DataTable/DataTable';
import { useEffect, useMemo, useState } from 'react';
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { runApiWithLoader } from '@/core/utils';
import type { FilterWithPaginationPaymentSchedule, PaymentScheduleModelData } from '@/features/crmPayTrack/models/PaymentScheduleModel';
import { paymentScheduleService } from '@/features/crmPayTrack/services/PaymentScheduleService';
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { Loader } from '@/core/utils/loader';
import { Input } from '@/ui/components/forms';
import { Modal } from '@/ui/components/Modal/Modal';
import { usePayTrackBookingListState } from '@/features/crmPayTrack/context/PayTrackBookingListStateContext';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { CustomTable } from '@/ui/components/DataTable/CustomTable';
import { formatCurrency } from '@/core/utils/comman';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { handleExportFile } from '@/core/utils/exportFile';


export const PaymentSchedule: React.FC = () => {
    const [paymentScheduleCrmList, setPaymentScheduleCrmList] = useState<PaymentScheduleModelData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isAddDemandLetterModalOpen, setIsAddDemandLetterModalOpen] = useState(false);
    const [demandLetterDocumentName, setDemandLetterDocumentName] = useState('');

    const { addToast } = useToast();
    const { projectId } = useProject();

    const { listState } = usePayTrackBookingListState();
    const { bookingId } = listState;

    useEffect(() => {
        if (projectId && bookingId) {

            loadPaymentScheduleCrmDetails();
        }
    }, [projectId, bookingId])


    const loadPaymentScheduleCrmDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationPaymentSchedule = {
                    ProjectId: Number(projectId),
                    BookingId: bookingId,
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
            "Loading Payment Schedule Crm Details"
        )
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
            }
        ];

    }, []);


    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <TableActionToolbar
                isShowSearchBar={false}
                // EXPORT
                isShowExportButton={dataWithTotal.length > 0}
                onExportExcel={handleExportPayTrackPaymentScheduleExcelFile}
                onExportPdf={handleExportPayTrackPaymentSchedulePdfFile}
                exportLoading={isLoading}

            />

            <CustomTable
                data={dataWithTotal}
                columns={paymentScheduleTableColumns}
                emptyMessage="No Schedule Data Found"
                fixedHeight={true}
                className="flex-1"
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