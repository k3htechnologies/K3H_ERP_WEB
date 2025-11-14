export const ShiftMasterApi = {
    PULL: '/ShiftManagementMaster/PullShiftManagementMaster',
    ADD_UPDATE: '/ShiftManagementMaster/AddUpdateShiftManagementMaster',
    DELETE: '/ShiftManagementMaster/DeleteShiftManagementMaster'
} as const

export type ShiftMasterApiKeys = keyof typeof ShiftMasterApi