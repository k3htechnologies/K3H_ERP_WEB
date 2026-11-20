
export const CallMonitoringApi = {

    PULL: '/CallMonitoring/PullCallMonitoring',
    ADD: '/CallMonitoring/AddCallMonitoring',
    UPDATE: '/CallMonitoring/UpdateCallMonitoring',
    DELETE: '/CallMonitoring/DeleteCallMonitoring'

} as const

export type CallMonitoringApiKeys = keyof typeof CallMonitoringApi