export const PaymentScheduleMasterApi = {

    PULL: '/PaymentScheduleMaster/PullPaymentScheduleMaster',
    ADD_UPDATE: '/PaymentScheduleMaster/AddUpdatePaymentScheduleMaster',
    DELETE: '/PaymentScheduleMaster/DeletePaymentScheduleMaster'

} as const

export type PaymentScheduleMasterApiKeys = keyof typeof PaymentScheduleMasterApi