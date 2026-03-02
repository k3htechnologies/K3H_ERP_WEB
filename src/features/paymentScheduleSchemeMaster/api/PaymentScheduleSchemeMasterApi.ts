export const PaymentScheduleSchemeMasterApi = {
    PULL : "/PaymentScheduleSchemeMaster/PullPaymentScheduleSchemeMaster",
    ADD_UPDATE : "/PaymentScheduleSchemeMaster/AddUpdatePaymentScheduleSchemeMaster",
    DELETE : "/PaymentScheduleSchemeMaster/DeletePaymentScheduleSchemeMaster",
} as const

export type PaymentScheduleSchemeMasterApiKeys = keyof typeof PaymentScheduleSchemeMasterApi


