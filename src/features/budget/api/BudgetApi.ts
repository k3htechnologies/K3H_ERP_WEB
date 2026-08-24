export const BudgetApi = {
    PULL: '/Budget/PullBudget',
    ADD_UPDATE: '/Budget/AddUpdateBudget'

} as const

export type BudgetApiKeys = keyof typeof BudgetApi;