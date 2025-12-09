export const ProjectRERADocumentCategoryMasterApi = {
    PULL : "/ProjectRERADocumentCategory/PullProjectRERADocumentCategory",
    ADD_UPDATE : "/ProjectRERADocumentCategory/AddUpdateProjectRERADocumentCategory",
    DELETE : "/ProjectRERADocumentCategory/DeleteProjectRERADocumentCategory",
} as const

export type ProjectRERADocumentCategoryMasterApiKeys = keyof typeof ProjectRERADocumentCategoryMasterApi