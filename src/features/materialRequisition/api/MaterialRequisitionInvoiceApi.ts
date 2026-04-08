export const MaterialRequisitionInvoiceApi = {

    PULL: '/MaterialRequisitionInvoice/PullMaterialRequisitionInvoice',
    ADD_UPDATE: '/MaterialRequisitionInvoice/AddUpdateMaterialRequisitionInvoice',
    DELETE: '/MaterialRequisitionInvoice/DeleteMaterialRequisitionInvoice',

} as const

export type MaterialRequisitionInvoiceApiKeys = keyof typeof MaterialRequisitionInvoiceApi