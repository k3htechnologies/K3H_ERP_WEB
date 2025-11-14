export const AssetMappingMasterApi = {
    PULL: '/AssetMasterMappingMapping/PullAssetMasterMapping',
    ADD_UPDATE: '/AssetMasterMappingMapping/AddUpdateAssetMasterMapping',
    DELETE: '/AssetMasterMappingMapping/DeleteAssetMasterMapping'
} as const

export type AssetMappingMasterApiKeys = keyof typeof AssetMappingMasterApi