import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { getStatusColor } from '@/features/enquiry/pages/Status';
import { DataTableWithOutBorder, type TableColumn } from '@/ui/components/DataTable/DataTableWithoutBorder';
import { useEffect, useState } from 'react';
import type { Table1 } from '@/features/salesDashboard/models/SalesDashboardModel';

interface Props {
    enquiryFollowUpData: Table1[];
}

export default function FollowUp({ enquiryFollowUpData }: Props) {

    const [tableData, setTableData] = useState<any[]>([]);

    useEffect(() => {
        setTableData(enquiryFollowUpData || []);
    }, [enquiryFollowUpData]);
    //#endregion

    //#region
    const columns: TableColumn[] = [
        {
            key: 'Name',
            label: 'Client Name',
            render: (value) => value || "-",
        },
        {
            key: 'EnquiryFollowUpDays',
            label: 'Due Day(s)',
            align: 'center',
            render: (value) => value || "-",
        },
        {
            key: 'NextFollowUpDate',
            label: 'Next FollowUp Date',
            sortable: false,
            align: 'left',
            render: value => value ? formatDate_dd_MonthName_yy(value) : '-'
        },
        {
            key: 'FinalStage',
            label: 'Status',
            align: 'center',
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
    //#endregion

    //#region
    return (
        <div className="space-y-4 flex flex-col h-full w-full min-w-0">
            <h2 className="text-lg font-semibold text-gray-800">Follow Up </h2>
            <div className="flex flex-row gap-4 items-stretch flex-1 min-w-0 min-h-0">
                <div className="flex-1 bg-white rounded-xl p-5 shadow-sm border border-gray-100 min-w-0 overflow-hidden flex flex-col">
                    <div className='h-[280px] overflow-y-auto thin-scroll'>
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
    );
}