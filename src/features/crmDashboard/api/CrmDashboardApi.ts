export const CrmDashboardApi = {
    PULL: '/CrmDashboard/CrmPullDashboard'
} as const

export type CrmDashboardApiKeys = keyof typeof CrmDashboardApi
