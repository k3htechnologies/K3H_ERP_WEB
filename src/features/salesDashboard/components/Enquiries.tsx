import { useCallback, useEffect, useState } from 'react';
import { DataTableWithOutBorder, type TableColumn } from '@/ui/components/DataTable/DataTableWithoutBorder';
import { Button } from "@/ui/components/forms";
import { ConfirmationDialogBox } from '@/core/utils/confirmationDialogBox';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import type { EnquiryOutTimeData, Table0, UpdateEnquiryOutTimeRequest } from '@/features/salesDashboard/models/SalesDashboardModel';
import { runApiWithLoader } from '@/core/utils';
import { salesDashboardService } from '@/features/salesDashboard/services/SalesDashboardServices';
import useToast from '@/core/hooks/useToast';
import * as E from "fp-ts/Either";
import TooltipText from '@/ui/components/Tooltip/TooltipText';

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

    useEffect(() => {
        setEnquiryList(enquiryData || []);
    }, [enquiryData]);

    //#region DATA LOADING | FETCH |  LOAD 
    const loadSalesDashboardData = useCallback(async () => {
        
        await runApiWithLoader(setIsLoading,
            setLoadingMessage,
            async () => {
                const response = await salesDashboardService.apiCallPullSalesDashboard(0);
                
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
    }, [addToast]);

    //#region HANDLE MARK TIME OUT
    const handleMarkTimeOut = async () => {
        if (!selectedMarkTimeOutItem) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload: UpdateEnquiryOutTimeRequest = {
                    EnquiryId: selectedMarkTimeOutItem.EnquiryId,
                    ProjectId: Number(selectedMarkTimeOutItem.ProjectId),
                };

                const response = await salesDashboardService.apiCallUpdateEnquiryOutTime(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });
                    loadSalesDashboardData();

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
            key: 'ProjectName',
            label: 'Project Name',
            fixed: 'left',
            render: (value) => value || "-",
        },
        {
            key: 'SystemGeneratedCode',
            label: 'Enquiry Code',
            align: 'left',
            render: value => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="150px"
                    tooltipThreshold={20}
                    tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
                />
            )
        },
        {
            key: 'Name',
            label: 'Client Name',
            fixed: 'left',
            render: (value) => value || "-",
        },
        {
            key: 'MobileNumber',
            label: 'Mobile Number',
            fixed: 'left',
            render: (value) => (value ? `+91 ${value}` : "-"),
        },
        {
            key: 'EnquiryDate',
            label: 'Date',
            sortable: false,
            align: 'center',
            render: value => value ? formatDate_dd_MonthName_yy(value) : '-'
        },
        {
            key: 'EnquiryTimeIn',
            label: 'Customer Time-in',
            align: 'center',
            render: (value) => value || "-",

        },
        {
            key: 'SalesAdvisor',
            label: 'Sales Advisor',
            fixed: 'left',
            render: (value) => value || "-",
        },
        {
            key: 'SourcingManager',
            label: 'Sourcing Manager',
            fixed: 'left',
            render: (value) => value || "-",
        },
        {
            key: 'Action',
            label: 'Action',
            align: 'center',
            fixed: 'right',
            render: (_value, row) => {
                
                return (
                    <Button
                        onClick={() => {
                            setIsConfirmationDialogBoxOpen(true);
                            setSelectedMarkTimeOutItem(row);
                        }}
                        size="sm"
                        fullWidth={false}
                        color='primary'
                    >
                        Time Out
                    </Button>
                );
            }
        }
    ]
    //#endregion

    //#region
    return (
        <div className="space-y-3 pt-4">

            <h2 className="text-lg font-semibold text-gray-800">
               Enquiries{" "}
                <span className="text-sm font-normal text-gray-500">
                    (Todays)
                </span>
            </h2>

            <div className="flex-1 bg-white rounded-xl p-5 h-[310px] border border-gray-100 min-w-0 overflow-hidden flex flex-col">
                <DataTableWithOutBorder
                    columns={columns}
                    data={enquiryList}
                    emptyMessage="No records Found"
                    fixedHeight={true}
                    
                />
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
                variant='logout'
            />

        </div>
    )
}