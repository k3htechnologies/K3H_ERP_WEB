export const BudgetApi = {

    PULL: '/Budget/PullBudget',
    ADD_UPDATE: '/Budget/AddUpdateBudget',
    SUBMIT_BUDGET_FOR_APPROVAL: '/Budget/SubmitBudgetForApproval',
    INVENTORY_PROJECT_BASEMENT_PODIUM_WING_BUDGET: '/Budget/PullInventoryProjectBasementPodiumWingBudget'

} as const

export type BudgetApiKeys = keyof typeof BudgetApi;