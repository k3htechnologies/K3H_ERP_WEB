export const ContractRequisitionInvoiceApi = {
    PULL: '/ContractRequisitionInvoice/PullContractRequisitionInvoice',
    ADD_UPDATE: '/ContractRequisitionInvoice/AddUpdateContractRequisitionInvoice',
    DELETE: '/ContractRequisitionInvoice/DeleteContractRequisitionInvoice',
    PULL_INVOICE_SUMMARY: '/ContractRequisitionInvoice/PullContractRequisitionInvoiceSummary'

} as const

export type ContractRequisitionInvoiceApiKeys = keyof typeof ContractRequisitionInvoiceApi