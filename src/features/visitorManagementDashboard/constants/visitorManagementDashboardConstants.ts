import type { VisitorManagementDashboardFilterType } from '@/features/visitorManagementDashboard/models/VisitorManagementDashboardModel';

export const VISITOR_LIST_TITLE: Record<VisitorManagementDashboardFilterType, string> = {
    TODAY: "Today's Visitors",
    WEEKLY: "This Week's Visitors",
    MONTHLY: "This Month's Visitors",
};
