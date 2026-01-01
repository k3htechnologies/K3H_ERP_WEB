export const ApprovalDocumentApi = {
    PULL : "/ApprovalDocument/PullApprovalDocument",
    ADD_UPDATE : "/ApprovalDocument/AddUpdateApprovalDocument",
    DELETE : "/ApprovalDocument/DeleteApprovalDocument",
} as const

export type ApprovalDocumentApiKeys = keyof typeof ApprovalDocumentApi

