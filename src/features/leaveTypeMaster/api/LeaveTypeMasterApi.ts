export const LeaveTypeMasterApi = {
    PULL: '/LeaveTypeMaster/PullLeaveTypeMaster',
    ADD_UPDATE: '/LeaveTypeMaster/AddUpdateLeaveTypeMaster',
    DELETE: '/LeaveTypeMaster/DeleteLeaveTypeMaster'
} as const

export type LeaveTypeMasterApiKeys = keyof typeof LeaveTypeMasterApi