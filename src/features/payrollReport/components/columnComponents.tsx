import React from 'react';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { getStatusBadgeClasses } from '@/features/attendanceCalendar/utils/attendanceUtils';

export const EmployeeTooltip: React.FC<{ value: any }> = ({ value }) => (
    <TooltipText text={value || '-'} maxWidth="250px" tooltipThreshold={25} />
);

export const AddressTooltip: React.FC<{ value: any }> = ({ value }) => (
    <TooltipText text={value || '-'} maxWidth="200px" tooltipThreshold={20} />
);

export const StatusBadge: React.FC<{ value: any }> = ({ value }) => {
    const status = value || '-';
    if (status === '-') return <>-</>;
    const badge = getStatusBadgeClasses(status);
    return (
        <div className="flex items-center" style={{ height: '100%', width: '100%' }}>
            <div
                className="text-xs rounded border inline-flex items-center justify-center"
                style={{
                    backgroundColor: `${badge.backgroundColor}20`,
                    color: badge.color,
                    borderColor: `${badge.backgroundColor}40`,
                    height: '24px', width: '90px',
                    fontSize: '12px', fontWeight: '500', lineHeight: '1',
                    padding: '0 8px', boxSizing: 'border-box',
                    textAlign: 'center', whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                }}
            >
                {status}
            </div>
        </div>
    );
};