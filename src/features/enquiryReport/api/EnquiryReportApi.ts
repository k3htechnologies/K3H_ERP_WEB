export const EnquiryReportApi = {
    PULL: '/EnquiryReport/PullEnquiryReport'
} as const

export type EnquiryReportApiKeys = keyof typeof EnquiryReportApi