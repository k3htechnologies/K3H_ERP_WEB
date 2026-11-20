export const EmployeeMasterApi = {
    PULL: '/Employee/PullEmployee',
    ADD_UPDATE: '/Employee/AddUpdateEmployee',

    PULL_EMPLOYEE_DOCUMENT: '/EmployeeDocument/PullEmployeeDocument',
    ADD_UPDATE_EMPLOYEE_DOCUMENT: '/EmployeeDocument/AddUpdateEmployeeDocument',
    DELETE_EMPLOYEE_DOCUMENT: '/EmployeeDocument/DeleteEmployeeDocument',

    PULL_EMPLOYEE_EXPERIENCE_DETAILS: '/EmployeeExperienceDetails/PullEmployeeExperienceDetails',
    ADD_UPDATE_EMPLOYEE_EXPERIENCE_DETAILS: '/EmployeeExperienceDetails/AddUpdateEmployeeExperienceDetails',
    DELETE_EMPLOYEE_EXPERIENCE_DETAILS: '/EmployeeExperienceDetails/DeleteEmployeeExperienceDetails',

    PULL_EMPLOYEE_EDUCATION_DETAILS: '/EmployeeEducationDetails/PullEmployeeEducationDetails',
    ADD_UPDATE_EMPLOYEE_EDUCATION_DETAILS: '/EmployeeEducationDetails/AddUpdateEmployeeEducationDetails',
    DELETE_EMPLOYEE_EDUCATION_DETAILS: '/EmployeeEducationDetails/DeleteEmployeeEducationDetails',

    SET_EMPLOYEE_MPIN: '/Employee/SetEmployeeMPIN',
    UPDATE: '/Employee/UpdateEmployee',

    PULL_EMPLOYEE_LETTER: '/EmployeeLetter/PullEmployeeLetter',
    ADD_UPDATE_EMPLOYEE_LETTER: '/EmployeeLetter/AddUpdateEmployeeLetter',
    ADD_UPDATE_EMPLOYEE_LETTER_SHOW_EMPLOYEE: '/EmployeeLetter/AddUpdateEmployeeLetterShowEmployee',
    ADD_UPDATE_EMPLOYEE_LETTER_ACCEPT_EMPLOYEE: '/EmployeeLetter/AddUpdateEmployeeLetterAcceptEmployee',
    DELETE_EMPLOYEE_LETTER: '/EmployeeLetter/DeleteEmployeeLetter'


} as const

export type EmployeeMasterApiKeys = keyof typeof EmployeeMasterApi