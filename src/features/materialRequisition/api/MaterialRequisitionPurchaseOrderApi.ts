export const MaterialRequisitionPurchaseOrderApi = {

    PULL: '/MaterialRequisitionPurchaseOrder/PullMaterialRequisitionPurchaseOrder',
    ADD_UPDATE: '/MaterialRequisitionPurchaseOrder/AddUpdateMaterialRequisitionPurchaseOrder',
    DELETE: '/MaterialRequisitionPurchaseOrder/DeleteMaterialRequisitionPurchaseOrder',
    GENERATE_PURCHASE_ORDER_PDF: '/MaterialRequisitionPurchaseOrder/GenerateMaterialRequisitionPurchaseOrderPdf',

} as const

export type MaterialRequisitionPurchaseOrderApiKeys = keyof typeof MaterialRequisitionPurchaseOrderApi