import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { useEffect, useMemo, useState } from 'react';
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { useParams } from 'react-router-dom';
import { runApiWithLoader } from '@/core/utils';
import type { FilterWithPaginationPaymentScheduleCrm, PaymentScheduleCrmModelData } from '@/features/crmPayTrackScreen/models/PaymentScheduleCrmModel';
import { paymentScheduleCrmService } from '../services/PaymentScheduleCrmService';
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { Loader } from '@/core/utils/loader';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { Plus } from 'lucide-react';
import { Modal } from '@/ui/components/Modal/Modal';
import { DatePickerInput } from '@/ui/components/forms/Datepicker';


export const PaymentScheduleCrm: React.FC = () => {
    const [paymentScheduleCrmList, setPaymentScheduleCrmList] = useState<PaymentScheduleCrmModelData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isAddDemandLetterModalOpen, setIsAddDemandLetterModalOpen] = useState(false);
    const [demandLetterDocumentName, setDemandLetterDocumentName] = useState('');
    const [demandLetterDocumentDate, setDemandLetterDocumentDate] = useState<Date | null>(null);

    const { canAction } = useMenuPermissions("/payTrack");


    const staticNames = ["Stamp Duty", "Registration Amount", "TDS"];

    const { addToast } = useToast();

    //#region PROJECT SELECTION GET ID
    const { projectId } = useProject();
    //#endregion

    //#region BOOKING ID
    const { BookingId } = useParams<{ BookingId?: string }>();
    const bookingId = BookingId ? Number(BookingId) : 0;
    //#endregion

    useEffect(() => {
        if (projectId && bookingId) {
            loadPaymentScheduleCrmDetails();
        }
    }, [projectId, bookingId])


    // #region DATA LOAD|FETCH
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
                    const updatedData = response.right.Data.map((item, index) => ({
                        ...item,
                        Name: staticNames[index] || item.Name
                    }));

                    setPaymentScheduleCrmList(updatedData);

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
    // #endregion

    const handleAddDemandLetter = () => {
        setIsAddDemandLetterModalOpen(true);
    }

    const generateDemandLetter = () => {
        console.log('This  is the generate demnad letter.');
    }

    const paymentScheduleTableColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: "Name",
                label: 'Name',
                width: '14',
                align: 'left',
            },
            {
                key: "PaymentSchedulePercentage",
                label: 'Percentage (%)',
                width: '14',
                align: 'left',
            },
            {
                key: "PaymentScheduleAmount",
                label: 'Agreement Amount (₹)',
                width: '14',
                align: 'left',
            },
            {
                key: "PaymentScheduleReceivedAmount",
                label: 'Agreement Received (₹)',
                width: '14',
                align: 'left',
            },
            {
                key: "PaymentSchedulePendingAmount",
                label: 'Agreement Pending (₹)',
                width: '14',
                align: 'left',
                render: (_: any, row: any) => {
                    const pendingAmount = Number(row.PaymentScheduleAmount || 0) - Number(row.PaymentScheduleReceivedAmount || 0);
                    return (
                        <div className="text-red-500">
                            {pendingAmount}
                        </div>
                    )
                }
            },
            {
                key: "PaymentScheduleGSTAmount",
                label: 'GST Amount (₹)',
                width: '14',
                align: 'left',
            },
            {
                key: "PaymentScheduleReceivedGSTAmount",
                label: 'GST Received (₹)',
                width: '14',
                align: 'left',
            },
            {
                key: "PaymentSchedulePendingGSTAmount",
                label: 'GST Pending (₹)',
                width: '14',
                align: 'left',
                render: (_: any, row: any) => {
                    const pendingGst = Number(row.PaymentScheduleGSTAmount || 0) - Number(row.PaymentScheduleReceivedGSTAmount || 0);
                    return (
                        <div className="text-red-500">
                            {pendingGst}
                        </div>
                    )
                }
            },
            {
                key: "CreatedBy",
                label: 'Created By',
                width: '14',
                align: 'left',
            },
            {
                key: 'Action',
                label: 'Demand Draft',
                width: '14',
                align: 'left',
                render: () => (
                    canAction && (
                        <Button
                            onClick={handleAddDemandLetter}
                            color='transparent'
                            isborderRadius
                            size='lg'
                            style={{
                                color: 'blue',
                                padding: '4px 8px'
                            }}
                            title="Add Demand Letter"
                        >
                            <Plus />
                        </Button>
                    )
                )
            },

        ], []
    )

    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>
            <DataTable
                columns={paymentScheduleTableColumns}
                data={paymentScheduleCrmList}
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

                <div>
                    <DatePickerInput
                        label="Document Date"
                        placeholder="Document Date"
                        // value={demandLetterDocumentDate ?? ''}
                        // onChange={(e) => setDemandLetterDocumentDate(e.target.value)}
                        required
                    />
                </div>

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
                </div>
            </Modal>


        </div>
    )
}

export default PaymentScheduleCrm