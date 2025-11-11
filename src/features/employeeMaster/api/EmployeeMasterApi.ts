export const EmployeeMasterApi = {
    PULL: '/Employee/PullEmployee',
    ADD_UPDATE: '/Employee/AddUpdateEmployeeMaster'
} as const

export type EmployeeMasterApiKeys = keyof typeof EmployeeMasterApi