export const SalesDashboardApi = {
    PULL: '/SalesDashboard/PullSalesDashboard',
    UPDATE_ENQUIRY_OUT_TIME: '/Enquiry/EnquiryOutTime'
    
} as const

export type SalesDashboardApiKeys = keyof typeof SalesDashboardApi