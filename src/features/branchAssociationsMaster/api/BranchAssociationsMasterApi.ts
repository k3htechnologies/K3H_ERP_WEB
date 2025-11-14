export const BranchAssociationsMasterApi = {
    PULL: '/BranchAssociations/PullBranchAssociations',
    ADD_UPDATE: '/BranchAssociations/AddUpdateBranchAssociations'
} as const

export type BranchAssociationsMasterApiKeys = keyof typeof BranchAssociationsMasterApi