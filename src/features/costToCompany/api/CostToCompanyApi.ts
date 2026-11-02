export const CostToCompanyApi = {

    PULL: '/CostToCompany/PullCostToCompany',
    PULL_COST_TO_COMPANY_BY_ID: '/CostToCompany/PullCostToCompanyById',
    ADD_UPDATE: '/CostToCompany/AddUpdateCostToCompany',
    DELETE: '/CostToCompany/DeleteCostToCompany',

} as const

export type CostToCompanyApiKeys = keyof typeof CostToCompanyApi;