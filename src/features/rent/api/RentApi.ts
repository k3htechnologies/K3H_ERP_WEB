export const RentApi = {
    PULL: '/Rent/PullTenantApplicantCharges'
} as const

export type RentApiKeys = keyof typeof RentApi