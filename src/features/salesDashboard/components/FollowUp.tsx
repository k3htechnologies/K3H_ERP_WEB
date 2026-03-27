import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { getStatusColor } from '@/features/enquiry/pages/Status';
import { DataTableWithOutBorder, type TableColumn } from '@/ui/components/DataTable/DataTableWithoutBorder';
import { useEffect, useState } from 'react';
import type { Table1 } from '@/features/salesDashboard/models/SalesDashboardModel';
import TooltipText from '@/ui/components/Tooltip/TooltipText';

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
            key: 'EnquiryFollowUpDays',
            label: 'Due Day',
            align: 'center',
            render: (value) => value || "-",
        },
        {
            key: 'NextFollowUpDate',
            label: 'Next FollowUp Date',
            sortable: false,
            align: 'center',
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
            key: 'CreatedDate',
            label: 'Created Date',
            sortable: false,
            align: 'center',
            render: value => value ? formatDate_dd_MonthName_yy(value) : '-'
        },
    ]
    //#endregion

    //#region
    return (
        <div className="space-y-3 pt-4">

            <h2 className="text-lg font-semibold text-gray-800">Follow Up</h2>

            <div className="flex-1 bg-white rounded-xl p-5 h-[310px] border border-gray-100 min-w-0 overflow-hidden flex flex-col">
                
                <DataTableWithOutBorder
                    columns={columns}
                    data={tableData}
                    emptyMessage="No records Found"
                    fixedHeight={true}
                />
            </div>
        </div>
    );
}