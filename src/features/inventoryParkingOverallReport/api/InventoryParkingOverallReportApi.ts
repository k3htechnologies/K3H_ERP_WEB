export const InventoryParkingOverallReportApi = {
    PULL_PROJECT: '/InventoryParkingOverallReport/PullProjectInventoryParkingDetails',
    PULL: '/InventoryParkingOverallReport/PullInventoryParkingOverallReport'
} as const

export type InventoryParkingOverallReportApiKeys = keyof typeof InventoryParkingOverallReportApi