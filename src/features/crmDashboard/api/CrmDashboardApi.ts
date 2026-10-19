export const CrmDashboardApi = {
    PULL: '/CrmDashboard/CrmPullDashboard',
    PULL_CRM_MILESTONE_COLLECTION: '/CrmDashboard/PullCrmMilestoneCollection',
    // Two New Api's add-ons
    PULL_COLLECTION_TREND: '/CrmDashboard/PullCollectionTrend',
    PULL_MILESTONE_COLLECTION: '/CrmDashboard/PullMilestoneCollection',

} as const

export type CrmDashboardApiKeys = keyof typeof CrmDashboardApi
