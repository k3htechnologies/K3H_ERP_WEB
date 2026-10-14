export const UserDashboardApi = {
     PULL: '/Dashboard/PullDashboard',
     PULL_MODULE_APPROVAL: '/Dashboard/PullModuleApproval'
} as const

export type UserDashboardApiKeys = keyof typeof UserDashboardApi