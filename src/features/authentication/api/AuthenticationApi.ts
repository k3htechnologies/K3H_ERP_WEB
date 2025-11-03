export const AuthenticationApi = {
    ValidateMobileNumber: '/Authentication/IsValidMobileNumber',
    ValidateOTP: '/Authentication/IsValidOTP'
} as const

export type AuthenticationApiKeys = keyof typeof AuthenticationApi