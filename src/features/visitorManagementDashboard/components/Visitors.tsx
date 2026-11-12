import { Bell, LogIn, LogOut } from 'lucide-react';
import { type TableColumn } from '@/ui/components/DataTable/DataTableWithoutBorder';
import { DataTableWithHeaderRowDivider } from '@/ui/components/DataTable/DataTableWithHeaderRowDivider';
import { Button } from '@/ui/components/forms';
import FieldInfoTooltip from '@/ui/components/forms/FieldInfoTooltip';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { getNameInitials } from '@/core/utils/getNameInitials';
import { getStatusColor } from '@/features/gatePass/utils/Status';
import type { VisitorTable, VisitorManagementDashboardFilterType } from '@/features/visitorManagementDashboard/models/VisitorManagementDashboardModel';
import { formatVisitorDateTime, getGatePassStatusColor } from '@/features/visitorManagementDashboard/utils/visitorManagementDashboardUtils';
import { VISITOR_LIST_TITLE } from '@/features/visitorManagementDashboard/constants/visitorManagementDashboardConstants';

interface Props {
    visitorData: VisitorTable[];
    filterType: VisitorManagementDashboardFilterType;
    onLogin?: (row: VisitorTable) => void;
    onLogout: (row: VisitorTable) => void;
    onBell: (row: VisitorTable) => void;
}

export default function Visitors({ visitorData, filterType, onLogin, onLogout, onBell }: Props) {

    const columns: TableColumn[] = [
        {
            key: 'VisitorName',
            label: 'Visitor Name',
            sortable: false,
            fixed: 'left',
            align: 'left',
            render: (value, row) => {
                const fullName = (value ?? '').trim();
                const hasProfile = row?.PhotoURL && row.PhotoURL !== '—';

                return (
                    <div className="flex items-center gap-3 min-w-0">
                        {hasProfile ? (
                            <img
                                src={row.PhotoURL}
                                alt={fullName}
                                className="w-7 h-7 rounded-full object-cover border border-gray-300 shrink-0"
                            />
                        ) : (
                            <div
                                className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center text-gray-800 font-medium text-xs border border-gray-300 shrink-0"
                                title={fullName || '-'}
                            >
                                {getNameInitials(fullName)}
                            </div>
                        )}
                        <div className="min-w-0">
                            <TooltipText
                                text={fullName}
                                maxWidth="150px"
                                tooltipThreshold={20}
                            />
                            {Number(row?.NoOfParticipants) > 0 && (
                                <p className="text-sm text-gray-900">+ {row.NoOfParticipants}</p>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'Contact',
            label: 'Mobile Number',
            sortable: false,
            align: 'left',
            render: (value) => value ? `+91 ${value}` : '-',
        },
        {
            key: 'AppointmentWith',
            label: 'Appointment With',
            sortable: false,
            align: 'left',
            render: (value) => value || '-',
        },
        {
            key: 'Purpose',
            label: 'Purpose',
            sortable: false,
            align: 'center',
            render: (value) => {
                const { bg, text } = getStatusColor(value);
                return (
                    <span
                        className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                        style={{ backgroundColor: bg, color: text }}
                    >
                        {value || '-'}
                    </span>
                );
            }
        },
        {
            key: 'CheckInTime',
            label: 'Check-In Time',
            sortable: false,
            align: 'center',
            render: (value) => value ? formatVisitorDateTime(value, filterType) : '-',
        },
        {
            key: 'CheckOutTime',
            label: 'Check-Out Time',
            sortable: false,
            align: 'center',
            render: (value, row) => (row?.Status === 'Checked Out' && value) ? formatVisitorDateTime(value, filterType) : '-',
        },
        {
            key: 'Status',
            label: 'Status',
            sortable: false,
            align: 'center',
            render: (value, row) => {
                const status = String(value || row?.Status || '').trim();
                const { bg, text } = getGatePassStatusColor(status);
                const approvalRemark = row?.ApprovalRemark ? String(row.ApprovalRemark).trim() : '';

                return (
                    <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap" style={{ backgroundColor: bg, color: text }}>
                            • {status || '-'}
                        </span>
                        {approvalRemark && (
                            <FieldInfoTooltip value={approvalRemark} />
                        )}
                    </div>
                );
            },
        },
        {
            key: 'Actions',
            label: 'Action',
            sortable: false,
            fixed: 'right',
            align: 'center',
            render: (_value, row) => {
                const isInDisabled =  !row?.IsApproval;
                const isOutDisabled = !row?.IsCheckOutEnabled;
                const isBellDisabled = !row?.IsNotificationEnabled;

                return (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (isInDisabled) return;
                                onLogin?.(row);
                            }}
                            color="transparent"
                            isborderRadius
                            disabled={isInDisabled}
                            size="sm"
                            style={{
                                color: isInDisabled ? "#9CA3AF" : "#16A34A",
                                padding: "4px 8px",
                                cursor: isInDisabled ? "not-allowed" : "pointer",
                                opacity: isInDisabled ? 0.5 : 1,
                            }}
                        >
                            <LogIn className="h-4 w-4" />
                        </Button>
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (isOutDisabled) return;
                                onLogout(row);
                            }}
                            color="transparent"
                            isborderRadius
                            disabled={isOutDisabled}
                            size="sm"
                            style={{
                                color: isOutDisabled ? "#9CA3AF" : "red",
                                padding: "4px 8px",
                                cursor: isOutDisabled ? "not-allowed" : "pointer",
                                opacity: isOutDisabled ? 0.5 : 1,
                            }}
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (isBellDisabled) return;
                                onBell(row);
                            }}
                            color="transparent"
                            isborderRadius
                            disabled={isBellDisabled}
                            size="sm"
                            style={{
                                color: isBellDisabled ? "#9CA3AF" : "red",
                                padding: "4px 8px",
                                cursor: isBellDisabled ? "not-allowed" : "pointer",
                                opacity: isBellDisabled ? 0.5 : 1,
                            }}
                        >
                            <Bell className="h-4 w-4" />
                        </Button>
                    </div>
                );
            }
        },
    ];

    return (
        <div className="space-y-3 pt-4">
            <div className="flex-1 bg-white rounded-xl  h-[475px] border border-gray-100 min-w-0 overflow-hidden flex flex-col">
                <h3 className="font-semibold text-gray-500  p-5 uppercase">
                    {VISITOR_LIST_TITLE[filterType]} <span className="text-sm font-normal text-gray-500">
                        ({visitorData.length} Records)
                    </span>
                </h3>
                <div className='flex-1 min-h-0'>
                    <DataTableWithHeaderRowDivider
                        columns={columns}
                        data={visitorData}
                        emptyMessage="No records Found"
                        fixedHeight={true}
                        className="flex-1"
                    />
                </div>
            </div>
        </div>
    );
}