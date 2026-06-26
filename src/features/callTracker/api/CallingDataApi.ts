export const CallingDataApi = {
    PULL: '/CallTracker/PullCallingData',
    ADD_UPDATE: '/CallTracker/AddCallingData',
} as const

export type CallingDataApiKeys = keyof typeof CallingDataApi