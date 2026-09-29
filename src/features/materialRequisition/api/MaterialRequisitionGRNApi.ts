export const MaterialRequisitionGRNApi = {

    PULL : "/MaterialRequisitionGRN/PullMaterialRequisitionGRN",
    ADD: "/MaterialRequisitionGRN/AddUpdateMaterialRequisitionGRN",
    PULL_SUMMARY:"/MaterialRequisitionGRN/PullMaterialRequisitionGRNSummary",
    GENERATE_PDF : "/MaterialRequisitionGRN/GenerateMaterialRequisitionGRNPDF",
    DELETE: "/MaterialRequisitionGRN/DeleteMaterialRequisitionGRN",
    
} as const

export type MaterialRequisitionQuotationGRNApiKeys = keyof typeof MaterialRequisitionGRNApi