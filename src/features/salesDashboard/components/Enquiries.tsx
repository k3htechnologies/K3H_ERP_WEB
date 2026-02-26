import { useState } from 'react';
import { DataTableWithOutBorder, type TableColumn } from '@/ui/components/DataTable/DataTableWithoutBorder';
import { Button } from "@/ui/components/forms";
import { ConfirmationDialogBox } from '@/core/utils/confirmationDialogBox';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';

interface EnquiryModel {
    Name: string | null;
    EnquiryDate: string | null;
    EnquiryTimeIn: string | null;
}

interface Props {
    enquiryData: EnquiryModel[];
}

export default function Enquiries({ }: Props) {
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [, setTableData] = useState<any[]>([]);

    const data = [
        {
            ClientName: "John Doe",
            Date: formatDate_dd_MonthName_yy("2022-01-12"),
            CustomerTimeIn: "10:00 AM",
            Action: "Mark Time Out"
        },
        {
            ClientName: "Jane Smith",
            Date: formatDate_dd_MonthName_yy("2022-12-23"),
            CustomerTimeIn: "12:00 PM",
            Action: "Mark Time Out"
        },
        {
            ClientName: "Tim Lee",
            Date: formatDate_dd_MonthName_yy("2022-08-22"),
            CustomerTimeIn: "12:00 PM",
            Action: "Mark Time Out"
        },
        {
            ClientName: "Kim John",
            Date: formatDate_dd_MonthName_yy("2022-01-12"),
            CustomerTimeIn: "12:00 PM",
            Action: "Mark Time Out"
        },
        {
            ClientName: "Tim LOKO",
            Date: formatDate_dd_MonthName_yy("2022-01-11"),
            CustomerTimeIn: "12:00 PM",
            Action: "Mark Time Out"
        },
        {
            ClientName: "Tim Lee",
            Date: "2022-01-07",
            CustomerTimeIn: "12:00 PM",
            Action: "Mark Time Out"
        },
        {
            ClientName: "Tim Lee",
            Date: "2022-01-08",
            CustomerTimeIn: "12:00 PM",
            Action: "Mark Time Out"
        },
        {
            ClientName: "Tim Lee",
            Date: "2022-01-09",
            CustomerTimeIn: "12:00 PM",
            Action: "Mark Time Out"
        },
        {
            ClientName: "Tim Lee",
            Date: "2022-01-10",
            CustomerTimeIn: "12:00 PM",
            Action: "Mark Time Out"
        },


    ]


    const columns: TableColumn[] = [
        { key: 'ClientName', label: 'Client Name', align: 'center' },
        { key: 'Date', label: 'Date', align: 'center' },
        { key: 'CustomerTimeIn', label: 'Customer Time-in', align: 'center' },
        {
            key: 'Action',
            label: 'Action',
            render: (_value, row) => (
                <Button
                    onClick={() => {
                        console.log(row)
                        setIsConfirmationDialogBoxOpen(true)
                        setSelectedRow(row)
                    }}
                    size="sm"
                    fullWidth={false}
                    color='primary'
                >
                    {_value}
                </Button>
            )
        }
    ]
    return (
        <div className="space-y-4 flex flex-col h-full w-full min-w-0">
            <h2 className="text-lg font-semibold text-gray-800">
                Enquiries
            </h2>
            <div className="flex flex-row gap-4 items-stretch flex-1 min-w-0 min-h-0">
                <div className="flex-1 bg-white rounded-xl p-5 shadow-sm border border-gray-100 min-w-0 overflow-hidden flex flex-col">
                    <div className='max-h-[280px] overflow-y-auto thin-scroll'>
                        <DataTableWithOutBorder
                            columns={columns}
                            data={data}
                            emptyMessage="No records Found"
                            fixedHeight={true}
                        />
                    </div>
                </div>
            </div>

            <ConfirmationDialogBox
                title='Are you sure?'
                message='You are about to mark time out for this enquiry'
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => setIsConfirmationDialogBoxOpen(false)}
                onConfirm={() => {
                    setTableData(prev => prev.filter(item => item.id !== selectedRow.id));
                    setIsConfirmationDialogBoxOpen(false)
                }
                }
            />
        </div>
    )
}