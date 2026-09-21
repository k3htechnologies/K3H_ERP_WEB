export const StockManagementApi = {
    PULL: '/Stock/PullStock',
    PULL_STOCK_HISTORY: '/Stock/PullStockHistory',
    ADD_UPDATE: '/stock/AddUpdateStock'
} as const

export type StockManagementApiKeys = keyof typeof StockManagementApi