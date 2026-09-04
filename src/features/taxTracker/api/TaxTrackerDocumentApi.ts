export const TaxTrackerDocumentApi = {
    PULL: '/TaxTracker/PullTaxTrackerDocument',
    ADD_UPDATE: '/TaxTracker/AddUpdateTaxTrackerDocument',
    DELETE: '/TaxTracker/DeleteTaxTrackerDocument'

} as const

export type TaxTrackerDocumentApiKeys = keyof typeof TaxTrackerDocumentApi