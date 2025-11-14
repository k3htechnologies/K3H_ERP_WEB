export const VendorApi = {
    PULL: '/Vendor/PullVendor',
    ADD_UPDATE: '/Vendor/AddUpdateVendor',
    DELETE: '/Vendor/DeleteVendor'
} as const

export type VendorApiKeys = keyof typeof VendorApi