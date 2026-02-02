export const InventoryDashboardApi = {
    PULL: '/InventoryDashboard/PullInventoryDashboard'
} as const

export type InventoryDashboardApiKeys = keyof typeof InventoryDashboardApi