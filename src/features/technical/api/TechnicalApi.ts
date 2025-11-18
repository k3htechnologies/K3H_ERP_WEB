export const TechnicalApi = {
    GETENVIRONMENT: '/Technical/GetEnvironment',
    PULL_NOTIFICATION: '/Notification/PullNotification',
    REFRESH_TOKEN: '/Authentication/RefreshToken',
    PULL_COUNTRY_STATE_CITY_DISTRICT_VILLAGE: '/Static/PullCountryStateCityDistrictVillage'
} as const

export type TechnicalApiKeys = keyof typeof TechnicalApi