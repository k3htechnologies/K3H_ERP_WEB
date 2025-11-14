export const ShiftMappingMasterApi = {
    PULL: '/ShiftManagementMasterMapping/PullShiftManagementMasterMapping',
    ADD_UPDATE: '/ShiftManagementMasterMapping/AddUpdateShiftManagementMasterMapping',
    DELETE: '/ShiftManagementMasterMapping/DeleteShiftManagementMasterMapping'
} as const

export type ShiftMappingMasterApiKeys = keyof typeof ShiftMappingMasterApi