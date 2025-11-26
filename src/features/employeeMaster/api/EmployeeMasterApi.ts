export const EmployeeMasterApi = {
    PULL: '/Employee/PullEmployee',
    ADD_UPDATE: '/Employee/AddUpdateEmployee'
    
} as const

export type EmployeeMasterApiKeys = keyof typeof EmployeeMasterApi