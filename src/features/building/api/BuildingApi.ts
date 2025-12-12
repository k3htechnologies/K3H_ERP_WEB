export const BuildingApi = {
    PULL: '/Building/PullBuilding',
    ADD_UPDATE: '/Building/PullBuilding',
    DELETE: '/Building/DeleteBuilding'

} as const

export type BuildingApiKeys = keyof typeof BuildingApi