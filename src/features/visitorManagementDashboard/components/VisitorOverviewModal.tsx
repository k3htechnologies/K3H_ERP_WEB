import { useMemo } from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { DataTable, type PaginationInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import FieldInfoTooltip from '@/ui/components/forms/FieldInfoTooltip';
import { getStatusColor } from '@/features/gatePass/utils/Status';
import type { VisitorTable, VisitorManagementDashboardFilterType } from '@/features/visitorManagementDashboard/models/VisitorManagementDashboardModel';
import { formatVisitorDateTime, getGatePassStatusColor } from '@/features/visitorManagementDashboard/utils/visitorManagementDashboardUtils';

interface Props {
    isOpen: boolean;
    title: string;
    visitorData: VisitorTable[];
    filterType: VisitorManagementDashboardFilterType;
    onClose: () => void;
}

export default function VisitorOverviewModal({ isOpen, title, visitorData, filterType, onClose }: Props) {

    const columns: TableColumn[] = useMemo(() => [
        {
            key: 'VisitorName',
            label: 'Visitor Name',
            sortable: false,
            render: (value, row) => (
                <div className="min-w-0">
                    <TooltipText
                        text={value}
                        maxWidth="150px"
                        tooltipThreshold={20}
                    />
                    {Number(row?.NoOfParticipants) > 0 && (
                        <p className="text-sm text-gray-900">+ {row.NoOfParticipants}</p>
                    )}
                </div>
            ),
        },
        {
            key: 'Contact',
            label: 'Contact',
            sortable: false,
            render: (value) => value ? `+91 ${value}` : '-',
        },
        {
            key: 'AppointmentWith',
            label: 'Appointment With',
            sortable: false,
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
            },
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
            key: "Remark",
            label: "Remark",
            align: "left",
            width: "30",
            render: (value) => (
                <FieldInfoTooltip value={value} />
            )
        },
    ], [filterType]);

    const visitorOverviewPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: 1,
            totalPages: 1,
            totalRecords: visitorData.length,
            pageSize: visitorData.length,
            onPageChange: () => { }
        }),
        [visitorData]
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${title} (${visitorData.length})`}
            size="large-half"
        >
            <DataTable
                data={visitorData}
                columns={columns}
                recordsPerPage={visitorData.length}
                fixedHeight
                className="flex-1"
                pagination={visitorOverviewPaginationInfo}
            />
        </Modal>
    );
}