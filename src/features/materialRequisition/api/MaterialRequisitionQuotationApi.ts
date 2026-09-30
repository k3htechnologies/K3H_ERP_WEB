export const MaterialRequisitionQuotationApi = {

    PULL : "/MaterialRequisitionQuotation/PullMaterialRequisitionQuotation",
    ADD : "/MaterialRequisitionQuotation/AddUpdateMaterialRequisitionQuotation",
    DELETE: "/MaterialRequisitionQuotation/DeleteMaterialRequisitionQuotation",
    PULL_SUMMARY_OF_QUITATION : "/MaterialRequisitionQuotation/PullMaterialRequisitionSummaryOfQuotation",
    
} as const

export type MaterialRequisitionQuotationApiKeys = keyof typeof MaterialRequisitionQuotationApi