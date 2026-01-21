export const EmployeeResignationApi = {
    PULL: '/EmployeeResignation/PullEmployeeResignation',
    ADD_UPDATE: '/EmployeeResignation/AddUpdateEmployeeResignation',
    DELETE: '/EmployeeResignation/DeleteEmployeeResignation',
} as const

export type EmployeeResignationApiKeys = keyof typeof EmployeeResignationApi


