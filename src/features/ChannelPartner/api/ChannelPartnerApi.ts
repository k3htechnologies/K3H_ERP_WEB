export const ChannelPartnerApi = {
    PULL: '/ChannelPartner/PullChannelPartner',
    ADD_UPDATE: '/ChannelPartner/AddUpdateChannelPartner',
    DELETE: '/ChannelPartner/DeleteChannelPartner',
} as const

export type ChannelPartnerApiKeys = keyof typeof ChannelPartnerApi