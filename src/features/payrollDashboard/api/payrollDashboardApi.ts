export const PayrollDashboardApi={
     PULL: '/PayrollDashboard/PullPayrollDashboard'
} as const

export type PayrollDashboardApiKeys = keyof typeof PayrollDashboardApi