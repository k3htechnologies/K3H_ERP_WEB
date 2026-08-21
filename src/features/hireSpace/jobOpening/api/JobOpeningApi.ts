export const JobOpeningApi = {
    PULL: '/JobOpening/PullJobOpeningMaster',
    ADD_UPDATE: '/JobOpening/AddUpdateJobOpeningMaster',
    DELETE: '/JobOpening/DeleteJobOpeningMaster',
} as const

export type JobOpeningApiKeys = keyof typeof JobOpeningApi
