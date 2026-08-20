export const JobRoleMasterApi = {
    PULL_DEPARTMENTS: '/JobRole/PullJobDepartment',
    PULL: '/JobRole/PullJobRoleMaster',
    ADD_UPDATE: '/JobRole/AddUpdateJobRoleMaster',
    DELETE: '/JobRole/DeleteJobRoleMaster'
} as const

export type JobRoleMasterApiKeys = keyof typeof JobRoleMasterApi
