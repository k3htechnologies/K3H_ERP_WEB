import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { getFollowUpColor, getStatusColor } from '@/features/enquiry/pages/Status';
import { DataTableWithOutBorder, type TableColumn } from '@/ui/components/DataTable/DataTableWithoutBorder';
import { useCallback, useEffect, useState } from 'react';
import type { Table1 } from '@/features/salesDashboard/models/SalesDashboardModel';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Button } from '@/ui/components/forms';
import { copyToClipboard } from '@/core/utils/comman';
import { Copy } from 'lucide-react';
import useToast from '@/core/hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/features/projectMaster/context/ProjectContext';

interface Props {
    enquiryFollowUpData: Table1[];
}

export default function FollowUp({ enquiryFollowUpData }: Props) {

    const [tableData, setTableData] = useState<any[]>([]);
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { setProjectId } = useProject();

    useEffect(() => {
        setTableData(enquiryFollowUpData || []);
    }, [enquiryFollowUpData]);


    const handleNavigateToView = useCallback((row: any) => {

        setProjectId(row.ProjectId);

        navigate(`/enquiry?search=${encodeURIComponent(row.Name)}`);

    }, [navigate, setProjectId]);

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
            sortable: false,
            fixed: 'left',
            align: 'left',
            render: (value) => {
                return (
                    <div className="flex items-center gap-2">

                        <TooltipText
                            text={value || '-'}
                            maxWidth="150px"
                            tooltipThreshold={20}
                            tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
                        />

                        {value && (
                            <Button
                                onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const success = await copyToClipboard(value);
                                    if (success) {
                                        addToast({ type: 'success', title: `${value} Copied!` });
                                    }
                                }}
                                color="transparent"
                                size="sm"
                                style={{
                                    padding: '2px 6px',
                                    color: '#6B7280',
                                    cursor: 'pointer'
                                }}
                                title="Copy"
                            >
                                <Copy className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'Name',
            label: 'Client Name',
            sortable: false,
            align: 'left',
            render: (value, row) => {
                
                if (row?.IsAction) {
                    return (
                        <TooltipText
                            text={value || '-'}
                            maxWidth="250px"
                            tooltipThreshold={25}
                            onClick={() => handleNavigateToView(row)}
                        />
                    );
                }

                return (
                    <span>
                        {value || '-'}
                    </span>
                );
            }
        },
        {
            key: 'MobileNumber',
            label: 'Mobile Number',
            fixed: 'left',
            render: (value, row) => value ? `${row.MobileNumberCountryCode || "+91"} ${value}` : '-'
        },

        {
            key: 'EnquiryFollowUpDays',
            label: 'Due Day',
            align: 'center',
            render: (value) => {
                const { text } = getFollowUpColor(value);

                return (
                    <span
                        className="inline-block px-2 py-1 rounded-full whitespace-nowrap"
                        style={{
                            color: text
                        }}
                    >
                        {value || "-"}
                    </span>
                );
            }
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

            <h2 className="text-lg font-semibold text-gray-800">Follow Up  {" "}
                <span className="text-sm font-normal text-gray-500">
                    ({tableData.length} Record's)
                </span>
            </h2>

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