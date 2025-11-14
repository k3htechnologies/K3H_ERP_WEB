export const DeductionMasterApi = {
    PULL: '/DeductionMaster/PullDeductionMaster',
    ADD_UPDATE: '/DeductionMaster/AddUpdateDeductionMaster',
    DELETE: '/DeductionMaster/DeleteDeductionMaster'
} as const

export type DeductionMasterApiKeys = keyof typeof DeductionMasterApi