export const AssetMasterApi = {
    PULL: '/AssetMaster/PullAssetMaster',
    ADD_UPDATE: '/AssetMaster/AddUpdateAssetMaster',
    DELETE: '/AssetMaster/DeleteAssetMaster',
    PULL_VERIFY_ASSET_MASTER: '/Static/VerifyAssetMaster',

} as const

export type AssetMasterApiKeys = keyof typeof AssetMasterApi