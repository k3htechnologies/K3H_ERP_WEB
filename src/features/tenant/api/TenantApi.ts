export const TenantApi = {
    PULL: '/Tenant/PullTenant',
    ADD_UPDATE: '/Tenant/AddUpdateTenant',
    DELETE: '/Tenant/DeleteTenant',
    
    PULL_TENANT_DOCUMENT: '/Tenant/PullTenantDocument',
    ADD_UPDATE_TENANT_DOCUMENT: '/Tenant/AddUpdateTenantDocument',
    DELETE_TENANT_DOCUMENT: '/Tenant/DeleteTenantDocument'

} as const

export type TenantApiKeys = keyof typeof TenantApi