export const LitigationHearingApi = {

    PULL_HEARING: '/Litigation/PullLitigationHearing',
    ADD_UPDATE_HEARING: '/Litigation/AddUpdateLitigationHearing',
    DELETE_HEARING: '/Litigation/DeleteLitigationHearing',

} as const

export type LitigationHearingApiKeys = keyof typeof LitigationHearingApi