export const ParkingApi = {
    PULL: '/Parking/PullParking',
    PULL_PARKING_PAGINATION: '/Parking/PullParkingWithPagination',
    UPDATE: '/Parking/UpdateParking'
} as const

export type ParkingApiKeys = keyof typeof ParkingApi