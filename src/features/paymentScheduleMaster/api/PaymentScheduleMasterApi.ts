export const PaymentScheduleMasterApi = {

    PULL: '/PaymentScheduleMaster/PullPaymentScheduleMaster',
    ADD_UPDATE: '/PaymentScheduleMaster/AddUpdatePaymentScheduleMaster',
    DELETE: '/PaymentScheduleMaster/DeletePaymentScheduleMaster',
    PULL_BUILDING: '/PaymentScheduleMaster/PullProjectInventoryStructure',

    //PAYMENT SCHEDULE REPORT
    PULL_PAYMENT_SCHEDULE_REPORT: '/PaymentScheduleMaster/PullPaymentScheduleMasterReport',
    PULL_COST_SHEET_REPORT: '/PaymentScheduleMaster/PullCostSheetReport',

} as const

export type PaymentScheduleMasterApiKeys = keyof typeof PaymentScheduleMasterApi