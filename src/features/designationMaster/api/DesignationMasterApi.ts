export const DesignationMasterApi = {
    PULL: '/DesignationMaster/PullDesignationMaster',
    ADD_UPDATE: '/DesignationMaster/AddUpdateDesignationMaster',
    DELETE: '/DesignationMaster/DeleteDesignationMaster'
} as const

export type DesignationMasterApiKeys = keyof typeof DesignationMasterApi