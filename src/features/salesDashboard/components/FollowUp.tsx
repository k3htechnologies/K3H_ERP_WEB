import { DataTableWithOutBorder, type TableColumn } from '@/ui/components/DataTable/DataTableWithoutBorder';
import { getStatusColor } from './Status'

export default function FollowUp() {

    const tableData = [
        { id: 1, clientName: 'John Doe', dueDay: 'Today', status: 'Select Stage', },
        { id: 2, clientName: 'Jeff Bezoz', dueDay: 'Tomorrow', status: 'Booking Done' },
        { id: 3, clientName: 'Alan Sethi', dueDay: '3 days', status: 'Blocked' },
        { id: 4, clientName: 'Ram Walker', dueDay: '5 days', status: 'Cancelled' },
        { id: 5, clientName: 'Jane Smith', dueDay: '7 days', status: 'Negotiation' },
        { id: 6, clientName: 'Jane Smith', dueDay: '10 days', status: 'Negotiation' },
        { id: 7, clientName: 'Jane Smith', dueDay: '10 days', status: 'Negotiation' },
        { id: 8, clientName: 'Jane Smith', dueDay: '10 days', status: 'Cancelled' },
        { id: 9, clientName: 'Jane Smith', dueDay: '10 days', status: 'Negotiation' },
        { id: 10, clientName: 'Jane Smith', dueDay: '10 days', status: 'Blocked' },
        { id: 11, clientName: 'Jane Smith', dueDay: '10 days', status: 'Booking Done' },
    ]


    const columns: TableColumn[] = [
        { key: 'clientName', label: 'Client Name' },
        { key: 'dueDay', label: 'Due Day(s)', align: 'center' },

        {
            key: 'status', label: 'Status',
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
            <h2 className="text-lg font-semibold text-gray-800">Follow Up</h2>
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