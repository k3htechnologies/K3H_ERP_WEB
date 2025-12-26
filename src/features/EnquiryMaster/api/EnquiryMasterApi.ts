export const EnquiryMasterApi = {
    PULL: '/Enquiry/PullEnquiry',
    ADD_UPDATE: '/Enquiry/AddUpdateEnquiry',
    DELETE: '/Enquiry/DeleteEnquiry',
    PULL_CHANNEL_PARTNER_WITH_ENQUIRY: '/Enquiry/PullChannelPartnerEnquiry'
} as const

export type EnquiryMasterApiKeys = keyof typeof EnquiryMasterApi