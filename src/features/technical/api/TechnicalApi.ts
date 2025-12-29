export const TechnicalApi = {
    GETENVIRONMENT: '/Technical/GetEnvironment',
    PULL_NOTIFICATION: '/Notification/PullNotification',
    REFRESH_TOKEN: '/Authentication/RefreshToken',
    PULL_COUNTRY_STATE_CITY_DISTRICT_VILLAGE: '/Static/PullCountryStateCityDistrictVillage',
    EXCEL_IMPORT: '/ExcelImport/ExcelImport',
    PULL_EXCEL_SAMPLE: '/ExcelImport/PullExcelSample',
    PULL_MATERIAL_SUBMATERIALUOM:'/Static/PullMaterialMasterSubMaterialMasterUOMMaster',
    PULL_MAGIC_LINK_WITH_VALIDATE:'/MagicLink/PullMagicLinkWithValidate'
    
} as const

export type TechnicalApiKeys = keyof typeof TechnicalApi