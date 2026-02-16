export const MarketingContentFolderApi = {

    PULL: 'MarketingContent/PullMarketingContentFolder',
    ADD_UPDATE: 'MarketingContent/AddUpdateMarketingContentFolder',
    DELETE: '/MarketingContent/DeleteMarketingContentFolder'

} as const

export type MarketingContentFolderApiKeys = keyof typeof MarketingContentFolderApi