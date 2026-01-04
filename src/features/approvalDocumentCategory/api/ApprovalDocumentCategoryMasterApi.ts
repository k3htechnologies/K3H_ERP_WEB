export const ApprovalDocumentCategoryMasterApi = {
    PULL : "/ApprovalDocumentCategory/PullApprovalDocumentCategory",
    ADD_UPDATE : "/ApprovalDocumentCategory/AddUpdateApprovalDocumentCategory",
    DELETE : "/ApprovalDocumentCategory/DeleteApprovalDocumentCategory",
} as const

export type ApprovalDocumentCategoryMasterApiKeys = keyof typeof ApprovalDocumentCategoryMasterApi


