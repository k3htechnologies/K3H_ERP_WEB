export const DrawingDocumentApi = {
    PULL : "/DrawingDocument/PullDrawingDocument",
    ADD_UPDATE : "/DrawingDocument/AddUpdateDrawingDocument",
    DELETE : "/DrawingDocument/DeleteDrawingDocument",
} as const

export type DrawingDocumentApiKeys = keyof typeof DrawingDocumentApi