export const CrmDashboardApi = {
    PULL: '/CrmDashboard/CrmPullDashboard',
    PULL_CRM_MILESTONE_COLLECTION: '/CrmDashboard/PullCrmMilestoneCollection'
} as const

export type CrmDashboardApiKeys = keyof typeof CrmDashboardApi
