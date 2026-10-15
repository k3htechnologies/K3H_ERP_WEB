export const ContractMasterApi = {
    PULL: "/ContractMaster/PullContractMaster",
    ADD_UPDATE: "/ContractMaster/AddUpdateContractMaster",
    DELETE: "/ContractMaster/DeleteContractMaster",
} as const

export type ContractMasterApiKeys = keyof typeof ContractMasterApi