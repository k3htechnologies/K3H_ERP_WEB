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

//#region END  NOTIFICATION

//#region REFRESH TOKEN
export interface FilterRefreshTokenRequest {
    Uniquekey: string | ''
}

//#region END  NOTIFICATION
export type TechnicalListResponse = ApiResponse<TechnicalData[]>;
export type NotificationListResponse = ApiResponse<NotificationData[]>;