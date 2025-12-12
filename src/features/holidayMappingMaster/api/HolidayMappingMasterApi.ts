export const HolidayMappingMasterApi = {
    PULL: '/HolidayMappingMaster/PullHolidayMappingMaster',
    ADD_UPDATE: '/HolidayMappingMaster/AddUpdateHolidayMappingMaster',
    DELETE: '/HolidayMappingMaster/DeleteHolidayMaster'
} as const

export type HolidayMappingMasterApiKeys = keyof typeof HolidayMappingMasterApi