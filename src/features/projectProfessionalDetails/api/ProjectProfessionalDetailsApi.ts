export const ProjectProfessionalDetailsApi = {

    PULL: 'ProjectProfessionalDetails/PullProjectProfessionalDetails',
    ADD_UPDATE: 'ProjectProfessionalDetails/AddUpdateProjectProfessionalDetails',
    DELETE: 'ProjectProfessionalDetails/DeleteProjectProfessionalDetails'

} as const

export type ProjectProfessionalDetailsApiKeys = keyof typeof ProjectProfessionalDetailsApi