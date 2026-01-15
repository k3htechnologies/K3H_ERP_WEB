export const BranchAssociationsMasterApi = {
    PULL: '/BranchAssociations/PullBranchAssociations',
    ADD_UPDATE: '/BranchAssociations/AddUpdateBranchAssociations',
    DELETE: '/BranchAssociations/DeleteBranchAssociations'
} as const

export type BranchAssociationsMasterApiKeys = keyof typeof BranchAssociationsMasterApi