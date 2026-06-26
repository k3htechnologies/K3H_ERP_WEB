export const SalesDashboardApi = {
    PULL: '/SalesDashboard/PullSalesDashboard',
    UPDATE_ENQUIRY_OUT_TIME: '/Enquiry/EnquiryOutTime',
    PULL_PROJECT_WISE_SALES_DASHBOARD: '/SalesDashboard/PullProjectWiseSalesDashboard',
    
} as const

export type SalesDashboardApiKeys = keyof typeof SalesDashboardApi