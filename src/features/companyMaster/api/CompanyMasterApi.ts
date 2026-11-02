export const CompanyMasterApi = {

    PULL: '/Company/PullCompany',
    ADD_UPDATE: '/Company/AddUpdateCompany',
    DELETE: '/Company/DeleteCompany',
    PULL_COMPANY_WITH_BANK_DETAILS: '/Company/PullCompanyWithBankDetails',
    ADD_UPDATE_COMPANY_WITH_BANK_DETAILS: '/Company/AddUpdateCompanyWithBankDetails',
    DELETE_COMPANY_WITH_BANK_DETAILS: '/Company/DeleteCompanyWithBankDetails',

    PULL_COMPANY_DOCUMENT: '/CompanyDocument/PullCompanyDocument',
    ADD_UPDATE_COMPANY_DOCUMENT: '/CompanyDocument/AddUpdateCompanyDocument',
    DELETE_COMPANY_DOCUMENT: '/CompanyDocument/DeleteCompanyDocument',

} as const

export type CompanyMasterApiKeys = keyof typeof CompanyMasterApi