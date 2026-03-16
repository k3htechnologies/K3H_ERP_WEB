export const AuthenticationApi = {
    ValidateMobileNumber: '/Authentication/IsValidMobileNumber',
    ValidateOTP: '/Authentication/IsValidOTP',
    SEND_OTP: '/Authentication/SendOTPMobileNumberAndModule',
    EMPLOYEE_WITH_MENU:'/Authentication/GetEmployeeWithMenu'
} as const

export type AuthenticationApiKeys = keyof typeof AuthenticationApi