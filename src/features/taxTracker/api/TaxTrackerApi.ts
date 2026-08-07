export const TaxTrackerApi = {
    PULL: '/TaxTracker/PullTaxTracker',
    ADD_UPDATE: '/TaxTracker/AddUpdateTaxTracker',
    DELETE: '/TaxTracker/DeleteTaxTracker',
} as const

export type TaxTrackerApiKeys = keyof typeof TaxTrackerApi