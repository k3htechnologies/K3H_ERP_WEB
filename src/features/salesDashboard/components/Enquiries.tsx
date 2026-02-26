import { useState, useEffect } from 'react';
import { DataTableWithOutBorder, type TableColumn } from '@/ui/components/DataTable/DataTableWithoutBorder';
import { Button } from "@/ui/components/forms";
import { ConfirmationDialogBox } from '@/core/utils/confirmationDialogBox';

interface EnquiryModel {
    Name: string | null;
    EnquiryDate: string | null;
    EnquiryTimeIn: string | null;
}

interface Props {
    enquiryData: EnquiryModel[];
}

export default function Enquiries({ enquiryData }: Props) {
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [tableData, setTableData] = useState<any[]>([]);

    useEffect(() => {
        const formattedData = enquiryData.map((item, index) => {
            return {
                id: index,
                clientName: item.Name,
                date: item.EnquiryDate,
                customerTimeIn: item.EnquiryTimeIn,
                action: 'Mark Time Out'
            }
        })
        setTableData(formattedData);
    }, [enquiryData])


    const columns: TableColumn[] = [
        { key: 'clientName', label: 'Client Name' },
        { key: 'date', label: 'Date' },
        { key: 'customerTimeIn', label: 'Customer Time-in' },
        {
            key: 'action',
            label: 'Action',
            render: (_value, row) => (
                <Button
                    onClick={() => {
                        console.log(row.id);
                        setSelectedRow(row.id);
                        setIsConfirmationDialogBoxOpen(true)
                    }}
                    size="sm"
                >
                    {_value}
                </Button>
            )
        }
    ]
    return (

        <div className="space-y-3 pt-2">
            <h2 className="text-lg font-semibold text-gray-800">
                Enquiries
            </h2>
            <div
                className="bg-white rounded-xl p-4 overflow-hidden"
                style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
            >
                <div className='-mx-4 px-4'>
                    <DataTableWithOutBorder
                        columns={columns}
                        data={tableData.slice(0, 4)}
                        emptyMessage="No records Found"
                        fixedHeight={true}
                    />
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