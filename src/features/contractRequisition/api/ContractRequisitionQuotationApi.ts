export const ContractRequisitionQuotationApi = {

    PULL : "/ContractRequisitionQuotation/PullContractRequisitionQuotation",
    ADD_UPDATE : "/ContractRequisitionQuotation/AddUpdateContractRequisitionQuotation",
    DELETE: "/ContractRequisitionQuotation/DeleteContractRequisitionQuotation",
    PULL_SUMMARY_OF_QUITATION : "/ContractRequisitionQuotation/PullContractRequisitionSummaryOfQuotation",
    
} as const

export type ContractRequisitionQuotationApiKeys = keyof typeof ContractRequisitionQuotationApi