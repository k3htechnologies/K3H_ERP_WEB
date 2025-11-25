export const HolidayMasterApi = {
    PULL: '/HolidayMaster/PullHolidayMaster',
    ADD_UPDATE: '/HolidayMaster/AddUpdateHolidayMaster',
    DELETE: '/HolidayMaster/DeleteHolidayMaster'
} as const

export type HolidayMasterApiKeys = keyof typeof HolidayMasterApi