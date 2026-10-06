export const LitigationApi = {

    PULL: '/Litigation/PullLitigation',
    ADD_UPDATE: '/Litigation/AddUpdateLitigation',
    DELETE: '/Litigation/DeleteLitigation',
    UPDATE_REOPEN: '/Litigation/UpdateLitigationReopen',
    PRIORITY_UPDATE: '/Litigation/AddUpdateLitigationPriority'

} as const

export type LitigationApiKeys = keyof typeof LitigationApi