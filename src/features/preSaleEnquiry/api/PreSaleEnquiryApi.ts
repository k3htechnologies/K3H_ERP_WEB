export const PreSaleEnquiryApi = {

    PULL: "/PreSaleEnquiry/PullPreSaleEnquiry",
    ADD_UPDATE: "/PreSaleEnquiry/AddUpdatePreSaleEnquiry",
    DELETE: "/PreSaleEnquiry/DeletePreSaleEnquiry",

} as const

export type PreSaleEnquiryApiKey = keyof typeof PreSaleEnquiryApi;