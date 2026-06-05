export const ChannelPartnerUniverseApi = {
    PULL: '/ChannelPartnerUniverse/PullChannelPartnerUniverse',

    PULL_UNIVERSE_ADDITIONAL_INFORMATION: '/ChannelPartnerUniverse/PullChannelPartnerUniverseAdditionalInformation',
    ADD_UPDATE_UNIVERSE_ADDITIONAL_INFORMATION: '/ChannelPartnerUniverse/AddUpdateChannelPartnerUniverseAdditionalInformation',
    DELETE_UNIVERSE_ADDITIONAL_INFORMATION: '/ChannelPartnerUniverse/DeleteChannelPartnerUniverseAdditionalInformation',
} as const

export type ChannelPartnerUniverseApiKeys = keyof typeof ChannelPartnerUniverseApi