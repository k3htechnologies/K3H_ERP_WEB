export const StockManagementApi = {
    PULL: '/Stock/PullStock',
    PULL_SUMMARY: '/Stock/PullStockSummary',
    PULL_STOCK_HISTORY: '/Stock/PullStockHistory',
    ADD_UPDATE: '/stock/AddUpdateStock',
    ADD_UPDATE_STOCKUSAGE: '/stock/AddUpdateStockUsage'
} as const

export type StockManagementApiKeys = keyof typeof StockManagementApi