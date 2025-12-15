export const LeaveCreditDebitApi = {
    PULL: '/LeaveCreditDebit/PullLeaveCreditDebit',
    ADD_UPDATE: '/LeaveCreditDebit/AddUpdateLeaveCreditDebit',
    DELETE: '/LeaveCreditDebit/DeleteLeaveCreditDebit'
} as const

export type LeaveCreditDebitApiKeys = keyof typeof LeaveCreditDebitApi




