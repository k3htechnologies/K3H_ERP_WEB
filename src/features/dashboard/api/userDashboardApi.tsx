export const UserDashboardApi={
     PULL: '/Dashboard/PullDashboard'
} as const

export type UserDashboardApiKeys = keyof typeof UserDashboardApi