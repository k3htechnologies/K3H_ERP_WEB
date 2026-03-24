import { useCallback, useEffect, useState } from 'react';
import { DataTableWithOutBorder, type TableColumn } from '@/ui/components/DataTable/DataTableWithoutBorder';
import { Button } from "@/ui/components/forms";
import { ConfirmationDialogBox } from '@/core/utils/confirmationDialogBox';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import type { EnquiryOutTimeData, Table0, UpdateEnquiryOutTimeRequest } from '@/features/salesDashboard/models/SalesDashboardModel';
import { runApiWithLoader } from '@/core/utils';
import { salesDashboardService } from '@/features/salesDashboard/services/SalesDashboardServices';
import useToast from '@/core/hooks/useToast';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import * as E from "fp-ts/Either";

interface Props {
    enquiryData: Table0[];
}

export default function Enquiries({ enquiryData }: Props) {

    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMarkTimeOutItem, setSelectedMarkTimeOutItem] = useState<EnquiryOutTimeData | null>(null);
    const [enquiryList, setEnquiryList] = useState<Table0[]>(enquiryData || []);

    // TOAST
    const { addToast } = useToast();

    //#region PROJECT SELECTION GET ID
    const { projectId } = useProject();
    //#endregion

    useEffect(() => {
        setEnquiryList(enquiryData || []);
    }, [enquiryData]);

    //#region DATA LOADING | FETCH |  LOAD 
    const loadSalesDashboardData = useCallback(async () => {
        await runApiWithLoader(setIsLoading,
            setLoadingMessage,
            async () => {
                const response = await salesDashboardService.apiCallPullSalesDashboard(Number(projectId));
                if (E.isRight(response)) {

                    const e = response.right.Data;
                    setEnquiryList(e.Table0 || []);
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message });
            },
            undefined,
            "Loading Data"
        );
    }, [projectId, addToast]);

    //#region HANDLE MARK TIME OUT
    const handleMarkTimeOut = async () => {
        if (!selectedMarkTimeOutItem) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const payload: UpdateEnquiryOutTimeRequest = {
                    EnquiryId: selectedMarkTimeOutItem.EnquiryId,
                    ProjectId: Number(projectId),
                };
                const response = await salesDashboardService.apiCallUpdateEnquiryOutTime(payload);

                if (E.isRight(response)) {
                    addToast({ type: "success", title: response.right.SuccessMessage[0] });
                    loadSalesDashboardData()
                } else {
                    addToast({ type: "error", title: response.left.message });
                }
                setIsConfirmationDialogBoxOpen(false);
                setSelectedMarkTimeOutItem(null);
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Mark Time Out",
        );
    };
    //#endregion

    const columns: TableColumn[] = [
        {
            key: 'Name',
            label: 'Client Name',
            align: 'left',
            render: (value) => value || "-",

        },
        {
            key: 'EnquiryDate',
            label: 'Date',
            sortable: false,
            align: 'left',
            render: value => value ? formatDate_dd_MonthName_yy(value) : '-'
        },
        {
            key: 'EnquiryTimeIn',
            label: 'Customer Time-in',
            align: 'center',
            render: (value) => value || "-",

        },
        {
            key: 'Action',
            label: 'Action',
            align: 'left',
            render: (_value, row) => (
                <Button
                    onClick={() => {
                        setIsConfirmationDialogBoxOpen(true)
                        setSelectedMarkTimeOutItem(row)
                    }}
                    size="sm"
                    fullWidth={false}
                    color='primary'
                >
                    Mark Time Out
                </Button>
            )
        }
    ]
    //#endregion

    //#region
    return (
        <div className="space-y-4 flex flex-col h-full w-full min-w-0">

            <h2 className="text-lg font-semibold text-gray-800">
                Enquiries (Todays)
            </h2>
            <div className="flex flex-row gap-4 items-stretch flex-1 min-w-0 min-h-0">
                <div className="flex-1 bg-white rounded-xl p-5 shadow-sm border border-gray-100 min-w-0 overflow-hidden flex flex-col">
                    <div className='max-h-[280px] overflow-y-auto thin-scroll'>
                        <DataTableWithOutBorder
                            columns={columns}
                            data={enquiryList}
                            emptyMessage="No records Found"
                            fixedHeight={true}
                        />
                    </div>
                </div>
            </div>

            <ConfirmationDialogBox
                title='Mark Time Out'
                message='Are you sure you want to Mark Time Out for this Enquiry'
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false);
                    setSelectedMarkTimeOutItem(null)
                }}
                onConfirm={handleMarkTimeOut}
                confirmText="Mark Time Out"
                cancelText="Cancel"
                loading={isLoading}
            />
        </div>
    )
}