export const PaidBrokerageBookingApi = {

    PULL: '/Brokerage/PullPaidBrokerageBooking',
    ADD_UPDATE: '/Brokerage/AddUpdatePaidBrokerageBooking',
    DELETE: '/Brokerage/DeletePaidBrokerageBooking'

} as const

export type PaidBrokerageBookingApiKeys = keyof typeof PaidBrokerageBookingApi