export const MaterialRequisitionQuotationApi = {
    PULL : "/MaterialRequisitionQuotation/PullMaterialRequisitionQuotation",
    ADD : "/MaterialRequisitionQuotation/AddUpdateMaterialRequisitionQuotation",
    DELETE: "/MaterialRequisitionQuotation/DeleteMaterialRequisitionQuotation",
} as const

export type MaterialRequisitionQuotationApiKeys = keyof typeof MaterialRequisitionQuotationApi