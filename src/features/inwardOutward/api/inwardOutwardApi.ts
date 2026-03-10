export const InwardOutwardApi = {
    PULL: '/InwardOutward/PullInwardOutward',
    ADD_UPDATE: '/InwardOutward/AddUpdateInwardOutward',
    DELETE: '/InwardOutward/DeleteInwardOutward',

} as const

export type InwardOutwardApiKeys = keyof typeof InwardOutwardApi