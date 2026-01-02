export const EnquiryFollowUpApi = {
    PULL: 'EnquiryFollowUp/PullEnquiryFollowUp',
    ADD_UPDATE: '/EnquiryFollowUp/AddUpdateEnquiryFollowUp',
    DELETE: '/EnquiryFollowUp/DeleteEnquiryFollowUp'
} as const

export type EnquiryFollowUpApiKeys = keyof typeof EnquiryFollowUpApi