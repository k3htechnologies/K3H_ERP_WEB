export const DepartmentMasterApi = {
    PULL: '/DepartmentMaster/PullDepartmentMaster',
    ADD_UPDATE: '/DepartmentMaster/AddUpdateDepartmentMaster',
    DELETE: '/DepartmentMaster/DeleteDepartmentMaster'
} as const

export type DepartmentMasterApiKeys = keyof typeof DepartmentMasterApi