export const BranchMasterApi = {
    PULL: '/BranchMaster/PullBranchMaster',
    ADD_UPDATE: '/BranchMaster/AddUpdateBranchMaster',
    DELETE: '/BranchMaster/DeleteBranchMaster'
} as const

export type BranchMasterApiKeys = keyof typeof BranchMasterApi