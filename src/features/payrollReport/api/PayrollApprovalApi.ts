export const PayrollApprovalApi = {
    PULL: '/Approval/PullApprovalStatus',
    ADD: '/Approval/AddApproval',
} as const

export type PayrollApprovalApiKeys = keyof typeof PayrollApprovalApi
