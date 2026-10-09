export const FinanceDashboardApi = {
    PULL: '/FinanceDashboard/PullFinanceDashboard'
} as const

export type FinanceDashboardApiKeys = keyof typeof FinanceDashboardApi