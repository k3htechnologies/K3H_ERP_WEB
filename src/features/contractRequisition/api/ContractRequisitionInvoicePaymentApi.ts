export const ContractRequisitionInvoicePaymentApi = {
    PULL: '/ContractRequisitionPayment/PullContractRequisitionPayment',
    ADD_UPDATE: '/ContractRequisitionPayment/AddUpdateContractRequisitionPayment',
    DELETE: '/ContractRequisitionPayment/DeleteContractRequisitionPayment',
} as const

export type ContractRequisitionInvoicePaymentApiKeys = keyof typeof ContractRequisitionInvoicePaymentApi;
