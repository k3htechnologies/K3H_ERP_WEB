export const BudgetLevelMasterApi = {

    PULL: '/BudgetLevelMaster/PullBudgetLevelMaster',
    ADD_UPDATE: '/BudgetLevelMaster/AddUpdateBudgetLevelMaster',
    DELETE: '/BudgetLevelMaster/DeleteBudgetLevelMaster'

} as const

export type BudgetLevelMasterApiKeys = keyof typeof BudgetLevelMasterApi;