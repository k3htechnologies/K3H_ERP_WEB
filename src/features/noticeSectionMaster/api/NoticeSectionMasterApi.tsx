export const NoticeSectionMasterApi = {
    PULL: '/NoticeSectionMaster/PullNoticeSectionMaster',
    ADD_UPDATE: '/NoticeSectionMaster/AddUpdateNoticeSectionMaster',
    DELETE: '/NoticeSectionMaster/DeleteNoticeSectionMaster'
} as const

export type NoticeSectionMasterApiKeys = keyof typeof NoticeSectionMasterApi