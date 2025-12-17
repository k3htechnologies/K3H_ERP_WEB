export const BuildingApi = {
    PULL: '/Building/PullBuilding',
    ADD_UPDATE: '/Building/AddUpdateBuilding',
    DELETE: '/Building/DeleteBuilding',

    PULL_BUILDING_DETAILS: '/BuildingDetails/PullBuildingDetails',
    ADD_UPDATE_BUILDING_DETAILS: '/BuildingDetails/AddUpdateBuildingDetails',

    PULL_BUILDING_DOCUMENT: '/BuildingDocument/PullBuildingDocument',
    ADD_UPDATE_BUILDING_DOCUMENT: '/BuildingDocument/AddUpdateBuildingDocument',
    DELETE_BUILDING_DOCUMENT: '/BuildingDocument/DeleteBuildingDocument',

} as const

export type BuildingApiKeys = keyof typeof BuildingApi