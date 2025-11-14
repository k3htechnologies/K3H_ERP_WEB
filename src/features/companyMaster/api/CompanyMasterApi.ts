export const CompanyMasterApi = {
    PULL: '/Company/PullCompany',
    ADD_UPDATE: '/Company/AddUpdateCompany',
    DELETE: '/Company/PullCompany'
} as const

export type CompanyMasterApiKeys = keyof typeof CompanyMasterApi