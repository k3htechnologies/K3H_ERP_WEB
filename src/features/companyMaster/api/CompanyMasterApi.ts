export const CompanyMasterApi = {

    PULL: '/Company/PullCompany',
    ADD_UPDATE: '/Company/AddUpdateCompany',
    DELETE: '/Company/DeleteCompany',
    PULL_COMPANY_WITH_BANK_DETAILS: '/Company/PullCompanyWithBankDetails',
    ADD_UPDATE_COMPANY_WITH_BANK_DETAILS: '/Company/AddUpdateCompanyWithBankDetails',
    DELETE_COMPANY_WITH_BANK_DETAILS: '/Company/DeleteCompanyWithBankDetails'

} as const

export type CompanyMasterApiKeys = keyof typeof CompanyMasterApi