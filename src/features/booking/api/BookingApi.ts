export const BookingApi = {
    PULL: '/Booking/PullBooking',
    ADD_UPDATE: '/Booking/AddUpdateBooking',
    CANCEL: '/Booking/CancelBooking',
    PULL_CHANNEL_PARTNER_BOOKING: '/Booking/PullChannelPartnerBooking',
    PULL_PAYMENT_SCHEDULE_STAGES: '/Booking/PullPaymentScheduleStages',
} as const

export type BookingApiKeys = keyof typeof BookingApi

