export const channelPartnerCategoryApi = {

    PULL: '/ChannelPartnerCategory/PullChannelPartnerCategory',
    ADD_UPDATE: '/ChannelPartnerCategory/AddUpdateChannelPartnerCategory'

} as const

export type channelPartnerCategoryApiKeys = keyof typeof channelPartnerCategoryApi