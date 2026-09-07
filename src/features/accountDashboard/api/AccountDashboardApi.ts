export const AccountDashboardApi = {
    PULL: '/AccountDashboard/PullAccountDashboard'
} as const

export type AccountDashboardApiKeys = keyof typeof AccountDashboardApi