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
    VillageMasterId: number
    VillageName: string
    CityMasterIdRef: number
}

export interface CountryStateCityDistrictVillageDataWrapper {
  CountryStateCityDistrictVillageData: CountryStateCityDistrictVillageData[];
}


//#endregion END  NOTIFICATION

//#region EXCEL IMPORT & SAMPLE EXCEL DOWNLOAD 
export interface FilterPullExcelSample {
    TableName: string | ''
}

//#endregion END  NOTIFICATION

export type TechnicalListResponse = ApiResponse<TechnicalData[]>;
export type NotificationListResponse = ApiResponse<NotificationData[]>;
export type CountryStateCityDistrictVillageListResponse = ApiResponse<CountryStateCityDistrictVillageDataWrapper[]>;