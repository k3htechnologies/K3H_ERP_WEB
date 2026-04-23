export const MaterialRequisitionPurchaseOrderApi = {

    PULL: '/MaterialRequisitionPurchaseOrder/PullMaterialRequisitionPurchaseOrder',
    ADD_UPDATE: '/MaterialRequisitionPurchaseOrder/AddUpdateMaterialRequisitionPurchaseOrder',
    DELETE: '/MaterialRequisitionPurchaseOrder/DeleteMaterialRequisitionPurchaseOrder',

    GENERATE_MATERIAL_REQUISITION: '/MaterialRequisitionPurchaseOrder/GenerateMaterialRequisitionPurchaseOrderPdf',

} as const

export type MaterialRequisitionPurchaseOrderApiKeys = keyof typeof MaterialRequisitionPurchaseOrderApi