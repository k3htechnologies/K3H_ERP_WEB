export const MaterialRequisitionFinalizedVendorApi = {

    ADD_FINALIZED_VENDOR: "/MaterialRequisitionFinalizedVendor/AddFinalizedVendor",
    PULL_MATERIAL_WISE_QUOTATION : "/MaterialRequisitionFinalizedVendor/PullMaterialWiseQuotation",
    REVOKE_FINALIZATION_VENDOR: "/MaterialRequisitionFinalizedVendor/revokeFinalizationVendor",
    
} as const

export type MaterialRequisitionFinalizedVendorApiKeys = keyof typeof MaterialRequisitionFinalizedVendorApi