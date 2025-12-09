export const ProjectDocumentApi = {
    PULL : "/ProjectDocument/PullProjectDocument",
    ADD_UPDATE : "/ProjectDocument/AddUpdateProjectDocument",
    DELETE : "/ProjectDocument/DeleteProjectDocument",
} as const

export type ProjectDocumentApiKeys = keyof typeof ProjectDocumentApi