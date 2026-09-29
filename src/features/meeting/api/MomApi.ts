export const MomApi = {
    ADD_UPDATE: '/MOM/AddUpdateMOMDocuments',
} as const

export type MomApiKeys = keyof typeof MomApi
