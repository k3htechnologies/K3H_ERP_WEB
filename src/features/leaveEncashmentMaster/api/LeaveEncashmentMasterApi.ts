export const LeaveEncashmentMasterApi = {
    PULL: '/LeaveEncashmentMasterSlabs/PullLeaveEncashmentMasterSlabs',
    ADD_UPDATE: '/LeaveEncashmentMasterSlabs/AddUpdateLeaveEncashmentMasterSlabs',
    DELETE: '/LeaveEncashmentMasterSlabs/AddUpdateLeaveEncashmentMasterSlabs'
} as const

export type LeaveEncashmentMasterApiKeys = keyof typeof LeaveEncashmentMasterApi