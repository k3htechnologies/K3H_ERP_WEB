export const MaterialRequisitionEnquiryApi = {

    PULL : "/MaterialRequisitionForEnquiry/PullVendorForEnquiry",
    ADD : "/MaterialRequisitionForEnquiry/AddVendorForEnquiry"
    
} as const

export type MaterialRequisitionEnquiryApiKeys = keyof typeof MaterialRequisitionEnquiryApi