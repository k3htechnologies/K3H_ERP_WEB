export const CallLogApi = {

    PULL: '/PayTrackCallLog/PullPayTrackCallLog',
    ADD: '/PayTrackCallLog/AddPayTrackCallLog',
    UPDATE: '/PayTrackCallLog/UpdatePayTrackCallLog',
    DELETE: '/PayTrackCallLog/DeletePayTrackCallLog'

} as const

export type CallLogApiKeys = keyof typeof CallLogApi