export const CallTrackerApi = {

    PULL: '/CallTracker/PullCallingData'

} as const

export type CallTrackerApiKeys = keyof typeof CallTrackerApi