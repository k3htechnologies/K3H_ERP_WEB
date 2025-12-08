export const ProjectRERADocumentApi = {
    PULL: "/ProjectRERADocument/PullProjectRERADocument",
    ADD_UPDATE: "/ProjectRERADocument/AddUpdateProjectRERADocument",
    DELETE: "/ProjectRERADocument/DeleteProjectRERADocument",
} as const

export type ProjectRERADocumentApiKeys = keyof typeof ProjectRERADocumentApi