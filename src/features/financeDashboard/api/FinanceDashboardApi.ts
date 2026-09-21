export const FinanceDashboardApi = {
    PULL: '/Finance/PullFinanceDashboard'
} as const

export type FinanceDashboardApiKeys = keyof typeof FinanceDashboardApi