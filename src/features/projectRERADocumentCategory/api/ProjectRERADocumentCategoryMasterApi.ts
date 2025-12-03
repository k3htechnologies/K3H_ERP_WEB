export const ProjectRERADocumentCategoryMasterApi = {
    PULL : "/ProjectRERADocumentCategory/PullRERAProjectDocumentCategory",
    ADD_UPDATE : "/ProjectRERADocumentCategory/AddUpdateProjectRERADocumentCategory",
    DELETE : "/ProjectRERADocumentCategory/DeleteProjectRERADocumentCategory",
} as const

export type ProjectRERADocumentCategoryMasterApiKeys = keyof typeof ProjectRERADocumentCategoryMasterApi