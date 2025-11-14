export const TncMasterApi = {
    PULL: '/TermsAndConditionsMaster/PullTermsAndConditionsMaster',
    ADD_UPDATE: '/TermsAndConditionsMaster/AddUpdateTermsAndConditionsMaster',
    DELETE: '/TermsAndConditionsMaster/DeleteTermsAndConditionsMaster'
} as const

export type TncMasterApiKeys = keyof typeof TncMasterApi