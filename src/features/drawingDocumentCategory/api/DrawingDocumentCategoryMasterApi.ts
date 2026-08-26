export const DrawingDocumentCategoryMasterApi = {
    PULL : "/DrawingDocumentCategory/PullDrawingDocumentCategory",
    ADD_UPDATE : "/DrawingDocumentCategory/AddUpdateDrawingDocumentCategory",
    DELETE : "/DrawingDocumentCategory/DeleteDrawingDocumentCategory",
} as const

export type DrawingDocumentCategoryMasterApiKeys = keyof typeof DrawingDocumentCategoryMasterApi