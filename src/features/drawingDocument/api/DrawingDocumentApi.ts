export const DrawingDocumentApi = {
    PULL : "/DrawingDocument/PullDrawingDocument",
    ADD_UPDATE : "/DrawingDocument/AddUpdateDrawingDocument",
    DELETE : "/DrawingDocument/DeleteDrawingDocument",
    PULL_INVENTORY_DRAWING:'/DrawingDocument/PullInventoryDrawingDocument'
} as const

export type DrawingDocumentApiKeys = keyof typeof DrawingDocumentApi