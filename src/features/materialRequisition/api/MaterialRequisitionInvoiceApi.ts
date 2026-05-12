export const MaterialRequisitionInvoiceApi = {

    PULL: '/MaterialRequisitionInvoice/PullMaterialRequisitionInvoice',
    ADD_UPDATE: '/MaterialRequisitionInvoice/AddUpdateMaterialRequisitionInvoice',
    DELETE: '/MaterialRequisitionInvoice/DeleteMaterialRequisitionInvoice',
    PULL_INVOICE_SUMMARY: '/MaterialRequisitionInvoice/PullMaterialRequisitionInvoiceSummary'
} as const

export type MaterialRequisitionInvoiceApiKeys = keyof typeof MaterialRequisitionInvoiceApi