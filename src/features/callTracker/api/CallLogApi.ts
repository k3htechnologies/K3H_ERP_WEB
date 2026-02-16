export const CallLogApi = {

    PULL: '/CallLog/PullCallLog',
    ADD: '/CallLog/AddCallLog',
    UPDATE: '/CallLog/UpdateCallLog',
    DELETE: '/CallLog/DeleteCallLog'

} as const

export type CallLogApiKeys = keyof typeof CallLogApi