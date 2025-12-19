export const CompanyMasterApi = {
    PULL: '/Company/PullCompany',
    ADD_UPDATE: '/Company/AddUpdateCompany',
    DELETE: '/Company/DeleteCompany'
} as const

export type CompanyMasterApiKeys = keyof typeof CompanyMasterApi