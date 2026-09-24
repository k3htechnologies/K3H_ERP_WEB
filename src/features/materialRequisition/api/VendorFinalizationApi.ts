export const VendorFinalizationApi = {

    PULL : "/MaterialRequisitionForEnquiry/PullVendorForEnquiry",
    ADD : "/MaterialRequisitionForEnquiry/AddVendorForEnquiry",
    PULL_SELECTED_VENDOR : "/MaterialRequisitionForEnquiry/PullSelectedVendorForEnquiry",
    ADD_FINALIZED_VENDOR: "/MaterialRequisitionForEnquiry/AddFinalizedVendor",
    PULL_FINALIZED_VENDOR: "/MaterialRequisitionForEnquiry/PullFinalizedVendor",
    REVOKE_FINALIZATION_VENDOR: "/MaterialRequisitionForEnquiry/revokeFinalizationVendor",
    
} as const

export type VendorFinalizationApiKeys = keyof typeof VendorFinalizationApi