export const ContractMasterApi = {
    PULL: "/ContractMaster/PullContractMaster",
} as const

export type ContractMasterApiKeys = keyof typeof ContractMasterApi