export const MaterialRequisitionReportApi = {

    PULL_VENDOR_WISE_MATERIAL_COUNT_REPORT: "/MaterialRequisitionReport/PullVendorWiseMaterialCountReport",
    PULL_MATERIAL_AND_VENDOR_REPORT: "/MaterialRequisitionReport/PullMaterialAndVendorReport",
    PULL_MATERIAL_REPORT: "/MaterialRequisitionReport/PullMaterialReport",
    PULL_MATERIAL_PURCHASE_REPORT: "/MaterialRequisitionReport/PullMaterialPurchaseReport",

} as const

export type MaterialRequisitionReportApiKeys = keyof typeof MaterialRequisitionReportApi;

