export const LitigationApi = {
    PULL: '/Litigation/PullLitigation',
    ADD_UPDATE:'/Litigation/AddUpdateLitigation',
    DELETE:'/Litigation/DeleteLitigation'
} as const

export type LitigationApiKeys = keyof typeof LitigationApi