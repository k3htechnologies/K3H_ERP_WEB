export const ChannelPartnerMasterApi = {
    PULL: '/ChannelPartner/PullChannelPartner',
    ADD_UPDATE: '/ChannelPartner/AddUpdateChannelPartner',
    DELETE: '/ChannelPartner/DeleteChannelPartner',
} as const

export type ChannelPartnerMasterApiKeys = keyof typeof ChannelPartnerMasterApi