export const ConferenceApi = {
    ADD_UPDATE: '/Conference/AddUpdateConferenceBooking',
    DELETE: '/Conference/DeleteConferenceBooking',
    PULL_DETAILS: '/Conference/PullConferenceDetails',
    PULL_BOOKING_DETAILS: '/Conference/PullConferenceBookingDetails',
} as const

export type ConferenceApiKeys = keyof typeof ConferenceApi
