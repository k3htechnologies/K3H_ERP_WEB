export const OtherChargesApi = {

    PULL: '/OtherCharges/PullOtherCharges',
    ADD_UPDATE: '/OtherCharges/AddUpdateOtherCharges',
    DELETE: '/OtherCharges/DeleteOtherCharges'

} as const

export type OtherChargesApiKeys = keyof typeof OtherChargesApi