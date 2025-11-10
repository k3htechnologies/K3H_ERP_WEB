export const TechnicalApi = {
    GETENVIRONMENT: '/Technical/GetEnvironment',
    PULL_NOTIFICATION: '/Notification/PullNotification'
} as const

export type TechnicalApiKeys = keyof typeof TechnicalApi