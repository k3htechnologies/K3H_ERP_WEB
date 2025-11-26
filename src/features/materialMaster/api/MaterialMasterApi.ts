export const MaterialMasterApi = {
    PULL : "/MaterialMaster/PullMaterialMaster",
    ADD_UPDATE : "/MaterialMaster/AddUpdateMaterialMaster",
    DELETE : "/MaterialMaster/DeleteMaterialMaster",
} as const

export type MaterialMasterApiKeys = keyof typeof MaterialMasterApi