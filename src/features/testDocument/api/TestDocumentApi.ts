export const TestDocumentApi = {
    PULL : "/TestDocument/PullTestDocument",
    ADD_UPDATE : "/TestDocument/AddUpdateTestDocument",
    DELETE : "/TestDocument/DeleteTestDocument",
} as const

export type TestDocumentApiKeys = keyof typeof TestDocumentApi