export const LeaveApi = {
    PULL: '/Leave/PullLeave',
    ADD_UPDATE: '/Leave/AddUpdateLeave',
    DELETE: '/Leave/DeleteLeave',

} as const

export type LeaveApiKeys = keyof typeof LeaveApi

