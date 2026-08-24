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
    UPDATE_EMPLOYEE_PROFILE_PHOTO: '/Employee/UpdateEmployeeProfilePhoto'

} as const

export type EmployeeMasterApiKeys = keyof typeof EmployeeMasterApi