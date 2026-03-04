export const SourcingTargetApi = {
    PULL: '/SaleTarget/PullSaleTargetSourcing'
} as const

export type SourcingTargetApiKeys = keyof typeof SourcingTargetApi