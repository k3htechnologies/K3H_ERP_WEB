export const SubMaterialMasterApi = {
    PULL : "/SubMaterialMaster/PullSubMaterialMaster",
    ADD_UPDATE : "/SubMaterialMaster/AddUpdateSubMaterialMaster",
    DELETE : "/SubMaterialMaster/DeleteSubMaterialMaster",
} as const

export type SubMaterialMasterApiKeys = keyof typeof SubMaterialMasterApi