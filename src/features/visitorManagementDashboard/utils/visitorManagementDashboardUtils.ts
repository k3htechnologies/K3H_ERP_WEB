import { formatDate_dd_MonthName_yy_hh_mm, formatTimeFromDateTime } from '@/core/utils/dateFormat';
import type { 
    VisitorTable, 
    TimelineTable, 
    VisitorManagementDashboardFilterType, 
    OverviewTable, 
    VisitorTimelineSlot,
    PurposeTable
} from '@/features/visitorManagementDashboard/models/VisitorManagementDashboardModel';

export const formatVisitorDateTime = (dateTime: string, filterType: VisitorManagementDashboardFilterType) =>
    filterType === 'TODAY' ? formatTimeFromDateTime(dateTime) : formatDate_dd_MonthName_yy_hh_mm(dateTime);

export const getVisitorOverviewCardData = (cardKey: keyof OverviewTable, visitorData: VisitorTable[]): VisitorTable[] => {
    switch (cardKey) {
        case 'CurrentlyInside':
            return visitorData.filter((row) => {
                const s = String(row.Status || '').toLowerCase().trim();
                if (
                    s === 'checked out' || 
                    s.includes('checked out') || 
                    s.includes('overstay') || 
                    s.includes('not checked out')
                ) {
                    return false;
                }
                return (
                    s.includes('currently in') || 
                    s.includes('currentlyin') || 
                    s.includes('current in') ||
                    s.includes('inside') || 
                    s.includes('checked in') ||
                    s === 'in' || 
                    s.endsWith(' in') ||
                    s.startsWith('in ')
                );
            });
        case 'ExpectedToday':
            return visitorData.filter((row) => {
                const s = String(row.Status || '').toLowerCase().trim();
                return (
                    s.includes('expected') ||
                    s.includes('not arrived') ||
                    s.includes('not arrive') ||
                    s.includes('upcoming')
                );
            });
        case 'PendingApprovals':
            return visitorData.filter((row) => {
                const s = String(row.Status || '').toLowerCase().trim();
                const isApprovalPending = Boolean(row.IsApproval);
                return isApprovalPending || s.includes('pending');
            });
        case 'Overstaying':
            return visitorData.filter((row) => {
                const s = String(row.Status || '').toLowerCase().trim();
                return (
                    s.includes('overstay') ||
                    s.includes('not checked out') ||
                    s.includes('not check out')
                );
            });
        case 'CheckedOut':
            return visitorData.filter((row) => {
                const s = String(row.Status || '').toLowerCase().trim();
                return s.includes('checked out') || s.includes('check out') || s === 'out' || s.includes('completed');
            });
        default:
            return visitorData;
    }
};

export const getVisitorTimelineData = (timelineData: TimelineTable[]): VisitorTimelineSlot[] => {
    const sortedData = [...timelineData].sort(
        (a, b) => new Date(a.VisitTime).getTime() - new Date(b.VisitTime).getTime()
    );

    return sortedData.reduce<VisitorTimelineSlot[]>((slots, row) => {
        const timeLabel = formatTimeFromDateTime(row.VisitTime);
        const entry = {
            VisitorName: row.VisitorName,
            NoOfParticipants: row.NoOfParticipants,
            Status: row.Status,
        };

        const existingSlot = slots.find((slot) => slot.TimeLabel === timeLabel);

        if (existingSlot) {
            existingSlot.Entries.push(entry);
        } else {
            slots.push({ TimeLabel: timeLabel, Entries: [entry] });
        }

        return slots;
    }, []);
};

export const getPurposeWiseVisitorData = (
    purposeData: PurposeTable[] = [], 
    visitorsList: VisitorTable[] = []
): PurposeTable[] => {
    if (purposeData && purposeData.length > 0) {
        return purposeData.map((item) => {
            const purposeName = (item.Purpose || '').trim();
            const listCount = visitorsList.filter(
                (v) => (v.Purpose || '').trim().toLowerCase() === purposeName.toLowerCase()
            ).length;

            const directCount =
                (item.VisitorCount !== undefined && item.VisitorCount !== null)
                    ? item.VisitorCount
                    : (item as any).TotalCount
                    ?? (item as any).Count
                    ?? (item as any).Total
                    ?? (item as any).TotalVisitors
                    ?? (item as any).NoOfVisitors
                    ?? listCount;

            const finalCount = Number(directCount) || 0;

            
            let percentage = 0;
            if (finalCount > 0) {
                if (item.Percentage && item.Percentage > 0) {
                    percentage = item.Percentage;
                } else if (visitorsList.length > 0) {
                    percentage = Math.round((finalCount / visitorsList.length) * 100);
                }
            }

            return {
                ...item,
                Purpose: purposeName,
                VisitorCount: finalCount,
                Percentage: percentage,
            };
        });
    }

    if (visitorsList && visitorsList.length > 0) {
        const purposeCountMap: Record<string, number> = {};
        visitorsList.forEach((row) => {
            const p = (row.Purpose || 'Other').trim();
            purposeCountMap[p] = (purposeCountMap[p] || 0) + 1;
        });

        const total = visitorsList.length;
        const defaultPurposes = ["Delivery", "Guest", "Interview", "Meeting", "Other"];
        const allPurposes = Array.from(new Set([...defaultPurposes, ...Object.keys(purposeCountMap)]));

        return allPurposes.map((p) => {
            const count = purposeCountMap[p] || 0;
            return {
                Purpose: p,
                VisitorCount: count,
                Percentage: (total > 0 && count > 0) ? Math.round((count / total) * 100) : 0,
            };
        });
    }

    return [];
};

export { getGatePassStatusColor, getAlertColor } from './Status';
export type { StatusColor, AlertColor } from './Status';
