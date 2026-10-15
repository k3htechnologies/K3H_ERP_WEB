export const ContractRequisitionBoqApi = {
    PULL: "/ContractRequisitionBOQ/PullContractRequisitionBOQ",
    ADD_UPDATE: "/ContractRequisitionBOQ/AddUpdateContractRequisitionBOQ",
} as const;

export type ContractRequisitionApiKeys = keyof typeof ContractRequisitionBoqApi;