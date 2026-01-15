export const LitigationDocumentApi = {
    
    PULL_DOCUMENT: '/LitigationDocument/PullLitigationDocument',
    ADD_UPDATE_DOCUMENT: '/LitigationDocument/AddUpdateLitigationDocument',
    DELETE_DOCUMENT: '/LitigationDocument/DeleteLitigationDocument',

} as const

export type LitigationDocumentApiKeys = keyof typeof LitigationDocumentApi