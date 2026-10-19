export const BaselineCostPlanDocumentApi = {
    PULL : "/BaselineCostPlanDocument/PullBaselineCostPlanDocument",
    ADD_UPDATE : "/BaselineCostPlanDocument/AddUpdateBaselineCostPlanDocument",
    DELETE : "/BaselineCostPlanDocument/DeleteBaselineCostPlanDocument",
} as const

export type BaselineCostPlanDocumentApiKeys = keyof typeof BaselineCostPlanDocumentApi