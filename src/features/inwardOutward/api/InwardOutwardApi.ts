export const InwardOutwardApi = {
    PULL: '/InwardOutward/PullInwardOutward',
    ADD_UPDATE: '/InwardOutward/AddUpdateInwardOutward',
    DELETE: '/InwardOutward/DeleteInwardOutward',
    ADD_REVERT: '/InwardOutward/AddUpdateInwardOutwardRevert',
    DELETE_REVERT: '/InwardOutward/DeleteInwardOutwardRevert',
    PULL_SENDER_RECEIVER_BY_MOBILE_NO: '/InwardOutward/PullSenderReceiverByMobileNo'
} as const

export type InwardOutwardApiKeys = keyof typeof InwardOutwardApi;