export const EarningMasterApi = {
    PULL: '/EarningMaster/PullEarningMaster',
    ADD_UPDATE: '/EarningMaster/AddUpdateEarningMaster',
    DELETE: '/EarningMaster/DeleteEarningMaster'
} as const

export type EarningMasterApiKeys = keyof typeof EarningMasterApi