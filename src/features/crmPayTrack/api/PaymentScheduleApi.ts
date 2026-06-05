export const PaymentScheduleApi = {
    PULL: "/PayTrack/PullPayTrackPaymentSchedule",
    PULL_DEMAND_SUMMARY: "/PayTrack/PullPayTrackPaymentScheduleDemandSummary",
    ADD_UPDATE_PAYMENT_SCHEDULE_DEMAND:"/PayTrack/AddUpdatePayTrackPaymentScheduleDemand",
}
export type PaymentScheduleApiKeys = keyof typeof PaymentScheduleApi