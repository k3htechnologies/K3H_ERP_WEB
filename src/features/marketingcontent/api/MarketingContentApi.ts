export const MarketingContentApi = {

    PULL: 'MarketingContent/PullMarketingContent',
    ADD_UPDATE: 'MarketingContent/AddUpdateMarketingContent',
    DELETE: '/MarketingContent/DeleteMarketingContent'

} as const

export type MarketingContentApiKeys = keyof typeof MarketingContentApi