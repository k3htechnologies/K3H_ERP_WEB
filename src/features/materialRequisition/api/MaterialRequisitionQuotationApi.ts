export const MaterialRequisitionQuotationApi = {

    PULL : "/MaterialRequisitionQuotation/PullMaterialRequisitionQuotation",
    PULL_SUMMARY_OF_QUITATION : "/MaterialRequisitionQuotation/PullMaterialRequisitionSummaryOfQuotation",
    ADD : "/MaterialRequisitionQuotation/AddUpdateMaterialRequisitionQuotation",
    DELETE: "/MaterialRequisitionQuotation/DeleteMaterialRequisitionQuotation",
    PULL_SELECTED_VENDOR_FOR_QUOTATION : "/MaterialRequisitionQuotation/PullSelectedVendorForQuotation",
    
    
    
} as const

export type MaterialRequisitionQuotationApiKeys = keyof typeof MaterialRequisitionQuotationApi