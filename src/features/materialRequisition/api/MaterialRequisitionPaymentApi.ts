export const MaterialRequisitionPaymentApi = {

    PULL: '/MaterialRequisitionPayment/PullMaterialRequisitionPayment',
    ADD_UPDATE: '/MaterialRequisitionPayment/AddUpdateMaterialRequisitionPayment',
    DELETE: '/MaterialRequisitionPayment/DeleteMaterialRequisitionPayment',

} as const

export type MaterialRequisitionPaymentApiKeys = keyof typeof MaterialRequisitionPaymentApi