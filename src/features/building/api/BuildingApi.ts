export const BuildingApi = {
    PULL: '/Building/PullBuilding',
    ADD_UPDATE: '/Building/AddUpdateBuilding',
    DELETE: '/Building/DeleteBuilding'

} as const

export type BuildingApiKeys = keyof typeof BuildingApi