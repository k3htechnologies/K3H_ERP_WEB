export const ApprovedBankFolderApi = {

    PULL: '/ApprovedBank/PullApprovedBankFolder',
    ADD_UPDATE: '/ApprovedBank/AddUpdateApprovedBankFolder',
    DELETE: '/ApprovedBank/DeleteApprovedBankFolder'

} as const

export type ApprovedBankApiKeys = keyof typeof ApprovedBankFolderApi