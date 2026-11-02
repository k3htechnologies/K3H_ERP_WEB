export const BaselineCostPlanDocumentCategoryMasterApi = {
    PULL : "/BaselineCostPlanDocumentCategory/PullBaselineCostPlanDocumentCategory",
    ADD_UPDATE : "/BaselineCostPlanDocumentCategory/AddUpdateBaselineCostPlanDocumentCategory",
    DELETE : "/BaselineCostPlanDocumentCategory/DeleteBaselineCostPlanDocumentCategory",
} as const

export type BaselineCostPlanDocumentCategoryMasterApiKeys = keyof typeof BaselineCostPlanDocumentCategoryMasterApi