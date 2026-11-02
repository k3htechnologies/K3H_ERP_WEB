export const ConstructionAreaApi = {
    PULL: '/ConstructionArea/PullConstructionArea',
    ADD_UPDATE: '/ConstructionArea/AddUpdateConstructionArea',
} as const

export type ConstructionAreaApiKeys = keyof typeof ConstructionAreaApi