export const LeaveApi = {
    PULL: '/Leave/PullLeave',
    ADD_UPDATE: '/Leave/AddUpdateLeave',
    DELETE: '/Leave/DeleteLeave',
    PULL_LEAVE_CONFIGURED: '/Leave/PullLeaveConfigured',
} as const

export type LeaveApiKeys = keyof typeof LeaveApi
