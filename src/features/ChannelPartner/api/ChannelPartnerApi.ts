export const ChannelPartnerApi = {
    PULL: '/ChannelPartner/PullChannelPartner',
    PULL_AOP: '/ChannelPartner/PullChannelPartnerAOP',
    ADD_UPDATE: '/ChannelPartner/AddUpdateChannelPartner',
    DELETE: '/ChannelPartner/DeleteChannelPartner',
    PULL_CHANNELPARTNER_COMPANY:'/ChannelPartner/PullChannelPartnerCompany'
} as const

export type ChannelPartnerApiKeys = keyof typeof ChannelPartnerApi