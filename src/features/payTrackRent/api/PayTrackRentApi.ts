export const PayTrackRentApi = {
    ADD_UPDATE: '/PayTrackRent/AddUpdatePayTrackRent',
    PULL: '/PayTrackRent/PullPayTrackRentLedger',
    DELETE: '/PayTrackRent/DeletePayTrackRent',
} as const

export type PayTrackRentApiKeys = keyof typeof PayTrackRentApi

