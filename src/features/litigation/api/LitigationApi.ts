export const LitigationApi = {

    PULL: '/Litigation/PullLitigation',
    ADD_UPDATE: '/Litigation/AddUpdateLitigation',
    DELETE: '/Litigation/DeleteLitigation',

    //LITIGATION REOPEN API
    UPDATE_REOPEN: '/Litigation/UpdateLitigationReopen',

    // LITIGATION PRIORITY API
    PRIORITY_UPDATE: '/Litigation/AddUpdateLitigationPriority'

} as const

export type LitigationApiKeys = keyof typeof LitigationApi