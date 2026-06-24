export const PaymentLedgerApi = {
    PULL: "/PayTrack/PullPayTrackPaymentLedger",
    PULL_SUMMARY: "/PayTrack/PullPayTrackPaymentLedgerSummary",
    ADD_UPDATE: "/PayTrack/AddUpdatePayTrackPaymentLedger",
    DELETE: "/PayTrack/DeletePayTrackPaymentLedger",
}
export type PaymentLedgerApiKeys = keyof typeof PaymentLedgerApi