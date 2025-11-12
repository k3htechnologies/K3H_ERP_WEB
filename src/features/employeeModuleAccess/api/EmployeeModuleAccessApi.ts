export const EmployeeModuleAccessApi = {
    PULL: '/ModulesPermissions/PullModulesPermissions',
    ADD_UPDATE: '/ModulesPermissions/AddUpdateModulesPermissions',
} as const

export type EmployeeModuleAccessApiKeys = keyof typeof EmployeeModuleAccessApi