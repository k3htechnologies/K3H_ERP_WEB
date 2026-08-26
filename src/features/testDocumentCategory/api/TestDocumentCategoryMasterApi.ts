export const TestDocumentCategoryMasterApi = {
    PULL : "/TestDocumentCategory/PullTestDocumentCategory",
    ADD_UPDATE : "/TestDocumentCategory/AddUpdateTestDocumentCategory",
    DELETE : "/TestDocumentCategory/DeleteTestDocumentCategory",
} as const

export type TestDocumentCategoryMasterApiKeys = keyof typeof TestDocumentCategoryMasterApi