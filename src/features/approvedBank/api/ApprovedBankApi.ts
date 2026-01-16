export const ApprovedBankApi = {
    PULL: '/ApprovedBank/PullApprovedBankFolder',
    ADD_UPDATE: '/ApprovedBank/AddUpdateApprovedBankFolder',
    DELETE: '/ApprovedBank/DeleteApprovedBankFolder'
} as const

export type ApprovedBankApiKeys = keyof typeof ApprovedBankApi