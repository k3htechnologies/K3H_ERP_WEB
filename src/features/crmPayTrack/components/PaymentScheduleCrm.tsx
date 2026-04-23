import {  type TableColumn } from '@/ui/components/DataTable/DataTable';
import { useEffect, useMemo, useState } from 'react';
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { runApiWithLoader } from '@/core/utils';
import type { FilterWithPaginationPaymentScheduleCrm, PaymentScheduleCrmModelData } from '@/features/crmPayTrack/models/PaymentScheduleCrmModel';
import { paymentScheduleCrmService } from '../services/PaymentScheduleCrmService';
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { Loader } from '@/core/utils/loader';
import { Input } from '@/ui/components/forms';
import { Modal } from '@/ui/components/Modal/Modal';
import { usePayTrackBookingListState } from '@/features/crmPayTrack/context/PayTrackBookingListStateContext';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { CustomTable } from '@/ui/components/DataTable/CustomTable';


export const PaymentScheduleCrm: React.FC = () => {
    const [paymentScheduleCrmList, setPaymentScheduleCrmList] = useState<PaymentScheduleCrmModelData[]>([]);
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
                const params: FilterWithPaginationPaymentScheduleCrm = {
                    ProjectId: Number(projectId),
                    BookingId: bookingId,
                };

                const response = await paymentScheduleCrmService.apiCallPullPaymentScheduleCrm(params);

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

    // ✅ GRAND TOTAL CALCULATION
    const totals = useMemo(() => {
        return paymentScheduleCrmList.reduce((acc, row) => {
            acc.PaymentScheduleAmount += row.PaymentScheduleAmount || 0;
            acc.PaymentScheduleReceivedAmount += row.PaymentScheduleReceivedAmount || 0;
            acc.PaymentSchedulePendingAmount +=  0;

            acc.PaymentScheduleGSTAmount += row.PaymentScheduleGSTAmount || 0;
            acc.PaymentScheduleReceivedGSTAmount += row.PaymentScheduleReceivedGSTAmount || 0;
            acc.PaymentSchedulePendingGSTAmount +=  0;

            return acc;
        }, {
            PaymentScheduleAmount: 0,
            PaymentScheduleReceivedAmount: 0,
            PaymentSchedulePendingAmount: 0,
            PaymentScheduleGSTAmount: 0,
            PaymentScheduleReceivedGSTAmount: 0,
            PaymentSchedulePendingGSTAmount: 0
        });
    }, [paymentScheduleCrmList]);

    // ✅ ADD TOTAL ROW
    const dataWithTotal = useMemo(() => {
        return [
            ...paymentScheduleCrmList,
            {
                Name: "Total",
                PaymentSchedulePercentage: "",

                PaymentScheduleAmount: totals.PaymentScheduleAmount,
                PaymentScheduleReceivedAmount: totals.PaymentScheduleReceivedAmount,
                PaymentSchedulePendingAmount: totals.PaymentSchedulePendingAmount,

                PaymentScheduleGSTAmount: totals.PaymentScheduleGSTAmount,
                PaymentScheduleReceivedGSTAmount: totals.PaymentScheduleReceivedGSTAmount,
                PaymentSchedulePendingGSTAmount: totals.PaymentSchedulePendingGSTAmount,

                isTotal: true
            } as any
        ];
    }, [paymentScheduleCrmList, totals]);

    const paymentScheduleTableColumns = useMemo<TableColumn[]>(() => [
        {
            key: "Name",
            label: 'Name',
            width: '14',
            align: 'left',
            render: (_value, row) => {

                if (row.Type === "Date" && row.Date) {

                    return formatDate_dd_MonthName_yy(row.Date);

                } else if (row.Type === "") {

                    return row.Name;
                }
                return "-";
            },
        },
        {
            key: "PaymentSchedulePercentage",
            label: 'Percentage (%)',
            width: '14',
            align: 'right',
        },


        {
            key: "AgreementGroup",
            label: "Agreement",
            align: "center",
            children: [
                { key: "PaymentScheduleAmount", label: "Amount (₹)", align: "center", render: (v: number) => v || 0 },
                { key: "PaymentScheduleReceivedAmount", label: "Received (₹)", align: "center", render: (v: number) => v || 0 },
                { key: "PaymentSchedulePendingAmount", label: "Pending (₹)", align: "center", render: (v: number) => v || 0 }
            ]
        },
        {
            key: "GSTGroup",
            label: "GST",
            align: "center",
            children: [
                { key: "PaymentScheduleGSTAmount", label: "Amount (₹)", align: "center", render: (v: number) => v || 0 },
                { key: "PaymentScheduleReceivedGSTAmount", label: "Received (₹)", align: "center", render: (v: number) => v || 0 },
                { key: "PaymentSchedulePendingGSTAmount", label: "Pending (₹)", align: "center", render: (v: number) => v || 0 }
            ]
        },



    ], []);


    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

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

export default PaymentScheduleCrm