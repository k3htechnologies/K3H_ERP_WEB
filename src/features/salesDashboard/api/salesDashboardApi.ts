export const SalesDashboardApi = {
    PULL: '/SalesDashboard/PullSalesDashboard'
} as const

export type SalesDashboardApiKeys = keyof typeof SalesDashboardApi