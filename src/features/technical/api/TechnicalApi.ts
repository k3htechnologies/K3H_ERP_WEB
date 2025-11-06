export const TechnicalApi = {
    GETENVIRONMENT: '/Technical/GetEnvironment'
} as const

export type TechnicalApiKeys = keyof typeof TechnicalApi