export const ProcessSalaryApi = {

    PULL: "/ProcessSalary/PullProcessSalary",
    ADD_UPDATE: "/ProcessSalary/AddUpdateProcessSalary",
    DELETE: "/ProcessSalary/DeleteProcessSalary",

    PULL_PROCESS_SALARY_DETAILS: "/ProcessSalary/PullProcessSalaryDetails",
    ADD_UPDATE_PROCESS_SALARY_DETAILS: "/ProcessSalary/AddUpdateProcessSalaryDetails",

} as const

export type ProcessSalaryApiKey = keyof typeof ProcessSalaryApi;