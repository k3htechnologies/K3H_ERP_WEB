export const LitigationApi = {
    PULL: '/Litigation/PullLitigation',
    ADD_UPDATE: '/Litigation/AddUpdateLitigation',
    DELETE: '/Litigation/DeleteLitigation',

    //HEARING
    PULL_HEARING: '/Litigation/PullLitigationHearing',
    ADD_UPDATE_HEARING: '/Litigation/AddUpdateLitigationHearing',
    DELETE_HEARING: '/Litigation/DeleteLitigationHearing',

    //HEARING CLOSURE
    PULL_CLOSURE: '/Litigation/PullLitigationClosure',
    ADD_UPDATE_CLOSURE: '/Litigation/AddUpdateLitigationClosure',
} as const

export type LitigationApiKeys = keyof typeof LitigationApi