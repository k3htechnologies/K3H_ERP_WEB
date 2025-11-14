export const HolidayMappingMasterApi = {
    PULL: '/HolidayMappingMaster/PullHolidayMappingMaster',
    ADD_UPDATE: '/HolidayMappingMaster/PullHolidayMappingMaster',
    DELETE: '/HolidayMappingMaster/DeleteHolidayMaster'
} as const

export type HolidayMappingMasterApiKeys = keyof typeof HolidayMappingMasterApi