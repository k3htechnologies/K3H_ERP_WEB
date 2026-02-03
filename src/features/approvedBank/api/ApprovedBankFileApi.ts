export const ApprovedBankFileApi = {

    PULL: '/ApprovedBank/PullApprovedBankFile',
    ADD_UPDATE: '/ApprovedBank/AddUpdateApprovedBankFile',
    DELETE: '/ApprovedBank/DeleteApprovedBankFile'

} as const

export type ApprovedBankApiKeys = keyof typeof ApprovedBankFileApi