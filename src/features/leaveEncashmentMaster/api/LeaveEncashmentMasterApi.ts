export const LeaveEncashmentMasterApi = {
    PULL: '/LeaveEncashmentMasterSlabs/PullLeaveEncashmentMasterSlabs',
    ADD_UPDATE: '/LeaveEncashmentMasterSlabs/AddUpdateLeaveEncashmentMasterSlabs',
    DELETE: '/LeaveEncashmentMasterSlabs/DeleteLeaveEncashmentMasterSlabs'
} as const

export type LeaveEncashmentMasterApiKeys = keyof typeof LeaveEncashmentMasterApi