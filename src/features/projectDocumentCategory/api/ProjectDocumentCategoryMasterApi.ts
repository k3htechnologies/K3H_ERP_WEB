export const ProjectDocumentCategoryMasterApi = {
    PULL : "/ProjectDocumentCategory/PullProjectDocumentCategory",
    ADD_UPDATE : "/ProjectDocumentCategory/AddUpdateProjectDocumentCategory",
    DELETE : "/ProjectDocumentCategory/DeleteProjectDocumentCategory",
} as const

export type ProjectDocumentCategoryMasterApiKeys = keyof typeof ProjectDocumentCategoryMasterApi