export const AssetMasterApi = {
    PULL: '/AssetMaster/PullAssetMaster',
    ADD_UPDATE: '/AssetMaster/AddUpdateAssetMaster',
    DELETE: '/AssetMaster/DeleteAssetMaster'
} as const

export type AssetMasterApiKeys = keyof typeof AssetMasterApi