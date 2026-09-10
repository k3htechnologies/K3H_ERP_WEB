import type { ApiResponse } from "@/core/api/ApiResponse";


//#region TECHNICAL CONTROLLER DATA
export interface TechnicalData {
    APP_POOL_ID: string | ''
}

//#endregion

//#region NOTIFICATION
export interface FilterWithPaginationNotificationRequest {
    PageSize: number | 0
    PageNumber: number | 0
    ProjectId?: number | 0
}

export interface NotificationData {
    NotificationId: number | 0
    Title: string | ''
    Description: string | ''
    IsRead: boolean | ''
    CreatedDate: string | ''
    Path: string | ''
}

//#endregion END  NOTIFICATION

//#region REFRESH TOKEN
export interface FilterRefreshTokenRequest {
    Uniquekey: string | ''
}

//#endregion END  NOTIFICATION

//#region COUNTRY_STATE_CITY_DISTRICT_VILLAGE

export interface CountryStateCityDistrictVillageData {
    CountryMasterId: number
    CountryName: string
    StateMasterId: number
    StateName: string
    CountryMasterIdRef: number
    DistrictMasterId: number
    DistrictName: string
    StateMasterIdRef: number
    CityMasterId: number
    CityName: string
    DistrictMasterIdRef: number
    WardMasterId: number
    WardName: string
    VillageMasterId: number
    VillageName: string
    CityMasterIdRef: number
}
export interface CountryStateCityDistrictVillageDataWrapper {
    CountryStateCityDistrictVillageData: CountryStateCityDistrictVillageData[];
}
export interface MaterialSubMaterialUOM {
    MaterialMasterId: number
    MaterialName: string
    SubMaterialMasterId: number
    StockQuantity: number
    SubMaterialName: string
    MaterialMasterIdRef: number
    UomMasterId: number
    UomCode: string
    IsTolerant?: boolean
    MaterialTolerant?: number
    TolerancePercentage?: number
    Tolerance?: number
}

export interface MateriaLSubMaterialMasterUOMWrapper {
    MaterialMasterSubMaterialMasterData: MaterialSubMaterialUOM[]
}

export interface FilterWithPaginationMaterialSubMaterialMasterUOM {
    ProjectId: number
    ClientRegistrationId: number

}
//#region EXCEL IMPORT & SAMPLE EXCEL DOWNLOAD 
export interface FilterPullExcelSample {
    TableName: string | ''
}

//#region MAGIC LINK WITH VALIDATION
export interface FilterMagicLinkWithValidate {
    MagicLinkType: string | ''
    ClientRegistrationId: number | 0
}

//#endregion END  NOTIFICATION

//#region VILLAGE
export interface FilterWithPaginationVillageRequest {
    PageSize: number | 0
    PageNumber: number | 0
    VillageMasterId?: number | 0
    VillageName?: string | ''
}

export interface VillageData {
    VillageMasterId: number | 0
    VillageName: string | ''
}

//#endregion END

export type TechnicalListResponse = ApiResponse<TechnicalData[]>;
export type NotificationListResponse = ApiResponse<NotificationData[]>;
export type CountryStateCityDistrictVillageListResponse = ApiResponse<CountryStateCityDistrictVillageDataWrapper[]>;
export type MaterialSubMaterialMasterUOMListResponse = ApiResponse<{ MaterialMasterSubMaterialMasterData: MaterialSubMaterialUOM[] }>
export type VillageListResponse = ApiResponse<VillageData[]>;