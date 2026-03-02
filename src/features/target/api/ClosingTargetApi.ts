export const ClosingTargetApi = {
    PULL: '/SaleTarget/PullSaleTargetClosing'
} as const

export type ClosingTargetApiKeys = keyof typeof ClosingTargetApi