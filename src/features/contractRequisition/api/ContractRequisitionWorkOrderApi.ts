export const ContractRequisitionWorkOrderApi = {

    PULL: '/ContractRequisitionWorkOrder/PullContractRequisitionWorkOrder',
    ADD_UPDATE: '/ContractRequisitionWorkOrder/AddUpdateContractRequisitionWorkOrder',
    DELETE: '/ContractRequisitionWorkOrder/DeleteContractRequisitionWorkOrder',

    GENERATE_WORK_ORDER_PDF: '/ContractRequisitionWorkOrder/GenerateContractRequisitionWorkOrderPdf',

} as const

export type ContractRequisitionWorkOrderApiKeys = keyof typeof ContractRequisitionWorkOrderApi