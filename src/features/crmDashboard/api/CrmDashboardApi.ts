export const CrmDashboardApi = {
    PULL: '/CrmDashboard/CrmPullDashboard',
    PULL_MILESTONE_COLLECTION_NEW: '/CrmDashboard/PullCrmMilestoneCollection',
    PULL_MILESTONE_SUMMARY: '/CrmDashboard/PullCrmCollectionSummary'

} as const

export type CrmDashboardApiKeys = keyof typeof CrmDashboardApi
