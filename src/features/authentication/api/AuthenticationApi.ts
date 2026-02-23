export const AuthenticationApi = {
    ValidateMobileNumber: '/Authentication/IsValidMobileNumber',
    ValidateOTP: '/Authentication/IsValidOTP',
    SEND_OTP: '/Authentication/SendOTPMobileNumberAndModule'
} as const

export type AuthenticationApiKeys = keyof typeof AuthenticationApi