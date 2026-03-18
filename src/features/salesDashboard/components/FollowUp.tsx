import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { getStatusColor } from '@/features/enquiry/pages/Status';
import { DataTableWithOutBorder, type TableColumn } from '@/ui/components/DataTable/DataTableWithoutBorder';
import { useEffect, useState } from 'react';

interface EnquiryFollowUpModel {
    Name: string | null;
    EnquiryFollowUpDays: string | null;
    FinalStage: string | null;
    NextFollowUpDate:string | null;
}

interface Props {
    enquiryFollowUpData: EnquiryFollowUpModel[];
}

export default function FollowUp({ enquiryFollowUpData }: Props) {

    const [tableData, setTableData] = useState<any[]>([]);

    useEffect(() => {
        setTableData(enquiryFollowUpData || []);
    }, [enquiryFollowUpData]);

    const columns: TableColumn[] = [
        { key: 'Name', label: 'Client Name' },
        { key: 'EnquiryFollowUpDays', label: 'Due Day(s)', align: 'center' },
{
            key: 'NextFollowUpDate',
            label: 'Next FollowUp Date',
            sortable: false,
            align: 'left',
            render: value => value ? formatDate_dd_MonthName_yy(value) : '-'
        },
        {
            key: 'FinalStage', label: 'Status',
            render: (value) => {
                const { bg, text } = getStatusColor(value);

                return (
                    <span
                        className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                        style={{
                            backgroundColor: bg,
                            color: text
                        }}
                    >
                        {value || "-"}
                    </span>
                );
            }
        },
    ]

    return (
        <div className="space-y-4 flex flex-col h-full w-full min-w-0">
            <h2 className="text-lg font-semibold text-gray-800">Follow Up </h2>
            <div className="flex gap-4 items-stretch flex-1 min-w-0 min-h-0">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex-1 min-w-0 overflow-hidden flex flex-col">
                    <div className='max-h-[280px] overflow-auto thin-scroll flex-1'>
                        <div className=''>
                            <DataTableWithOutBorder
                                columns={columns}
                                data={tableData}
                                emptyMessage="No records Found"
                                fixedHeight={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}