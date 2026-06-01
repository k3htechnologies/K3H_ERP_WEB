export const CollectionReportApi = {
    PULL_PROJECT_WISE: '/CollectionReport/PullProjectWiseCollectionReport',
    PULL: '/CollectionReport/PullCollectionReport',
} as const

export type CollectionReportApiKeys = keyof typeof CollectionReportApi