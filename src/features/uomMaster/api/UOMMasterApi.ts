export const UomMasterApi = {
    PULL : "/UomMaster/PullUomMaster",
    ADD_UPDATE : "/UomMaster/AddUpdateUomMaster",
    DELETE : "/UomMaster/DeleteUomMaster",
} as const

export type UomMasterApiKeys = keyof typeof UomMasterApi