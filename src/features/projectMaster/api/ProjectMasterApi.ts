export const ProjectMasterApi = {
    PULL: '/Project/PullProject',
    ADD_UPDATE: '/Project/AddUpdateProject',
    PULL_PROJECT_SUMMARY: '/Project/PullProjectSummary',

    PULL_PROJECT_WITH_EMPLOYEE: '/Project/PullProjectWithEmployee',
    ADD_UPDATE_PROJECT_WITH_EMPLOYEE: '/Project/AddUpdateProjectEmployee',
    DELETE_PROJECT_WITH_EMPLOYEE: '/Project/DeleteProjectWithEmployee',

    PULL_PROJECT_WITH_COMPANY: '/Project/PullProjectWithCompany',
    ADD_UPDATE_PROJECT_WITH_COMPANY: '/Project/AddUpdateProjectWithCompany',

    PULL_PROJECT_WITH_BANK_DETAILS: '/Project/PullProjectWithBankDetails',
    ADD_UPDATE_PROJECT_WITH_BANK_DETAILS: '/Project/AddUpdateProjectWithBankDetails',
    DELETE_PROJECT_WITH_BANK_DETAILS: '/Project/DeleteProjectWithBankDetails'
} as const

export type ProjectMasterApiKeys = keyof typeof ProjectMasterApi