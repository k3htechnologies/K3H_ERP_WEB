export const TechnicalApi = {
    GETENVIRONMENT: '/Technical/GetEnvironment',
    PULL_NOTIFICATION: '/Notification/PullNotification',
    REFRESH_TOKEN: '/Authentication/RefreshToken'
} as const

export type TechnicalApiKeys = keyof typeof TechnicalApi