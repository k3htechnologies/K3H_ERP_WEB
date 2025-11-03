export const EmployeeMasterApi = {
    PULL: '/EmployeeMaster/PullEmployeeMaster',
    ADD_UPDATE: '/EmployeeMaster/AddUpdateEmployeeMaster'
} as const

export type EmployeeMasterApiKeys = keyof typeof EmployeeMasterApi