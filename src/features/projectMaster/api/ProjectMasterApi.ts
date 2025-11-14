export const ProjectMasterApi = {
    PULL: '/api/Project/PullProject',
    ADD_UPDATE: '/api/Project/AddUpdateProject',
    PULL_PROJECT_SUMMARY: '/api/Project/PullProjectSummary',

    PULL_PROJECT_WITH_EMPLOYEE: '/api/Project/PullProjectWithEmployee',
    ADD_UPDATE_PROJECT_WITH_EMPLOYEE: '/api/Project/AddUpdateProjectEmployee',
    DELETE_PROJECT_WITH_EMPLOYEE: '/api/Project/DeleteProjectWithEmployee',

    PULL_PROJECT_WITH_COMPANY: '/api/Project/PullProjectWithCompany',
    ADD_UPDATE_PROJECT_WITH_COMPANY: '/api/Project/AddUpdateProjectWithCompany',

    PULL_PROJECT_WITH_BANK_DETAILS: '/api/Project/PullProjectWithBankDetails',
    ADD_UPDATE_PROJECT_WITH_BANK_DETAILS: '/api/Project/AddUpdateProjectWithBankDetails',
    DELETE_PROJECT_WITH_BANK_DETAILS: '/api/Project/DeleteProjectWithBankDetails'
} as const

export type ProjectMasterApiKeys = keyof typeof ProjectMasterApi