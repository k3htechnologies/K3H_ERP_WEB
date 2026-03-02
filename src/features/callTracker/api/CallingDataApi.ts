export const CallingDataApi = {
    PULL: '/CallTracker/PullCallingData'
} as const

export type CallingDataApiKeys = keyof typeof CallingDataApi    