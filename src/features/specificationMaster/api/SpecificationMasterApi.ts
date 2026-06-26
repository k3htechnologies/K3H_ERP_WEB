export const SpecificationMasterApi = {

    PULL: "SpecificationMaster/PullSpecificationMaster",
    ADD_UPDATE: "SpecificationMaster/AddUpdateSpecificationMaster",
    DELETE: "SpecificationMaster/DeleteSpecificationMaster"

} as const

export type SpecificationMasterApiKeys = keyof typeof SpecificationMasterApi