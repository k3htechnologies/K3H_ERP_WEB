export const BudgetApi = {

    PULL: '/Budget/PullBudget',
    ADD_UPDATE: '/Budget/AddUpdateBudget',
    SUBMIT_BUDGET_FOR_APPROVAL: '/Budget/SubmitBudgetForApproval'

} as const

export type BudgetApiKeys = keyof typeof BudgetApi;