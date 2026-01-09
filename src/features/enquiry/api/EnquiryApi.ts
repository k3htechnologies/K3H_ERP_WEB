export const EnquiryApi = {
    PULL: '/Enquiry/PullEnquiry',
    ADD_UPDATE: '/Enquiry/AddUpdateEnquiry',
    DELETE: '/Enquiry/DeleteEnquiry',
<<<<<<< HEAD
    PULL_CHANNEL_PARTNER_WITH_ENQUIRY: '/Enquiry/PullChannelPartnerEnquiry'
=======
>>>>>>> bfa44a9e8ca7f45ab97331bc2bbbfdc1c50e4df5
} as const

export type EnquiryApiKeys = keyof typeof EnquiryApi