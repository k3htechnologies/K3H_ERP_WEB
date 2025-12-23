export const EmployeeMasterApi = {
    PULL: '/Employee/PullEmployee',
    ADD_UPDATE: '/Employee/AddUpdateEmployee',

    PULL_EMPLOYEE_DOCUMENT: '/EmployeeDocument/PullEmployeeDocument',
    ADD_UPDATE_EMPLOYEE_DOCUMENT: '/EmployeeDocument/AddUpdateEmployeeDocument',
    DELETE_EMPLOYEE_DOCUMENT: '/EmployeeDocument/DeleteEmployeeDocument',
    
} as const

export type EmployeeMasterApiKeys = keyof typeof EmployeeMasterApi