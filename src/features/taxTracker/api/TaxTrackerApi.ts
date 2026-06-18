export const TaxTrackerApi = {
    
    PULL: '/TaxTracker/PullTaxTracker',
    ADD_UPDATE: '/TaxTracker/AddUpdateTaxTracker',
    DELETE: '/TaxTracker/DeleteTaxTracker',

    PULL_TAX_TRACKER_DOCUMENT: '/TaxTracker/PullTaxTrackerDocument',
    ADD_UPDATE_TAX_TRACKER_DOCUMENT:'/TaxTracker/AddUpdateTaxTrackerDocument',
    DELETE_TAX_TRACKER_DOCUMENT:'/TaxTracker/DeleteTaxTrackerDocument'

} as const

export type TaxTrackerApiKeys = keyof typeof TaxTrackerApi