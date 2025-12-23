export const EnquiryMasterApi = {
    PULL: '/Enquiry/PullEnquiry',
    ADD_UPDATE: '/Enquiry/AddUpdateEnquiry',
    DELETE: '/Enquiry/DeleteEnquiry',
} as const

export type EnquiryMasterApiKeys = keyof typeof EnquiryMasterApi