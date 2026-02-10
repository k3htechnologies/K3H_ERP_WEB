export const SaleTargetApi = {

    PULL: '/SaleTarget/PullSaleTarget',
    ADD_UPDATE: '/SaleTarget/AddUpdateSaleTarget',
    DELETE: '/SaleTarget/DeleteSaleTarget',

} as const

export type SaleTargetApiKeys = keyof typeof SaleTargetApi