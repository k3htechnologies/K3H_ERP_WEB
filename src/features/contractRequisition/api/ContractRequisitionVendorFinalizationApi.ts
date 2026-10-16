export const ContractRequisitionVendorFinalizationApi = {

    PULL: "/ContractRequisitionForEnquiry/PullVendorForEnquiry",
    ADD: "/ContractRequisitionForEnquiry/AddVendorForEnquiry",
    PULL_SELECTED_VENDOR: "/ContractRequisitionForEnquiry/PullSelectedVendorForEnquiry",
    ADD_FINALIZED_VENDOR: "/ContractRequisitionForEnquiry/AddFinalizedVendor",
    PULL_FINALIZED_VENDOR: "/ContractRequisitionForEnquiry/PullFinalizedVendor",
    REVOKE_FINALIZATION_VENDOR: "/ContractRequisitionForEnquiry/RevokeFinalizationVendor",

} as const

export type VendorFinalizationApiKeys = keyof typeof ContractRequisitionVendorFinalizationApi